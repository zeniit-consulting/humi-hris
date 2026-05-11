import { TimerReset } from 'lucide-react';
import { useEffect, useState } from 'react';
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

type PortalSummary = {
    employee: { id: number } | null;
    links: PortalLinkMap;
};

type OvertimePayload = {
    items: Array<{
        id: number;
        work_date: string;
        start_time: string | null;
        end_time: string | null;
        break_minutes: number;
        total_hours: number;
        reason: string | null;
        status: string;
    }>;
};

export default function PortalOvertimesPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<OvertimePayload['items']>([]);
    const [form, setForm] = useState({
        work_date: '',
        start_time: '',
        end_time: '',
        break_minutes: '0',
        reason: '',
    });

    const loadData = async () => {
        try {
            const [portalResponse, overtimeResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<OvertimePayload>(
                    '/portal/api/overtimes?scope=all&per_page=20',
                ),
            ]);

            setPortal(portalResponse.data);
            setItems(overtimeResponse.data.items);
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data lembur tidak bisa dimuat.',
                      )
                    : 'Data lembur tidak bisa dimuat.',
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
            await requestApi('/portal/api/overtimes', 'POST', {
                employee_id: portal.employee.id,
                work_date: form.work_date,
                start_time: form.start_time,
                end_time: form.end_time,
                break_minutes: Number(form.break_minutes || 0),
                reason: form.reason,
                status: 'pending',
            });

            setForm({
                work_date: '',
                start_time: '',
                end_time: '',
                break_minutes: '0',
                reason: '',
            });
            notifyPortal('success', 'Pengajuan lembur berhasil dikirim.');
            await loadData();
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Pengajuan lembur gagal.',
                      )
                    : 'Pengajuan lembur gagal.',
            );
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Pengajuan lembur"
            description="Ajukan lembur pribadi dan cek status persetujuannya."
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
                        <TimerReset className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Pengajuan baru
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Ajukan lembur
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <input
                        type="date"
                        value={form.work_date}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                work_date: event.target.value,
                            }))
                        }
                        className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                        required
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="time"
                            value={form.start_time}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    start_time: event.target.value,
                                }))
                            }
                            className="h-12 rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                            required
                        />
                        <input
                            type="time"
                            value={form.end_time}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    end_time: event.target.value,
                                }))
                            }
                            className="h-12 rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                            required
                        />
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="480"
                        value={form.break_minutes}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                break_minutes: event.target.value,
                            }))
                        }
                        className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                        placeholder="Durasi istirahat (menit)"
                    />
                    <textarea
                        value={form.reason}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                reason: event.target.value,
                            }))
                        }
                        className="min-h-28 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
                        placeholder="Alasan lembur"
                    />
                    <button
                        type="submit"
                        className="portal-primary-bg inline-flex h-12 w-full items-center justify-center rounded-[9px] text-sm font-semibold"
                    >
                        Kirim pengajuan lembur
                    </button>
                </form>
            </section>

            <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                    Daftar pengajuan
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">
                    Riwayat lembur
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
                                            {formatDate(item.work_date)}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.start_time} - {item.end_time}{' '}
                                            · {item.total_hours} jam
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
                            Belum ada pengajuan lembur.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
