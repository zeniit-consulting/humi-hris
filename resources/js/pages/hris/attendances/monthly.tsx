import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Camera,
    Clock3,
    ExternalLink,
    Filter,
    RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import ActionIconButton from '@/components/action-icon-button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatAttendanceDate, formatAttendanceTime } from '@/lib/attendance-timezone';
import { index as attendancesIndex } from '@/routes/hris/attendances';
import type { BreadcrumbItem } from '@/types';

type Employee = {
    id: number;
    employee_code: string;
    full_name: string;
    label: string;
};

type Period = {
    key: string;
    label: string;
    start_date: string;
    end_date: string;
};

type AttendanceRecord = {
    id: number | null;
    attendance_date: string;
    timezone: string | null;
    shift_name: string;
    status: string;
    is_backup?: boolean;
    backup_for_employee?: { id: number; employee_code: string; full_name: string } | null;
    late_minutes: number | null;
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
    is_missing: boolean;
};

type PageProps = {
    employee: Employee;
    filters: {
        period: string;
    };
    period: Period;
    summary: {
        total: number;
        present: number;
        late: number;
        on_leave: number;
        absent: number;
    };
    attendances: AttendanceRecord[];
};

const statusLabelMap: Record<string, string> = {
    present: 'Hadir',
    late: 'Terlambat',
    on_leave: 'Cuti',
    absent: 'Absen',
};

const formatLateDuration = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined || minutes <= 0) {
        return '-';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} jam ${mins} menit`;
};

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function currentPeriod() {
    return new Date().toISOString().slice(0, 7);
}

function monthlyAttendanceUrl(employeeId: number) {
    return `/hris/attendances/employees/${employeeId}/monthly`;
}

export default function MonthlyAttendancePage() {
    const { employee, filters, period, summary, attendances } =
        usePage<PageProps>().props;
    const [periodFilter, setPeriodFilter] = useState(filters.period);
    const [selectedPhotoRecord, setSelectedPhotoRecord] =
        useState<AttendanceRecord | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Kehadiran',
            href: attendancesIndex(),
        },
        {
            title: employee.full_name,
            href: monthlyAttendanceUrl(employee.id),
        },
    ];

    const applyFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            monthlyAttendanceUrl(employee.id),
            { period: periodFilter },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilter = () => {
        const nextPeriod = currentPeriod();

        setPeriodFilter(nextPeriod);
        router.get(
            monthlyAttendanceUrl(employee.id),
            { period: nextPeriod },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const summaryCards = [
        { label: 'Total Record', value: summary.total },
        { label: 'Hadir', value: summary.present },
        { label: 'Terlambat', value: summary.late },
        { label: 'Cuti', value: summary.on_leave },
        { label: 'Absen', value: summary.absent },
    ];

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            headerActions={
                <Button asChild size="sm" variant="outline">
                    <Link href={attendancesIndex()}>
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Link>
                </Button>
            }
        >
            <Head title={`Kehadiran Bulanan - ${employee.full_name}`} />

            <div className="space-y-4 p-4">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">
                        {employee.employee_code}
                    </p>
                    <h1 className="text-2xl font-semibold tracking-normal">
                        Kehadiran Bulanan {employee.full_name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Periode {period.label} ({period.start_date} sampai{' '}
                        {period.end_date})
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Periode</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilter}
                            className="grid gap-3 md:grid-cols-[220px_auto]"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="period">Bulan</Label>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="period"
                                        type="month"
                                        value={periodFilter}
                                        onChange={(event) =>
                                            setPeriodFilter(event.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
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

                <div className="grid gap-3 md:grid-cols-5">
                    {summaryCards.map((item) => (
                        <Card key={item.label} className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>{item.label}</CardDescription>
                                <CardTitle className="text-2xl">
                                    {item.value}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Kehadiran</CardTitle>
                        <CardDescription>
                            Data absensi karyawan dalam bulan yang dipilih.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Shift</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Check-in</th>
                                        <th className="px-3 py-2">Check-out</th>
                                        <th className="px-3 py-2">Catatan</th>
                                        <th className="px-3 py-2 text-right">Foto / Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-6 text-center text-muted-foreground"
                                            >
                                                Belum ada data kehadiran pada
                                                periode ini.
                                            </td>
                                        </tr>
                                    )}
                                    {attendances.map((row) => (
                                        <tr
                                            key={row.id ?? row.attendance_date}
                                            className={
                                                row.is_missing
                                                    ? 'border-b bg-red-50/70 dark:bg-red-950/20'
                                                    : 'border-b'
                                            }
                                        >
                                            <td className="px-3 py-3">
                                                {formatDate(
                                                    row.attendance_date,
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.shift_name}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant={
                                                        row.status === 'late' ||
                                                        row.status === 'absent'
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
                                                            {row.late_level === 'half_day' ? 'Potong Prorata Harian' : row.late_level}
                                                            {row.late_minutes !== null && row.late_minutes > 0 ? ` (${formatLateDuration(row.late_minutes)})` : ''}
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
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock3 className="size-3.5 text-muted-foreground" />
                                                        {formatAttendanceTime(
                                                            row.check_in_at,
                                                            row.timezone,
                                                        )}
                                                    </span>
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
                                            <td className="max-w-[240px] px-3 py-3">
                                                <span className="line-clamp-2">
                                                    {row.notes ??
                                                        (row.is_missing
                                                            ? 'Tidak ada data kehadiran'
                                                            : '-')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dedicated Tampilkan Foto Kehadiran Bulanan */}
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
                            {employee.label} •{' '}
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
        </AppLayout>
    );
}
