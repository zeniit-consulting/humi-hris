// Hallmark · audience: karyawan · use: melihat status kerja dan melakukan absensi · tone: utilitarian
// Hallmark · genre: modern-minimal · macrostructure: Operational Workbench · theme: Starline-adapted · anchor: Humi teal
// Hallmark · pre-emit critique: P4 H5 E4 S5 R4 V4 · contrast: pass (46–50) · responsive: pass (36, 59, 61–69)
import { Head, Link } from '@inertiajs/react';
import {
    BellRing,
    CalendarDays,
    ChevronRight,
    CircleCheck,
    ClipboardCheck,
    Clock3,
    HandCoins,
    History,
    LogOut,
    PackageCheck,
    ReceiptText,
    RotateCcw,
    ScanLine,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { notifyPortal, requestApi, translatePortalError } from './lib';
import { PortalNavbar } from './navbar';
import { PortalToastViewport } from './toast';

type ShiftPayload = {
    id: number;
    code: string;
    name: string;
    start_time: string | null;
    end_time: string | null;
    is_day_off: boolean;
};

type AttendancePayload = {
    id: number;
    attendance_date: string | null;
    status: string;
    shift: ShiftPayload | null;
    check_in_at: string | null;
    check_out_at: string | null;
    notes: string | null;
};

type PortalSummary = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string | null;
    };
    today: {
        date: string;
        formatted: string;
    };
    employee: {
        id: number;
        employee_code: string;
        full_name: string;
        email: string | null;
        employment_status: string | null;
        employment_type: string | null;
        is_wfa: boolean;
        division: { id: number; name: string } | null;
        position: { id: number; name: string } | null;
    } | null;
    quick_action: {
        shift: ShiftPayload | null;
        attendance: AttendancePayload | null;
        open_attendance: AttendancePayload | null;
        can_clock_in: boolean;
        can_clock_out: boolean;
        hint: string;
    };
    cards: {
        annual_leave_days: number;
        sick_leave_days: number;
        pending_surveys: number;
        assigned_assets: number;
        payroll_preview: {
            period: string;
            is_saved: boolean;
            generated_at: string | null;
            net_salary: string | null;
        };
    };
    announcements: Array<{
        id: number;
        title: string;
        message: string;
        publish_at: string | null;
    }>;
    surveys: Array<{
        id: number;
        title: string;
        description: string | null;
        is_anonymous: boolean;
        questions_count: number;
        ends_at: string | null;
    }>;
    assets: Array<{
        id: number;
        asset_code: string | null;
        name: string;
        category: string | null;
        issued_at: string | null;
        condition_out: string | null;
    }>;
    timeline: Array<{
        id: string;
        type: string;
        date: string;
        month_label: string;
        day_label: string;
        title: string;
        subtitle: string;
        chip: string;
    }>;
    links: {
        attendance: string;
        leaves: string;
        overtimes: string;
        kasbons?: string;
        reimbursements?: string;
        payroll: string;
        activity?: string;
        profile?: string;
        dashboard: string;
    };
    features?: {
        kasbon?: boolean;
    };
};

type AttendanceFocusState = {
    description: string;
    href: string;
    actionLabel: string;
};

type AttentionItem = {
    key: string;
    label: string;
    title: string;
    href: string;
    icon: LucideIcon;
};

const fallbackLinks: PortalSummary['links'] = {
    attendance: '/portal/attendance',
    leaves: '/portal/leaves',
    overtimes: '/portal/overtimes',
    reimbursements: '/portal/reimbursements',
    payroll: '/portal/payroll',
    activity: '/portal/activity',
    profile: '/portal/profile',
    dashboard: '/portal',
};

const quickLinks = [
    { key: 'attendance', label: 'Absensi', icon: ScanLine },
    { key: 'leaves', label: 'Cuti', icon: CalendarDays },
    { key: 'overtimes', label: 'Lembur', icon: Clock3 },
    { key: 'kasbons', label: 'Kasbon', icon: HandCoins },
    { key: 'reimbursements', label: 'Reimburse', icon: ReceiptText },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
] as const;

const formatTime = (value: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
        .format(date)
        .replace('.', ':');
};

const resolveAttendanceFocus = (
    summary: PortalSummary | null,
): AttendanceFocusState => {
    const action = summary?.quick_action;
    const attendanceHref =
        summary?.links.attendance ?? fallbackLinks.attendance;

    if (action?.shift?.is_day_off) {
        return {
            description: action.hint,
            href: attendanceHref,
            actionLabel: 'Lihat jadwal',
        };
    }

    if (action?.can_clock_in) {
        return {
            description: action.hint,
            href: '/portal/check-in',
            actionLabel: 'Mulai kerja',
        };
    }

    if (action?.can_clock_out) {
        return {
            description: action.hint,
            href: '/portal/check-out',
            actionLabel: 'Selesaikan kerja',
        };
    }

    return {
        description: action?.hint ?? 'Lihat rincian kehadiran Anda.',
        href: attendanceHref,
        actionLabel: 'Lihat absensi',
    };
};

const initials = (value: string) =>
    value
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

export default function PortalPage() {
    const [summary, setSummary] = useState<PortalSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const cancelLogoutRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let cancelled = false;

        const loadSummary = async () => {
            setIsLoading(true);
            setLoadFailed(false);

            try {
                const response = await requestApi<PortalSummary>(
                    '/portal/api/summary',
                );

                if (cancelled) {
                    return;
                }

                startTransition(() => {
                    setSummary(response.data);
                    setIsLoading(false);
                });
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                notifyPortal(
                    'error',
                    loadError instanceof Error
                        ? translatePortalError(
                              loadError.message,
                              'Data portal tidak bisa dimuat.',
                          )
                        : 'Data portal tidak bisa dimuat.',
                );
                setLoadFailed(true);
                setIsLoading(false);
            }
        };

        void loadSummary();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    useEffect(() => {
        if (!logoutConfirmOpen) {
            return;
        }

        cancelLogoutRef.current?.focus();

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setLogoutConfirmOpen(false);
            }
        };

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [logoutConfirmOpen]);

    const headlineName =
        summary?.employee?.full_name ?? summary?.user.name ?? 'Pengguna';
    const firstName = headlineName.split(' ')[0] ?? headlineName;
    const links = summary?.links ?? fallbackLinks;
    const visibleQuickLinks = useMemo(
        () =>
            quickLinks.filter(
                (item) =>
                    item.key !== 'kasbons' ||
                    summary?.features?.kasbon === true,
            ),
        [summary],
    );
    const attendanceFocus = useMemo(
        () => resolveAttendanceFocus(summary),
        [summary],
    );
    const currentAttendance =
        summary?.quick_action.open_attendance ??
        summary?.quick_action.attendance ??
        null;
    const attentionItems = useMemo<AttentionItem[]>(() => {
        const items: AttentionItem[] = [];
        const announcement = summary?.announcements[0];
        const survey = summary?.surveys[0];
        const asset = summary?.assets[0];

        if (announcement) {
            items.push({
                key: `announcement-${announcement.id}`,
                label: 'Pengumuman terbaru',
                title: announcement.title,
                href: '/portal/announcements',
                icon: BellRing,
            });
        }

        if (survey) {
            items.push({
                key: `survey-${survey.id}`,
                label: 'Perlu diisi',
                title: survey.title,
                href: '/portal/surveys',
                icon: ClipboardCheck,
            });
        }

        if (asset) {
            items.push({
                key: `asset-${asset.id}`,
                label: 'Aset dititipkan',
                title: asset.name,
                href: '/portal/assets',
                icon: PackageCheck,
            });
        }

        return items;
    }, [summary?.announcements, summary?.assets, summary?.surveys]);

    return (
        <>
            <Head title="Portal Karyawan">
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="apple-mobile-web-app-title" content="Humi" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link
                    rel="apple-touch-icon"
                    href="/icons/apple-touch-icon.png"
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="portal-page min-h-screen overflow-x-clip">
                <PortalToastViewport />
                <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-32 sm:max-w-xl sm:px-6 md:max-w-2xl">
                    <div className="portal-top-header -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] rounded-b-[var(--portal-radius-surface)] bg-[var(--portal-color-accent-strong)] px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28 shadow-[var(--portal-shadow-raised)] sm:-mx-6 sm:px-6 sm:pb-32">
                        <header className="flex items-center justify-between gap-4 py-2">
                            <a
                                href={links.profile ?? fallbackLinks.profile}
                                className="portal-pressable portal-focus-ring flex min-h-14 min-w-0 items-center gap-3 rounded-[var(--portal-radius-control)] pr-2"
                                aria-label="Buka profil"
                            >
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--portal-radius-control)] bg-white/15 font-bold text-[var(--portal-color-paper)]">
                                    {initials(headlineName)}
                                </span>
                                <span className="min-w-0 text-left">
                                    <span className="block text-base font-bold text-[var(--portal-color-paper)]">
                                        Halo, {firstName}
                                    </span>
                                    <span className="block truncate text-xs font-normal text-[var(--portal-color-paper)]">
                                        {summary?.employee?.position?.name ??
                                            'Portal karyawan'}
                                    </span>
                                </span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setLogoutConfirmOpen(true)}
                                className="portal-pressable portal-focus-ring flex size-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[var(--portal-color-paper)]"
                                aria-label="Keluar dari portal"
                            >
                                <LogOut className="size-[18px]" />
                            </button>
                        </header>
                    </div>

                    <main className="flex-1 pt-0">
                        {isLoading ? <PortalHomeSkeleton /> : null}

                        {loadFailed ? (
                            <section className="rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] p-5">
                                <RotateCcw className="size-6 text-[var(--portal-color-accent-strong)]" />
                                <h1 className="portal-display mt-4 text-xl font-bold">
                                    Data portal belum termuat
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-[var(--portal-color-muted)]">
                                    Periksa koneksi Anda, lalu muat ulang data
                                    portal.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setReloadKey((current) => current + 1)
                                    }
                                    className="portal-pressable portal-focus-ring mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--portal-radius-control)] bg-[var(--portal-color-ink)] px-5 text-sm font-semibold whitespace-nowrap text-[var(--portal-color-paper)]"
                                >
                                    Muat ulang
                                </button>
                            </section>
                        ) : null}

                        {!isLoading && !loadFailed ? (
                            <div className="space-y-7 pb-3">
                                <section
                                    className="-mt-24 overflow-hidden rounded-[var(--portal-radius-surface)] border border-white/70 bg-[var(--portal-color-surface)] shadow-[var(--portal-shadow-float)] sm:-mt-28"
                                    aria-live="polite"
                                >
                                    <div className="border-b border-[var(--portal-color-rule)] bg-[var(--portal-color-accent-soft)] px-4 py-3 sm:px-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="portal-tabular min-w-0 truncate text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                                {summary?.today.formatted}
                                            </span>
                                            <span className="portal-tabular shrink-0 text-xs font-bold text-[var(--portal-color-accent-strong)]">
                                                {summary?.quick_action.shift
                                                    ?.code ?? '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-4 py-4 sm:px-5">
                                        <dl className="portal-tabular grid grid-cols-2 divide-x divide-[var(--portal-color-rule)]">
                                            <div className="min-w-0 pr-4">
                                                <dt className="text-xs font-medium text-[var(--portal-color-muted)]">
                                                    Jam masuk
                                                </dt>
                                                <dd className="portal-display mt-1 text-3xl font-extrabold tracking-[-0.05em]">
                                                    {formatTime(
                                                        currentAttendance?.check_in_at ??
                                                            null,
                                                    )}
                                                </dd>
                                            </div>
                                            <div className="min-w-0 pl-4">
                                                <dt className="text-xs font-medium text-[var(--portal-color-muted)]">
                                                    Jam pulang
                                                </dt>
                                                <dd className="portal-display mt-1 text-3xl font-extrabold tracking-[-0.05em]">
                                                    {formatTime(
                                                        currentAttendance?.check_out_at ??
                                                            null,
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>

                                        <a
                                            href={attendanceFocus.href}
                                            className="portal-pressable portal-focus-ring mt-4 flex min-h-12 items-center justify-between rounded-[var(--portal-radius-control)] bg-[var(--portal-color-accent-strong)] px-4 text-sm font-bold whitespace-nowrap text-[var(--portal-color-accent-ink)]"
                                        >
                                            {attendanceFocus.actionLabel}
                                            <ChevronRight className="size-5" />
                                        </a>
                                    </div>
                                </section>

                                <section aria-labelledby="statistik-karyawan">
                                    <h2
                                        id="statistik-karyawan"
                                        className="portal-display text-[0.95rem] font-extrabold tracking-[-0.04em]"
                                    >
                                        Statistik
                                    </h2>
                                    <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                                        <SummaryCard
                                            label="Cuti tahunan"
                                            value={`${summary?.cards.annual_leave_days ?? 0} hari`}
                                            icon={CalendarDays}
                                        />
                                        <a
                                            href={links.payroll}
                                            className="portal-pressable portal-focus-ring rounded-[var(--portal-radius-control)] border border-white/70 bg-[var(--portal-color-surface-glass)] p-3 shadow-[var(--portal-shadow-raised)]"
                                        >
                                            <span className="flex items-center justify-between gap-2 text-[var(--portal-color-muted)]">
                                                <span className="text-xs font-medium">
                                                    Payroll
                                                </span>
                                                {summary?.cards.payroll_preview
                                                    .is_saved ? (
                                                    <CircleCheck className="size-4 text-[var(--portal-color-success)]" />
                                                ) : (
                                                    <Clock3 className="size-4 text-[var(--portal-color-warning)]" />
                                                )}
                                            </span>
                                            <span className="mt-3 block text-sm font-bold text-[var(--portal-color-ink)]">
                                                {summary?.cards.payroll_preview
                                                    .is_saved
                                                    ? 'Sudah tersedia'
                                                    : 'Belum tersedia'}
                                            </span>
                                        </a>
                                        <div className="rounded-[var(--portal-radius-control)] border border-white/70 bg-[var(--portal-color-surface-glass)] p-3 shadow-[var(--portal-shadow-raised)]">
                                            <span className="flex items-center justify-between gap-2 text-[var(--portal-color-muted)]">
                                                <span className="text-xs font-medium">
                                                    Perlu perhatian
                                                </span>
                                                <BellRing className="size-4 text-[var(--portal-color-accent-strong)]" />
                                            </span>
                                            <span className="portal-tabular mt-3 block text-sm font-bold text-[var(--portal-color-ink)]">
                                                {attentionItems.length} item
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {attentionItems.length > 0 ? (
                                    <section
                                        id="attention"
                                        aria-labelledby="perlu-perhatian"
                                    >
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--portal-color-muted)] uppercase">
                                                    Prioritas
                                                </p>
                                                <h2
                                                    id="perlu-perhatian"
                                                    className="portal-display mt-1 text-xl font-extrabold tracking-[-0.04em]"
                                                >
                                                    Perlu perhatian
                                                </h2>
                                            </div>
                                            <span className="portal-tabular rounded-full bg-[var(--portal-color-accent-soft)] px-2.5 py-1 text-xs font-bold text-[var(--portal-color-accent-strong)]">
                                                {attentionItems.length}
                                            </span>
                                        </div>
                                        <div className="mt-4 overflow-hidden rounded-[var(--portal-radius-surface)] border border-white/70 bg-[var(--portal-color-surface-glass)] shadow-[var(--portal-shadow-raised)]">
                                            {attentionItems.map(
                                                (item, index) => (
                                                    <a
                                                        key={item.key}
                                                        href={item.href}
                                                        className={`portal-pressable portal-focus-ring flex min-h-16 items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-[var(--portal-color-rule)]' : ''}`}
                                                    >
                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--portal-color-accent-soft)] text-[var(--portal-color-accent-strong)]">
                                                            <item.icon className="size-5" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-xs text-[var(--portal-color-muted)]">
                                                                {item.label}
                                                            </span>
                                                            <span className="mt-0.5 block truncate text-sm font-semibold">
                                                                {item.title}
                                                            </span>
                                                        </span>
                                                        <ChevronRight className="size-4 shrink-0 text-[var(--portal-color-muted)]" />
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    </section>
                                ) : null}

                                <section aria-labelledby="quick-menu">
                                    <h2
                                        id="quick-menu"
                                        className="portal-display text-[0.95rem] font-extrabold tracking-[-0.04em]"
                                    >
                                        Quick Menu
                                    </h2>
                                    <div className="portal-horizontal-scroll -mx-4 mt-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
                                        <ul
                                            aria-label="Quick Menu"
                                            className="flex w-max gap-3"
                                        >
                                            {visibleQuickLinks.map((item) => {
                                                const href =
                                                    links[
                                                        item.key as keyof PortalSummary['links']
                                                    ] ?? '#';
                                                return (
                                                    <li
                                                        key={item.key}
                                                        className="w-32 shrink-0"
                                                    >
                                                        <a
                                                            href={href}
                                                            className="portal-pressable portal-focus-ring flex min-h-24 flex-col justify-between rounded-[var(--portal-radius-control)] border border-[var(--portal-color-accent)] bg-[var(--portal-color-surface-glass)] p-3.5 shadow-[var(--portal-shadow-raised)]"
                                                        >
                                                            <item.icon className="size-5 text-[var(--portal-color-accent-strong)]" />
                                                            <span className="text-sm font-semibold whitespace-nowrap">
                                                                {item.label}
                                                            </span>
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </section>

                                <section aria-labelledby="aktivitas-terbaru">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--portal-color-muted)] uppercase">
                                                Riwayat
                                            </p>
                                            <h2
                                                id="aktivitas-terbaru"
                                                className="portal-display mt-1 text-xl font-extrabold tracking-[-0.04em]"
                                            >
                                                Aktivitas terbaru
                                            </h2>
                                        </div>
                                        <a
                                            href={
                                                links.activity ??
                                                fallbackLinks.activity
                                            }
                                            className="portal-focus-ring rounded-md text-sm font-semibold whitespace-nowrap text-[var(--portal-color-accent-strong)]"
                                        >
                                            Lihat semua
                                        </a>
                                    </div>
                                    {summary?.timeline.length ? (
                                        <ol className="mt-4 overflow-hidden rounded-[var(--portal-radius-surface)] border border-white/70 bg-[var(--portal-color-surface-glass)] px-4 shadow-[var(--portal-shadow-raised)]">
                                            {summary.timeline
                                                .slice(0, 3)
                                                .map((item, index) => (
                                                    <li
                                                        key={item.id}
                                                        className={`grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3.5 ${index > 0 ? 'border-t border-[var(--portal-color-rule)]' : ''}`}
                                                    >
                                                        <time
                                                            dateTime={item.date}
                                                            className="portal-tabular text-center"
                                                        >
                                                            <span className="block text-[10px] font-semibold tracking-[0.08em] text-[var(--portal-color-muted)] uppercase">
                                                                {
                                                                    item.month_label
                                                                }
                                                            </span>
                                                            <span className="portal-display block text-xl font-extrabold">
                                                                {item.day_label}
                                                            </span>
                                                        </time>
                                                        <div className="min-w-0 border-l border-[var(--portal-color-rule)] pl-3">
                                                            <p className="text-sm font-semibold">
                                                                {item.title}
                                                            </p>
                                                            <p className="mt-1 truncate text-sm text-[var(--portal-color-muted)]">
                                                                {item.subtitle}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                        </ol>
                                    ) : (
                                        <div className="mt-4 flex items-center gap-3 rounded-[var(--portal-radius-surface)] border border-white/70 bg-[var(--portal-color-surface-glass)] p-4 shadow-[var(--portal-shadow-raised)]">
                                            <History className="size-5 text-[var(--portal-color-muted)]" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold">
                                                    Belum ada aktivitas terbaru
                                                </p>
                                                <a
                                                    href={links.attendance}
                                                    className="portal-focus-ring mt-1 inline-flex rounded text-sm whitespace-nowrap text-[var(--portal-color-accent-strong)]"
                                                >
                                                    Buka riwayat absensi
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            </div>
                        ) : null}
                    </main>

                    <PortalNavbar active="home" links={links} />
                </div>

                {logoutConfirmOpen ? (
                    <div
                        className="fixed inset-0 z-[var(--portal-z-modal)] flex items-end justify-center bg-[var(--portal-color-scrim)] px-4 py-5 backdrop-blur-sm sm:items-center"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setLogoutConfirmOpen(false);
                            }
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="logout-dialog-title"
                            className="w-full max-w-sm rounded-[var(--portal-radius-surface)] bg-[var(--portal-color-surface)] p-5 text-[var(--portal-color-ink)] shadow-[var(--portal-shadow-material)]"
                        >
                            <LogOut className="size-6 text-[var(--portal-color-danger)]" />
                            <h2
                                id="logout-dialog-title"
                                className="portal-display mt-4 text-xl font-extrabold"
                            >
                                Keluar dari portal?
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-[var(--portal-color-muted)]">
                                Anda perlu masuk kembali untuk membuka data
                                portal karyawan.
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <button
                                    ref={cancelLogoutRef}
                                    type="button"
                                    onClick={() => setLogoutConfirmOpen(false)}
                                    className="portal-pressable portal-focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] text-sm font-bold whitespace-nowrap"
                                >
                                    Tetap masuk
                                </button>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="portal-pressable portal-focus-ring inline-flex min-h-12 items-center justify-center rounded-[var(--portal-radius-control)] bg-[var(--portal-color-danger)] text-sm font-bold whitespace-nowrap text-[var(--portal-color-accent-ink)]"
                                >
                                    Keluar
                                </Link>
                            </div>
                        </section>
                    </div>
                ) : null}
            </div>
        </>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
}) {
    return (
        <div className="rounded-[var(--portal-radius-control)] border border-white/70 bg-[var(--portal-color-surface-glass)] p-3.5 shadow-[var(--portal-shadow-raised)]">
            <span className="flex items-center justify-between gap-2 text-[var(--portal-color-muted)]">
                <span className="text-xs font-medium">{label}</span>
                <Icon className="size-4 text-[var(--portal-color-accent-strong)]" />
            </span>
            <span className="portal-tabular mt-3 block text-sm font-bold text-[var(--portal-color-ink)]">
                {value}
            </span>
        </div>
    );
}

function PortalHomeSkeleton() {
    return (
        <div className="space-y-7" aria-label="Memuat portal" aria-busy="true">
            <div className="h-72 animate-pulse rounded-[var(--portal-radius-surface)] bg-[var(--portal-color-surface-raised)]" />
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-28 animate-pulse rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)]"
                    />
                ))}
            </div>
            <div className="h-44 animate-pulse rounded-[var(--portal-radius-surface)] bg-[var(--portal-color-surface-raised)]" />
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-24 animate-pulse rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)]"
                    />
                ))}
            </div>
        </div>
    );
}
