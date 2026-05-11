import { PlaneTakeoff } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    chips,
    formatDate,
    leaveTypeLabels,
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

type PortalSummary = {
    employee: { id: number } | null;
    links: PortalLinkMap;
};

type LeavePayload = {
    items: Array<{
        id: number;
        leave_type: string;
        start_date: string;
        end_date: string;
        total_days: number;
        reason: string | null;
        status: string;
        rejection_reason: string | null;
    }>;
};

export default function PortalLeavesPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<LeavePayload['items']>([]);
    const [form, setForm] = useState({
        leave_type:
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('type') === 'sick'
                ? 'sick'
                : 'annual',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const loadData = async () => {
        try {
            const [portalResponse, leavesResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<LeavePayload>(
                    '/portal/api/leaves?scope=all&per_page=20',
                ),
            ]);

            setPortal(portalResponse.data);
            setItems(leavesResponse.data.items);
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data cuti tidak bisa dimuat.',
                      )
                    : 'Data cuti tidak bisa dimuat.',
            );
        }
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!portal?.employee) {
            return;
        }

        try {
            await requestApi('/portal/api/leaves', 'POST', {
                employee_id: portal.employee.id,
                leave_type: form.leave_type,
                start_date: form.start_date,
                end_date: form.end_date,
                reason: form.reason,
                status: 'pending',
            });

            setForm({
                leave_type: 'annual',
                start_date: '',
                end_date: '',
                reason: '',
            });
            notifyPortal('success', 'Pengajuan cuti berhasil dikirim.');
            await loadData();
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Pengajuan cuti gagal.',
                      )
                    : 'Pengajuan cuti gagal.',
            );
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Pengajuan cuti"
            description="Ajukan cuti pribadi dan pantau status persetujuannya."
            active="home"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <PlaneTakeoff className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Pengajuan baru
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Ajukan cuti
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <select
                        value={form.leave_type}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                leave_type: event.target.value,
                            }))
                        }
                        className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                    >
                        <option value="annual">Cuti tahunan</option>
                        <option value="sick">Cuti sakit</option>
                        <option value="unpaid">Cuti tanpa gaji</option>
                        <option value="other">Cuti lainnya</option>
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={form.start_date}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    start_date: event.target.value,
                                }))
                            }
                            className="h-12 rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                            required
                        />
                        <input
                            type="date"
                            value={form.end_date}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    end_date: event.target.value,
                                }))
                            }
                            className="h-12 rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                            required
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
                        className="min-h-28 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                        placeholder="Alasan cuti"
                    />
                    <button
                        type="submit"
                        className="portal-primary-bg inline-flex h-12 w-full items-center justify-center rounded-[9px] text-sm font-semibold"
                    >
                        Kirim pengajuan
                    </button>
                </form>
            </section>

            <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                    Daftar pengajuan
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">
                    Riwayat pengajuan
                </h2>

                <div className="mt-5 space-y-3">
                    {items.length ? (
                        items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[12px] border border-stone-200/80 bg-stone-50 px-4 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {leaveTypeLabels[item.leave_type] ??
                                                item.leave_type}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {formatDate(item.start_date)} -{' '}
                                            {formatDate(item.end_date)} ·{' '}
                                            {item.total_days} hari
                                        </p>
                                        {item.reason ? (
                                            <p className="mt-2 text-sm text-slate-600">
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
                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                            Belum ada pengajuan cuti.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
