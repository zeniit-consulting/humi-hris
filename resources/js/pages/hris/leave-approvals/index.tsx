import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Check, Eye, Filter, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ActionIconButton from '@/components/action-icon-button';
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
type Filters = { status: string; employee_id: string; date: string };
type LeaveRow = {
    id: number;
    employee_label: string;
    division_name: string | null;
    position_name: string | null;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: string;
    reason: string | null;
    status: string;
    approval_stage: number;
    first_approved_by: string | null;
    first_approved_at: string | null;
    approved_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
};
type PageProps = {
    leaves: Paginator<LeaveRow>;
    employees: EmployeeOption[];
    filters: Filters;
    statusOptions: string[];
    stats: { pending: number; approved: number; rejected: number };
    approvalLevels: number;
};

const pageUrl = '/hris/leave-approvals';
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Approval Cuti', href: pageUrl }];
const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
};
const typeLabels: Record<string, string> = {
    annual: 'Tahunan',
    sick: 'Sakit',
    unpaid: 'Tidak dibayar',
    other: 'Lainnya',
};

const badgeVariant = (status: string) =>
    status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';

export default function LeaveApprovalPage() {
    const { leaves, employees, filters, statusOptions, stats, approvalLevels } = usePage<PageProps>().props;
    const [filterState, setFilterState] = useState(filters);
    const [detailRow, setDetailRow] = useState<LeaveRow | null>(null);
    const [rejectRow, setRejectRow] = useState<LeaveRow | null>(null);
    const rejectForm = useForm({ rejection_reason: '' });

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setFilterState(filters);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [filters]);

    const applyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(pageUrl, filterState, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetFilter = () => {
        const reset = { status: 'pending', employee_id: '', date: '' };
        setFilterState(reset);
        router.get(pageUrl, reset, { preserveState: true, preserveScroll: true, replace: true });
    };

    const submitReject = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!rejectRow) return;
        rejectForm.post(`${pageUrl}/${rejectRow.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectRow(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Cuti" />
            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        ['Menunggu', stats.pending],
                        ['Disetujui', stats.approved],
                        ['Ditolak', stats.rejected],
                    ].map(([label, value]) => (
                        <Card key={label} className={`gap-2 py-3 ${label === 'Menunggu' ? 'border-amber-200 bg-amber-50/70 dark:border-amber-950 dark:bg-amber-950/25' : label === 'Disetujui' ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-950 dark:bg-emerald-950/25' : 'border-rose-200 bg-rose-50/70 dark:border-rose-950 dark:bg-rose-950/25'}`}>
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>{label}</CardDescription>
                                <CardTitle className="text-2xl">{value}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Approval Cuti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilter} className="grid gap-3 md:grid-cols-[220px_220px_170px_auto]">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Tanggal</Label>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="date" type="date" value={filterState.date} onChange={(e) => setFilterState((p) => ({ ...p, date: e.target.value }))} className="pl-9" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Karyawan</Label>
                                <SearchableSelect
                                    value={filterState.employee_id || '__all'}
                                    onValueChange={(value) => setFilterState((p) => ({ ...p, employee_id: value === '__all' ? '' : value }))}
                                    placeholder="Semua"
                                    searchPlaceholder="Cari karyawan..."
                                    options={[{ value: '__all', label: 'Semua karyawan' }, ...employees.map((e) => ({ value: String(e.id), label: e.label }))]}
                                    className="w-full"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={filterState.status || '__all'} onValueChange={(value) => setFilterState((p) => ({ ...p, status: value === '__all' ? '' : value }))}>
                                    <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all">Semua status</SelectItem>
                                        {statusOptions.map((status) => <SelectItem key={status} value={status}>{statusLabels[status] ?? status}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button type="submit"><Filter className="size-4" />Terapkan</Button>
                                <Button type="button" variant="outline" onClick={resetFilter}><RotateCcw className="size-4" />Reset</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pengajuan Cuti</CardTitle>
                        <CardDescription>Total data: {leaves.total}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">Karyawan</th>
                                        <th className="px-3 py-2">Periode</th>
                                        <th className="px-3 py-2">Jenis</th>
                                        <th className="px-3 py-2">Alasan</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.data.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Belum ada pengajuan cuti.</td></tr>}
                                    {leaves.data.map((row) => (
                                        <tr key={row.id} className="border-b align-top">
                                            <td className="px-3 py-3"><div className="font-medium">{row.employee_label}</div><div className="text-xs text-muted-foreground">{[row.division_name, row.position_name].filter(Boolean).join(' • ') || '-'}</div></td>
                                            <td className="px-3 py-3">{row.start_date} s/d {row.end_date}<div className="text-xs text-muted-foreground">{row.total_days} hari</div></td>
                                            <td className="px-3 py-3">{typeLabels[row.leave_type] ?? row.leave_type}</td>
                                            <td className="max-w-[260px] px-3 py-3"><p className="line-clamp-2 whitespace-normal">{row.reason ?? '-'}</p></td>
                                            <td className="px-3 py-3"><Badge variant={badgeVariant(row.status)}>{row.status === 'pending' && approvalLevels === 2 ? `Menunggu ${row.approval_stage + 1}/2` : statusLabels[row.status] ?? row.status}</Badge></td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1.5">
                                                    <ActionIconButton label="Detail" icon={Eye} variant="outline" onClick={() => setDetailRow(row)} />
                                                    {row.status === 'pending' && <>
                                                        <ActionIconButton label="Setujui" icon={Check} onClick={() => router.post(`${pageUrl}/${row.id}/approve`, undefined, { preserveScroll: true })} />
                                                        <ActionIconButton label="Tolak" icon={X} variant="destructive" onClick={() => { rejectForm.reset(); setRejectRow(row); }} />
                                                    </>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {leaves.links.map((link, index) => (
                                <Button key={`${link.label}-${index}`} asChild={link.url !== null} size="sm" variant={link.active ? 'default' : 'outline'} disabled={link.url === null}>
                                    {link.url ? <Link href={link.url} preserveScroll preserveState><span dangerouslySetInnerHTML={{ __html: link.label }} /></Link> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={detailRow !== null} onOpenChange={(open) => !open && setDetailRow(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Detail Pengajuan Cuti</DialogTitle><DialogDescription>{detailRow?.employee_label}</DialogDescription></DialogHeader>
                    {detailRow && <div className="space-y-3 text-sm">
                        <p><strong>Periode:</strong> {detailRow.start_date} s/d {detailRow.end_date} ({detailRow.total_days} hari)</p>
                        <p><strong>Jenis:</strong> {typeLabels[detailRow.leave_type] ?? detailRow.leave_type}</p>
                        <p className="whitespace-pre-line"><strong>Alasan:</strong> {detailRow.reason ?? '-'}</p>
                        {detailRow.first_approved_by && <p><strong>Approval tingkat 1:</strong> {detailRow.first_approved_by}</p>}
                        {detailRow.rejection_reason && <p><strong>Alasan penolakan:</strong> {detailRow.rejection_reason}</p>}
                    </div>}
                </DialogContent>
            </Dialog>

            <Dialog open={rejectRow !== null} onOpenChange={(open) => !open && setRejectRow(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Tolak Pengajuan Cuti</DialogTitle><DialogDescription>Masukkan alasan penolakan.</DialogDescription></DialogHeader>
                    <form onSubmit={submitReject} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rejection_reason">Alasan</Label>
                            <Input id="rejection_reason" value={rejectForm.data.rejection_reason} onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)} />
                            <InputError message={rejectForm.errors.rejection_reason} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setRejectRow(null)}>Batal</Button>
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing}>Tolak</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
