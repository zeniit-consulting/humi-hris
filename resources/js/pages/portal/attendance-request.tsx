import { Clock3, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    chips,
    formatDate,
    formatTime,
    notifyPortal,
    requestApi,
    statusLabels,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type ShiftPayload = {
    id: number;
    code: string;
    name: string;
    start_time: string | null;
    end_time: string | null;
    is_day_off: boolean;
};

type PortalSummary = {
    employee: { id: number } | null;
    shift_options: ShiftPayload[];
    links: PortalLinkMap;
};

type AttendanceRequestPayload = {
    items: Array<{
        id: number;
        attendance_date: string;
        shift: ShiftPayload | null;
        check_in_at: string | null;
        check_out_at: string | null;
        reason: string | null;
        status: string;
        rejection_reason: string | null;
    }>;
};

const formatShift = (shift: ShiftPayload | null): string => {
    if (!shift) return 'Tanpa shift';
    if (shift.is_day_off) return `${shift.name} (Libur)`;
    if (!shift.start_time || !shift.end_time) return shift.name;
    return `${shift.name} • ${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}`;
};

export default function PortalAttendanceRequestPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<AttendanceRequestPayload['items']>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [form, setForm] = useState({
        attendance_date: '',
        shift_id: '',
        check_in_time: '',
        check_out_time: '',
        reason: '',
    });

    const loadData = useCallback(async () => {
        try {
            const [portalResponse, requestsResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<AttendanceRequestPayload>(
                    '/portal/api/attendance-requests',
                ),
            ]);

            setPortal(portalResponse.data);
            setItems(requestsResponse.data.items);

            setForm((current) =>
                current.shift_id
                    ? current
                    : {
                          ...current,
                          shift_id: String(
                              portalResponse.data.shift_options.find(
                                  (shift) => !shift.is_day_off,
                              )?.id ??
                                  portalResponse.data.shift_options[0]?.id ??
                                  '',
                          ),
                      },
            );
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data request absensi tidak bisa dimuat.',
                      )
                    : 'Data request absensi tidak bisa dimuat.',
            );
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadData]);

    useEffect(() => {
        if (!isSheetOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsSheetOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSheetOpen]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!portal?.employee) return;

        const checkInAt =
            form.attendance_date && form.check_in_time
                ? `${form.attendance_date}T${form.check_in_time}:00`
                : null;
        const checkOutAt =
            form.attendance_date && form.check_out_time
                ? `${form.attendance_date}T${form.check_out_time}:00`
                : null;

        try {
            setIsSubmitting(true);
            await requestApi('/portal/api/attendance-requests', 'POST', {
                attendance_date: form.attendance_date,
                shift_id: form.shift_id ? Number(form.shift_id) : null,
                check_in_at: checkInAt,
                check_out_at: checkOutAt,
                reason: form.reason,
            });

            setForm((current) => ({
                ...current,
                attendance_date: '',
                check_in_time: '',
                check_out_time: '',
                reason: '',
            }));
            setIsSheetOpen(false);
            notifyPortal('success', 'Request absensi berhasil dikirim.');
            await loadData();
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Request absensi gagal.',
                      )
                    : 'Request absensi gagal.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Request absensi"
            description="Ajukan absensi manual jika GPS perangkat bermasalah."
            active="attendance"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-xl">
                        <Clock3 className="portal-primary-text size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            GPS bermasalah
                        </p>
                        <h2 className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-950">
                            Request absensi manual
                        </h2>
                    </div>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                    Ajukan koreksi jam masuk atau pulang ketika lokasi tidak
                    terbaca.
                </p>
                <button
                    type="button"
                    onClick={() => setIsSheetOpen(true)}
                    className="portal-primary-bg portal-pressable portal-focus-ring mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold"
                >
                    <Plus className="size-4" />
                    Buat Request Absensi
                </button>
            </section>

            {isSheetOpen ? (
                <div
                    className="portal-sheet-backdrop fixed inset-0 z-[var(--portal-z-modal)] flex items-end justify-center bg-slate-950/35 sm:items-center sm:px-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget)
                            setIsSheetOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="attendance-request-sheet-title"
                        className="portal-sheet-panel max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[22px] bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[18px]"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">
                                    Request absensi
                                </p>
                                <h2
                                    id="attendance-request-sheet-title"
                                    className="mt-1 text-lg font-black tracking-[-0.04em] text-slate-950"
                                >
                                    Isi detail koreksi
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSheetOpen(false)}
                                className="portal-pressable portal-focus-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                                aria-label="Tutup form request absensi"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-5 space-y-3"
                        >
                            <input
                                type="date"
                                value={form.attendance_date}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        attendance_date: event.target.value,
                                    }))
                                }
                                className="h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                                required
                            />
                            <select
                                value={form.shift_id}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        shift_id: event.target.value,
                                    }))
                                }
                                className="h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                            >
                                <option value="">Tanpa shift</option>
                                {portal?.shift_options.map((shift) => (
                                    <option key={shift.id} value={shift.id}>
                                        {formatShift(shift)}
                                    </option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="time"
                                    value={form.check_in_time}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            check_in_time: event.target.value,
                                        }))
                                    }
                                    className="h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                                    aria-label="Jam masuk"
                                />
                                <input
                                    type="time"
                                    value={form.check_out_time}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            check_out_time: event.target.value,
                                        }))
                                    }
                                    className="h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                                    aria-label="Jam pulang"
                                />
                            </div>
                            <textarea
                                value={form.reason}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        reason: event.target.value,
                                    }))
                                }
                                placeholder="Jelaskan kendala GPS atau alasan request absensi manual."
                                className="min-h-28 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="portal-primary-bg portal-pressable portal-focus-ring inline-flex h-12 w-full items-center justify-center rounded-[12px] text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Kirim Request'}
                            </button>
                        </form>
                    </section>
                </div>
            ) : null}

            <section className="mt-5 rounded-[18px] border border-slate-200 bg-white px-5 py-5">
                <h2 className="text-lg font-black tracking-[-0.04em]">
                    Riwayat request
                </h2>
                <div className="mt-4 space-y-3">
                    {items.length ? (
                        items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[14px] border border-slate-200 px-4 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {formatDate(item.attendance_date)}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {formatShift(item.shift)}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Masuk {formatTime(item.check_in_at)}{' '}
                                            · Pulang{' '}
                                            {formatTime(item.check_out_at)}
                                        </p>
                                        {item.rejection_reason ? (
                                            <p className="mt-2 text-xs text-red-600">
                                                {item.rejection_reason}
                                            </p>
                                        ) : null}
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${chips[item.status] ?? 'bg-stone-200 text-stone-800'}`}
                                    >
                                        {statusLabels[item.status] ??
                                            item.status}
                                    </span>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[14px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                            Belum ada request absensi.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
