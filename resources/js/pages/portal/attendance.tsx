import {
    CalendarClock,
    CalendarDays,
    History,
    PlaneTakeoff,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

type AttendancePayload = {
    summary: {
        present: number;
        late: number;
        on_leave: number;
        absent: number;
    };
    items: Array<{
        id: number;
        employee_id: number;
        employee_label: string;
        attendance_date: string;
        status: string;
        check_in_at: string | null;
        check_out_at: string | null;
        notes: string | null;
    }>;
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
    today: { date: string; formatted: string };
    employee: { id: number } | null;
    quick_action: {
        shift: ShiftPayload | null;
        attendance: {
            id: number;
            attendance_date: string | null;
            status: string;
            shift: ShiftPayload | null;
            check_in_at: string | null;
            check_out_at: string | null;
            notes: string | null;
        } | null;
        open_attendance: {
            id: number;
            attendance_date: string | null;
            status: string;
            shift: ShiftPayload | null;
            check_in_at: string | null;
            check_out_at: string | null;
            notes: string | null;
        } | null;
        hint: string;
    };
    links: PortalLinkMap;
};

const countWorkdaysUntilToday = (date?: string): number => {
    const today = date ? new Date(date) : new Date();

    if (Number.isNaN(today.getTime())) {
        return 0;
    }

    const year = today.getFullYear();
    const month = today.getMonth();
    let total = 0;

    for (let day = 1; day <= today.getDate(); day += 1) {
        const current = new Date(year, month, day);
        const weekDay = current.getDay();

        if (weekDay !== 0 && weekDay !== 6) {
            total += 1;
        }
    }

    return total;
};

const formatShiftRange = (shift: ShiftPayload | null): string => {
    if (!shift) {
        return 'Belum ada shift hari ini';
    }

    if (shift.is_day_off) {
        return 'Libur';
    }

    if (!shift.start_time || !shift.end_time) {
        return 'Jam shift belum diatur';
    }

    return `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;
};

export default function PortalAttendancePage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [attendance, setAttendance] = useState<AttendancePayload | null>(
        null,
    );

    const loadData = async () => {
        try {
            const [portalResponse, attendanceResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<AttendancePayload>(
                    `/portal/api/attendances?period=${new Date().toISOString().slice(0, 7)}&per_page=31`,
                ),
            ]);

            setPortal(portalResponse.data);
            setAttendance(attendanceResponse.data);
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data jadwal tidak bisa dimuat.',
                      )
                    : 'Data jadwal tidak bisa dimuat.',
            );
        }
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const todayShift =
        portal?.quick_action.shift ??
        portal?.quick_action.open_attendance?.shift ??
        portal?.quick_action.attendance?.shift ??
        null;
    const workdays = useMemo(
        () => countWorkdaysUntilToday(portal?.today.date),
        [portal?.today.date],
    );
    const leaveOrPermit =
        (attendance?.summary.on_leave ?? 0) + (attendance?.summary.absent ?? 0);

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Jadwal kerja"
            description="Pantau shift, ringkasan kehadiran, dan riwayat absensi bulan ini."
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
            <section className="grid grid-cols-2 gap-3">
                <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                    <span className="portal-primary-soft inline-flex size-10 items-center justify-center rounded-xl">
                        <CalendarDays className="portal-primary-text size-5" />
                    </span>
                    <p className="mt-4 text-xs tracking-[0.2em] text-slate-500 uppercase">
                        Hari kerja
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-950">
                        {workdays}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">bulan ini</p>
                </div>
                <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-4">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                        <PlaneTakeoff className="size-5" />
                    </span>
                    <p className="mt-4 text-xs tracking-[0.2em] text-slate-500 uppercase">
                        Cuti/Izin
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-950">
                        {leaveOrPermit}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">kali</p>
                </div>
            </section>

            <section className="mt-5 rounded-[18px] border border-slate-200 bg-white px-5 py-5">
                <div className="flex items-start gap-3">
                    <span className="portal-primary-soft inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
                        <CalendarClock className="portal-primary-text size-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Shift hari ini
                        </p>
                        <h2 className="mt-1 text-2xl font-black tracking-[-0.06em] text-slate-950">
                            {todayShift?.name ?? 'Belum ada shift'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            {formatShiftRange(todayShift)}
                        </p>
                    </div>
                </div>

                <a
                    href="/portal/shift-change"
                    className="portal-primary-bg mt-5 inline-flex h-12 w-full items-center justify-center rounded-[12px] text-sm font-bold"
                >
                    Ubah Jadwal Saya
                </a>
            </section>

            <section className="mt-5 rounded-[18px] border border-slate-200 bg-white px-5 py-5">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-xl">
                        <History className="portal-primary-text size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Bulan ini
                        </p>
                        <h2 className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-950">
                            History absensi
                        </h2>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    {attendance?.items.length ? (
                        attendance.items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[14px] border border-slate-200 bg-white px-4 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {formatDate(item.attendance_date)}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Masuk {formatTime(item.check_in_at)}{' '}
                                            · Keluar{' '}
                                            {formatTime(item.check_out_at)}
                                        </p>
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
                            Belum ada history absensi bulan ini.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
