import { ScrollText } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    chips,
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

type ReprimandPayload = {
    items: Array<{
        id: number;
        reprimand_number: string;
        level: string;
        issued_date: string | null;
        incident_date: string | null;
        subject: string;
        description: string | null;
        action_plan: string | null;
        status: string;
        resolution_notes: string | null;
    }>;
};

const levelLabels: Record<string, string> = {
    verbal: 'Teguran Lisan',
    sp1: 'SP 1',
    sp2: 'SP 2',
    sp3: 'SP 3',
};

const statusLabels: Record<string, string> = {
    active: 'Aktif',
    resolved: 'Selesai',
    void: 'Dibatalkan',
};

export default function PortalReprimandsPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<ReprimandPayload['items']>([]);

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                const [portalResponse, reprimandResponse] = await Promise.all([
                    requestApi<PortalSummary>('/portal/api/summary'),
                    requestApi<ReprimandPayload>('/portal/api/reprimands'),
                ]);

                if (!cancelled) {
                    setPortal(portalResponse.data);
                    setItems(reprimandResponse.data.items);
                }
            } catch (loadError) {
                notifyPortal(
                    'error',
                    loadError instanceof Error
                        ? translatePortalError(
                              loadError.message,
                              'Data reprimand tidak bisa dimuat.',
                          )
                        : 'Data reprimand tidak bisa dimuat.',
                );
            }
        };

        void loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Employee reprimand"
            description="Lihat riwayat teguran dan surat peringatan Anda."
            active="activity"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                    activity: '/portal/activity',
                    reprimands: '/portal/reprimands',
                }
            }
        >
            <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <ScrollText className="portal-primary-text size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Teguran karyawan
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Riwayat reprimand
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
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {item.subject}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.reprimand_number} •{' '}
                                            {levelLabels[item.level] ??
                                                item.level}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Terbit:{' '}
                                            {formatDate(item.issued_date)}
                                            {item.incident_date
                                                ? ` • Kejadian: ${formatDate(item.incident_date)}`
                                                : ''}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                                            chips[item.status] ??
                                            'bg-stone-200 text-stone-800'
                                        }`}
                                    >
                                        {statusLabels[item.status] ??
                                            item.status}
                                    </span>
                                </div>

                                {item.description ? (
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {item.description}
                                    </p>
                                ) : null}

                                {item.action_plan ? (
                                    <div className="mt-3 rounded-[10px] bg-white px-3 py-3 text-sm leading-6 text-slate-700">
                                        <span className="font-semibold">
                                            Action plan:
                                        </span>{' '}
                                        {item.action_plan}
                                    </div>
                                ) : null}

                                {item.resolution_notes ? (
                                    <div className="mt-3 rounded-[10px] border border-[#b9dfe0] bg-[#f3fbfb] px-3 py-3 text-sm leading-6 text-slate-700">
                                        <span className="font-semibold">
                                            Penyelesaian:
                                        </span>{' '}
                                        {item.resolution_notes}
                                    </div>
                                ) : null}
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                            Tidak ada reprimand yang terkait dengan akun Anda.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
