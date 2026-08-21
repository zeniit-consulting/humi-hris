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

type OvertimeEventItem = {
    code?: string;
    name: string;
    nominal: number;
    unit?: 'kegiatan' | 'hari' | 'jam' | 'kehadiran';
    position_ids?: number[];
};

type PortalSummary = {
    employee: { id: number; position_id?: number | null } | null;
    links: PortalLinkMap;
    overtime_events?: OvertimeEventItem[];
};

type OvertimePayload = {
    items: Array<{
        id: number;
        work_date: string;
        is_event?: boolean;
        event_name?: string | null;
        event_nominal?: number | null;
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
        is_event: false,
        event_name: '',
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
        loadData();
    }, []);

    const overtimeEvents = portal?.overtime_events ?? [];
    const selectedEvent = overtimeEvents.find((e) => e.name === form.event_name);

    const calculateHours = (startTime: string, endTime: string, breakMins: string) => {
        if (!startTime || !endTime) return 0;
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
        let startMinutes = startH * 60 + startM;
        let endMinutes = endH * 60 + endM;
        if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60;
        }
        const netMinutes = Math.max(endMinutes - startMinutes - (Number(breakMins) || 0), 0);
        return Math.round((netMinutes / 60) * 100) / 100;
    };

    const calculatedHours = calculateHours(form.start_time, form.end_time, form.break_minutes);

    const estimatedEventNominal = (() => {
        if (!form.is_event || !selectedEvent) return 0;
        const baseNominal = Number(selectedEvent.nominal ?? 0);
        if (selectedEvent.unit === 'jam') {
            return Math.round(baseNominal * calculatedHours);
        }
        return baseNominal;
    })();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!portal?.employee) {
            return;
        }

        try {
            await requestApi('/portal/api/overtimes', 'POST', {
                employee_id: portal.employee.id,
                work_date: form.work_date,
                is_event: form.is_event,
                event_name: form.is_event ? form.event_name : null,
                start_time: form.start_time,
                end_time: form.end_time,
                break_minutes: Number(form.break_minutes || 0),
                reason: form.reason,
                status: 'pending',
            });

            setForm({
                work_date: '',
                is_event: false,
                event_name: '',
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
                    {/* Event Overtime Toggle */}
                    <div className="rounded-[10px] border border-stone-200 bg-stone-50 p-3 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input
                                type="checkbox"
                                checked={form.is_event}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setForm((current) => ({
                                        ...current,
                                        is_event: checked,
                                        event_name: checked ? current.event_name : '',
                                    }));
                                }}
                                className="size-4 rounded border-stone-300"
                            />
                            <span>Lembur Event / Kegiatan Khusus (Sesuai Jabatan)</span>
                        </label>

                        {form.is_event && (
                            <div className="pt-2 border-t border-stone-200 space-y-2">
                                <select
                                    value={form.event_name}
                                    onChange={(e) =>
                                        setForm((current) => ({
                                            ...current,
                                            event_name: e.target.value,
                                        }))
                                    }
                                    className="h-11 w-full rounded-[8px] border border-stone-200 bg-white px-3 text-sm outline-none"
                                    required={form.is_event}
                                >
                                    <option value="">-- Pilih Event Lembur --</option>
                                    {overtimeEvents.map((ev, idx) => (
                                        <option key={idx} value={ev.name}>
                                            {ev.code ? `[${ev.code}] ` : ''}{ev.name} — Rp {Number(ev.nominal).toLocaleString('id-ID')} / {ev.unit ?? 'kegiatan'}
                                        </option>
                                    ))}
                                </select>

                                {selectedEvent && (
                                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900 border border-emerald-200">
                                        <div>
                                            <p className="font-semibold">{selectedEvent.name}</p>
                                            <p className="text-emerald-700">
                                                Rp {Number(selectedEvent.nominal).toLocaleString('id-ID')} / {selectedEvent.unit ?? 'kegiatan'}
                                                {selectedEvent.unit === 'jam' && ` × ${calculatedHours} jam`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase text-emerald-600 block">Estimasi Upah</span>
                                            <span className="text-sm font-bold text-emerald-900">
                                                Rp {estimatedEventNominal.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {formatDate(item.work_date)}
                                            </p>
                                            {item.is_event && (
                                                <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[11px] font-medium text-purple-700">
                                                    {item.event_name || 'Event'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.start_time} - {item.end_time}{' '}
                                            · {item.total_hours} jam
                                            {item.is_event && item.event_nominal !== null && item.event_nominal !== undefined && (
                                                <span className="ml-1.5 font-medium text-emerald-600">
                                                    (Rp {Number(item.event_nominal).toLocaleString('id-ID')})
                                                </span>
                                            )}
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
