import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Check, Eye, Filter, Paperclip, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ActionIconButton from '@/components/action-icon-button';
import { AttachmentPreviewDialog } from '@/components/attachment-preview-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
import { SimplePagination } from '@/components/ui/simple-pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatLongDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type LinkItem = { url: string | null; label: string; active: boolean };
type Paginator<T> = { data: T[]; links: LinkItem[]; total: number };
type EmployeeOption = { id: number; label: string };
type Filters = {
    status: string;
    employee_id: string;
    date?: string;
    start_date?: string;
    end_date?: string;
};
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
    attachment: string | null;
    attachment_name: string | null;
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
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Approval Cuti', href: pageUrl },
];
const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
};
const typeLabels: Record<string, string> = {
    annual: 'Cuti Tahunan (Annual Leave)',
    sick: 'Izin Sakit (Sick Leave)',
    unpaid: 'Izin (Unpaid Leave)',
    other: 'Cuti Khusus (Special Leave)',
};

const badgeVariant = (status: string) =>
    status === 'approved'
        ? 'default'
        : status === 'rejected'
          ? 'destructive'
          : 'secondary';

export default function LeaveApprovalPage() {
    const { leaves, employees, filters, statusOptions, stats, approvalLevels } =
        usePage<PageProps>().props;
    const [filterState, setFilterState] = useState<Filters>({
        status: filters.status ?? '',
        employee_id: filters.employee_id ?? '',
        date: filters.date ?? '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });
    const [detailRow, setDetailRow] = useState<LeaveRow | null>(null);
    const [rejectRow, setRejectRow] = useState<LeaveRow | null>(null);
    const [approveConfirmRow, setApproveConfirmRow] = useState<LeaveRow | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkApproveOpen, setBulkApproveOpen] = useState(false);
    const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
    const [bulkRejectReason, setBulkRejectReason] = useState('');
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState<{
        url: string;
        name?: string | null;
        title?: string;
    } | null>(null);
    const rejectForm = useForm({ rejection_reason: '' });

    useEffect(() => {
        setFilterState({
            status: filters.status ?? '',
            employee_id: filters.employee_id ?? '',
            date: filters.date ?? '',
            start_date: filters.start_date ?? '',
            end_date: filters.end_date ?? '',
        });
        setSelectedIds([]);
    }, [filters]);

    const pendingRequests = leaves.data.filter((r) => r.status === 'pending');
    const allPendingSelected =
        pendingRequests.length > 0 &&
        pendingRequests.every((r) => selectedIds.includes(r.id));

    const toggleSelectAll = () => {
        if (allPendingSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingRequests.map((r) => r.id));
        }
    };

    const toggleSelectRow = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    const applyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(pageUrl, filterState, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        const reset: Filters = {
            status: '',
            employee_id: '',
            date: '',
            start_date: '',
            end_date: '',
        };
        setFilterState(reset);
        router.get(pageUrl, reset, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const confirmApprove = (row: LeaveRow) => {
        setApproveConfirmRow(row);
    };

    const submitApprove = () => {
        if (!approveConfirmRow) return;
        router.post(
            `${pageUrl}/${approveConfirmRow.id}/approve`,
            undefined,
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setApproveConfirmRow(null),
            },
        );
    };

    const submitReject = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!rejectRow) return;
        rejectForm.post(`${pageUrl}/${rejectRow.id}/reject`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setRejectRow(null);
                rejectForm.reset();
            },
        });
    };

    const submitBulkApprove = () => {
        if (selectedIds.length === 0) return;
        setIsBulkProcessing(true);
        router.post(
            `${pageUrl}/bulk-approve`,
            { ids: selectedIds },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsBulkProcessing(false);
                    setBulkApproveOpen(false);
                    setSelectedIds([]);
                },
            },
        );
    };

    const submitBulkReject = () => {
        if (selectedIds.length === 0 || !bulkRejectReason.trim()) return;
        setIsBulkProcessing(true);
        router.post(
            `${pageUrl}/bulk-reject`,
            { ids: selectedIds, rejection_reason: bulkRejectReason },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsBulkProcessing(false);
                    setBulkRejectOpen(false);
                    setBulkRejectReason('');
                    setSelectedIds([]);
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            headerActions={
                <Button asChild size="sm" variant="outline">
                    <Link href="/hris/leaves">Kelola Cuti</Link>
                </Button>
            }
        >
            <Head title="Approval Cuti" />
            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        ['Menunggu', stats.pending, 'pending'],
                        ['Disetujui', stats.approved, 'approved'],
                        ['Ditolak', stats.rejected, 'rejected'],
                    ].map(([label, value, statusKey]) => (
                        <Card
                            key={label}
                            role="button"
                            onClick={() => {
                                const nextStatus =
                                    filterState.status === statusKey
                                        ? ''
                                        : statusKey;
                                const nextFilters: Filters = {
                                    ...filterState,
                                    status: nextStatus,
                                };
                                setFilterState(nextFilters);
                                router.get(pageUrl, nextFilters, {
                                    preserveState: true,
                                    preserveScroll: true,
                                    replace: true,
                                });
                            }}
                            className={`cursor-pointer transition-all hover:scale-[1.01] gap-2 py-3 ${
                                filterState.status === statusKey
                                    ? 'ring-2 ring-primary ring-offset-2 '
                                    : ''
                            }${
                                label === 'Menunggu'
                                    ? 'border-amber-200 bg-amber-50/70 dark:border-amber-950 dark:bg-amber-950/25'
                                    : label === 'Disetujui'
                                      ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-950 dark:bg-emerald-950/25'
                                      : 'border-rose-200 bg-rose-50/70 dark:border-rose-950 dark:bg-rose-950/25'
                            }`}
                        >
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>{label}</CardDescription>
                                <CardTitle className="text-2xl">
                                    {value}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Approval Cuti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilter}
                            className="grid gap-3 md:grid-cols-[260px_220px_180px_auto]"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="date">Rentang Tanggal</Label>
                                <DateRangePicker
                                    value={{
                                        from: filterState.start_date || filterState.date || undefined,
                                        to: filterState.end_date || filterState.date || undefined,
                                    }}
                                    onChange={(range) => {
                                        setFilterState((p) => ({
                                            ...p,
                                            start_date: range.from || '',
                                            end_date: range.to ?? range.from ?? '',
                                            date: range.from || '',
                                        }));
                                    }}
                                    placeholder="Semua tanggal..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Karyawan</Label>
                                <SearchableSelect
                                    value={filterState.employee_id || '__all'}
                                    onValueChange={(value) =>
                                        setFilterState((p) => ({
                                            ...p,
                                            employee_id:
                                                value === '__all' ? '' : value,
                                        }))
                                    }
                                    placeholder="Semua"
                                    searchPlaceholder="Cari karyawan..."
                                    options={[
                                        {
                                            value: '__all',
                                            label: 'Semua karyawan',
                                        },
                                        ...employees.map((e) => ({
                                            value: String(e.id),
                                            label: e.label,
                                        })),
                                    ]}
                                    className="w-full"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filter_status">Status</Label>
                                <Select
                                    value={
                                        filterState.status === ''
                                            ? '__all'
                                            : filterState.status
                                    }
                                    onValueChange={(value) =>
                                        setFilterState((p) => ({
                                            ...p,
                                            status:
                                                value === '__all' ? '' : value,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="filter_status">
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all">
                                            Semua status
                                        </SelectItem>
                                        {statusOptions.map((status) => (
                                            <SelectItem
                                                key={status}
                                                value={status}
                                            >
                                                {statusLabels[status] ?? status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button type="submit">
                                    <Filter className="size-4" />
                                    Terapkan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilter}
                                >
                                    <RotateCcw className="size-4" />
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar Pengajuan Cuti</CardTitle>
                            <CardDescription>
                                Total data: {leaves.total}
                            </CardDescription>
                        </div>
                        <SimplePagination data={leaves} />
                    </CardHeader>
                    <CardContent>
                        {selectedIds.length > 0 && (
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                                <div className="font-medium text-foreground">
                                    <span className="font-semibold text-primary">
                                        {selectedIds.length}
                                    </span>{' '}
                                    pengajuan dipilih
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setBulkApproveOpen(true)}
                                    >
                                        <Check className="size-4" />
                                        Setujui Terpilih ({selectedIds.length})
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            setBulkRejectReason('');
                                            setBulkRejectOpen(true);
                                        }}
                                    >
                                        <X className="size-4" />
                                        Tolak Terpilih ({selectedIds.length})
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedIds([])}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="w-10 px-3 py-2">
                                            <Checkbox
                                                checked={
                                                    allPendingSelected
                                                        ? true
                                                        : selectedIds.length > 0
                                                          ? 'indeterminate'
                                                          : false
                                                }
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Pilih semua yang pending"
                                                disabled={pendingRequests.length === 0}
                                            />
                                        </th>
                                        <th className="px-3 py-2">Karyawan</th>
                                        <th className="px-3 py-2">Periode</th>
                                        <th className="px-3 py-2">Jenis</th>
                                        <th className="px-3 py-2">Alasan</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-6 text-center text-muted-foreground"
                                            >
                                                Belum ada pengajuan cuti.
                                            </td>
                                        </tr>
                                    )}
                                    {leaves.data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b align-top"
                                        >
                                            <td className="w-10 px-3 py-3">
                                                {row.status === 'pending' ? (
                                                    <Checkbox
                                                        checked={selectedIds.includes(row.id)}
                                                        onCheckedChange={() => toggleSelectRow(row.id)}
                                                        aria-label={`Pilih ${row.employee_label}`}
                                                    />
                                                ) : (
                                                    <span className="inline-block size-4" />
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-medium">
                                                    {row.employee_label}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {[
                                                        row.division_name,
                                                        row.position_name,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' • ') || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-medium">
                                                    {row.start_date === row.end_date
                                                        ? formatLongDate(row.start_date)
                                                        : `${formatLongDate(row.start_date)} s/d ${formatLongDate(row.end_date)}`}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.total_days} hari
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                {typeLabels[row.leave_type] ??
                                                    row.leave_type}
                                            </td>
                                            <td className="max-w-[260px] px-3 py-3">
                                                <p className="line-clamp-2 whitespace-normal">
                                                    {row.reason ?? '-'}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant={badgeVariant(
                                                        row.status,
                                                    )}
                                                >
                                                    {row.status === 'pending' &&
                                                    approvalLevels === 2
                                                        ? `Menunggu ${row.approval_stage + 1}/2`
                                                        : (statusLabels[
                                                               row.status
                                                           ] ?? row.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1.5">
                                                    {row.attachment && (
                                                        <ActionIconButton
                                                            label="Lihat Lampiran"
                                                            icon={Paperclip}
                                                            variant="outline"
                                                            onClick={() =>
                                                                setPreviewAttachment({
                                                                    url: row.attachment!,
                                                                    name: row.attachment_name,
                                                                    title: `Lampiran Cuti - ${row.employee_label}`,
                                                                })
                                                            }
                                                        />
                                                    )}
                                                    <ActionIconButton
                                                        label="Detail"
                                                        icon={Eye}
                                                        variant="outline"
                                                        onClick={() =>
                                                            setDetailRow(row)
                                                        }
                                                    />
                                                    {row.status ===
                                                        'pending' && (
                                                        <>
                                                            <ActionIconButton
                                                                label="Setujui"
                                                                icon={Check}
                                                                onClick={() =>
                                                                    confirmApprove(row)
                                                                }
                                                            />
                                                            <ActionIconButton
                                                                label="Tolak"
                                                                icon={X}
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    rejectForm.reset();
                                                                    setRejectRow(
                                                                        row,
                                                                    );
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmationDialog
                open={approveConfirmRow !== null}
                onOpenChange={(open) => !open && setApproveConfirmRow(null)}
                title="Konfirmasi Persetujuan Cuti"
                variant="success"
                confirmLabel="Ya, Setujui"
                description={
                    approveConfirmRow ? (
                        <span>
                            Apakah Anda yakin ingin menyetujui pengajuan cuti (<strong>{typeLabels[approveConfirmRow.leave_type] ?? approveConfirmRow.leave_type}</strong>) untuk{' '}
                            <strong>{approveConfirmRow.employee_label}</strong> pada periode{' '}
                            <strong>
                                {approveConfirmRow.start_date === approveConfirmRow.end_date
                                    ? formatLongDate(approveConfirmRow.start_date)
                                    : `${formatLongDate(approveConfirmRow.start_date)} s/d ${formatLongDate(approveConfirmRow.end_date)}`}
                            </strong>{' '}
                            ({approveConfirmRow.total_days} hari)?
                        </span>
                    ) : undefined
                }
                onConfirm={submitApprove}
            />

            <ConfirmationDialog
                open={bulkApproveOpen}
                onOpenChange={setBulkApproveOpen}
                title="Konfirmasi Bulk Approval Cuti"
                variant="success"
                confirmLabel={`Ya, Setujui (${selectedIds.length})`}
                loading={isBulkProcessing}
                description={
                    <span>
                        Apakah Anda yakin ingin menyetujui secara massal{' '}
                        <strong>{selectedIds.length} pengajuan cuti</strong> yang dipilih?
                    </span>
                }
                onConfirm={submitBulkApprove}
            />

            <Dialog
                open={bulkRejectOpen}
                onOpenChange={(open) => {
                    if (!isBulkProcessing) setBulkRejectOpen(open);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Masal Pengajuan Cuti</DialogTitle>
                        <DialogDescription>
                            Anda akan menolak <strong>{selectedIds.length}</strong> pengajuan cuti yang dipilih. Silakan masukkan alasan penolakan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bulk_leave_rejection_reason">Alasan Penolakan</Label>
                            <Input
                                id="bulk_leave_rejection_reason"
                                placeholder="Contoh: Sisa kuota tidak cukup / Jadwal krusial"
                                value={bulkRejectReason}
                                onChange={(e) => setBulkRejectReason(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setBulkRejectOpen(false)}
                                disabled={isBulkProcessing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={!bulkRejectReason.trim() || isBulkProcessing}
                                onClick={submitBulkReject}
                            >
                                {isBulkProcessing ? 'Memproses...' : `Tolak (${selectedIds.length})`}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={detailRow !== null}
                onOpenChange={(open) => !open && setDetailRow(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detail Pengajuan Cuti</DialogTitle>
                        <DialogDescription>
                            {detailRow?.employee_label}
                        </DialogDescription>
                    </DialogHeader>
                    {detailRow && (
                        <div className="space-y-3 text-sm">
                            <p>
                                <strong>Periode:</strong>{' '}
                                {detailRow.start_date === detailRow.end_date
                                    ? formatLongDate(detailRow.start_date)
                                    : `${formatLongDate(detailRow.start_date)} s/d ${formatLongDate(detailRow.end_date)}`}{' '}
                                ({detailRow.total_days} hari)
                            </p>
                            <p>
                                <strong>Jenis:</strong>{' '}
                                {typeLabels[detailRow.leave_type] ??
                                    detailRow.leave_type}
                            </p>
                            <p className="whitespace-pre-line">
                                <strong>Alasan:</strong>{' '}
                                {detailRow.reason ?? '-'}
                            </p>
                            {detailRow.first_approved_by && (
                                <p>
                                    <strong>Approval tingkat 1:</strong>{' '}
                                    {detailRow.first_approved_by}
                                </p>
                            )}
                            {detailRow.rejection_reason && (
                                <p>
                                    <strong>Alasan penolakan:</strong>{' '}
                                    {detailRow.rejection_reason}
                                </p>
                            )}
                            {detailRow.attachment && (
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">
                                        Lampiran / Dokumen Pendukung:
                                    </p>
                                    <div className="mt-1.5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-xs"
                                            onClick={() =>
                                                setPreviewAttachment({
                                                    url: detailRow.attachment!,
                                                    name: detailRow.attachment_name,
                                                    title: `Lampiran Cuti - ${detailRow.employee_label}`,
                                                })
                                            }
                                        >
                                            <Paperclip className="size-3.5" />
                                            {detailRow.attachment_name || 'Lihat Lampiran'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={rejectRow !== null}
                onOpenChange={(open) => !open && setRejectRow(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Pengajuan Cuti</DialogTitle>
                        <DialogDescription>
                            Masukkan alasan penolakan.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitReject} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rejection_reason">Alasan</Label>
                            <Input
                                id="rejection_reason"
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) =>
                                    rejectForm.setData(
                                        'rejection_reason',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={rejectForm.errors.rejection_reason}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectRow(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={rejectForm.processing}
                            >
                                Tolak
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AttachmentPreviewDialog
                open={previewAttachment !== null}
                onOpenChange={(open) => {
                    if (!open) setPreviewAttachment(null);
                }}
                url={previewAttachment?.url}
                name={previewAttachment?.name}
                title={previewAttachment?.title}
            />
        </AppLayout>
    );
}
