import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownWideNarrow,
    CalendarDays,
    CalendarRange,
    Camera,
    Clock,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Filter,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import {
    browserTimezone,
    formatAttendanceDate,
    formatAttendanceTime,
    timezoneLabel,
    toAttendanceDateTimeInput,
} from '@/lib/attendance-timezone';
import { cn } from '@/lib/utils';
import { index as attendancesIndex } from '@/routes/hris/attendances';
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

type AttendanceRecord = {
    id: number;
    employee_id: number;
    employee_label: string;
    attendance_date: string;
    timezone: string | null;
    shift_name: string;
    status: string;
    is_backup?: boolean;
    backup_for_employee?: { id: number; employee_code: string; full_name: string } | null;
    backup_by_employee?: { id: number; employee_code: string; full_name: string } | null;
    late_minutes: number | null;
    late_duration_label?: string;
    late_level: string | null;
    late_penalty?: number;
    is_half_day?: boolean;
    check_in_at: string | null;
    check_out_at: string | null;
    check_in_photo_url?: string | null;
    check_out_photo_url?: string | null;
    face_similarity_score?: number | null;
    has_photo?: boolean;
    notes: string | null;
};

type AttendanceFormData = {
    employee_id: string;
    attendance_date: string;
    status: string;
    check_in_at: string;
    check_out_at: string;
    timezone: string;
    notes: string;
};

type Filters = {
    date?: string;
    start_date?: string;
    end_date?: string;
    status: string;
    employee_id: string;
    sort_by: 'employee' | 'check_in_at' | 'check_out_at';
    sort_dir: 'asc' | 'desc';
};

type PageProps = {
    attendances: Paginator<AttendanceRecord>;
    employees: EmployeeOption[];
    filters: Filters;
    todaySummary: {
        present: number;
        late: number;
        on_leave: number;
        absent: number;
    };
    statusOptions: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kehadiran',
        href: attendancesIndex(),
    },
];

const statusLabelMap: Record<string, string> = {
    present: 'Hadir',
    late: 'Terlambat',
    on_leave: 'Cuti',
    absent: 'Absen',
};

const lateLevelLabelMap: Record<string, string> = {
    level_1: 'Level 1',
    level_2: 'Level 2',
    level_3: 'Level 3',
    half_day: 'Potong Prorata Harian',
};

const formatLateDuration = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined || minutes <= 0) {
        return '-';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} jam ${mins} menit`;
};

const defaultAttendanceForm: AttendanceFormData = {
    employee_id: '',
    attendance_date: '',
    status: 'present',
    check_in_at: '',
    check_out_at: '',
    timezone: browserTimezone(),
    notes: '',
};

function monthlyAttendanceUrl(employeeId: number, period: string) {
    return `/hris/attendances/employees/${employeeId}/monthly?period=${period}`;
}

export default function AttendancePage() {
    const { attendances, employees, filters, todaySummary, statusOptions } =
        usePage<PageProps>().props;

    const [filterState, setFilterState] = useState<Filters>(filters);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailRecord, setDetailRecord] = useState<AttendanceRecord | null>(
        null,
    );
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
        null,
    );
    const [selectedPhotoRecord, setSelectedPhotoRecord] =
        useState<AttendanceRecord | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<AttendanceRecord | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const attendanceForm = useForm<AttendanceFormData>(defaultAttendanceForm);

    const handleDelete = () => {
        if (!deleteRecord) return;
        setIsDeleting(true);
        router.delete(`/hris/attendances/${deleteRecord.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteRecord(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    useEffect(() => {
        setFilterState(filters);
    }, [filters]);

    useEffect(() => {
        attendanceForm.setData('timezone', browserTimezone());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreateDialog = () => {
        setEditingRecord(null);
        attendanceForm.clearErrors();
        attendanceForm.setData({
            ...defaultAttendanceForm,
            timezone: browserTimezone(),
        });
        setDialogOpen(true);
    };

    const openEditDialog = (record: AttendanceRecord) => {
        setEditingRecord(record);
        attendanceForm.clearErrors();
        attendanceForm.setData({
            employee_id: String(record.employee_id),
            attendance_date: record.attendance_date,
            status: record.status,
            check_in_at: toAttendanceDateTimeInput(
                record.check_in_at,
                record.timezone,
            ),
            check_out_at: toAttendanceDateTimeInput(
                record.check_out_at,
                record.timezone,
            ),
            timezone: record.timezone ?? browserTimezone(),
            notes: record.notes ?? '',
        });
        setDialogOpen(true);
    };

    const submitAttendance = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingRecord) {
            attendanceForm.put(`/hris/attendances/${editingRecord.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    attendanceForm.reset();
                    setEditingRecord(null);
                },
            });

            return;
        }

        attendanceForm.post('/hris/attendances', {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                attendanceForm.reset();
            },
        });
    };

    const applyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(attendancesIndex.url(), filterState, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const toggleSort = (
        sortBy: 'attendance_date' | 'check_in_at' | 'check_out_at',
    ) => {
        const nextDir: Filters['sort_dir'] =
            filterState.sort_by === sortBy && filterState.sort_dir === 'asc'
                ? 'desc'
                : 'asc';

        const nextFilter = {
            ...filterState,
            sort_by: sortBy,
            sort_dir: nextDir,
        };

        setFilterState(nextFilter);
        router.get(attendancesIndex.url(), nextFilter, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const getExportUrl = (format: 'pdf' | 'xls') => {
        const params = new URLSearchParams(
            Object.entries({
                start_date: filterState.start_date ?? filterState.date ?? '',
                end_date: filterState.end_date ?? filterState.date ?? '',
                status: filterState.status,
                employee_id: filterState.employee_id,
                sort_by: filterState.sort_by,
                sort_dir: filterState.sort_dir,
                timezone: browserTimezone(),
                format,
            }).filter(([, value]) => value !== ''),
        );

        return `/hris/attendances/export?${params.toString()}`;
    };

    const dateRangeDisplay = filterState.start_date && filterState.end_date
        ? filterState.start_date === filterState.end_date
            ? filterState.start_date
            : `${filterState.start_date} s/d ${filterState.end_date}`
        : filterState.date ?? '-';

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            headerActions={
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            router.post(
                                '/hris/attendances/sync-missing-checkouts',
                                { date: filterState.start_date ?? filterState.date },
                                { preserveScroll: true },
                            )
                        }
                    >
                        <RotateCcw className="size-4" />
                        Sync Lupa Pulang
                    </Button>
                    <Button size="sm" onClick={openCreateDialog}>
                        <Plus className="size-4" />
                        Input Kehadiran
                    </Button>
                </div>
            }
        >
            <Head title="Kehadiran" />

            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Hadir Hari Ini</CardDescription>
                            <CardTitle className="text-2xl">
                                {todaySummary.present}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Terlambat</CardDescription>
                            <CardTitle className="text-2xl">
                                {todaySummary.late}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Cuti</CardDescription>
                            <CardTitle className="text-2xl">
                                {todaySummary.on_leave}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Absen</CardDescription>
                            <CardTitle className="text-2xl">
                                {todaySummary.absent}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Data Kehadiran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilter}
                            className="grid gap-3 md:grid-cols-[240px_200px_220px_auto]"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="filter_date">Rentang Tanggal</Label>
                                <DateRangePicker
                                    value={{
                                        from: filterState.start_date ?? filterState.date,
                                        to: filterState.end_date ?? filterState.date,
                                    }}
                                    onChange={(range) => {
                                        setFilterState((prev) => ({
                                            ...prev,
                                            start_date: range.from,
                                            end_date: range.to ?? range.from,
                                            date: range.from,
                                        }));
                                    }}
                                    placeholder="Pilih rentang tanggal..."
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
                                                {statusLabelMap[status] ??
                                                    status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    placeholder="Semua karyawan"
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
                            <div className="flex items-end gap-2">
                                <Button type="submit">
                                    <Filter className="size-4" />
                                    Terapkan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const todayStr = new Date()
                                            .toISOString()
                                            .slice(0, 10);
                                        const reset: Filters = {
                                            ...filterState,
                                            date: todayStr,
                                            start_date: todayStr,
                                            end_date: todayStr,
                                            status: '',
                                            employee_id: '',
                                        };
                                        setFilterState(reset);
                                        router.get(
                                            attendancesIndex.url(),
                                            reset,
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            },
                                        );
                                    }}
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
                            <CardTitle>Daftar Kehadiran</CardTitle>
                            <CardDescription>
                                Rentang tanggal aktif: {dateRangeDisplay}
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <SimplePagination data={attendances} />
                            <div className="flex items-center gap-1.5">
                                <Button asChild size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                                    <a
                                        href={getExportUrl('pdf')}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Download Laporan PDF dengan Kop Perusahaan"
                                    >
                                        <FileText className="size-4" />
                                        Export PDF
                                    </a>
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                    <a
                                        href={getExportUrl('xls')}
                                        title="Download Laporan Spreadsheet Excel"
                                    >
                                        <Download className="size-4" />
                                        Export Excel
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3"
                                                onClick={() =>
                                                    toggleSort('attendance_date')
                                                }
                                            >
                                                Tanggal
                                                <ArrowDownWideNarrow className="size-3.5" />
                                            </Button>
                                        </th>
                                        <th className="px-3 py-2">Karyawan</th>
                                        <th className="px-3 py-2">
                                            Nama Shift
                                        </th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3"
                                                onClick={() =>
                                                    toggleSort('check_in_at')
                                                }
                                            >
                                                Check-in
                                                <ArrowDownWideNarrow className="size-3.5" />
                                            </Button>
                                        </th>
                                        <th className="px-3 py-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-3"
                                                onClick={() =>
                                                    toggleSort('check_out_at')
                                                }
                                            >
                                                Check-out
                                                <ArrowDownWideNarrow className="size-3.5" />
                                            </Button>
                                        </th>
                                        <th className="px-3 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-6 text-center text-muted-foreground"
                                            >
                                                Belum ada data kehadiran.
                                            </td>
                                        </tr>
                                    )}
                                    {attendances.data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={cn(
                                                'border-b',
                                                row.status === 'late' &&
                                                    'bg-destructive/10 text-destructive',
                                            )}
                                        >
                                            <td className="px-3 py-3 whitespace-nowrap font-medium text-foreground">
                                                {formatAttendanceDate(
                                                    row.attendance_date,
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.employee_label}
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.shift_name}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant={
                                                        row.status === 'late'
                                                            ? 'destructive'
                                                            : row.status ===
                                                                'present'
                                                              ? 'default'
                                                              : 'secondary'
                                                    }
                                                >
                                                    {statusLabelMap[
                                                        row.status
                                                    ] ?? row.status}
                                                </Badge>
                                                {row.is_backup && row.backup_for_employee ? (
                                                    <span className="inline-block w-fit text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold px-1.5 py-0.5 rounded mt-1">
                                                        Backup: {row.backup_for_employee.full_name}
                                                    </span>
                                                ) : null}
                                                {row.late_level ? (
                                                    <div className="mt-1 text-xs text-destructive flex flex-col gap-0.5">
                                                        <span>
                                                            {lateLevelLabelMap[
                                                                row.late_level
                                                            ] ?? row.late_level}
                                                            {row.late_minutes !==
                                                            null && row.late_minutes > 0
                                                                ? ` - ${formatLateDuration(row.late_minutes)}`
                                                                : ''}
                                                        </span>
                                                        {row.late_penalty && row.late_penalty > 0 ? (
                                                            <span className="text-[11px] font-medium text-destructive/90">
                                                                Denda: Rp {row.late_penalty.toLocaleString('id-ID')}
                                                            </span>
                                                        ) : null}
                                                        {row.is_half_day ? (
                                                            <span className="inline-block w-fit text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold px-1 rounded">
                                                                Potong Prorata Harian
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : row.status === 'late' && row.late_minutes && row.late_minutes > 0 ? (
                                                    <div className="mt-1 text-xs text-destructive flex flex-col gap-0.5">
                                                        <span>{formatLateDuration(row.late_minutes)}</span>
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div>
                                                    {formatAttendanceTime(
                                                        row.check_in_at,
                                                        row.timezone,
                                                    )}
                                                </div>
                                                {row.check_in_photo_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedPhotoRecord(
                                                                row,
                                                            )
                                                        }
                                                        className="mt-1 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                                                        title="Tampilkan foto check-in"
                                                    >
                                                        <Camera className="size-3" />
                                                        Foto Masuk
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div>
                                                    {formatAttendanceTime(
                                                        row.check_out_at,
                                                        row.timezone,
                                                    )}
                                                </div>
                                                {row.check_out_photo_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedPhotoRecord(
                                                                row,
                                                            )
                                                        }
                                                        className="mt-1 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                                                        title="Tampilkan foto check-out"
                                                    >
                                                        <Camera className="size-3" />
                                                        Foto Pulang
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1.5">
                                                    <ActionIconButton
                                                        label="Tampilkan foto kehadiran"
                                                        icon={Camera}
                                                        variant={
                                                            row.has_photo
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        className={
                                                            row.has_photo
                                                                ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                                                                : 'text-muted-foreground'
                                                        }
                                                        onClick={() =>
                                                            setSelectedPhotoRecord(
                                                                row,
                                                            )
                                                        }
                                                    />
                                                    <ActionIconButton
                                                        label="Detail kehadiran"
                                                        icon={Eye}
                                                        variant="outline"
                                                        onClick={() =>
                                                            setDetailRecord(row)
                                                        }
                                                    />
                                                    <ActionIconButton
                                                        label="Edit kehadiran"
                                                        icon={Pencil}
                                                        variant="outline"
                                                        onClick={() =>
                                                            openEditDialog(row)
                                                        }
                                                    />
                                                    <ActionIconButton
                                                        label="Kehadiran bulanan"
                                                        icon={CalendarRange}
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.get(
                                                                monthlyAttendanceUrl(
                                                                    row.employee_id,
                                                                    row.attendance_date.slice(
                                                                        0,
                                                                        7,
                                                                    ),
                                                                ),
                                                            )
                                                        }
                                                    />
                                                    <ActionIconButton
                                                        label="Hapus kehadiran"
                                                        icon={Trash2}
                                                        variant="outline"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                                        onClick={() =>
                                                            setDeleteRecord(row)
                                                        }
                                                    />
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
                open={detailRecord !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailRecord(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Kehadiran</DialogTitle>
                        <DialogDescription>
                            Informasi detail absensi karyawan.
                        </DialogDescription>
                    </DialogHeader>
                    {detailRecord && (
                        <div className="grid gap-2 text-sm">
                            <p>Karyawan: {detailRecord.employee_label}</p>
                            <p>Tanggal: {detailRecord.attendance_date}</p>
                            <p>Nama Shift: {detailRecord.shift_name}</p>
                            <p>
                                Status:{' '}
                                {statusLabelMap[detailRecord.status] ??
                                    detailRecord.status}
                            </p>
                            <p>
                                Keterlambatan:{' '}
                                {detailRecord.late_level
                                    ? `${lateLevelLabelMap[detailRecord.late_level] ?? detailRecord.late_level} (${formatLateDuration(detailRecord.late_minutes)})`
                                    : (detailRecord.late_minutes && detailRecord.late_minutes > 0 ? formatLateDuration(detailRecord.late_minutes) : '-')}
                            </p>
                            {detailRecord.is_backup && detailRecord.backup_for_employee ? (
                                <p>
                                    Backup Untuk:{' '}
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        {detailRecord.backup_for_employee.full_name} ({detailRecord.backup_for_employee.employee_code})
                                    </span>
                                </p>
                            ) : null}
                            {detailRecord.backup_by_employee ? (
                                <p>
                                    Dibackup Oleh:{' '}
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        {detailRecord.backup_by_employee.full_name} ({detailRecord.backup_by_employee.employee_code})
                                    </span>
                                </p>
                            ) : null}
                            <p>
                                Check-in:{' '}
                                {formatAttendanceTime(
                                    detailRecord.check_in_at,
                                    detailRecord.timezone,
                                )}
                            </p>
                            <p>
                                Check-out:{' '}
                                {formatAttendanceTime(
                                    detailRecord.check_out_at,
                                    detailRecord.timezone,
                                )}
                            </p>
                            <p>
                                Zona waktu:{' '}
                                {detailRecord.timezone
                                    ? `${detailRecord.timezone} (${timezoneLabel(detailRecord.timezone)})`
                                    : `Mengikuti perangkat admin (${timezoneLabel(null)})`}
                            </p>
                            <p>Catatan: {detailRecord.notes ?? '-'}</p>

                            {/* Foto Kehadiran Section in Detail */}
                            <div className="mt-2 rounded-lg border bg-muted/30 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                        <Camera className="size-3.5 text-primary" />
                                        Foto Verifikasi Kehadiran
                                    </span>
                                    {(detailRecord.check_in_photo_url ||
                                        detailRecord.check_out_photo_url) && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2 text-xs text-primary"
                                            onClick={() =>
                                                setSelectedPhotoRecord(
                                                    detailRecord,
                                                )
                                            }
                                        >
                                            Perbesar
                                        </Button>
                                    )}
                                </div>
                                {detailRecord.check_in_photo_url ||
                                detailRecord.check_out_photo_url ? (
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="flex flex-col items-center rounded border bg-card p-2 text-center">
                                            <span className="mb-1 text-[11px] font-medium text-muted-foreground">
                                                Foto Masuk
                                            </span>
                                            {detailRecord.check_in_photo_url ? (
                                                <a
                                                    href={
                                                        detailRecord.check_in_photo_url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group relative block aspect-4/3 w-full overflow-hidden rounded border"
                                                >
                                                    <img
                                                        src={
                                                            detailRecord.check_in_photo_url
                                                        }
                                                        alt="Foto Masuk"
                                                        className="size-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </a>
                                            ) : (
                                                <div className="flex aspect-4/3 w-full items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">
                                                    Tidak ada foto
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center rounded border bg-card p-2 text-center">
                                            <span className="mb-1 text-[11px] font-medium text-muted-foreground">
                                                Foto Pulang
                                            </span>
                                            {detailRecord.check_out_photo_url ? (
                                                <a
                                                    href={
                                                        detailRecord.check_out_photo_url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group relative block aspect-4/3 w-full overflow-hidden rounded border"
                                                >
                                                    <img
                                                        src={
                                                            detailRecord.check_out_photo_url
                                                        }
                                                        alt="Foto Pulang"
                                                        className="size-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </a>
                                            ) : (
                                                <div className="flex aspect-4/3 w-full items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">
                                                    Tidak ada foto
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Belum ada foto verifikasi wajah untuk
                                        absensi ini.
                                    </p>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button asChild size="sm" variant="outline">
                                    <Link
                                        href={monthlyAttendanceUrl(
                                            detailRecord.employee_id,
                                            detailRecord.attendance_date.slice(
                                                0,
                                                7,
                                            ),
                                        )}
                                    >
                                        <CalendarRange className="size-4" />
                                        Lihat bulan ini
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal Dedicated Tampilkan Foto Kehadiran */}
            <Dialog
                open={selectedPhotoRecord !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedPhotoRecord(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Camera className="size-5 text-primary" />
                            Foto Kehadiran & Verifikasi Wajah
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPhotoRecord?.employee_label} •{' '}
                            {selectedPhotoRecord &&
                                formatAttendanceDate(
                                    selectedPhotoRecord.attendance_date,
                                )}{' '}
                            (Shift: {selectedPhotoRecord?.shift_name ?? '-'})
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPhotoRecord && (
                        <div className="space-y-4">
                            {selectedPhotoRecord.check_in_photo_url ||
                            selectedPhotoRecord.check_out_photo_url ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Foto Masuk */}
                                    <div className="flex flex-col rounded-lg border bg-card p-3 shadow-xs">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                                                Foto Masuk (Check-In)
                                            </span>
                                            <span className="text-xs font-medium text-foreground">
                                                {formatAttendanceTime(
                                                    selectedPhotoRecord.check_in_at,
                                                    selectedPhotoRecord.timezone,
                                                )}
                                            </span>
                                        </div>

                                        {selectedPhotoRecord.check_in_photo_url ? (
                                            <div className="group relative aspect-4/3 w-full overflow-hidden rounded-md border bg-slate-950/5">
                                                <img
                                                    src={
                                                        selectedPhotoRecord.check_in_photo_url
                                                    }
                                                    alt="Foto Masuk"
                                                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-xs transition duration-200 group-hover:opacity-100">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        asChild
                                                    >
                                                        <a
                                                            href={
                                                                selectedPhotoRecord.check_in_photo_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <ExternalLink className="size-3.5" />
                                                            Buka Foto Penuh
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex aspect-4/3 w-full flex-col items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                                                <Camera className="mb-1 size-8 opacity-40" />
                                                Tidak ada foto check-in
                                            </div>
                                        )}

                                        {selectedPhotoRecord.face_similarity_score !==
                                            null &&
                                            selectedPhotoRecord.face_similarity_score !==
                                                undefined && (
                                                <div className="mt-2.5 flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-xs">
                                                    <span className="text-muted-foreground">
                                                        Kecocokan Wajah:
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-emerald-600 dark:text-emerald-400"
                                                    >
                                                        {(
                                                            selectedPhotoRecord.face_similarity_score *
                                                            100
                                                        ).toFixed(1)}
                                                        %
                                                    </Badge>
                                                </div>
                                            )}
                                    </div>

                                    {/* Foto Pulang */}
                                    <div className="flex flex-col rounded-lg border bg-card p-3 shadow-xs">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                                                Foto Pulang (Check-Out)
                                            </span>
                                            <span className="text-xs font-medium text-foreground">
                                                {formatAttendanceTime(
                                                    selectedPhotoRecord.check_out_at,
                                                    selectedPhotoRecord.timezone,
                                                )}
                                            </span>
                                        </div>

                                        {selectedPhotoRecord.check_out_photo_url ? (
                                            <div className="group relative aspect-4/3 w-full overflow-hidden rounded-md border bg-slate-950/5">
                                                <img
                                                    src={
                                                        selectedPhotoRecord.check_out_photo_url
                                                    }
                                                    alt="Foto Pulang"
                                                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-xs transition duration-200 group-hover:opacity-100">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        asChild
                                                    >
                                                        <a
                                                            href={
                                                                selectedPhotoRecord.check_out_photo_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <ExternalLink className="size-3.5" />
                                                            Buka Foto Penuh
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex aspect-4/3 w-full flex-col items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                                                <Camera className="mb-1 size-8 opacity-40" />
                                                Tidak ada foto check-out
                                            </div>
                                        )}

                                        {selectedPhotoRecord.check_out_at && (
                                            <div className="mt-2.5 flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-xs">
                                                <span className="text-muted-foreground">
                                                    Status Pulang:
                                                </span>
                                                <Badge variant="outline">
                                                    Clock-Out Tercatat
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    <Camera className="mx-auto mb-2 size-10 opacity-30" />
                                    <p className="font-medium text-foreground">
                                        Belum Ada Foto Verifikasi Wajah
                                    </p>
                                    <p className="mt-1 text-xs">
                                        Data kehadiran ini tidak memiliki foto
                                        verifikasi (misalnya diinput manual oleh
                                        admin atau verifikasi wajah dinonaktifkan
                                        saat absensi dilakukan).
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedPhotoRecord(null)}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        attendanceForm.reset();
                        attendanceForm.clearErrors();
                        setEditingRecord(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRecord
                                ? 'Edit Kehadiran'
                                : 'Input Kehadiran'}
                        </DialogTitle>
                        <DialogDescription>
                            Simpan data absensi untuk karyawan pada tanggal
                            tertentu.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="grid gap-3 md:grid-cols-2"
                        onSubmit={submitAttendance}
                    >
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="employee_id">Karyawan</Label>
                            <SearchableSelect
                                id="employee_id"
                                value={
                                    attendanceForm.data.employee_id === ''
                                        ? '__none'
                                        : attendanceForm.data.employee_id
                                }
                                onValueChange={(value) =>
                                    attendanceForm.setData(
                                        'employee_id',
                                        value === '__none' ? '' : value,
                                    )
                                }
                                placeholder="Pilih karyawan"
                                searchPlaceholder="Cari karyawan..."
                                options={[
                                    { value: '__none', label: '-' },
                                    ...employees.map((employee) => ({
                                        value: String(employee.id),
                                        label: employee.label,
                                    })),
                                ]}
                                className="w-full"
                            />
                            <InputError
                                message={attendanceForm.errors.employee_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="attendance_date">Tanggal</Label>
                            <Input
                                id="attendance_date"
                                type="date"
                                value={attendanceForm.data.attendance_date}
                                onChange={(event) =>
                                    attendanceForm.setData(
                                        'attendance_date',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            <InputError
                                message={attendanceForm.errors.attendance_date}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="attendance_status">Status</Label>
                            <Select
                                value={attendanceForm.data.status}
                                onValueChange={(value) =>
                                    attendanceForm.setData('status', value)
                                }
                            >
                                <SelectTrigger
                                    id="attendance_status"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {statusLabelMap[status] ?? status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={attendanceForm.errors.status}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="check_in_at">Check-in</Label>
                            <Input
                                id="check_in_at"
                                type="datetime-local"
                                value={attendanceForm.data.check_in_at}
                                onChange={(event) =>
                                    attendanceForm.setData(
                                        'check_in_at',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={attendanceForm.errors.check_in_at}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="check_out_at">Check-out</Label>
                            <Input
                                id="check_out_at"
                                type="datetime-local"
                                value={attendanceForm.data.check_out_at}
                                onChange={(event) =>
                                    attendanceForm.setData(
                                        'check_out_at',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={attendanceForm.errors.check_out_at}
                            />
                        </div>

                        <input
                            type="hidden"
                            name="timezone"
                            value={attendanceForm.data.timezone}
                        />

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="notes">Catatan</Label>
                            <Input
                                id="notes"
                                value={attendanceForm.data.notes}
                                onChange={(event) =>
                                    attendanceForm.setData(
                                        'notes',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={attendanceForm.errors.notes} />
                        </div>

                        <div className="flex justify-end gap-2 md:col-span-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={attendanceForm.processing}
                            >
                                {editingRecord ? 'Simpan' : 'Tambah'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Konfirmasi Hapus Kehadiran */}
            <Dialog
                open={deleteRecord !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteRecord(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus Kehadiran?</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus data kehadiran untuk karyawan{' '}
                            <strong className="text-foreground">
                                {deleteRecord?.employee_label}
                            </strong>{' '}
                            pada tanggal{' '}
                            <strong className="text-foreground">
                                {deleteRecord?.attendance_date}
                            </strong>
                            ? Data absensi ini akan dihapus.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => setDeleteRecord(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleDelete}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus Kehadiran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
