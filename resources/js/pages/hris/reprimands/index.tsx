import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Filter, Pencil, Plus, RotateCcw, ScrollText, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type LinkItem = { url: string | null; label: string; active: boolean };
type Paginator<T> = { data: T[]; links: LinkItem[]; total: number };
type EmployeeOption = { id: number; label: string };
type Reprimand = {
    id: number;
    employee_id: number;
    employee_label: string;
    reprimand_number: string;
    level: string;
    issued_date: string;
    incident_date: string | null;
    subject: string;
    description: string | null;
    action_plan: string | null;
    status: string;
    resolution_notes: string | null;
};
type FormData = {
    employee_id: string;
    level: string;
    issued_date: string;
    incident_date: string;
    subject: string;
    description: string;
    action_plan: string;
    status: string;
    resolution_notes: string;
};
type PageProps = {
    reprimands: Paginator<Reprimand>;
    employeeOptions: EmployeeOption[];
    filters: { status: string; level: string; employee_id: string };
    levelOptions: string[];
    statusOptions: string[];
    stats: { active: number; resolved: number; void: number };
};

const pageUrl = '/hris/reprimands';
const today = new Date().toISOString().slice(0, 10);
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reprimand', href: pageUrl }];
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
const emptyForm: FormData = {
    employee_id: '',
    level: 'sp1',
    issued_date: today,
    incident_date: '',
    subject: '',
    description: '',
    action_plan: '',
    status: 'active',
    resolution_notes: '',
};

export default function ReprimandPage() {
    const { reprimands, employeeOptions, filters, levelOptions, statusOptions, stats } = usePage<PageProps>().props;
    const [filterState, setFilterState] = useState(filters);
    const [editing, setEditing] = useState<Reprimand | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const form = useForm<FormData>(emptyForm);

    const employeeSelectOptions = useMemo(
        () => employeeOptions.map((employee) => ({ value: String(employee.id), label: employee.label })),
        [employeeOptions],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing) {
            form.put(`${pageUrl}/${editing.id}`, { preserveScroll: true, onSuccess: closeForm });
            return;
        }

        form.post(pageUrl, { preserveScroll: true, onSuccess: closeForm });
    };

    const applyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(pageUrl, filterState, { preserveScroll: true, preserveState: true, replace: true });
    };

    const resetFilter = () => {
        const nextFilters = { status: 'active', level: '', employee_id: '' };
        setFilterState(nextFilters);
        router.get(pageUrl, nextFilters, { preserveScroll: true, preserveState: true, replace: true });
    };

    const openCreateForm = () => {
        setEditing(null);
        form.clearErrors();
        form.setData(emptyForm);
        setFormOpen(true);
    };

    const openEditForm = (row: Reprimand) => {
        setEditing(row);
        form.clearErrors();
        form.setData({
            employee_id: String(row.employee_id),
            level: row.level,
            issued_date: row.issued_date,
            incident_date: row.incident_date ?? '',
            subject: row.subject,
            description: row.description ?? '',
            action_plan: row.action_plan ?? '',
            status: row.status,
            resolution_notes: row.resolution_notes ?? '',
        });
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        form.clearErrors();
        form.setData(emptyForm);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reprimand" />

            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Stat label="Aktif" value={stats.active} />
                    <Stat label="Selesai" value={stats.resolved} />
                    <Stat label="Dibatalkan" value={stats.void} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-semibold">
                            <ScrollText className="size-5" />
                            Reprimand
                        </h1>
                        <p className="text-sm text-muted-foreground">Catat teguran lisan dan surat peringatan karyawan.</p>
                    </div>
                    <Button type="button" onClick={openCreateForm}>
                        <Plus className="size-4" />
                        Tambah Reprimand
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilter} className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_160px_160px_auto]">
                            <SearchableSelect
                                value={filterState.employee_id}
                                options={employeeSelectOptions}
                                onValueChange={(value) => setFilterState((prev) => ({ ...prev, employee_id: value }))}
                                placeholder="Semua karyawan"
                                searchPlaceholder="Cari karyawan"
                            />
                            <Select value={filterState.level || '__all'} onValueChange={(value) => setFilterState((prev) => ({ ...prev, level: value === '__all' ? '' : value }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all">Semua level</SelectItem>
                                    {levelOptions.map((level) => <SelectItem key={level} value={level}>{levelLabels[level]}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={filterState.status || '__all'} onValueChange={(value) => setFilterState((prev) => ({ ...prev, status: value === '__all' ? '' : value }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all">Semua status</SelectItem>
                                    {statusOptions.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button type="submit"><Filter className="size-4" />Terapkan</Button>
                                <Button type="button" variant="outline" onClick={resetFilter}><RotateCcw className="size-4" />Reset</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Reprimand</CardTitle>
                        <CardDescription>Total data: {reprimands.total}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">Nomor</th>
                                        <th className="px-3 py-2">Karyawan</th>
                                        <th className="px-3 py-2">Level</th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Subjek</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reprimands.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                                                Belum ada data reprimand.
                                            </td>
                                        </tr>
                                    )}
                                    {reprimands.data.map((row) => (
                                        <tr key={row.id} className="border-b align-top">
                                            <td className="px-3 py-3 font-medium">{row.reprimand_number}</td>
                                            <td className="px-3 py-3">{row.employee_label}</td>
                                            <td className="px-3 py-3">{levelLabels[row.level]}</td>
                                            <td className="px-3 py-3">
                                                {row.issued_date}
                                                <div className="text-xs text-muted-foreground">Kejadian: {row.incident_date ?? '-'}</div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-medium">{row.subject}</div>
                                                <div className="line-clamp-2 text-xs text-muted-foreground">{row.action_plan ?? row.description ?? '-'}</div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{statusLabels[row.status]}</Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-2">
                                                    <Button type="button" size="icon" variant="outline" onClick={() => openEditForm(row)} aria-label="Edit reprimand">
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button type="button" size="icon" variant="destructive" onClick={() => router.delete(`${pageUrl}/${row.id}`, { preserveScroll: true })} aria-label="Hapus reprimand">
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {reprimands.links.map((link, index) => (
                                <Button key={`${link.label}-${index}`} asChild={link.url !== null} size="sm" variant={link.active ? 'default' : 'outline'} disabled={link.url === null}>
                                    {link.url ? <Link href={link.url} preserveScroll preserveState><span dangerouslySetInnerHTML={{ __html: link.label }} /></Link> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={formOpen} onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? `Edit ${editing.reprimand_number}` : 'Tambah Reprimand'}</DialogTitle>
                        <DialogDescription>Gunakan untuk teguran lisan, SP1, SP2, atau SP3.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Karyawan" error={form.errors.employee_id}>
                                <SearchableSelect
                                    value={form.data.employee_id}
                                    options={employeeSelectOptions}
                                    onValueChange={(value) => form.setData('employee_id', value)}
                                    placeholder="Pilih karyawan"
                                    searchPlaceholder="Cari karyawan"
                                />
                            </Field>
                            <Field label="Level" error={form.errors.level}>
                                <Select value={form.data.level} onValueChange={(value) => form.setData('level', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{levelOptions.map((level) => <SelectItem key={level} value={level}>{levelLabels[level]}</SelectItem>)}</SelectContent>
                                </Select>
                            </Field>
                            <Field label="Tanggal Terbit" error={form.errors.issued_date}>
                                <Input type="date" value={form.data.issued_date} onChange={(event) => form.setData('issued_date', event.target.value)} />
                            </Field>
                            <Field label="Tanggal Kejadian" error={form.errors.incident_date}>
                                <Input type="date" value={form.data.incident_date} onChange={(event) => form.setData('incident_date', event.target.value)} />
                            </Field>
                            <Field label="Subjek" error={form.errors.subject} className="md:col-span-2">
                                <Input value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} />
                            </Field>
                            <TextAreaField label="Deskripsi" value={form.data.description} error={form.errors.description} onChange={(value) => form.setData('description', value)} />
                            <TextAreaField label="Action Plan" value={form.data.action_plan} error={form.errors.action_plan} onChange={(value) => form.setData('action_plan', value)} />
                            <Field label="Status" error={form.errors.status}>
                                <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{statusOptions.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}</SelectContent>
                                </Select>
                            </Field>
                            <TextAreaField label="Catatan Penyelesaian" value={form.data.resolution_notes} error={form.errors.resolution_notes} onChange={(value) => form.setData('resolution_notes', value)} />
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
                            <Button type="submit" disabled={form.processing}>{editing ? 'Simpan Perubahan' : 'Simpan Reprimand'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardHeader className="px-4 py-3">
                <CardDescription className="text-xs">{label}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={`grid gap-2 ${className ?? ''}`}>
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function TextAreaField({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (value: string) => void }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)} />
            <InputError message={error} />
        </div>
    );
}
