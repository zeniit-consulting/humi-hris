import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Filter, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatThousandDigits, normalizeDigitInput } from '@/lib/currency-input';
import type { BreadcrumbItem } from '@/types';

type LinkItem = { url: string | null; label: string; active: boolean };
type Paginator<T> = { data: T[]; links: LinkItem[]; total: number };
type Option = { id: number; label: string };
type Invoice = {
    id: number;
    invoice_number: string;
    sub_company_label: string;
    period: string;
    issued_at: string;
    due_date: string | null;
    status: string;
    employee_count: number;
    payroll_cost: string;
    service_fee: string;
    tax_amount: string;
    total_amount: string;
    notes: string | null;
};
type PageProps = {
    invoices: Paginator<Invoice>;
    subCompanies: Option[];
    filters: { status: string; sub_company_id: string; period: string };
    statusOptions: string[];
    stats: { draft: number; sent: number; paid: number; outstanding_amount: number };
};

const pageUrl = '/hris/client-billings';
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Billing Klien', href: pageUrl }];
const statusLabels: Record<string, string> = { draft: 'Draft', sent: 'Terkirim', paid: 'Paid', cancelled: 'Batal' };
const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));

export default function ClientBillingPage() {
    const { invoices, subCompanies, filters, statusOptions, stats } = usePage<PageProps>().props;
    const [filterState, setFilterState] = useState(filters);
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const form = useForm({
        sub_company_id: '',
        period: filters.period,
        issued_at: new Date().toISOString().slice(0, 10),
        due_date: '',
        service_fee: '',
        tax_amount: '',
        notes: '',
    });

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setFilterState(filters), 0);

        return () => window.clearTimeout(timeoutId);
    }, [filters]);

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(pageUrl, {
            preserveScroll: true,
            onSuccess: () => {
                setInvoiceDialogOpen(false);
                form.reset('sub_company_id', 'service_fee', 'tax_amount', 'notes');
            },
        });
    };

    const applyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(pageUrl, filterState, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetFilter = () => {
        const reset = { status: '', sub_company_id: '', period: filters.period };
        setFilterState(reset);
        router.get(pageUrl, reset, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Klien" />
            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <Stat label="Draft" value={stats.draft} />
                    <Stat label="Terkirim" value={stats.sent} />
                    <Stat label="Paid" value={stats.paid} />
                    <Stat label="Outstanding" value={formatCurrency(stats.outstanding_amount)} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Invoice</CardTitle>
                        <CardDescription>Pilih periode, klien, dan status invoice yang ingin ditampilkan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilter} className="grid gap-3 lg:grid-cols-[180px_minmax(240px,1fr)_180px_auto]">
                            <div className="grid gap-2">
                                <Label>Periode</Label>
                                <Input type="month" value={filterState.period} onChange={(event) => setFilterState((p) => ({ ...p, period: event.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Klien / Sub-company</Label>
                                <Select value={filterState.sub_company_id || '__all'} onValueChange={(value) => setFilterState((p) => ({ ...p, sub_company_id: value === '__all' ? '' : value }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="__all">Semua klien</SelectItem>{subCompanies.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={filterState.status || '__all'} onValueChange={(value) => setFilterState((p) => ({ ...p, status: value === '__all' ? '' : value }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="__all">Semua status</SelectItem>{statusOptions.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button><Filter className="size-4" />Terapkan</Button>
                                <Button type="button" variant="outline" onClick={resetFilter}><RotateCcw className="size-4" />Reset</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <CardTitle>Daftar Invoice Klien</CardTitle>
                                <CardDescription>Total data: {invoices.total}</CardDescription>
                            </div>
                            <Button type="button" onClick={() => setInvoiceDialogOpen(true)}>
                                <Plus className="size-4" />
                                Buat Invoice Klien
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-sm">
                                <thead><tr className="border-b text-left"><th className="px-3 py-2">Invoice</th><th className="px-3 py-2">Klien</th><th className="px-3 py-2">Periode</th><th className="px-3 py-2">Headcount</th><th className="px-3 py-2">Payroll</th><th className="px-3 py-2">Fee + Pajak</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Aksi</th></tr></thead>
                                <tbody>
                                    {invoices.data.length === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">Belum ada invoice klien.</td></tr>}
                                    {invoices.data.map((row) => (
                                        <tr key={row.id} className="border-b align-top">
                                            <td className="px-3 py-3 font-medium">{row.invoice_number}<div className="text-xs text-muted-foreground">{row.issued_at} {row.due_date ? `• due ${row.due_date}` : ''}</div></td>
                                            <td className="px-3 py-3">{row.sub_company_label}</td>
                                            <td className="px-3 py-3">{row.period}</td>
                                            <td className="px-3 py-3">{row.employee_count}</td>
                                            <td className="px-3 py-3">{formatCurrency(row.payroll_cost)}</td>
                                            <td className="px-3 py-3">{formatCurrency(Number(row.service_fee) + Number(row.tax_amount))}</td>
                                            <td className="px-3 py-3 font-semibold">{formatCurrency(row.total_amount)}</td>
                                            <td className="px-3 py-3"><Badge>{statusLabels[row.status] ?? row.status}</Badge></td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-2">
                                                    {row.status !== 'paid' && <Button size="sm" variant="outline" onClick={() => router.put(`${pageUrl}/${row.id}`, { status: row.status === 'draft' ? 'sent' : 'paid', due_date: row.due_date, notes: row.notes }, { preserveScroll: true })}>{row.status === 'draft' ? 'Kirim' : 'Paid'}</Button>}
                                                    {row.status !== 'paid' && <Button size="icon" variant="destructive" onClick={() => router.delete(`${pageUrl}/${row.id}`, { preserveScroll: true })}><Trash2 className="size-4" /></Button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">{invoices.links.map((link, index) => <Button key={`${link.label}-${index}`} asChild={link.url !== null} size="sm" variant={link.active ? 'default' : 'outline'} disabled={link.url === null}>{link.url ? <Link href={link.url} preserveScroll preserveState><span dangerouslySetInnerHTML={{ __html: link.label }} /></Link> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}</Button>)}</div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Buat Invoice Klien</DialogTitle>
                        <DialogDescription>
                            Sistem mengambil nilai payroll reguler per sub-company. Jika payroll belum digenerate, sistem memakai gaji pokok aktif.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="grid gap-3 md:grid-cols-3">
                        <div className="grid gap-2">
                            <Label>Sub-company</Label>
                            <Select value={form.data.sub_company_id} onValueChange={(value) => form.setData('sub_company_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                                <SelectContent>{subCompanies.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.label}</SelectItem>)}</SelectContent>
                            </Select>
                            <InputError message={form.errors.sub_company_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Periode</Label>
                            <Input type="month" value={form.data.period} onChange={(event) => form.setData('period', event.target.value)} />
                            <InputError message={form.errors.period} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Tanggal Invoice</Label>
                            <Input type="date" value={form.data.issued_at} onChange={(event) => form.setData('issued_at', event.target.value)} />
                            <InputError message={form.errors.issued_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Jatuh Tempo</Label>
                            <Input type="date" value={form.data.due_date} onChange={(event) => form.setData('due_date', event.target.value)} />
                            <InputError message={form.errors.due_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Service Fee</Label>
                            <Input type="text" inputMode="numeric" value={formatThousandDigits(form.data.service_fee)} onChange={(event) => form.setData('service_fee', normalizeDigitInput(event.target.value))} />
                            <InputError message={form.errors.service_fee} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Pajak</Label>
                            <Input type="text" inputMode="numeric" value={formatThousandDigits(form.data.tax_amount)} onChange={(event) => form.setData('tax_amount', normalizeDigitInput(event.target.value))} />
                            <InputError message={form.errors.tax_amount} />
                        </div>
                        <div className="grid gap-2 md:col-span-3">
                            <Label>Catatan</Label>
                            <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2 md:col-span-3">
                            <Button type="button" variant="outline" onClick={() => setInvoiceDialogOpen(false)}>Batal</Button>
                            <Button disabled={form.processing}>Buat Invoice</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return <Card className="gap-2 py-3"><CardHeader className="px-4 pb-0"><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>;
}
