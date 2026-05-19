import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Filter, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type LinkItem = { url: string | null; label: string; active: boolean };
type Paginator<T> = { data: T[]; links: LinkItem[]; total: number };
type Option = { id: number; label?: string; name?: string };
type Row = {
    id: number;
    request_number: string;
    sub_company_id: number;
    sub_company_label: string;
    position_id: number | null;
    position_name: string | null;
    title: string;
    requested_headcount: number;
    fulfilled_headcount: number;
    needed_by: string | null;
    status: string;
    priority: string;
    requirements: string | null;
    notes: string | null;
};
type PageProps = {
    requests: Paginator<Row>;
    subCompanies: Option[];
    positions: Option[];
    filters: { status: string; sub_company_id: string };
    statusOptions: string[];
    priorityOptions: string[];
    stats: { open: number; in_progress: number; remaining: number };
};

const pageUrl = '/hris/manpower-requests';
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Manpower Request', href: pageUrl }];
const statusLabels: Record<string, string> = { open: 'Open', in_progress: 'Diproses', fulfilled: 'Fulfilled', cancelled: 'Batal' };
const priorityLabels: Record<string, string> = { normal: 'Normal', high: 'High', urgent: 'Urgent' };
const emptyForm = { sub_company_id: '', position_id: '', title: '', requested_headcount: '1', fulfilled_headcount: '0', needed_by: '', status: 'open', priority: 'normal', requirements: '', notes: '' };

export default function ManpowerRequestPage() {
    const { requests, subCompanies, positions, filters, statusOptions, priorityOptions, stats } = usePage<PageProps>().props;
    const [filterState, setFilterState] = useState(filters);
    const [editing, setEditing] = useState<Row | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const form = useForm(emptyForm);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setFilterState(filters), 0);

        return () => window.clearTimeout(timeoutId);
    }, [filters]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (editing) {
            form.put(`${pageUrl}/${editing.id}`, { preserveScroll: true, onSuccess: closeFormDialog });
            return;
        }
        form.post(pageUrl, { preserveScroll: true, onSuccess: closeFormDialog });
    };

    const applyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(pageUrl, filterState, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openCreateDialog = () => {
        setEditing(null);
        form.clearErrors();
        form.setData(emptyForm);
        setFormDialogOpen(true);
    };

    const closeFormDialog = () => {
        setFormDialogOpen(false);
        setEditing(null);
        form.clearErrors();
        form.setData(emptyForm);
    };

    const startEdit = (row: Row) => {
        setEditing(row);
        form.setData({
            sub_company_id: String(row.sub_company_id),
            position_id: row.position_id ? String(row.position_id) : '',
            title: row.title,
            requested_headcount: String(row.requested_headcount),
            fulfilled_headcount: String(row.fulfilled_headcount),
            needed_by: row.needed_by ?? '',
            status: row.status,
            priority: row.priority,
            requirements: row.requirements ?? '',
            notes: row.notes ?? '',
        });
        form.clearErrors();
        setFormDialogOpen(true);
    };

    const requestForm = (
        <form onSubmit={submit} className="space-y-5">
            <div className="rounded-lg border bg-muted/30 p-4">
                <p className="font-medium">{editing ? 'Perbarui kebutuhan manpower yang sudah tercatat.' : 'Isi kebutuhan manpower baru dari klien atau sub-company.'}</p>
                <p className="mt-1 text-sm text-muted-foreground">Lengkapi detail posisi, target headcount, serta status pemenuhan agar tim operasional mudah menindaklanjuti.</p>
            </div>

            <div className="grid gap-4 xl:grid-cols-12">
                <Field label="Sub-company" error={form.errors.sub_company_id} className="xl:col-span-4">
                    <Select value={form.data.sub_company_id} onValueChange={(value) => form.setData('sub_company_id', value)}>
                        <SelectTrigger><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                        <SelectContent>{subCompanies.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.label}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="Posisi" error={form.errors.position_id} className="xl:col-span-4">
                    <Select value={form.data.position_id || '__none'} onValueChange={(value) => form.setData('position_id', value === '__none' ? '' : value)}>
                        <SelectTrigger><SelectValue placeholder="Opsional" /></SelectTrigger>
                        <SelectContent><SelectItem value="__none">Tanpa posisi master</SelectItem>{positions.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="Judul kebutuhan" error={form.errors.title} className="xl:col-span-4">
                    <Input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
                </Field>
                <Field label="Headcount Diminta" error={form.errors.requested_headcount} className="md:col-span-1 xl:col-span-3">
                    <Input type="number" min="1" value={form.data.requested_headcount} onChange={(event) => form.setData('requested_headcount', event.target.value)} />
                </Field>
                <Field label="Headcount Terpenuhi" error={form.errors.fulfilled_headcount} className="md:col-span-1 xl:col-span-3">
                    <Input type="number" min="0" value={form.data.fulfilled_headcount} onChange={(event) => form.setData('fulfilled_headcount', event.target.value)} />
                </Field>
                <Field label="Dibutuhkan sebelum" error={form.errors.needed_by} className="md:col-span-1 xl:col-span-3">
                    <Input type="date" value={form.data.needed_by} onChange={(event) => form.setData('needed_by', event.target.value)} />
                </Field>
                <Field label="Status" error={form.errors.status} className="md:col-span-1 xl:col-span-3">
                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{statusOptions.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <Field label="Prioritas" error={form.errors.priority} className="md:col-span-1 xl:col-span-3">
                    <Select value={form.data.priority} onValueChange={(value) => form.setData('priority', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{priorityOptions.map((priority) => <SelectItem key={priority} value={priority}>{priorityLabels[priority]}</SelectItem>)}</SelectContent>
                    </Select>
                </Field>
                <div className="grid gap-2 xl:col-span-6">
                    <Label>Requirement</Label>
                    <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={form.data.requirements} onChange={(event) => form.setData('requirements', event.target.value)} />
                    <InputError message={form.errors.requirements} />
                </div>
                <div className="grid gap-2 xl:col-span-6">
                    <Label>Catatan</Label>
                    <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                    <InputError message={form.errors.notes} />
                </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={closeFormDialog}>Batal</Button>
                <Button disabled={form.processing}>{editing ? 'Simpan Perubahan' : 'Tambah Request'}</Button>
            </div>
        </form>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manpower Request" />
            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Stat label="Open" value={stats.open} />
                    <Stat label="Diproses" value={stats.in_progress} />
                    <Stat label="Kebutuhan Belum Terpenuhi" value={stats.remaining} />
                </div>

                <div className="flex justify-end">
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="size-4" />
                        Tambah Manpower Request
                    </Button>
                </div>

                <Card>
                    <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilter} className="grid gap-3 md:grid-cols-[220px_180px_auto]">
                            <Select value={filterState.sub_company_id || '__all'} onValueChange={(value) => setFilterState((p) => ({ ...p, sub_company_id: value === '__all' ? '' : value }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="__all">Semua klien</SelectItem>{subCompanies.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.label}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={filterState.status || '__all'} onValueChange={(value) => setFilterState((p) => ({ ...p, status: value === '__all' ? '' : value }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="__all">Semua status</SelectItem>{statusOptions.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="flex gap-2"><Button><Filter className="size-4" />Terapkan</Button><Button type="button" variant="outline" onClick={() => { const reset = { status: 'open', sub_company_id: '' }; setFilterState(reset); router.get(pageUrl, reset, { preserveScroll: true, preserveState: true, replace: true }); }}><RotateCcw className="size-4" />Reset</Button></div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Daftar Manpower Request</CardTitle><CardDescription>Total data: {requests.total}</CardDescription></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-sm">
                                <thead><tr className="border-b text-left"><th className="px-3 py-2">Request</th><th className="px-3 py-2">Klien</th><th className="px-3 py-2">Kebutuhan</th><th className="px-3 py-2">Headcount</th><th className="px-3 py-2">Deadline</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Aksi</th></tr></thead>
                                <tbody>
                                    {requests.data.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">Belum ada manpower request.</td></tr>}
                                    {requests.data.map((row) => (
                                        <tr key={row.id} className="border-b align-top">
                                            <td className="px-3 py-3 font-medium">{row.request_number}<div className="text-xs text-muted-foreground">{priorityLabels[row.priority]}</div></td>
                                            <td className="px-3 py-3">{row.sub_company_label}</td>
                                            <td className="px-3 py-3">{row.title}<div className="text-xs text-muted-foreground">{row.position_name ?? '-'}</div></td>
                                            <td className="px-3 py-3">{row.fulfilled_headcount}/{row.requested_headcount}</td>
                                            <td className="px-3 py-3">{row.needed_by ?? '-'}</td>
                                            <td className="px-3 py-3"><Badge variant={row.priority === 'urgent' ? 'destructive' : 'secondary'}>{statusLabels[row.status]}</Badge></td>
                                            <td className="px-3 py-3"><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit</Button><Button size="icon" variant="destructive" onClick={() => router.delete(`${pageUrl}/${row.id}`, { preserveScroll: true })}><Trash2 className="size-4" /></Button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">{requests.links.map((link, index) => <Button key={`${link.label}-${index}`} asChild={link.url !== null} size="sm" variant={link.active ? 'default' : 'outline'} disabled={link.url === null}>{link.url ? <Link href={link.url} preserveScroll preserveState><span dangerouslySetInnerHTML={{ __html: link.label }} /></Link> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}</Button>)}</div>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setFormDialogOpen(true);
                    } else {
                        closeFormDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? `Edit ${editing.request_number}` : 'Tambah Manpower Request'}</DialogTitle>
                        <DialogDescription>Catat kebutuhan tenaga kerja dari klien/sub-company.</DialogDescription>
                    </DialogHeader>
                    {requestForm}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return <Card className="gap-2 py-3"><CardHeader className="px-4 pb-0"><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>;
}

function Field({ label, error, children, className = '' }: { label: string; error?: string; children: ReactNode; className?: string }) {
    return <div className={`grid gap-2 ${className}`.trim()}><Label>{label}</Label>{children}<InputError message={error} /></div>;
}
