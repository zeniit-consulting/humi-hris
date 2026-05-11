import { BellRing } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    formatDate,
    notifyPortal,
    requestApi,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type PortalSummary = {
    links: PortalLinkMap;
};

type AnnouncementPayload = {
    items: Array<{
        id: number;
        title: string;
        message: string;
        publish_at: string | null;
        expires_at: string | null;
    }>;
};

export default function PortalAnnouncementsPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<AnnouncementPayload['items']>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [portalResponse, announcementResponse] =
                    await Promise.all([
                        requestApi<PortalSummary>('/portal/api/summary'),
                        requestApi<AnnouncementPayload>(
                            '/portal/api/announcements',
                        ),
                    ]);

                setPortal(portalResponse.data);
                setItems(announcementResponse.data.items);
            } catch (loadError) {
                notifyPortal(
                    'error',
                    loadError instanceof Error
                        ? translatePortalError(
                              loadError.message,
                              'Pengumuman tidak bisa dimuat.',
                          )
                        : 'Pengumuman tidak bisa dimuat.',
                );
            }
        };

        void loadData();
    }, []);

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Portal news"
            description="Baca pengumuman dan informasi terbaru dari perusahaan."
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
                        <BellRing className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Company updates
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Semua pengumuman
                        </h2>
                    </div>
                </div>

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
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Dipublikasikan{' '}
                                            {formatDate(item.publish_at)}
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-slate-700">
                                            {item.message}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                            Belum ada pengumuman aktif.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
