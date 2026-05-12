import { CalendarClock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    chips,
    formatDate,
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
        return '-';
    }

    if (shift.is_day_off) {
        return `${shift.name} (Libur)`;
    }

    if (!shift.start_time || !shift.end_time) {
        return shift.name;
    }

    return `${shift.name} • ${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}`;
};

export default function PortalShiftChangePage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<ShiftChangePayload['items']>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        requested_date: '',
        requested_shift_id: '',
        reason: '',
    });

    const loadData = useCallback(async () => {
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
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
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
                reason: form.reason,
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
            eyebrow="Request jadwal"
            description="Ajukan perubahan shift untuk tanggal kerja tertentu."
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
                        <CalendarClock className="portal-primary-text size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Pengajuan baru
                        </p>
                        <h2 className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-950">
                            Ubah shift saya
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <input
                        type="date"
                        value={form.requested_date}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                requested_date: event.target.value,
                            }))
                        }
                        className="h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                        required
                    />
                    <select
                        value={form.requested_shift_id}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                requested_shift_id: event.target.value,
                            }))
                        }
                        className="h-12 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                        required
                    >
                        <option value="">Pilih shift pengganti</option>
                        {portal?.shift_options.map((shift) => (
                            <option key={shift.id} value={shift.id}>
                                {formatShift(shift)}
                            </option>
                        ))}
                    </select>
                    <textarea
                        value={form.reason}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                reason: event.target.value,
                            }))
                        }
                        className="min-h-28 w-full rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                        placeholder="Alasan perubahan shift"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="portal-primary-bg inline-flex h-12 w-full items-center justify-center rounded-[10px] text-sm font-bold disabled:opacity-60"
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim pengajuan'}
                    </button>
                </form>
            </section>

            <section className="mt-5 rounded-[18px] border border-slate-200 bg-white px-5 py-5">
                <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                    Riwayat
                </p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-950">
                    Pengajuan ubah shift
                </h2>

                <div className="mt-5 space-y-3">
                    {items.length ? (
                        items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[14px] border border-slate-200 bg-white px-4 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {formatDate(item.requested_date)}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {formatShift(item.current_shift)} ke{' '}
                                            {formatShift(item.requested_shift)}
                                        </p>
                                        {item.reason ? (
                                            <p className="mt-2 text-sm leading-5 text-slate-600">
                                                {item.reason}
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
                            Belum ada pengajuan ubah shift.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
