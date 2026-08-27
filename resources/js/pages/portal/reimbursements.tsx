import { Camera, FileText, LoaderCircle, Plus, Receipt, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    formatThousandDigits,
    normalizeDigitInput,
} from '@/lib/currency-input';
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
type BankAccount = {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    is_primary: boolean;
    label: string;
};
type Item = {
    id: number;
    category: string;
    bank_account_id?: number | null;
    bank_name?: string | null;
    account_number?: string | null;
    account_holder_name?: string | null;
    title: string;
    description: string;
    amount: string | number;
    status: string;
    receipt_url: string | null;
    receipt_name: string | null;
    rejection_reason: string | null;
    created_at: string | null;
};
type Payload = {
    items: Item[];
    bank_accounts?: BankAccount[];
    categories?: string[];
};

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

const defaultCategories = ['Travels', 'Meals', 'Supplies', 'Others'];

export default function PortalReimbursementsPage({ pageTitle }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [categories, setCategories] = useState<string[]>(defaultCategories);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        category: 'Travels',
        employee_bank_account_id: '' as string | number,
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
            if (response.data.bank_accounts) {
                setBankAccounts(response.data.bank_accounts);
                const primary = response.data.bank_accounts.find((a) => a.is_primary);
                if (primary) {
                    setForm((p) => ({ ...p, employee_bank_account_id: primary.id }));
                } else if (response.data.bank_accounts.length > 0) {
                    setForm((p) => ({ ...p, employee_bank_account_id: response.data.bank_accounts![0].id }));
                }
            }
            if (response.data.categories && response.data.categories.length > 0) {
                setCategories(response.data.categories);
            }
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
        data.append('category', form.category);
        if (form.employee_bank_account_id) {
            data.append('employee_bank_account_id', String(form.employee_bank_account_id));
        }
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

            const primary = bankAccounts.find((a) => a.is_primary);
            setForm({
                category: 'Travels',
                employee_bank_account_id: primary ? primary.id : (bankAccounts[0]?.id ?? ''),
                title: '',
                description: '',
                amount: '',
                receipt: null,
            });
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
                                    <div className="flex items-center gap-2">
                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                            {item.category || 'Others'}
                                        </span>
                                        <h3 className="truncate text-sm font-extrabold text-slate-950">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {formatDate(item.created_at)} ·{' '}
                                        {item.receipt_name ?? 'Nota'}
                                    </p>
                                    {item.bank_name && (
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            Rek: {item.bank_name} - {item.account_number} ({item.account_holder_name})
                                        </p>
                                    )}
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
                <div className="portal-sheet-backdrop fixed inset-0 z-[var(--portal-z-modal)] flex items-end justify-center bg-slate-950/30 p-0 sm:items-center sm:p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reimbursement-sheet-title"
                        className="portal-sheet-panel max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[22px] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-[18px]"
                    >
                        <div className="flex items-center justify-between">
                            <h2
                                id="reimbursement-sheet-title"
                                className="text-lg font-extrabold text-slate-950"
                            >
                                Ajukan reimbursement
                            </h2>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="portal-pressable portal-focus-ring inline-flex size-9 items-center justify-center rounded-full bg-slate-100"
                                aria-label="Tutup"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="mt-5 space-y-4">
                            <label className="block text-sm font-bold text-slate-800">
                                Kategori Reimbursement
                                <select
                                    required
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            category: e.target.value,
                                        }))
                                    }
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {bankAccounts.length > 0 && (
                                <label className="block text-sm font-bold text-slate-800">
                                    Rekening Penerima
                                    <select
                                        value={form.employee_bank_account_id}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                employee_bank_account_id: e.target.value,
                                            }))
                                        }
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                    >
                                        {bankAccounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="mt-1 block text-xs font-normal text-slate-500">
                                        Default menggunakan rekening utama.
                                    </span>
                                </label>
                            )}

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
                                    type="text"
                                    inputMode="numeric"
                                    value={formatThousandDigits(form.amount)}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            amount: normalizeDigitInput(
                                                e.target.value,
                                            ),
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
