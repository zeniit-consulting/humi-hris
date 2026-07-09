import {
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

const menuItems: Array<{
    title: string;
    description: string;
    hrefKey: keyof PortalLinkMap;
    fallbackHref: string;
    icon: LucideIcon;
}> = [
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

    return (
        <PortalShell
            title={pageTitle ?? 'Aktivitas'}
            eyebrow="Portal"
            active="activity"
            links={links}
        >
            <div className="space-y-5">
                <section className="rounded-[16px] border border-slate-200 bg-white px-5 py-5">
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                        Menu aktivitas
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">
                        Pilih aktivitas kerja
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Setiap menu punya halaman kerja sendiri supaya form dan
                        riwayat lebih fokus.
                    </p>
                </section>

                <section className="grid grid-cols-3 gap-3">
                    {menuItems.map((item) => {
                        const href = links[item.hrefKey] ?? item.fallbackHref;

                        return (
                            <a
                                key={item.title}
                                href={href}
                                className="group flex min-h-36 flex-col rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#006069]/35"
                            >
                                <span className="portal-primary-soft inline-flex size-10 items-center justify-center rounded-[10px]">
                                    <item.icon className="portal-primary-text size-5" />
                                </span>
                                <span className="mt-3 text-sm leading-tight font-black tracking-[-0.03em] text-slate-950">
                                    {item.title}
                                </span>
                                <span className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-500">
                                    {item.description}
                                </span>
                                <span className="mt-auto inline-flex items-center pt-3 text-[11px] font-bold text-[#006069]">
                                    Buka
                                    <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
                                </span>
                            </a>
                        );
                    })}
                </section>
            </div>
        </PortalShell>
    );
}
