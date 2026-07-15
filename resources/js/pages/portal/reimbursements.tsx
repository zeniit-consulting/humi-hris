import { Camera, FileText, LoaderCircle, Plus, Receipt, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    formatCurrency,
    formatDate,
    notifyPortal,
    requestApi,
    statusLabels,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = { pageTitle: string };
type Item = {
    id: number;
    title: string;
    description: string;
    amount: string | number;
    status: string;
    receipt_url: string | null;
    receipt_name: string | null;
    rejection_reason: string | null;
    created_at: string | null;
};
type Payload = { items: Item[] };

const links: PortalLinkMap = {
    attendance: '/portal/attendance',
    leaves: '/portal/leaves',
    overtimes: '/portal/overtimes',
    kasbons: '/portal/kasbons',
    payroll: '/portal/payroll',
    activity: '/portal/activity',
    profile: '/portal/profile',
    dashboard: '/portal',
};

export default function PortalReimbursementsPage({ pageTitle }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        amount: '',
        receipt: null as File | null,
    });

    const load = async () => {
        try {
            setLoading(true);
            const response = await requestApi<Payload>(
                '/portal/api/reimbursements',
            );
            setItems(response.data.items);
        } catch (error) {
            notifyPortal(
                'error',
                translatePortalError(
                    error instanceof Error ? error.message : '',
                    'Data reimbursement tidak bisa dimuat.',
                ),
            );
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void load();
    }, []);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.receipt) {
            notifyPortal('error', 'Foto nota wajib diunggah.');
            return;
        }
        const data = new FormData();
        data.append('title', form.title);
        data.append('description', form.description);
        data.append('amount', form.amount);
        data.append('receipt', form.receipt);
        const xsrf = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        try {
            setSubmitting(true);
            const response = await fetch('/portal/api/reimbursements', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(xsrf
                        ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) }
                        : {}),
                },
                body: data,
            });
            const payload = (await response.json()) as {
                success: boolean;
                message: string;
            };
            if (!response.ok || !payload.success)
                throw new Error(payload.message);
            setForm({ title: '', description: '', amount: '', receipt: null });
            setOpen(false);
            notifyPortal('success', payload.message);
            await load();
        } catch (error) {
            notifyPortal(
                'error',
                translatePortalError(
                    error instanceof Error ? error.message : '',
                    'Pengajuan reimbursement gagal.',
                ),
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Reimbursement"
            description="Ajukan penggantian biaya dengan nota digital."
            active="home"
            links={links}
            headerAction={
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="portal-primary-bg inline-flex size-10 items-center justify-center rounded-full"
                    aria-label="Ajukan reimbursement"
                >
                    <Plus className="size-4" />
                </button>
            }
        >
            <section className="portal-material rounded-[16px] px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase">
                            Total pengajuan
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
                            {items.length}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Pantau status penggantian biaya Anda.
                        </p>
                    </div>
                    <span className="portal-primary-soft inline-flex size-12 items-center justify-center rounded-xl">
                        <Receipt className="portal-primary-text size-6" />
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="portal-primary-bg mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[11px] text-sm font-bold"
                >
                    <Plus className="size-4" />
                    Ajukan reimbursement
                </button>
            </section>
            <section className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold tracking-[-0.03em] text-slate-950">
                        Riwayat pengajuan
                    </h2>
                    <button
                        type="button"
                        onClick={() => void load()}
                        className="text-xs font-bold text-teal-700"
                    >
                        Muat ulang
                    </button>
                </div>
                {loading ? (
                    <div className="portal-material rounded-[14px] p-5 text-center text-sm text-slate-500">
                        <LoaderCircle className="mx-auto size-5 animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="portal-material rounded-[14px] p-6 text-center">
                        <FileText className="mx-auto size-7 text-slate-400" />
                        <p className="mt-3 text-sm font-bold text-slate-800">
                            Belum ada pengajuan
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Simpan nota dan ajukan reimbursement saat
                            diperlukan.
                        </p>
                    </div>
                ) : (
                    items.map((item) => (
                        <article
                            key={item.id}
                            className="portal-material rounded-[14px] p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-extrabold text-slate-950">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatDate(item.created_at)} ·{' '}
                                        {item.receipt_name ?? 'Nota'}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === 'approved' || item.status === 'paid' ? 'portal-primary-soft portal-primary-text' : item.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'}`}
                                >
                                    {statusLabels[item.status] ?? item.status}
                                </span>
                            </div>
                            <p className="mt-3 text-lg font-black tracking-[-0.03em] text-slate-950">
                                {formatCurrency(item.amount)}
                            </p>
                            {item.rejection_reason ? (
                                <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
                                    {item.rejection_reason}
                                </p>
                            ) : null}
                        </article>
                    ))
                )}
            </section>
            {open ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-0 sm:items-center sm:p-4">
                    <div className="w-full max-w-md rounded-t-[22px] bg-white p-5 shadow-xl sm:rounded-[18px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-slate-950">
                                Ajukan reimbursement
                            </h2>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100"
                                aria-label="Tutup"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="mt-5 space-y-4">
                            <label className="block text-sm font-bold text-slate-800">
                                Judul
                                <input
                                    required
                                    maxLength={150}
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            title: e.target.value,
                                        }))
                                    }
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                                    placeholder="Contoh: Transport meeting client"
                                />
                            </label>
                            <label className="block text-sm font-bold text-slate-800">
                                Keterangan
                                <textarea
                                    required
                                    maxLength={5000}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                                    placeholder="Jelaskan keperluan biaya"
                                />
                            </label>
                            <label className="block text-sm font-bold text-slate-800">
                                Nominal
                                <input
                                    required
                                    min="1"
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            amount: e.target.value,
                                        }))
                                    }
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                                    placeholder="0"
                                />
                            </label>
                            <label className="block text-sm font-bold text-slate-800">
                                Foto nota
                                <span className="mt-2 flex h-24 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600">
                                    <Camera className="size-5" />
                                    {form.receipt
                                        ? form.receipt.name
                                        : 'Pilih foto JPG, PNG, WEBP (maks. 5 MB)'}
                                    <input
                                        required
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                receipt:
                                                    e.target.files?.[0] ?? null,
                                            }))
                                        }
                                        className="sr-only"
                                    />
                                </span>
                            </label>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="portal-primary-bg inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold"
                            >
                                {submitting ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <Receipt className="size-4" />
                                )}
                                Kirim pengajuan
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </PortalShell>
    );
}
