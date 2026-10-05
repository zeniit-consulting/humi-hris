import {
    ArrowUpRight,
    BarChart3,
    ChevronRight,
    ClipboardList,
    MapPinned,
    ScrollText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notifyPortal, requestApi, translatePortalError } from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type PortalSummary = {
    links: PortalLinkMap;
};

type Props = {
    pageTitle?: string;
};

type ActivityItem = {
    title: string;
    description: string;
    hrefKey: keyof PortalLinkMap;
    fallbackHref: string;
    icon: LucideIcon;
    badge?: string;
};

const fallbackLinks: PortalLinkMap = {
    attendance: '/portal/attendance',
    leaves: '/portal/leaves',
    overtimes: '/portal/overtimes',
    payroll: '/portal/payroll',
    activity: '/portal/activity',
    client_visits: '/portal/activity/client-visits',
    performance_activity: '/portal/activity/performance',
    reprimands: '/portal/reprimands',
    profile: '/portal/profile',
};

const menuItems: ActivityItem[] = [
    {
        title: 'Client Visit',
        description: 'Clock-in, clock-out, dan riwayat kunjungan kerja di lokasi klien.',
        hrefKey: 'client_visits',
        fallbackHref: '/portal/activity/client-visits',
        icon: MapPinned,
        badge: 'Lokasi GPS',
    },
    {
        title: 'Kinerja & KPI',
        description: 'Update progress target KPI, OKR, dan capaian kerja berkala.',
        hrefKey: 'performance_activity',
        fallbackHref: '/portal/activity/performance',
        icon: BarChart3,
    },
    {
        title: 'Catatan Aktivitas',
        description: 'Ringkasan pekerjaan harian dan log aktivitas portal.',
        hrefKey: 'performance_activity',
        fallbackHref: '/portal/activity/performance',
        icon: ClipboardList,
    },
    {
        title: 'Riwayat Teguran',
        description: 'Catatan pembinaan, surat peringatan, dan konseling resmi.',
        hrefKey: 'reprimands',
        fallbackHref: '/portal/reprimands',
        icon: ScrollText,
    },
];

export default function PortalActivityPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await requestApi<PortalSummary>(
                    '/portal/api/summary',
                );

                if (!cancelled) {
                    setPortal(response.data);
                }
            } catch (error) {
                notifyPortal(
                    'error',
                    error instanceof Error
                        ? translatePortalError(
                              error.message,
                              'Menu aktivitas tidak bisa dimuat.',
                          )
                        : 'Menu aktivitas tidak bisa dimuat.',
                );
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    const links = portal?.links ?? fallbackLinks;
    const activities = menuItems.map((item) => ({
        ...item,
        href: links[item.hrefKey] ?? item.fallbackHref,
    }));
    const [clientVisit, ...secondaryActivities] = activities;

    return (
        <PortalShell
            title={pageTitle ?? 'Aktivitas'}
            eyebrow="Aktivitas Kerja"
            description="Pantau kunjungan klien lapangan, perkembangan performa, dan riwayat aktivitas Anda."
            active="activity"
            links={links}
        >
            <div className="min-w-0 space-y-4">
                {/* Hero / Primary Action: Client Visit */}
                <section aria-labelledby="field-action-title">
                    <div className="mb-2 flex min-w-0 items-center justify-between">
                        <p className="text-xs font-semibold tracking-wider text-[var(--portal-color-muted)] uppercase">
                            Aktivitas Lapangan
                        </p>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200/60">
                            Real-time GPS
                        </span>
                    </div>

                    <a
                        href={clientVisit.href}
                        className="portal-pressable portal-focus-ring group block min-w-0 rounded-[var(--portal-radius-surface)] bg-[var(--portal-color-accent-strong)] p-4.5 text-[var(--portal-color-accent-ink)] shadow-[var(--portal-shadow-material)]"
                    >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-[var(--portal-color-accent-ink)]">
                                <MapPinned
                                    className="size-5.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-[var(--portal-color-accent-ink)]">
                                Mulai Visit
                                <ArrowUpRight
                                    className="size-3.5 transition-transform duration-[var(--portal-duration-press)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                                    aria-hidden="true"
                                />
                            </span>
                        </div>

                        <div className="mt-4 min-w-0">
                            <h3
                                id="field-action-title"
                                className="portal-display text-lg font-bold tracking-tight text-[var(--portal-color-accent-ink)]"
                            >
                                {clientVisit.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-[var(--portal-color-accent-soft)]">
                                {clientVisit.description}
                            </p>
                        </div>
                    </a>
                </section>

                {/* Secondary Activities List */}
                <section aria-labelledby="other-activity-title">
                    <div className="mb-2 flex min-w-0 items-center justify-between">
                        <h3
                            id="other-activity-title"
                            className="text-xs font-semibold tracking-wider text-[var(--portal-color-muted)] uppercase"
                        >
                            Menu Aktivitas & Performa
                        </h3>
                    </div>

                    <div className="min-w-0 divide-y divide-[var(--portal-color-rule)] rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] shadow-[var(--portal-shadow-subtle)]">
                        {secondaryActivities.map((item) => (
                            <a
                                key={item.title}
                                href={item.href}
                                className="portal-pressable portal-focus-ring group flex min-h-18 min-w-0 items-center gap-3.5 px-4 py-3.5 first:rounded-t-[var(--portal-radius-surface)] last:rounded-b-[var(--portal-radius-surface)]"
                            >
                                <span className="portal-primary-soft inline-flex size-10.5 shrink-0 items-center justify-center rounded-xl">
                                    <item.icon
                                        className="portal-primary-text size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate font-bold text-sm text-[var(--portal-color-ink)]">
                                        {item.title}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-relaxed text-[var(--portal-color-muted)]">
                                        {item.description}
                                    </span>
                                </div>
                                <ChevronRight
                                    className="size-4 shrink-0 text-[var(--portal-color-muted)] transition-transform duration-[var(--portal-duration-press)] group-hover:translate-x-0.5 motion-reduce:transition-none"
                                    aria-hidden="true"
                                />
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </PortalShell>
    );
}
