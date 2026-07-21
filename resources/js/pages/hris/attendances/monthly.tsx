import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    Filter,
    RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatAttendanceTime } from '@/lib/attendance-timezone';
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
    id: number;
    attendance_date: string;
    timezone: string | null;
    shift_name: string;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
    notes: string | null;
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-3 py-6 text-center text-muted-foreground"
                                            >
                                                Belum ada data kehadiran pada
                                                periode ini.
                                            </td>
                                        </tr>
                                    )}
                                    {attendances.map((row) => (
                                        <tr key={row.id} className="border-b">
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
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock3 className="size-3.5 text-muted-foreground" />
                                                    {formatAttendanceTime(
                                                        row.check_in_at,
                                                        row.timezone,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                {formatAttendanceTime(
                                                    row.check_out_at,
                                                    row.timezone,
                                                )}
                                            </td>
                                            <td className="max-w-[280px] px-3 py-3">
                                                <span className="line-clamp-2">
                                                    {row.notes ?? '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
