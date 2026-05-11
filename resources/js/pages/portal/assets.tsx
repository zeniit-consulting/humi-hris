import { BriefcaseBusiness } from 'lucide-react';
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

type AssetPayload = {
    items: Array<{
        id: number;
        asset: {
            id: number;
            asset_code: string | null;
            name: string;
            category: string | null;
            brand: string | null;
            model: string | null;
            serial_number: string | null;
            status: string;
        } | null;
        issued_at: string | null;
        returned_at: string | null;
        condition_out: string | null;
        condition_in: string | null;
        notes: string | null;
        is_active: boolean;
    }>;
};

export default function PortalAssetsPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<AssetPayload['items']>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [portalResponse, assetResponse] = await Promise.all([
                    requestApi<PortalSummary>('/portal/api/summary'),
                    requestApi<AssetPayload>('/portal/api/assets'),
                ]);

                setPortal(portalResponse.data);
                setItems(assetResponse.data.items);
            } catch (loadError) {
                notifyPortal(
                    'error',
                    loadError instanceof Error
                        ? translatePortalError(
                              loadError.message,
                              'Data aset tidak bisa dimuat.',
                          )
                        : 'Data aset tidak bisa dimuat.',
                );
            }
        };

        void loadData();
    }, []);

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Company assets"
            description="Lihat asset perusahaan yang sedang dipinjamkan kepada Anda."
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
                        <BriefcaseBusiness className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Aset karyawan
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Riwayat aset
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
                                            {item.asset?.name ??
                                                'Aset perusahaan'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.asset?.asset_code ?? '-'} •{' '}
                                            {item.asset?.category ?? 'Aset'}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Keluar: {formatDate(item.issued_at)}
                                            {item.returned_at
                                                ? ` • Kembali: ${formatDate(item.returned_at)}`
                                                : ' • Masih aktif'}
                                        </p>
                                        {item.condition_out ? (
                                            <p className="mt-1 text-sm text-slate-600">
                                                Kondisi awal:{' '}
                                                {item.condition_out}
                                            </p>
                                        ) : null}
                                        {item.notes ? (
                                            <p className="mt-2 text-sm text-slate-600">
                                                {item.notes}
                                            </p>
                                        ) : null}
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
                                            item.is_active
                                                ? 'portal-primary-soft'
                                                : 'bg-stone-200 text-stone-800'
                                        }`}
                                    >
                                        {item.is_active
                                            ? 'Aktif'
                                            : 'Dikembalikan'}
                                    </span>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                            Tidak ada aset perusahaan yang terkait dengan akun
                            Anda.
                        </div>
                    )}
                </div>
            </section>
        </PortalShell>
    );
}
