import {
    CalendarClock,
    CalendarDays,
    ChevronRight,
    History,
    RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    chips,
    formatDate,
    formatTime,
    localMonthString,
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
    const [period, setPeriod] = useState(localMonthString());
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);

        try {
            const [portalResponse, attendanceResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<AttendancePayload>(
                    `/portal/api/attendances?period=${period}&per_page=31`,
                ),
            ]);

            setPortal(portalResponse.data);
            setAttendance(attendanceResponse.data);
        } catch (loadError) {
            const message =
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data jadwal tidak bisa dimuat.',
                      )
                    : 'Data jadwal tidak bisa dimuat.';

            setLoadError(message);
            notifyPortal('error', message);
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const todayShift =
        portal?.quick_action.shift ??
        portal?.quick_action.open_attendance?.shift ??
        portal?.quick_action.attendance?.shift ??
        null;
    const leaveOrPermit =
        (attendance?.summary.on_leave ?? 0) + (attendance?.summary.absent ?? 0);
    const periodLabel = period
        ? new Intl.DateTimeFormat('id-ID', {
              month: 'long',
              year: 'numeric',
          }).format(new Date(`${period}-01T12:00:00`))
        : 'Bulan ini';

    const retry = () => {
        void loadData();
    };

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
            <section className="portal-material rounded-[var(--portal-radius-surface)] border p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="portal-primary-soft inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--portal-radius-control)]">
                            <CalendarDays className="portal-primary-text size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs text-[var(--portal-color-muted)]">
                                Ringkasan kehadiran
                            </p>
                            <p className="portal-display truncate text-base font-bold">
                                {periodLabel}
                            </p>
                        </div>
                    </div>
                    <label className="sr-only" htmlFor="attendance-period">
                        Pilih periode
                    </label>
                    <input
                        type="month"
                        id="attendance-period"
                        value={period}
                        onChange={(event) => setPeriod(event.target.value)}
                        className="portal-focus-ring min-h-11 max-w-[8.5rem] rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-xs font-semibold text-[var(--portal-color-ink)]"
                        aria-label="Pilih periode"
                    />
                </div>

                <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--portal-color-rule)] border-y border-[var(--portal-color-rule)] py-3">
                    <div className="pr-3">
                        <p className="text-xs text-[var(--portal-color-muted)]">
                            Hadir
                        </p>
                        <p className="portal-tabular portal-display mt-1 text-xl font-extrabold">
                            {attendance?.summary.present ?? 0}
                        </p>
                    </div>
                    <div className="px-3">
                        <p className="text-xs text-[var(--portal-color-muted)]">
                            Terlambat
                        </p>
                        <p className="portal-tabular portal-display mt-1 text-xl font-extrabold">
                            {attendance?.summary.late ?? 0}
                        </p>
                    </div>
                    <div className="pl-3">
                        <p className="text-xs text-[var(--portal-color-muted)]">
                            Cuti/Izin
                        </p>
                        <p className="portal-tabular portal-display mt-1 text-xl font-extrabold">
                            {leaveOrPermit}
                        </p>
                    </div>
                </div>
            </section>

            <section className="portal-material mt-4 rounded-[var(--portal-radius-surface)] border p-4">
                <div className="flex items-start gap-3">
                    <span className="portal-primary-soft inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
                        <CalendarClock className="portal-primary-text size-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs text-[var(--portal-color-muted)]">
                            Shift hari ini
                        </p>
                        <h2 className="portal-display mt-1 text-xl font-extrabold">
                            {todayShift?.name ?? 'Belum ada shift'}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--portal-color-muted)]">
                            {formatShiftRange(todayShift)}
                        </p>
                    </div>
                </div>

                <a
                    href="/portal/shift-change"
                    className="portal-primary-bg portal-pressable portal-focus-ring mt-4 inline-flex h-12 w-full items-center justify-center rounded-[var(--portal-radius-control)] text-sm font-bold"
                >
                    Ubah Jadwal Saya
                </a>
                <a
                    href="/portal/attendance-request"
                    className="portal-pressable portal-focus-ring mt-2 inline-flex h-12 w-full items-center justify-center rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] text-sm font-bold text-[var(--portal-color-ink)]"
                >
                    Request Absensi Manual
                </a>
            </section>

            <section className="portal-material mt-4 rounded-[var(--portal-radius-surface)] border p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-xl">
                            <History className="portal-primary-text size-5" />
                        </span>
                        <div>
                            <p className="text-xs text-[var(--portal-color-muted)]">
                                Riwayat absensi
                            </p>
                            <h2 className="portal-display mt-1 text-lg font-extrabold">
                                {periodLabel}
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={retry}
                        className="portal-pressable portal-focus-ring inline-flex size-11 items-center justify-center rounded-full border border-[var(--portal-color-rule)] text-[var(--portal-color-accent-strong)]"
                        aria-label="Muat ulang jadwal"
                    >
                        <RefreshCw className="size-4" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="mt-5 space-y-3" aria-label="Memuat jadwal">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-16 animate-pulse rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)]"
                            />
                        ))}
                    </div>
                ) : loadError ? (
                    <div className="mt-5 rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] p-4">
                        <p className="text-sm font-semibold">
                            Jadwal belum termuat
                        </p>
                        <p className="mt-1 text-sm text-[var(--portal-color-muted)]">
                            {loadError}
                        </p>
                        <button
                            type="button"
                            onClick={retry}
                            className="portal-pressable portal-focus-ring mt-3 inline-flex min-h-11 items-center gap-2 rounded-[var(--portal-radius-control)] bg-[var(--portal-color-ink)] px-4 text-sm font-semibold text-[var(--portal-color-paper)]"
                        >
                            Coba lagi <ChevronRight className="size-4" />
                        </button>
                    </div>
                ) : attendance?.items.length ? (
                    <div className="mt-5 space-y-0">
                        {attendance.items.map((item) => (
                            <article
                                key={item.id}
                                className="relative flex gap-3 border-b border-[var(--portal-color-rule)] py-3 last:border-b-0"
                            >
                                <div className="flex w-12 shrink-0 flex-col items-center pt-0.5">
                                    <span className="portal-tabular text-xs font-semibold text-[var(--portal-color-muted)]">
                                        {formatDate(item.attendance_date)}
                                    </span>
                                    <span className="mt-2 size-2 rounded-full bg-[var(--portal-color-accent)]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">
                                                {formatDate(
                                                    item.attendance_date,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--portal-color-muted)]">
                                                Masuk{' '}
                                                {formatTime(item.check_in_at)} ·
                                                Keluar{' '}
                                                {formatTime(item.check_out_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${chips[item.status] ?? 'bg-stone-200 text-stone-800'}`}
                                        >
                                            {statusLabels[item.status] ??
                                                item.status}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-5 rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface)] px-4 py-5 text-sm text-[var(--portal-color-muted)]">
                        Belum ada history absensi bulan ini.
                    </div>
                )}
            </section>
        </PortalShell>
    );
}
