import { HandCoins, LoaderCircle, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
    formatCurrency,
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
    employee: { id: number } | null;
    today: { date: string };
    links: PortalLinkMap;
};

type KasbonPayload = {
    period: string;
    summary: {
        total_entries: number;
        total_amount: number;
    };
    limit: {
        max_amount: number;
        used_amount: number;
        available_amount: number;
    } | null;
    items: Array<{
        id: number;
        amount: string | number;
        deduction_date: string | null;
        notes: string | null;
    }>;
};

const currentPeriod = () => new Date().toISOString().slice(0, 7);

export default function PortalKasbonsPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [kasbon, setKasbon] = useState<KasbonPayload | null>(null);
    const [period] = useState(currentPeriod);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        amount: '',
        notes: '',
    });

    const loadData = async () => {
        try {
            const [portalResponse, kasbonResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<KasbonPayload>(
                    `/portal/api/kasbons?period=${period}&per_page=20`,
                ),
            ]);

            setPortal(portalResponse.data);
            setKasbon(kasbonResponse.data);
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data kasbon tidak bisa dimuat.',
                      )
                    : 'Data kasbon tidak bisa dimuat.',
            );
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const requestedAmount = Number(form.amount || 0);
    const availableAmount = Number(kasbon?.limit?.available_amount ?? 0);
    const isAmountOverLimit =
        requestedAmount > 0 && requestedAmount > availableAmount;
    const canSubmit =
        !!portal?.employee &&
        requestedAmount > 0 &&
        form.notes.trim() !== '' &&
        !isAmountOverLimit &&
        !isSubmitting;

    const usagePercent = useMemo(() => {
        const maxAmount = Number(kasbon?.limit?.max_amount ?? 0);
        const usedAmount = Number(kasbon?.limit?.used_amount ?? 0);

        if (maxAmount <= 0) {
            return 0;
        }

        return Math.min(100, Math.round((usedAmount / maxAmount) * 100));
    }, [kasbon?.limit?.max_amount, kasbon?.limit?.used_amount]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!portal?.employee || !canSubmit) {
            return;
        }

        try {
            setIsSubmitting(true);

            await requestApi('/portal/api/kasbons', 'POST', {
                employee_id: portal.employee.id,
                amount: requestedAmount,
                deduction_date: portal.today.date,
                notes: form.notes.trim(),
                period,
            });

            setForm({ amount: '', notes: '' });
            setIsSheetOpen(false);
            notifyPortal('success', 'Request kasbon berhasil dikirim.');
            await loadData();
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Request kasbon gagal.',
                      )
                    : 'Request kasbon gagal.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Kasbon"
            description="Ajukan kasbon pribadi dan cek limit periode berjalan."
            active="home"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    kasbons: '/portal/kasbons',
                    payroll: '/portal/payroll',
                }
            }
            headerAction={
                <button
                    type="button"
                    onClick={() => setIsSheetOpen(true)}
                    className="portal-primary-bg inline-flex size-10 items-center justify-center rounded-full"
                    aria-label="Request kasbon"
                >
                    <Plus className="size-4" />
                </button>
            }
        >
            <section className="rounded-[16px] border border-slate-200 bg-white px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Limit maksimum
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
                            {formatCurrency(kasbon?.limit?.max_amount ?? 0)}
                        </h2>
                    </div>
                    <span className="portal-primary-soft inline-flex size-12 shrink-0 items-center justify-center rounded-xl">
                        <HandCoins className="portal-primary-text size-6" />
                    </span>
                </div>

                <div className="mt-5 rounded-[12px] bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-600">
                            Terpakai
                        </span>
                        <span className="font-bold text-slate-950">
                            {formatCurrency(kasbon?.limit?.used_amount ?? 0)}
                        </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="portal-primary-bg h-full rounded-full"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-600">
                            Sisa limit
                        </span>
                        <span className="font-bold text-slate-950">
                            {formatCurrency(
                                kasbon?.limit?.available_amount ?? 0,
                            )}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsSheetOpen(true)}
                    className="portal-primary-bg mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[11px] text-sm font-bold"
                >
                    <Plus className="size-4" />
                    Request kasbon
                </button>
            </section>

            <section className="mt-5 rounded-[16px] border border-slate-200 bg-white px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Periode {kasbon?.period ?? period}
                        </p>
                        <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950">
                            Riwayat kasbon
                        </h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {kasbon?.summary.total_entries ?? 0} request
                    </span>
                </div>

                <div className="mt-5 space-y-3">
                    {kasbon?.items.length ? (
                        kasbon.items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[12px] border border-slate-200 bg-white px-4 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-950">
                                            {formatCurrency(item.amount)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {formatDate(item.deduction_date)}
                                        </p>
                                    </div>
                                    <span className="portal-primary-soft shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase">
                                        diajukan
                                    </span>
                                </div>
                                {item.notes ? (
                                    <p className="mt-3 text-sm leading-5 text-slate-600">
                                        {item.notes}
                                    </p>
                                ) : null}
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[12px] bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            Belum ada request kasbon di periode ini.
                        </div>
                    )}
                </div>
            </section>

            {isSheetOpen ? (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/45 px-4 pb-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-t-[24px] bg-white px-5 pt-4 pb-5 text-slate-950 shadow-[0_-24px_70px_rgba(15,23,42,0.28)]">
                        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
                        <div className="mt-5 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                    Request kasbon
                                </p>
                                <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">
                                    Pengajuan baru
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSheetOpen(false)}
                                className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white"
                                aria-label="Tutup"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            <div>
                                <label
                                    htmlFor="kasbon_amount"
                                    className="text-sm font-bold text-slate-700"
                                >
                                    Nominal kasbon
                                </label>
                                <input
                                    id="kasbon_amount"
                                    type="number"
                                    min="1"
                                    max={availableAmount || undefined}
                                    inputMode="numeric"
                                    value={form.amount}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            amount: event.target.value,
                                        }))
                                    }
                                    className="mt-2 h-12 w-full rounded-[11px] border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-[#006069] focus:bg-white"
                                    placeholder="Contoh: 500000"
                                    required
                                />
                                <p
                                    className={`mt-2 text-xs ${
                                        isAmountOverLimit
                                            ? 'text-red-600'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    Sisa limit{' '}
                                    {formatCurrency(availableAmount)}.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="kasbon_notes"
                                    className="text-sm font-bold text-slate-700"
                                >
                                    Keterangan
                                </label>
                                <textarea
                                    id="kasbon_notes"
                                    value={form.notes}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            notes: event.target.value,
                                        }))
                                    }
                                    className="mt-2 min-h-28 w-full rounded-[11px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#006069] focus:bg-white"
                                    placeholder="Keperluan kasbon"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="portal-primary-bg inline-flex h-12 w-full items-center justify-center gap-2 rounded-[11px] text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                            >
                                {isSubmitting ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : null}
                                Kirim request
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </PortalShell>
    );
}
