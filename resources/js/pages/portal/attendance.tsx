import {
    CalendarClock,
    CalendarDays,
    ChevronRight,
    Clock3,
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

type ShiftPayload = {
    id: number;
    code: string;
    name: string;
    start_time: string | null;
    end_time: string | null;
    is_day_off: boolean;
};

type AttendanceItem = {
    id: number;
    employee_id: number;
    employee_label: string;
    attendance_date: string;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
    notes: string | null;
    late_minutes?: number | null;
    is_half_day?: boolean;
    shift?: ShiftPayload | null;
};

type AttendancePayload = {
    summary: {
        present: number;
        late: number;
        on_leave: number;
        absent: number;
    };
    items: AttendanceItem[];
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
        return 'Hari Libur';
    }

    if (!shift.start_time || !shift.end_time) {
        return 'Jam kerja belum diatur';
    }

    return `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;
};

const formatLateMinutes = (minutes: number | null | undefined): string => {
    if (!minutes || minutes <= 0) {
        return '';
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (hours > 0 && remaining > 0) {
        return `${hours} jam ${remaining} menit`;
    }

    if (hours > 0) {
        return `${hours} jam`;
    }

    return `${remaining} menit`;
};

export default function PortalAttendancePage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [attendance, setAttendance] = useState<AttendancePayload | null>(null);
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
    const todayAttendance =
        portal?.quick_action.attendance ??
        portal?.quick_action.open_attendance ??
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
            eyebrow="Jadwal & Absensi"
            description="Pantau shift kerja, ringkasan kehadiran bulanan, dan riwayat absensi Anda."
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
            {/* Shift Hari Ini Hero Card */}
            <section className="portal-material rounded-[var(--portal-radius-surface)] border p-4.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="portal-primary-soft inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
                            <CalendarClock className="portal-primary-text size-5.5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--portal-color-muted)]">
                                Shift Hari Ini
                            </p>
                            <h2 className="portal-display mt-0.5 text-lg font-bold tracking-tight text-[var(--portal-color-ink)]">
                                {todayShift?.name ?? 'Belum ada jadwal shift'}
                            </h2>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[var(--portal-color-muted)]">
                                <Clock3 className="size-3.5 shrink-0" />
                                <span>{formatShiftRange(todayShift)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 text-right">
                        {todayShift?.is_day_off ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                Libur
                            </span>
                        ) : todayAttendance?.check_in_at ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                Sudah Masuk ({formatTime(todayAttendance.check_in_at)})
                            </span>
                        ) : (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                Belum Absen
                            </span>
                        )}
                        {portal?.today?.formatted ? (
                            <p className="mt-1 text-[11px] text-[var(--portal-color-muted)]">
                                {portal.today.formatted}
                            </p>
                        ) : null}
                    </div>
                </div>

                {/* Schedule Quick Actions */}
                <div className="mt-4 flex gap-2">
                    <a
                        href="/portal/shift-change"
                        className="portal-primary-bg portal-pressable portal-focus-ring inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[var(--portal-radius-control)] px-2 text-center text-sm font-bold"
                    >
                        <CalendarClock className="size-4 shrink-0" />
                        <span>Ubah Jadwal</span>
                    </a>
                    <a
                        href="/portal/attendance-request"
                        className="portal-pressable portal-focus-ring inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-2 text-center text-sm font-bold text-[var(--portal-color-ink)]"
                    >
                        <Clock3 className="size-4 shrink-0" />
                        <span>Req Absensi</span>
                    </a>
                </div>
            </section>

            {/* Monthly Attendance Summary */}
            <section className="portal-material mt-4 rounded-[var(--portal-radius-surface)] border p-4.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="portal-primary-soft inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--portal-radius-control)]">
                            <CalendarDays className="portal-primary-text size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--portal-color-muted)]">
                                Ringkasan Kehadiran
                            </p>
                            <p className="portal-display truncate text-base font-bold text-[var(--portal-color-ink)]">
                                {periodLabel}
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="sr-only" htmlFor="attendance-period">
                            Pilih periode bulan
                        </label>
                        <input
                            type="month"
                            id="attendance-period"
                            value={period}
                            onChange={(event) => setPeriod(event.target.value)}
                            className="portal-focus-ring min-h-10 max-w-[8.5rem] rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-2.5 text-xs font-semibold text-[var(--portal-color-ink)]"
                            aria-label="Pilih periode bulan"
                        />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                    <div className="rounded-[var(--portal-radius-control)] border border-emerald-100 bg-emerald-50/50 p-3 text-center">
                        <p className="text-xs font-medium text-emerald-800">
                            Hadir
                        </p>
                        <p className="portal-tabular portal-display mt-1 text-2xl font-extrabold text-emerald-950">
                            {attendance?.summary.present ?? 0}
                        </p>
                        <p className="mt-0.5 text-[10px] text-emerald-700/80">
                            Hari kerja
                        </p>
                    </div>

                    <div className="rounded-[var(--portal-radius-control)] border border-amber-100 bg-amber-50/50 p-3 text-center">
                        <p className="text-xs font-medium text-amber-800">
                            Terlambat
                        </p>
                        <p className="portal-tabular portal-display mt-1 text-2xl font-extrabold text-amber-950">
                            {attendance?.summary.late ?? 0}
                        </p>
                        <p className="mt-0.5 text-[10px] text-amber-700/80">
                            Kali telat
                        </p>
                    </div>

                    <div className="rounded-[var(--portal-radius-control)] border border-sky-100 bg-sky-50/50 p-3 text-center">
                        <p className="text-xs font-medium text-sky-800">
                            Cuti/Izin
                        </p>
                        <p className="portal-tabular portal-display mt-1 text-2xl font-extrabold text-sky-950">
                            {leaveOrPermit}
                        </p>
                        <p className="mt-0.5 text-[10px] text-sky-700/80">
                            Hari libur
                        </p>
                    </div>
                </div>
            </section>

            {/* Attendance History */}
            <section className="portal-material mt-4 rounded-[var(--portal-radius-surface)] border p-4.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="portal-primary-soft inline-flex size-10 items-center justify-center rounded-xl">
                            <History className="portal-primary-text size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-medium text-[var(--portal-color-muted)]">
                                Riwayat Absensi
                            </p>
                            <h2 className="portal-display mt-0.5 text-base font-bold text-[var(--portal-color-ink)]">
                                {periodLabel}
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={retry}
                        className="portal-pressable portal-focus-ring inline-flex size-10 items-center justify-center rounded-full border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] text-[var(--portal-color-ink-soft)]"
                        aria-label="Muat ulang jadwal"
                    >
                        <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="mt-4 space-y-3" aria-label="Memuat jadwal">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-18 animate-pulse rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)]"
                            />
                        ))}
                    </div>
                ) : loadError ? (
                    <div className="mt-4 rounded-[var(--portal-radius-control)] border border-rose-200 bg-rose-50/60 p-4">
                        <p className="text-sm font-semibold text-rose-900">
                            Jadwal belum termuat
                        </p>
                        <p className="mt-1 text-xs text-rose-700">
                            {loadError}
                        </p>
                        <button
                            type="button"
                            onClick={retry}
                            className="portal-pressable portal-focus-ring mt-3 inline-flex min-h-10 items-center gap-2 rounded-[var(--portal-radius-control)] bg-[var(--portal-color-ink)] px-3.5 text-xs font-semibold text-[var(--portal-color-paper)]"
                        >
                            Coba lagi <ChevronRight className="size-3.5" />
                        </button>
                    </div>
                ) : attendance?.items.length ? (
                    <div className="mt-4 divide-y divide-[var(--portal-color-rule)]">
                        {attendance.items.map((item) => {
                            const lateText = formatLateMinutes(item.late_minutes);

                            return (
                                <article
                                    key={item.id}
                                    className="py-3.5 first:pt-1 last:pb-1"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold">
                                                {formatDate(item.attendance_date)}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--portal-color-muted)]">
                                                {item.shift ? (
                                                    <span className="font-medium text-[var(--portal-color-ink-soft)]">
                                                        {item.shift.name}
                                                    </span>
                                                ) : null}
                                                <span>
                                                    Masuk {formatTime(item.check_in_at)} · Keluar {formatTime(item.check_out_at)}
                                                </span>
                                            </div>

                                            {(lateText || item.is_half_day || item.notes) ? (
                                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                    {lateText ? (
                                                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/60">
                                                            Terlambat {lateText}
                                                        </span>
                                                    ) : null}
                                                    {item.is_half_day ? (
                                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 border border-blue-200/60">
                                                            Setengah Hari
                                                        </span>
                                                    ) : null}
                                                    {item.notes ? (
                                                        <span className="line-clamp-1 text-[11px] text-[var(--portal-color-muted)] italic">
                                                            "{item.notes}"
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${chips[item.status] ?? 'bg-stone-200 text-stone-800'}`}
                                        >
                                            {statusLabels[item.status] ?? item.status}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4 rounded-[var(--portal-radius-control)] border border-dashed border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-4 py-8 text-center">
                        <CalendarDays className="mx-auto size-8 text-[var(--portal-color-muted)] opacity-60" />
                        <p className="mt-2 text-sm font-semibold text-[var(--portal-color-ink)]">
                            Belum Ada Riwayat Absensi
                        </p>
                        <p className="mt-1 text-xs text-[var(--portal-color-muted)]">
                            Belum ada catatan kehadiran untuk bulan {periodLabel}.
                        </p>
                    </div>
                )}
            </section>
        </PortalShell>
    );
}
