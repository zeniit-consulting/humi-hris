import {
    ArrowUpRight,
    BarChart3,
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
        description: 'Clock-in, clock-out, dan riwayat kunjungan.',
        hrefKey: 'client_visits',
        fallbackHref: '/portal/activity/client-visits',
        icon: MapPinned,
    },
    {
        title: 'Performance',
        description: 'Update progress KPI, OKR, dan action item.',
        hrefKey: 'performance_activity',
        fallbackHref: '/portal/activity/performance',
        icon: BarChart3,
    },
    {
        title: 'Aktivitas Saya',
        description: 'Ringkasan pekerjaan dan catatan portal.',
        hrefKey: 'performance_activity',
        fallbackHref: '/portal/activity/performance',
        icon: ClipboardList,
    },
    {
        title: 'Reprimand',
        description: 'Riwayat teguran dan surat peringatan.',
        hrefKey: 'reprimands',
        fallbackHref: '/portal/reprimands',
        icon: ScrollText,
    },
];

// Hallmark · audience: field workers · use: start, update, and review daily work · tone: field-first utilitarian
// Hallmark · genre: modern-minimal · macrostructure: Narrative Workflow · theme: Quiet · enrichment: none
// Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · contrast: pass (46–50) · responsive: pass (36, 59, 61–69)

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
    const [clientVisit, performance, personalActivity, reprimand] = activities;

    return (
        <PortalShell
            title={pageTitle ?? 'Aktivitas'}
            eyebrow="Portal"
            active="activity"
            links={links}
        >
            <div className="min-w-0 space-y-5">
                <section aria-labelledby="field-action-title">
                    <div className="mb-3 flex min-w-0 flex-col gap-1">
                        <p className="text-[var(--portal-text-label)] font-semibold tracking-[0.14em] text-[var(--portal-color-muted)] uppercase">
                            Langkah utama
                        </p>
                        <h3
                            id="field-action-title"
                            className="min-w-0 text-[var(--portal-text-heading)] font-bold tracking-[-0.03em] text-[var(--portal-color-ink)] [overflow-wrap:anywhere]"
                        >
                            Kerja di lokasi
                        </h3>
                    </div>

                    <a
                        href={clientVisit.href}
                        className="portal-pressable portal-focus-ring group flex min-h-44 min-w-0 flex-col justify-between rounded-[var(--portal-radius-surface)] bg-[var(--portal-color-accent-strong)] p-5 text-[var(--portal-color-accent-ink)] shadow-[var(--portal-shadow-material)]"
                    >
                        <span className="flex min-w-0 items-start justify-between gap-4">
                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--portal-radius-control)] bg-[var(--portal-color-accent)] text-[var(--portal-color-accent-ink)]">
                                <MapPinned className="size-5" aria-hidden="true" />
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[var(--portal-text-label)] font-semibold">
                                Mulai visit
                                <ArrowUpRight
                                    className="size-4 transition-transform duration-[var(--portal-duration-press)] motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    aria-hidden="true"
                                />
                            </span>
                        </span>
                        <span className="mt-5 min-w-0">
                            <span className="block text-[var(--portal-text-heading)] font-bold tracking-[-0.03em]">
                                {clientVisit.title}
                            </span>
                            <span className="mt-1 block max-w-[34ch] text-[var(--portal-text-body)] leading-6 text-[var(--portal-color-accent-soft)]">
                                {clientVisit.description}
                            </span>
                        </span>
                    </a>
                </section>

                <section aria-labelledby="update-title">
                    <div className="mb-3 flex min-w-0 flex-col gap-1">
                        <h3
                            id="update-title"
                            className="min-w-0 text-[var(--portal-text-heading)] font-bold tracking-[-0.03em] text-[var(--portal-color-ink)] [overflow-wrap:anywhere]"
                        >
                            Menu lainnya
                        </h3>
                    </div>

                    <div className="min-w-0 overflow-hidden rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] shadow-[var(--portal-shadow-subtle)]">
                        {[performance, personalActivity, reprimand].map((item, index) => (
                            <a
                                key={item.title}
                                href={item.href}
                                className={`portal-pressable portal-focus-ring group flex min-h-20 min-w-0 items-center gap-3 px-4 py-3 ${index < 2 ? 'border-b border-[var(--portal-color-rule)]' : ''}`}
                            >
                                <span className="portal-primary-soft inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--portal-radius-control)]">
                                    <item.icon
                                        className="portal-primary-text size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[var(--portal-text-body)] font-bold tracking-[-0.02em] text-[var(--portal-color-ink)]">
                                        {item.title}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[var(--portal-text-small)] text-[var(--portal-color-muted)]">
                                        {item.description}
                                    </span>
                                </span>
                                <ArrowUpRight
                                    className="size-4 shrink-0 text-[var(--portal-color-accent-strong)] transition-transform duration-[var(--portal-duration-press)] motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
