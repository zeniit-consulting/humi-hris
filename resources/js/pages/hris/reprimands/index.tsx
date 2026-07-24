import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, CircleX, FileText, Filter, Pencil, Plus, RotateCcw, ScrollText, Trash2, UploadCloud, X } from 'lucide-react';
import type { DragEvent, FormEvent } from 'react';
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
    validity_months: number | null;
    expires_at: string | null;
    subject: string;
    description: string | null;
    action_plan: string | null;
    status: string;
    resolution_notes: string | null;
    attachment_url: string | null;
    attachment_name: string | null;
};
type FormData = {
    employee_id: string;
    level: string;
    issued_date: string;
    incident_date: string;
    validity_months: string;
    subject: string;
    description: string;
    action_plan: string;
    status: string;
    resolution_notes: string;
    attachment: File | null;
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
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Teguran', href: pageUrl }];
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
    validity_months: '',
    subject: '',
    description: '',
    action_plan: '',
    status: 'active',
    resolution_notes: '',
    attachment: null,
};

export default function ReprimandPage() {
    const { reprimands, employeeOptions, filters, levelOptions, statusOptions, stats } = usePage<PageProps>().props;
    const [filterState, setFilterState] = useState(filters);
    const [editing, setEditing] = useState<Reprimand | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const form = useForm<FormData>(emptyForm);

    const employeeSelectOptions = useMemo(
        () => employeeOptions.map((employee) => ({ value: String(employee.id), label: employee.label })),
        [employeeOptions],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`${pageUrl}/${editing.id}`, { forceFormData: true, preserveScroll: true, onSuccess: closeForm });
            return;
        }

        form.post(pageUrl, { forceFormData: true, preserveScroll: true, onSuccess: closeForm });
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
            validity_months: row.validity_months ? String(row.validity_months) : '',
            subject: row.subject,
            description: row.description ?? '',
            action_plan: row.action_plan ?? '',
            status: row.status,
            resolution_notes: row.resolution_notes ?? '',
            attachment: null,
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
            <Head title="Teguran" />

            <div className="space-y-4 p-4">
                <div className="grid gap-5 md:grid-cols-3">
                    <Stat label="Aktif" value={stats.active} tone="blue" />
                    <Stat label="Selesai" value={stats.resolved} tone="emerald" />
                    <Stat label="Dibatalkan" value={stats.void} tone="rose" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-semibold">
                            <ScrollText className="size-5" />
                            Teguran
                        </h1>
                        <p className="text-sm text-muted-foreground">Catat teguran lisan dan surat peringatan karyawan.</p>
                    </div>
                    <Button type="button" onClick={openCreateForm}>
                        <Plus className="size-4" />
                        Tambah Teguran
                    </Button>
                </div>

                <Card>
                    <CardHeader className="p-0">
                        <button type="button" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} className="flex w-full items-center justify-between gap-4 px-5 py-2.5 text-left hover:bg-muted/40">
                            <div>
                                <CardTitle className="text-base">Filter</CardTitle>
                                <CardDescription className="mt-0.5 text-xs">Saring data berdasarkan karyawan, level, dan status.</CardDescription>
                            </div>
                            <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </CardHeader>
                    {filterOpen && <CardContent className="border-t py-3">
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
                    </CardContent>}
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Teguran</CardTitle>
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
                                                Belum ada data teguran.
                                            </td>
                                        </tr>
                                    )}
                                    {reprimands.data.map((row) => (
                                        <tr key={row.id} className="border-b align-top">
                                            <td className="px-3 py-3 font-medium">{row.reprimand_number}</td>
                                            <td className="px-3 py-3"><Link className="text-primary hover:underline" href={`/hris/reprimands/tracking/${row.employee_id}`}>{row.employee_label}</Link></td>
                                            <td className="px-3 py-3">{levelLabels[row.level]}</td>
                                            <td className="px-3 py-3">
                                                {row.issued_date}
                                                <div className="text-xs text-muted-foreground">Kejadian: {row.incident_date ?? '-'}</div>
                                                {row.validity_months && <div className="text-xs text-muted-foreground">Berlaku {row.validity_months} bulan sampai {row.expires_at}</div>}
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
                                                    <Button type="button" size="icon" variant="outline" onClick={() => openEditForm(row)} aria-label="Edit teguran">
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button type="button" size="icon" variant="destructive" onClick={() => router.delete(`${pageUrl}/${row.id}`, { preserveScroll: true })} aria-label="Hapus teguran">
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
                        <DialogTitle>{editing ? `Edit ${editing.reprimand_number}` : 'Tambah Teguran'}</DialogTitle>
                        <DialogDescription>Gunakan untuk teguran lisan, SP1, SP2, atau SP3.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-6">
                            <section className="space-y-3">
                                <div><h3 className="text-sm font-semibold">Informasi Teguran</h3><p className="text-xs text-muted-foreground">Identitas karyawan dan jenis peringatan.</p></div>
                                <div className="grid gap-4 md:grid-cols-12">
                            <Field label="Karyawan" error={form.errors.employee_id} className="md:col-span-6">
                                <SearchableSelect
                                    value={form.data.employee_id}
                                    options={employeeSelectOptions}
                                    onValueChange={(value) => form.setData('employee_id', value)}
                                    placeholder="Pilih karyawan"
                                    searchPlaceholder="Cari karyawan"
                                />
                            </Field>
                            <Field label="Level" error={form.errors.level} className="md:col-span-3">
                                <Select value={form.data.level} onValueChange={(value) => form.setData('level', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{levelOptions.map((level) => <SelectItem key={level} value={level}>{levelLabels[level]}</SelectItem>)}</SelectContent>
                                </Select>
                            </Field>
                            <Field label="Tanggal Terbit" error={form.errors.issued_date} className="md:col-span-3">
                                <Input type="date" value={form.data.issued_date} onChange={(event) => form.setData('issued_date', event.target.value)} />
                            </Field>
                            <Field label="Tanggal Kejadian" error={form.errors.incident_date} className="md:col-span-4">
                                <Input type="date" value={form.data.incident_date} onChange={(event) => form.setData('incident_date', event.target.value)} />
                            </Field>
                            <Field label="Masa Berlaku (bulan)" error={form.errors.validity_months} className="md:col-span-4">
                                <Input type="number" min="1" max="120" value={form.data.validity_months} onChange={(event) => form.setData('validity_months', event.target.value)} placeholder="Contoh: 6" />
                            </Field>
                            <Field label="Subjek" error={form.errors.subject} className="md:col-span-4">
                                <Input value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} />
                            </Field>
                                </div>
                            </section>
                            <section className="space-y-3">
                                <div><h3 className="text-sm font-semibold">Detail dan Tindak Lanjut</h3><p className="text-xs text-muted-foreground">Jelaskan kejadian dan rencana perbaikan secara ringkas.</p></div>
                                <div className="grid gap-4 md:grid-cols-2">
                            <TextAreaField label="Deskripsi" className="md:col-span-2" value={form.data.description} error={form.errors.description} onChange={(value) => form.setData('description', value)} />
                            <TextAreaField label="Action Plan" className="md:col-span-2" value={form.data.action_plan} error={form.errors.action_plan} onChange={(value) => form.setData('action_plan', value)} />
                            {editing && <Field label="Status" error={form.errors.status}>
                                <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{statusOptions.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}</SelectContent>
                                </Select>
                            </Field>}
                            <TextAreaField label="Catatan Penyelesaian" className="md:col-span-2" value={form.data.resolution_notes} error={form.errors.resolution_notes} onChange={(value) => form.setData('resolution_notes', value)} />
                                </div>
                            </section>
                            <section className="space-y-3">
                                <div><h3 className="text-sm font-semibold">Dokumen Pendukung</h3><p className="text-xs text-muted-foreground">Upload bukti teguran atau dokumen terkait.</p></div>
                                <AttachmentDropzone file={form.data.attachment} existingName={editing?.attachment_name ?? null} error={form.errors.attachment} onChange={(file) => form.setData('attachment', file)} />
                            </section>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
                            <Button type="submit" disabled={form.processing}>{editing ? 'Simpan Perubahan' : 'Simpan Teguran'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'blue' | 'emerald' | 'rose' }) {
    const styles = {
        blue: { card: 'border-blue-200/80 bg-blue-50/70 dark:border-blue-950 dark:bg-blue-950/25', icon: 'bg-blue-600 text-white', value: 'text-blue-700 dark:text-blue-300' },
        emerald: { card: 'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-950 dark:bg-emerald-950/25', icon: 'bg-emerald-600 text-white', value: 'text-emerald-700 dark:text-emerald-300' },
        rose: { card: 'border-rose-200/80 bg-rose-50/70 dark:border-rose-950 dark:bg-rose-950/25', icon: 'bg-rose-600 text-white', value: 'text-rose-700 dark:text-rose-300' },
    }[tone];
    const Icon = tone === 'blue' ? ScrollText : tone === 'emerald' ? CheckCircle2 : CircleX;
    return (
        <Card className={`min-h-16 ${styles.card}`}>
            <CardContent className="flex items-center justify-between gap-4 px-4 py-2.5">
                <div className="flex items-center gap-3"><span className={`grid size-8 place-items-center rounded-full ${styles.icon}`}><Icon className="size-4" /></span><CardDescription className="text-xs font-semibold text-foreground/75">{label}</CardDescription></div>
                <CardTitle className={`text-2xl leading-none ${styles.value}`}>{value}</CardTitle>
            </CardContent>
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

function TextAreaField({ label, className, value, error, onChange }: { label: string; className?: string; value: string; error?: string; onChange: (value: string) => void }) {
    return (
        <div className={`grid gap-2 ${className ?? ''}`}>
            <Label>{label}</Label>
            <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)} />
            <InputError message={error} />
        </div>
    );
}

function AttachmentDropzone({ file, existingName, error, onChange }: { file: File | null; existingName: string | null; error?: string; onChange: (file: File | null) => void }) {
    const [dragging, setDragging] = useState(false);
    const accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx';
    const pickFile = (candidate?: File) => candidate && onChange(candidate);
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        pickFile(event.dataTransfer.files?.[0]);
    };

    return (
        <div className="grid gap-2">
            <div
                role="button"
                tabIndex={0}
                onClick={() => document.getElementById('reprimand-attachment')?.click()}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') document.getElementById('reprimand-attachment')?.click(); }}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`cursor-pointer rounded-lg border-2 border-dashed px-5 py-6 text-center transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/30'}`}
            >
                <input id="reprimand-attachment" type="file" className="hidden" accept={accept} onChange={(event) => pickFile(event.target.files?.[0])} />
                {file ? <div className="flex items-center justify-center gap-3 text-left"><FileText className="size-8 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · Klik untuk mengganti</p></div><Button type="button" size="icon" variant="ghost" onClick={(event) => { event.stopPropagation(); onChange(null); }} aria-label="Hapus file"><X className="size-4" /></Button></div> : <><UploadCloud className="mx-auto size-8 text-muted-foreground" /><p className="mt-2 text-sm font-medium">Tarik file ke sini atau klik untuk memilih</p><p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG, DOC, DOCX, XLS, XLSX · Maksimal 10 MB</p>{existingName && <p className="mt-2 text-xs text-primary">File saat ini: {existingName}</p>}</>}
            </div>
            <InputError message={error} />
        </div>
    );
}
