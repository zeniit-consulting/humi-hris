import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarDays,
    Check,
    Eye,
    Filter,
    RotateCcw,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ActionIconButton from '@/components/action-icon-button';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginator<T> = {
    data: T[];
    links: PaginatorLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type EmployeeOption = {
    id: number;
    label: string;
};

type ShiftPayload = {
    id: number;
    code: string;
    name: string;
    start_time: string | null;
    end_time: string | null;
    is_day_off: boolean;
};

type ShiftChangeRow = {
    id: number;
    employee_id: number;
    employee_label: string;
    division_name: string | null;
    position_name: string | null;
    requested_date: string | null;
    requested_date_label: string;
    current_shift: ShiftPayload | null;
    requested_shift: ShiftPayload | null;
    reason: string | null;
    status: string;
    approved_by: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    created_at: string | null;
};

type Filters = {
    status: string;
    employee_id: string;
    date?: string;
    start_date?: string;
    end_date?: string;
};

type PageProps = {
    requests: Paginator<ShiftChangeRow>;
    employees: EmployeeOption[];
    filters: Filters;
    statusOptions: string[];
    stats: {
        pending: number;
        approved: number;
        rejected: number;
    };
};

type RejectFormData = {
    rejection_reason: string;
};

const pageUrl = '/hris/shift-change-requests';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Approval Jadwal',
        href: pageUrl,
    },
];

const statusLabelMap: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

const formatShift = (shift: ShiftPayload | null) => {
    if (!shift) {
        return 'Belum ada shift';
    }

    if (shift.is_day_off) {
        return `${shift.name} (Libur)`;
    }

    if (!shift.start_time || !shift.end_time) {
        return shift.name;
    }

    return `${shift.name} • ${shift.start_time}-${shift.end_time}`;
};

const formatDateTime = (value: string | null) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

const statusBadgeVariant = (status: string) => {
    if (status === 'approved') {
        return 'default';
    }

    if (status === 'rejected') {
        return 'destructive';
    }

    return 'secondary';
};

export default function ShiftChangeApprovalPage() {
    const { requests, employees, filters, statusOptions, stats } =
        usePage<PageProps>().props;

    const [filterState, setFilterState] = useState<Filters>({
        status: filters.status ?? '',
        employee_id: filters.employee_id ?? '',
        date: filters.date ?? '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });
    const [detailRow, setDetailRow] = useState<ShiftChangeRow | null>(null);
    const [rejectRow, setRejectRow] = useState<ShiftChangeRow | null>(null);
    const rejectForm = useForm<RejectFormData>({
        rejection_reason: '',
    });

    useEffect(() => {
        setFilterState({
            status: filters.status ?? '',
            employee_id: filters.employee_id ?? '',
            date: filters.date ?? '',
            start_date: filters.start_date ?? '',
            end_date: filters.end_date ?? '',
        });
    }, [filters]);

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

    const approveRequest = (row: ShiftChangeRow) => {
        router.post(`${pageUrl}/${row.id}/approve`, undefined, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const openRejectDialog = (row: ShiftChangeRow) => {
        rejectForm.clearErrors();
        rejectForm.setData('rejection_reason', '');
        setRejectRow(row);
    };

    const submitReject = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!rejectRow) {
            return;
        }

        rejectForm.post(`${pageUrl}/${rejectRow.id}/reject`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setRejectRow(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Jadwal" />

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
                        <CardTitle>Approval Perubahan Jadwal</CardTitle>
                        <CardDescription>
                            Setujui request perubahan shift dari portal
                            karyawan. Request yang disetujui akan langsung
                            memperbarui jadwal kerja pada tanggal terkait.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilter}
                            className="grid gap-3 md:grid-cols-[260px_220px_180px_auto]"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="filter_date">Rentang Tanggal</Label>
                                <DateRangePicker
                                    value={{
                                        from: filterState.start_date || filterState.date || undefined,
                                        to: filterState.end_date || filterState.date || undefined,
                                    }}
                                    onChange={(range) => {
                                        setFilterState((prev) => ({
                                            ...prev,
                                            start_date: range.from || '',
                                            end_date: range.to ?? range.from ?? '',
                                            date: range.from || '',
                                        }));
                                    }}
                                    placeholder="Semua tanggal..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filter_employee">
                                    Karyawan
                                </Label>
                                <SearchableSelect
                                    id="filter_employee"
                                    value={
                                        filterState.employee_id === ''
                                            ? '__all'
                                            : filterState.employee_id
                                    }
                                    onValueChange={(value) =>
                                        setFilterState((prev) => ({
                                            ...prev,
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
                                        ...employees.map((employee) => ({
                                            value: String(employee.id),
                                            label: employee.label,
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
                                        setFilterState((prev) => ({
                                            ...prev,
                                            status:
                                                value === '__all' ? '' : value,
                                        }))
                                    }
                                >
                                    <SelectTrigger
                                        id="filter_status"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Semua" />
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
                                                {statusLabelMap[status] ??
                                                     status}
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
                            <CardTitle>Daftar Request</CardTitle>
                            <CardDescription>
                                Total data: {requests.total}
                            </CardDescription>
                        </div>
                        <SimplePagination data={requests} />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1120px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">Karyawan</th>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">
                                            Shift Saat Ini
                                        </th>
                                        <th className="px-3 py-2">
                                            Shift Diminta
                                        </th>
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
                                                Belum ada request perubahan
                                                jadwal.
                                            </td>
                                        </tr>
                                    )}
                                    {requests.data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b align-top"
                                        >
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
                                            <td className="px-3 py-3 font-medium">
                                                {formatLongDate(row.requested_date)}
                                            </td>
                                            <td className="px-3 py-3">
                                                {formatShift(row.current_shift)}
                                            </td>
                                            <td className="px-3 py-3 font-medium">
                                                {formatShift(
                                                    row.requested_shift,
                                                )}
                                            </td>
                                            <td className="max-w-[260px] px-3 py-3">
                                                <p className="line-clamp-2 whitespace-normal">
                                                    {row.reason ?? '-'}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant={statusBadgeVariant(
                                                        row.status,
                                                    )}
                                                >
                                                    {statusLabelMap[
                                                        row.status
                                                    ] ?? row.status}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1.5">
                                                    <ActionIconButton
                                                        label="Detail request"
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
                                                                    approveRequest(
                                                                        row,
                                                                    )
                                                                }
                                                            />
                                                            <ActionIconButton
                                                                label="Tolak"
                                                                icon={X}
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    openRejectDialog(
                                                                        row,
                                                                    )
                                                                }
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

            <Dialog
                open={detailRow !== null}
                onOpenChange={(open) => !open && setDetailRow(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detail Perubahan Jadwal</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap request perubahan shift.
                        </DialogDescription>
                    </DialogHeader>
                    {detailRow ? (
                        <div className="space-y-4 text-sm">
                            <div className="rounded-lg border p-3">
                                <p className="font-semibold">
                                    {detailRow.employee_label}
                                </p>
                                <p className="text-muted-foreground">
                                    {formatLongDate(detailRow.requested_date)}
                                </p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Shift saat ini
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {formatShift(detailRow.current_shift)}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Shift diminta
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {formatShift(detailRow.requested_shift)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Alasan
                                </p>
                                <p className="mt-1 whitespace-pre-line">
                                    {detailRow.reason ?? '-'}
                                </p>
                            </div>
                            {detailRow.status !== 'pending' ? (
                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarCheck className="size-4 text-muted-foreground" />
                                        <p>
                                            Diproses oleh{' '}
                                            {detailRow.approved_by ?? '-'} pada{' '}
                                            {formatDateTime(
                                                detailRow.approved_at,
                                            )}
                                        </p>
                                    </div>
                                    {detailRow.rejection_reason ? (
                                        <p className="mt-2 text-muted-foreground">
                                            Alasan penolakan:{' '}
                                            {detailRow.rejection_reason}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog
                open={rejectRow !== null}
                onOpenChange={(open) => !open && setRejectRow(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Perubahan Jadwal</DialogTitle>
                        <DialogDescription>
                            Berikan alasan agar karyawan memahami keputusan
                            penolakan.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitReject} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rejection_reason">
                                Alasan penolakan
                            </Label>
                            <Input
                                id="rejection_reason"
                                value={rejectForm.data.rejection_reason}
                                onChange={(event) =>
                                    rejectForm.setData(
                                        'rejection_reason',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Jadwal operasional sudah penuh"
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
                                Tolak Request
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
