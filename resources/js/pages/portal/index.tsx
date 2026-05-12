import { Head, Link } from '@inertiajs/react';
import {
    BellRing,
    CalendarDays,
    Clock3,
    LogOut,
    ScanLine,
    Sparkles,
    Wallet,
} from 'lucide-react';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { notifyPortal, translatePortalError } from './lib';
import { PortalNavbar } from './navbar';
import { PortalToastViewport } from './toast';

type MobileResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

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
        division: {
            id: number;
            name: string;
        } | null;
        position: {
            id: number;
            name: string;
        } | null;
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
        payroll: string;
        profile?: string;
        dashboard: string;
    };
};

type RequestMethod = 'GET' | 'POST' | 'PUT';

const quickLinks = [
    {
        key: 'attendance',
        label: 'Absensi',
        icon: ScanLine,
    },
    {
        key: 'leaves',
        label: 'Cuti',
        icon: CalendarDays,
    },
    {
        key: 'overtimes',
        label: 'Lembur',
        icon: Clock3,
    },
    {
        key: 'payroll',
        label: 'Payroll',
        icon: Wallet,
    },
] as const;

const formatTime = (value: string | null) => {
    if (!value) {
        return '--:--';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
};

const formatDateParts = (value: string | null) => {
    if (!value) {
        return { month: '-', day: '--' };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return { month: '-', day: '--' };
    }

    return {
        month: new Intl.DateTimeFormat('id-ID', {
            month: 'short',
        })
            .format(date)
            .toUpperCase(),
        day: new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
        }).format(date),
    };
};

async function requestApi<T>(
    url: string,
    method: RequestMethod = 'GET',
    body?: Record<string, unknown>,
): Promise<MobileResponse<T>> {
    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(xsrfCookie
                ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfCookie) }
                : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const payload = (await response.json()) as MobileResponse<T>;

    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Request failed.');
    }

    return payload;
}

export default function PortalPage() {
    const [summary, setSummary] = useState<PortalSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(() =>
        new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(new Date()),
    );

    useEffect(() => {
        let cancelled = false;

        const loadSummary = async () => {
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
                setIsLoading(false);
            }
        };

        void loadSummary();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setCurrentTime(
                new Intl.DateTimeFormat('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }).format(new Date()),
            );
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, []);

    const headlineName =
        summary?.employee?.full_name ?? summary?.user.name ?? 'Pengguna';
    const workingDays = useMemo(() => {
        if (!summary?.today.date) {
            return 0;
        }

        const today = new Date(summary.today.date);
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
    }, [summary?.today.date]);

    const announcements = useMemo(() => {
        return summary?.announcements ?? [];
    }, [summary?.announcements]);

    return (
        <>
            <Head title="Employee App">
                <meta name="theme-color" content="#006069" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content={
                        import.meta.env.VITE_APP_NAME ||
                        'Humi - Easy HR Management'
                    }
                />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white text-slate-900">
                <PortalToastViewport />
                <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-4 pt-4 pb-28 sm:max-w-lg">
                    <section className="rounded-[17px] border border-stone-200 bg-white px-4 py-4 text-slate-900">
                        <div className="relative">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <a
                                        href={
                                            summary?.links.profile ??
                                            '/portal/profile'
                                        }
                                        className="portal-primary-soft inline-flex size-14 items-center justify-center rounded-full text-lg font-bold"
                                        aria-label="Buka profil"
                                    >
                                        {headlineName
                                            .split(' ')
                                            .slice(0, 2)
                                            .map((part) => part[0] ?? '')
                                            .join('')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </a>
                                    <div className="min-w-0">
                                        <h1
                                            className="truncate text-2xl font-extrabold tracking-[-0.05em]"
                                            style={{
                                                fontFamily:
                                                    'Manrope, ui-sans-serif, system-ui, sans-serif',
                                            }}
                                        >
                                            {headlineName}
                                        </h1>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            {summary?.employee?.position
                                                ?.name ?? 'Portal User'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-900"
                                        aria-label="Logout"
                                    >
                                        <LogOut className="size-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-[14px] border border-stone-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                                    <p className="text-xs font-medium text-slate-500">
                                        Clock In
                                    </p>
                                    <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                                        {formatTime(
                                            summary?.quick_action
                                                .open_attendance?.check_in_at ??
                                                summary?.quick_action.attendance
                                                    ?.check_in_at ??
                                                null,
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {summary?.today.formatted ?? 'Hari ini'}
                                    </p>
                                </div>
                                <div className="rounded-[14px] border border-stone-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                                    <p className="text-xs font-medium text-slate-500">
                                        Clock Out
                                    </p>
                                    <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                                        {formatTime(
                                            summary?.quick_action
                                                .open_attendance
                                                ?.check_out_at ??
                                                summary?.quick_action.attendance
                                                    ?.check_out_at ??
                                                null,
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {currentTime}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        void (window.location.href = summary
                                            ?.quick_action.can_clock_in
                                            ? '/portal/check-in'
                                            : '/portal/check-out')
                                    }
                                    disabled={
                                        !summary?.quick_action.can_clock_in &&
                                            !summary?.quick_action
                                                .can_clock_out
                                    }
                                    className="portal-primary-bg inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[11px] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Clock3 className="size-4" />
                                    {summary?.quick_action.can_clock_in
                                        ? 'Masuk'
                                        : 'Pulang'}
                                </button>
                            </div>

                            <div className="portal-primary-soft mt-4 rounded-[14px] p-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {quickLinks.map((item) => {
                                        const href =
                                            summary?.links[
                                                item.key as keyof PortalSummary['links']
                                            ] ?? '#';

                                        return (
                                            <a
                                                key={item.key}
                                                href={href}
                                                className="rounded-[11px] bg-white px-2 py-3 text-center shadow-[0_10px_22px_rgba(15,23,42,0.06)]"
                                            >
                                                <span className="portal-primary-soft mx-auto inline-flex size-11 items-center justify-center rounded-lg">
                                                    <item.icon className="portal-primary-text size-5" />
                                                </span>
                                                <p className="mt-2 text-[11px] font-semibold text-slate-700">
                                                    {item.label}
                                                </p>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {isLoading ? (
                        <div className="mt-5 space-y-3">
                            <div className="h-28 animate-pulse rounded-[14px] bg-white/70" />
                            <div className="h-28 animate-pulse rounded-[14px] bg-white/70" />
                            <div className="h-52 animate-pulse rounded-[14px] bg-white/70" />
                        </div>
                    ) : null}

                    {!isLoading ? (
                        <>
                            <section className="mt-5 rounded-[16px] border border-slate-200 bg-white px-5 py-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2
                                            className="text-xl font-extrabold tracking-[-0.04em] text-slate-950"
                                            style={{
                                                fontFamily:
                                                    'Manrope, ui-sans-serif, system-ui, sans-serif',
                                            }}
                                        >
                                            Today
                                        </h2>
                                    </div>
                                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                                        <Sparkles className="portal-primary-text size-5" />
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-[12px] border border-slate-200 bg-white px-4 py-4">
                                            <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                                                Sisa cuti
                                            </p>
                                            <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                                                {summary?.cards
                                                    .annual_leave_days ?? 0}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                hari
                                            </p>
                                        </div>
                                        <div className="rounded-[12px] border border-slate-200 bg-white px-4 py-4">
                                            <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                                                Hari kerja
                                            </p>
                                            <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                                                {workingDays}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                hari kerja
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-[12px] border border-slate-200 bg-white px-4 py-4">
                                            <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                                                Survey aktif
                                            </p>
                                            <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                                                {summary?.cards
                                                    .pending_surveys ?? 0}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                pending
                                            </p>
                                        </div>
                                        <div className="rounded-[12px] border border-slate-200 bg-white px-4 py-4">
                                            <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">
                                                Asset aktif
                                            </p>
                                            <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                                                {summary?.cards
                                                    .assigned_assets ?? 0}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                aktif
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mt-5 rounded-[16px] border border-slate-200 bg-white px-5 py-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2
                                            className="text-xl font-extrabold tracking-[-0.04em] text-slate-950"
                                            style={{
                                                fontFamily:
                                                    'Manrope, ui-sans-serif, system-ui, sans-serif',
                                            }}
                                        >
                                            Pengumuman
                                        </h2>
                                    </div>
                                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                                        <BellRing className="portal-primary-text size-5" />
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {announcements.length ? (
                                        announcements.map((item) => {
                                            const dateParts = formatDateParts(
                                                item.publish_at,
                                            );

                                            return (
                                                <a
                                                    key={item.id}
                                                    href="/portal/announcements"
                                                    className="flex items-center gap-4 rounded-[12px] border border-slate-200 bg-white px-4 py-4"
                                                >
                                                    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-[10px] bg-white py-2 text-slate-900">
                                                        <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                                            {dateParts.month}
                                                        </span>
                                                        <span className="text-xl font-bold tracking-[-0.04em]">
                                                            {dateParts.day}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    {item.title}
                                                                </p>
                                                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                                                    {
                                                                        item.message
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span className="portal-primary-soft shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase">
                                                                info
                                                            </span>
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                                            Belum ada pengumuman terbaru.
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="mt-5 rounded-[16px] border border-slate-200 bg-white px-5 py-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2
                                            className="text-xl font-extrabold tracking-[-0.04em] text-slate-950"
                                            style={{
                                                fontFamily:
                                                    'Manrope, ui-sans-serif, system-ui, sans-serif',
                                            }}
                                        >
                                            Required task
                                        </h2>
                                    </div>
                                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                                        <Sparkles className="portal-primary-text size-5" />
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {summary?.surveys.length
                                        ? summary.surveys.map((survey) => (
                                              <a
                                                  key={`survey-${survey.id}`}
                                                  href="/portal/surveys"
                                                  className="rounded-[12px] border border-slate-200 bg-white px-4 py-4"
                                              >
                                                  <div className="flex items-start justify-between gap-3">
                                                      <div>
                                                          <p className="text-sm font-semibold text-slate-900">
                                                              {survey.title}
                                                          </p>
                                                          <p className="mt-1 text-sm text-slate-500">
                                                              {
                                                                  survey.questions_count
                                                              }{' '}
                                                              pertanyaan
                                                              {survey.is_anonymous
                                                                  ? ' • anonim'
                                                                  : ''}
                                                          </p>
                                                          {survey.description ? (
                                                              <p className="mt-2 text-sm leading-5 text-slate-600">
                                                                  {
                                                                      survey.description
                                                                  }
                                                              </p>
                                                          ) : null}
                                                      </div>
                                                      <span className="portal-primary-soft rounded-full px-3 py-1 text-[11px] font-semibold uppercase">
                                                          survey
                                                      </span>
                                                  </div>
                                              </a>
                                          ))
                                        : null}

                                    {summary?.assets.length
                                        ? summary.assets.map((asset) => (
                                              <a
                                                  key={`asset-${asset.id}`}
                                                  href="/portal/assets"
                                                  className="rounded-[12px] border border-slate-200 bg-white px-4 py-4"
                                              >
                                                  <div className="flex items-start justify-between gap-3">
                                                      <div>
                                                          <p className="text-sm font-semibold text-slate-900">
                                                              {asset.name}
                                                          </p>
                                                          <p className="mt-1 text-sm text-slate-500">
                                                              {asset.asset_code ??
                                                                  '-'}{' '}
                                                              •{' '}
                                                              {asset.category ??
                                                                  'Asset'}
                                                          </p>
                                                          <p className="mt-2 text-sm text-slate-600">
                                                              Dipinjam sejak{' '}
                                                              {asset.issued_at
                                                                  ? asset.issued_at
                                                                  : '-'}
                                                              {asset.condition_out
                                                                  ? ` • Kondisi ${asset.condition_out}`
                                                                  : ''}
                                                          </p>
                                                      </div>
                                                      <span className="portal-primary-soft rounded-full px-3 py-1 text-[11px] font-semibold uppercase">
                                                          asset
                                                      </span>
                                                  </div>
                                              </a>
                                          ))
                                        : null}

                                    {!summary?.surveys.length &&
                                    !summary?.assets.length ? (
                                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                                            Tidak ada survey aktif atau asset
                                            pinjaman yang perlu ditindaklanjuti.
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        </>
                    ) : null}

                    <PortalNavbar
                        active="home"
                        links={
                            summary?.links ?? {
                                attendance: '/portal/attendance',
                                leaves: '/portal/leaves',
                                overtimes: '/portal/overtimes',
                                payroll: '/portal/payroll',
                                profile: '/portal/profile',
                            }
                        }
                    />
                </div>
            </div>
        </>
    );
}
