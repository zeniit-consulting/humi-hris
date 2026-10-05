import {
    AlertCircle,
    ArrowRight,
    CalendarClock,
    CalendarDays,
    History,
    RefreshCw,
    Send,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    chips,
    formatDate,
    localDateString,
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

type ShiftChangePayload = {
    items: Array<{
        id: number;
        requested_date: string;
        current_shift: ShiftPayload | null;
        requested_shift: ShiftPayload | null;
        reason: string | null;
        status: string;
        rejection_reason: string | null;
    }>;
};

const formatShift = (shift: ShiftPayload | null): string => {
    if (!shift) {
        return 'Shift Berjalan';
    }

    if (shift.is_day_off) {
        return `${shift.name} (Libur)`;
    }

    if (!shift.start_time || !shift.end_time) {
        return shift.name;
    }

    return `${shift.name} (${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)})`;
};

export default function PortalShiftChangePage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<ShiftChangePayload['items']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        requested_date: '',
        requested_shift_id: '',
        reason: '',
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [portalResponse, requestsResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<ShiftChangePayload>(
                    '/portal/api/shift-change-requests',
                ),
            ]);

            setPortal(portalResponse.data);
            setItems(requestsResponse.data.items);

            const firstWorkingShift = portalResponse.data.shift_options.find(
                (shift) => !shift.is_day_off,
            );
            const fallbackShiftId = firstWorkingShift
                ? String(firstWorkingShift.id)
                : String(portalResponse.data.shift_options[0]?.id ?? '');

            setForm((current) =>
                current.requested_shift_id
                    ? current
                    : {
                          ...current,
                          requested_shift_id: fallbackShiftId,
                      },
            );
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data pengajuan ubah shift tidak bisa dimuat.',
                      )
                    : 'Data pengajuan ubah shift tidak bisa dimuat.',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!portal?.employee) {
            return;
        }

        try {
            setIsSubmitting(true);
            await requestApi('/portal/api/shift-change-requests', 'POST', {
                requested_date: form.requested_date,
                requested_shift_id: Number(form.requested_shift_id),
                reason: form.reason.trim() || null,
            });

            setForm((current) => ({
                ...current,
                requested_date: '',
                reason: '',
            }));
            notifyPortal('success', 'Pengajuan ubah shift berhasil dikirim.');
            await loadData();
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Pengajuan ubah shift gagal.',
                      )
                    : 'Pengajuan ubah shift gagal.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Jadwal & Shift"
            description="Ajukan permohonan perubahan shift untuk tanggal kerja tertentu."
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
            {/* Form Permohonan Ubah Shift */}
            <section className="portal-material rounded-[var(--portal-radius-surface)] border p-4.5">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-xl">
                        <CalendarClock className="portal-primary-text size-5.5" />
                    </span>
                    <div>
                        <p className="text-xs font-medium text-[var(--portal-color-muted)]">
                            Form Pengajuan
                        </p>
                        <h2 className="portal-display mt-0.5 text-lg font-bold tracking-tight text-[var(--portal-color-ink)]">
                            Ubah Shift Kerja
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label
                            htmlFor="shift-change-date"
                            className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]"
                        >
                            Tanggal Kerja <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="shift-change-date"
                            min={localDateString()}
                            value={form.requested_date}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    requested_date: event.target.value,
                                }))
                            }
                            className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                            required
                        />
                        <p className="mt-1 text-[11px] text-[var(--portal-color-muted)]">
                            Pilih tanggal kerja yang ingin diganti jadwal shiftnya.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="shift-change-target"
                            className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]"
                        >
                            Shift Pengganti <span className="text-rose-500">*</span>
                        </label>
                        <select
                            id="shift-change-target"
                            value={form.requested_shift_id}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    requested_shift_id: event.target.value,
                                }))
                            }
                            className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                            required
                        >
                            <option value="">Pilih shift pengganti</option>
                            {portal?.shift_options.map((shift) => (
                                <option key={shift.id} value={shift.id}>
                                    {formatShift(shift)}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-[11px] text-[var(--portal-color-muted)]">
                            Tentukan shift kerja baru yang Anda ajukan.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="shift-change-reason"
                            className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]"
                        >
                            Alasan Perubahan{' '}
                            <span className="text-[11px] font-normal text-[var(--portal-color-muted)]">
                                (Opsional)
                            </span>
                        </label>
                        <textarea
                            id="shift-change-reason"
                            rows={3}
                            value={form.reason}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    reason: event.target.value,
                                }))
                            }
                            className="portal-focus-ring mt-1.5 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-ink)]"
                            placeholder="Contoh: Menyesuaikan jadwal kuliah, pergantian jadwal dengan rekan, dll."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="portal-primary-bg portal-pressable portal-focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--portal-radius-control)] px-4 text-sm font-bold disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>
                                <RefreshCw className="size-4 animate-spin" />
                                <span>Mengirim pengajuan...</span>
                            </>
                        ) : (
                            <>
                                <Send className="size-4" />
                                <span>Kirim Pengajuan Ubah Shift</span>
                            </>
                        )}
                    </button>
                </form>
            </section>

            {/* Riwayat Pengajuan Ubah Shift */}
            <section className="portal-material mt-4 rounded-[var(--portal-radius-surface)] border p-4.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="portal-primary-soft inline-flex size-10 items-center justify-center rounded-xl">
                            <History className="portal-primary-text size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-medium text-[var(--portal-color-muted)]">
                                Riwayat
                            </p>
                            <h2 className="portal-display mt-0.5 text-base font-bold text-[var(--portal-color-ink)]">
                                Pengajuan Ubah Shift
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadData()}
                        className="portal-pressable portal-focus-ring inline-flex size-10 items-center justify-center rounded-full border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] text-[var(--portal-color-ink-soft)]"
                        aria-label="Muat ulang riwayat pengajuan"
                    >
                        <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {isLoading ? (
                        <div className="space-y-3" aria-label="Memuat riwayat">
                            {[1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="h-20 animate-pulse rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)]"
                                />
                            ))}
                        </div>
                    ) : items.length ? (
                        items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] p-3.5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[var(--portal-color-ink)]">
                                            {formatDate(item.requested_date)}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${chips[item.status] ?? 'bg-stone-200 text-stone-800'}`}
                                    >
                                        {statusLabels[item.status] ?? item.status}
                                    </span>
                                </div>

                                {/* Shift transition indicator */}
                                <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-[var(--portal-color-surface-raised)] p-2 text-xs">
                                    <span className="min-w-0 flex-1 truncate font-medium text-[var(--portal-color-ink-soft)]">
                                        {formatShift(item.current_shift)}
                                    </span>
                                    <ArrowRight className="size-3.5 shrink-0 text-[var(--portal-color-muted)]" />
                                    <span className="min-w-0 flex-1 truncate font-semibold text-[var(--portal-color-ink)]">
                                        {formatShift(item.requested_shift)}
                                    </span>
                                </div>

                                {item.reason ? (
                                    <p className="mt-2 text-xs text-[var(--portal-color-ink-soft)]">
                                        <span className="font-medium text-[var(--portal-color-muted)]">Alasan: </span>
                                        {item.reason}
                                    </p>
                                ) : null}

                                {item.status === 'rejected' && item.rejection_reason ? (
                                    <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-900">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                                        <div>
                                            <p className="font-semibold text-rose-950">
                                                Alasan Penolakan:
                                            </p>
                                            <p className="mt-0.5 text-rose-800">
                                                {item.rejection_reason}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[var(--portal-radius-control)] border border-dashed border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-4 py-8 text-center">
                            <CalendarDays className="mx-auto size-8 text-[var(--portal-color-muted)] opacity-60" />
                            <p className="mt-2 text-sm font-semibold text-[var(--portal-color-ink)]">
                                Belum Ada Pengajuan
                            </p>
                            <p className="mt-1 text-xs text-[var(--portal-color-muted)]">
                                Pengajuan ubah shift yang Anda kirim akan tercatat di sini.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
