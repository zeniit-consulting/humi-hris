import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Check, Eye, Filter, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ActionIconButton from '@/components/action-icon-button';
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
import { formatAttendanceTime } from '@/lib/attendance-timezone';
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
type ShiftPayload = {
    id: number;
    code: string;
    name: string;
    start_time: string | null;
    end_time: string | null;
    is_day_off: boolean;
};
type AttendanceRequestRow = {
    id: number;
    employee_label: string;
    division_name: string | null;
    position_name: string | null;
    attendance_date: string;
    timezone: string | null;
    shift: ShiftPayload | null;
    check_in_at: string | null;
    check_out_at: string | null;
    reason: string | null;
    request_type: 'manual_attendance' | 'missing_clock_out';
    status: string;
    rejection_reason: string | null;
};
const requestTypeLabels: Record<AttendanceRequestRow['request_type'], string> =
    {
        manual_attendance: 'Lupa Absen',
        missing_clock_out: 'Lupa Absen Pulang',
    };
type PageProps = {
    requests: Paginator<AttendanceRequestRow>;
    employees: EmployeeOption[];
    filters: Filters;
    statusOptions: string[];
    stats: { pending: number; approved: number; rejected: number };
};

const pageUrl = '/hris/attendance-approvals';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Approval Absensi', href: pageUrl },
];
const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};
const badgeVariant = (status: string) =>
    status === 'approved'
        ? 'default'
        : status === 'rejected'
          ? 'destructive'
          : 'secondary';

const formatShift = (shift: ShiftPayload | null) => {
    if (!shift) return '-';
    if (shift.is_day_off) return `${shift.name} (Libur)`;
    if (!shift.start_time || !shift.end_time) return shift.name;
    return `${shift.name} • ${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}`;
};

export default function AttendanceApprovalPage() {
    const { requests, employees, filters, statusOptions, stats } =
        usePage<PageProps>().props;
    const [filterState, setFilterState] = useState<Filters>({
        status: filters.status ?? '',
        employee_id: filters.employee_id ?? '',
        date: filters.date ?? '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });
    const [detailRow, setDetailRow] = useState<AttendanceRequestRow | null>(
        null,
    );
    const [rejectRow, setRejectRow] = useState<AttendanceRequestRow | null>(
        null,
    );
    const [approveConfirmRow, setApproveConfirmRow] = useState<AttendanceRequestRow | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkApproveOpen, setBulkApproveOpen] = useState(false);
    const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
    const [bulkRejectReason, setBulkRejectReason] = useState('');
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
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

    const pendingRequests = requests.data.filter((r) => r.status === 'pending');
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

    const confirmApprove = (row: AttendanceRequestRow) => {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Absensi" />
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
                        <CardTitle>Filter Approval Absensi</CardTitle>
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
                                        from:
                                            filterState.start_date ||
                                            filterState.date ||
                                            undefined,
                                        to:
                                            filterState.end_date ||
                                            filterState.date ||
                                            undefined,
                                    }}
                                    onChange={(range) => {
                                        setFilterState((p) => ({
                                            ...p,
                                            start_date: range.from || '',
                                            end_date:
                                                range.to ?? range.from ?? '',
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
                            <CardTitle>Daftar Request Absensi</CardTitle>
                            <CardDescription>
                                Total data: {requests.total}
                            </CardDescription>
                        </div>
                        <SimplePagination data={requests} />
                    </CardHeader>
                    <CardContent>
                        {selectedIds.length > 0 && (
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                                <div className="font-medium text-foreground">
                                    <span className="font-semibold text-primary">
                                        {selectedIds.length}
                                    </span>{' '}
                                    request dipilih
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
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Jam</th>
                                        <th className="px-3 py-2">Alasan</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-6 text-center text-muted-foreground"
                                            >
                                                Belum ada request absensi.
                                            </td>
                                        </tr>
                                    )}
                                    {requests.data.map((row) => (
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
                                                    {formatLongDate(
                                                        row.attendance_date,
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatShift(row.shift)}
                                                </div>
                                                <div className="mt-1 text-xs font-medium text-primary">
                                                    {
                                                        requestTypeLabels[
                                                            row.request_type
                                                        ]
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                Masuk{' '}
                                                {formatAttendanceTime(
                                                    row.check_in_at,
                                                    row.timezone,
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    Pulang{' '}
                                                    {formatAttendanceTime(
                                                        row.check_out_at,
                                                        row.timezone,
                                                    )}
                                                </div>
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
                                                    {statusLabels[row.status] ??
                                                        row.status}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1.5">
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
                title="Konfirmasi Persetujuan Absensi"
                variant="success"
                confirmLabel="Ya, Setujui"
                description={
                    approveConfirmRow ? (
                        <span>
                            Apakah Anda yakin ingin menyetujui pengajuan absensi untuk{' '}
                            <strong>{approveConfirmRow.employee_label}</strong> pada tanggal{' '}
                            <strong>{formatLongDate(approveConfirmRow.attendance_date)}</strong>?
                        </span>
                    ) : undefined
                }
                onConfirm={submitApprove}
            />

            <ConfirmationDialog
                open={bulkApproveOpen}
                onOpenChange={setBulkApproveOpen}
                title="Konfirmasi Bulk Approval Absensi"
                variant="success"
                confirmLabel={`Ya, Setujui (${selectedIds.length})`}
                loading={isBulkProcessing}
                description={
                    <span>
                        Apakah Anda yakin ingin menyetujui secara massal{' '}
                        <strong>{selectedIds.length} pengajuan absensi</strong> yang dipilih?
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
                        <DialogTitle>Tolak Masal Request Absensi</DialogTitle>
                        <DialogDescription>
                            Anda akan menolak <strong>{selectedIds.length}</strong> pengajuan yang dipilih. Silakan masukkan alasan penolakan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bulk_rejection_reason">Alasan Penolakan</Label>
                            <Input
                                id="bulk_rejection_reason"
                                placeholder="Contoh: Jadwal tidak sesuai / Tidak memenuhi syarat"
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
                        <DialogTitle>Detail Request Absensi</DialogTitle>
                        <DialogDescription>
                            {detailRow?.employee_label}
                        </DialogDescription>
                    </DialogHeader>
                    {detailRow && (
                        <div className="space-y-3 text-sm">
                            <p>
                                <strong>Tanggal:</strong>{' '}
                                {formatLongDate(detailRow.attendance_date)}
                            </p>
                            <p>
                                <strong>Shift:</strong>{' '}
                                {formatShift(detailRow.shift)}
                            </p>
                            <p>
                                <strong>Kategori:</strong>{' '}
                                {requestTypeLabels[detailRow.request_type]}
                            </p>
                            <p>
                                <strong>Jam:</strong> Masuk{' '}
                                {formatAttendanceTime(
                                    detailRow.check_in_at,
                                    detailRow.timezone,
                                )}{' '}
                                · Pulang{' '}
                                {formatAttendanceTime(
                                    detailRow.check_out_at,
                                    detailRow.timezone,
                                )}
                            </p>
                            <p className="whitespace-pre-line">
                                <strong>Alasan:</strong>{' '}
                                {detailRow.reason ?? '-'}
                            </p>
                            {detailRow.rejection_reason && (
                                <p>
                                    <strong>Alasan penolakan:</strong>{' '}
                                    {detailRow.rejection_reason}
                                </p>
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
                        <DialogTitle>Tolak Request Absensi</DialogTitle>
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
        </AppLayout>
    );
}
