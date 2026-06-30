import { Head, router, usePage } from '@inertiajs/react';
import { CalendarDays, Download, Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    exportMethod as exportReport,
    index as reportsIndex,
} from '@/routes/hris/reports';
import type { BreadcrumbItem } from '@/types';

type Period = {
    key: string;
    month: number;
    year: number;
    label: string;
    start_date: string;
    end_date: string;
};

type Summary = {
    active_employees: number;
    attendance: {
        present: number;
        late: number;
        on_leave: number;
        absent: number;
    };
    leave: {
        approved_days: number;
    };
    overtime: {
        approved_hours: number;
    };
    payroll: {
        runs_count: number;
        employees_count: number;
        base_salary: string;
        allowances: string;
        deductions: string;
        net_salary: string;
    };
};

type EmployeeReportRow = {
    id: number;
    employee_code: string;
    employee_name: string;
    is_active: boolean;
    present_count: number;
    late_count: number;
    on_leave_count: number;
    absent_count: number;
    leave_days: number;
    overtime_hours: number;
    net_salary: string;
};

type AttendanceDetailRow = {
    employee_id: number;
    employee_code: string;
    employee_name: string;
    recorded_days: number;
    present_count: number;
    late_count: number;
    on_leave_count: number;
    absent_count: number;
};

type PayrollDetailRow = {
    employee_id: number;
    employee_code: string;
    employee_name: string;
    base_salary: string;
    allowances_total: string;
    overtime_hours: number;
    overtime_pay: string;
    deductions_total: string;
    net_salary: string;
};

type LeaveDetailRow = {
    employee_id: number;
    employee_code: string;
    employee_name: string;
    approved_days: number;
    pending_days: number;
    rejected_days: number;
    remaining_balance: number;
};

type OvertimeDetailRow = {
    employee_id: number;
    employee_code: string;
    employee_name: string;
    approved_requests: number;
    pending_requests: number;
    rejected_requests: number;
    approved_hours: number;
    pending_hours: number;
};

type EmployeeMovementDetails = {
    summary: {
        joiners: number;
        offboarded: number;
        active_headcount: number;
    };
    joiners: Array<{
        employee_id: number;
        employee_code: string;
        employee_name: string;
        hire_date: string | null;
        employment_status: string;
    }>;
    offboarded: Array<{
        employee_id: number;
        employee_code: string;
        employee_name: string;
        offboarded_at: string | null;
        employment_status: string;
    }>;
};

type DocumentExpiryRow = {
    id: number;
    employee_id: number;
    employee_code: string;
    employee_name: string;
    document_type: string;
    document_number: string | null;
    expires_at: string | null;
    status: string;
};

type AssetAssignmentRow = {
    id: number;
    asset_code: string;
    asset_name: string;
    asset_category: string;
    employee_id: number;
    employee_code: string;
    employee_name: string;
    issued_at: string | null;
    returned_at: string | null;
    condition_out: string;
    condition_in: string | null;
    assignment_status: string;
};

type PerformanceDetails = {
    summary: {
        reviews: number;
        completed_reviews: number;
        average_final_score: number;
        at_risk: number;
    };
    rows: Array<{
        id: number;
        employee_id: number;
        employee_code: string;
        employee_name: string;
        period_name: string;
        status: string;
        okr_score: number;
        kpi_score: number;
        manager_score: number | null;
        final_score: number;
        grade: string;
        reviewed_at: string | null;
    }>;
};

type RecruitmentDetails = {
    summary: {
        active_vacancies: number;
        applications: number;
        hired: number;
        rejected: number;
    };
    stages: Record<string, number>;
    vacancies: Array<{
        id: number;
        title: string;
        status: string;
        openings: number;
        published_at: string | null;
        closing_date: string | null;
        applications_count: number;
        hired_count: number;
        rejected_count: number;
    }>;
};

type Analytics = {
    cards: Array<{
        key: string;
        label: string;
        value: number | string;
        suffix?: string;
        format?: 'currency';
    }>;
};

type PageProps = {
    period: Period;
    filters: {
        month: number;
        year: number;
    };
    summary: Summary;
    employees: EmployeeReportRow[];
    attendanceDetails: AttendanceDetailRow[];
    payrollDetails: PayrollDetailRow[];
    leaveDetails: LeaveDetailRow[];
    overtimeDetails: OvertimeDetailRow[];
    employeeMovementDetails: EmployeeMovementDetails;
    documentExpiryDetails: DocumentExpiryRow[];
    assetAssignmentDetails: AssetAssignmentRow[];
    performanceDetails: PerformanceDetails;
    recruitmentDetails: RecruitmentDetails;
    analytics: Analytics;
};

const monthOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laporan',
        href: reportsIndex(),
    },
];

const formatNumber = (value: number | string) =>
    new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const formatCurrency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

export default function ReportPage() {
    const {
        period,
        filters,
        summary,
        employees,
        attendanceDetails,
        payrollDetails,
        leaveDetails,
        overtimeDetails,
        employeeMovementDetails,
        documentExpiryDetails,
        assetAssignmentDetails,
        performanceDetails,
        recruitmentDetails,
        analytics,
    } = usePage<PageProps>().props;
    const [month, setMonth] = useState(String(filters.month));
    const [year, setYear] = useState(String(filters.year));

    const applyFilter = () => {
        router.get(
            reportsIndex.url(),
            {
                month,
                year,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const resetFilter = () => {
        router.get(reportsIndex.url());
    };

    const exportUrl = exportReport.url({
        query: {
            month,
            year,
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan HRIS" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Laporan HRIS Bulanan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Periode {period.label}
                        </p>
                    </div>
                    <Button asChild>
                        <a href={exportUrl}>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarDays className="h-4 w-4" />
                            Periode Laporan
                        </CardTitle>
                        <CardDescription>
                            Pilih bulan dan tahun laporan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-[220px_160px_auto] md:items-end">
                            <div className="space-y-2">
                                <Label>Bulan</Label>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={String(option.value)}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tahun</Label>
                                <Input
                                    inputMode="numeric"
                                    min={2000}
                                    max={new Date().getFullYear() + 1}
                                    type="number"
                                    value={year}
                                    onChange={(event) =>
                                        setYear(event.target.value)
                                    }
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" onClick={applyFilter}>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Terapkan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilter}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <MetricCard
                        label="Karyawan Aktif"
                        value={summary.active_employees}
                    />
                    <MetricCard
                        label="Hadir"
                        value={summary.attendance.present}
                    />
                    <MetricCard
                        label="Terlambat"
                        value={summary.attendance.late}
                    />
                    <MetricCard
                        label="Hari Cuti"
                        value={formatNumber(summary.leave.approved_days)}
                    />
                    <MetricCard
                        label="Jam Lembur"
                        value={formatNumber(summary.overtime.approved_hours)}
                    />
                    <MetricCard
                        label="Net Payroll"
                        value={formatCurrency(summary.payroll.net_salary)}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard Analitik</CardTitle>
                        <CardDescription>
                            Ringkasan indikator lintas modul untuk periode
                            laporan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                            {analytics.cards.map((card) => (
                                <MetricCard
                                    key={card.key}
                                    label={card.label}
                                    value={
                                        card.format === 'currency'
                                            ? formatCurrency(card.value)
                                            : `${formatNumber(card.value)}${card.suffix ? ` ${card.suffix}` : ''}`
                                    }
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Absensi Bulanan Detail</CardTitle>
                        <CardDescription>
                            Rekap hari tercatat, hadir, terlambat, cuti, dan
                            absen per karyawan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead className="text-right">
                                            Hari Tercatat
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Hadir
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Terlambat
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Cuti
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Absen
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceDetails.map((row) => (
                                        <TableRow key={row.employee_id}>
                                            <TableCell>
                                                <EmployeeCell row={row} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.recorded_days}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.present_count}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.late_count}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.on_leave_count}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.absent_count}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payroll Bulanan</CardTitle>
                        <CardDescription>
                            Komponen payroll per karyawan pada periode aktif.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead className="text-right">
                                            Gaji Pokok
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Tunjangan
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Jam Lembur
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Upah Lembur
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Potongan
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Take Home Pay
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payrollDetails.length === 0 ? (
                                        <EmptyRow colSpan={7} />
                                    ) : (
                                        payrollDetails.map((row) => (
                                            <TableRow key={row.employee_id}>
                                                <TableCell>
                                                    <EmployeeCell row={row} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        row.base_salary,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        row.allowances_total,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatNumber(
                                                        row.overtime_hours,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        row.overtime_pay,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        row.deductions_total,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(
                                                        row.net_salary,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cuti & Sisa Cuti</CardTitle>
                        <CardDescription>
                            Hari cuti per status dan saldo cuti tersisa per
                            karyawan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead className="text-right">
                                            Disetujui
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Pending
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Ditolak
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Sisa Cuti
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveDetails.map((row) => (
                                        <TableRow key={row.employee_id}>
                                            <TableCell>
                                                <EmployeeCell row={row} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    row.approved_days,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    row.pending_days,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    row.rejected_days,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    row.remaining_balance,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lembur</CardTitle>
                        <CardDescription>
                            Jumlah pengajuan dan jam lembur per status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead className="text-right">
                                            Approved
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Pending
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Rejected
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Jam Approved
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Jam Pending
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overtimeDetails.map((row) => (
                                        <TableRow key={row.employee_id}>
                                            <TableCell>
                                                <EmployeeCell row={row} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.approved_requests}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.pending_requests}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.rejected_requests}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    row.approved_hours,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumber(
                                                    row.pending_hours,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mutasi Karyawan</CardTitle>
                        <CardDescription>
                            Karyawan masuk, keluar, dan headcount aktif pada
                            periode laporan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-3">
                            <MetricCard
                                label="Karyawan Masuk"
                                value={employeeMovementDetails.summary.joiners}
                            />
                            <MetricCard
                                label="Karyawan Keluar"
                                value={
                                    employeeMovementDetails.summary.offboarded
                                }
                            />
                            <MetricCard
                                label="Headcount Aktif"
                                value={
                                    employeeMovementDetails.summary
                                        .active_headcount
                                }
                            />
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <MovementTable
                                title="Karyawan Masuk"
                                rows={employeeMovementDetails.joiners}
                                dateKey="hire_date"
                                emptyText="Tidak ada karyawan masuk."
                            />
                            <MovementTable
                                title="Karyawan Keluar"
                                rows={employeeMovementDetails.offboarded}
                                dateKey="offboarded_at"
                                emptyText="Tidak ada karyawan keluar."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kontrak & Dokumen Expired</CardTitle>
                        <CardDescription>
                            Dokumen yang sudah expired atau akan expired dalam
                            30 hari setelah periode laporan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead>Dokumen</TableHead>
                                        <TableHead>Nomor</TableHead>
                                        <TableHead>Expired</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documentExpiryDetails.length === 0 ? (
                                        <EmptyRow colSpan={5} />
                                    ) : (
                                        documentExpiryDetails.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <EmployeeCell row={row} />
                                                </TableCell>
                                                <TableCell>
                                                    {row.document_type}
                                                </TableCell>
                                                <TableCell>
                                                    {row.document_number ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.expires_at ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.status}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Asset Karyawan</CardTitle>
                        <CardDescription>
                            Asset yang masih dipinjam atau dikembalikan pada
                            periode laporan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset</TableHead>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Issued</TableHead>
                                        <TableHead>Returned</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assetAssignmentDetails.length === 0 ? (
                                        <EmptyRow colSpan={6} />
                                    ) : (
                                        assetAssignmentDetails.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {row.asset_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.asset_code}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <EmployeeCell row={row} />
                                                </TableCell>
                                                <TableCell>
                                                    {row.asset_category}
                                                </TableCell>
                                                <TableCell>
                                                    {row.issued_at ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.returned_at ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.assignment_status}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance/KPI</CardTitle>
                        <CardDescription>
                            Review KPI dan OKR yang periodenya berjalan pada
                            bulan laporan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-4">
                            <MetricCard
                                label="Total Review"
                                value={performanceDetails.summary.reviews}
                            />
                            <MetricCard
                                label="Review Selesai"
                                value={
                                    performanceDetails.summary.completed_reviews
                                }
                            />
                            <MetricCard
                                label="Rata-rata Final"
                                value={formatNumber(
                                    performanceDetails.summary
                                        .average_final_score,
                                )}
                            />
                            <MetricCard
                                label="At Risk"
                                value={performanceDetails.summary.at_risk}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            OKR
                                        </TableHead>
                                        <TableHead className="text-right">
                                            KPI
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Final
                                        </TableHead>
                                        <TableHead>Grade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {performanceDetails.rows.length === 0 ? (
                                        <EmptyRow colSpan={7} />
                                    ) : (
                                        performanceDetails.rows.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <EmployeeCell row={row} />
                                                </TableCell>
                                                <TableCell>
                                                    {row.period_name}
                                                </TableCell>
                                                <TableCell>
                                                    {row.status}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatNumber(
                                                        row.okr_score,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatNumber(
                                                        row.kpi_score,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatNumber(
                                                        row.final_score,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {row.grade}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recruitment</CardTitle>
                        <CardDescription>
                            Lowongan aktif dan pipeline kandidat pada periode
                            laporan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-4">
                            <MetricCard
                                label="Lowongan Aktif"
                                value={
                                    recruitmentDetails.summary.active_vacancies
                                }
                            />
                            <MetricCard
                                label="Lamaran Masuk"
                                value={recruitmentDetails.summary.applications}
                            />
                            <MetricCard
                                label="Diterima"
                                value={recruitmentDetails.summary.hired}
                            />
                            <MetricCard
                                label="Ditolak"
                                value={recruitmentDetails.summary.rejected}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Lowongan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Kebutuhan
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Lamaran
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Diterima
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Ditolak
                                        </TableHead>
                                        <TableHead>Closing</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recruitmentDetails.vacancies.length ===
                                    0 ? (
                                        <EmptyRow colSpan={7} />
                                    ) : (
                                        recruitmentDetails.vacancies.map(
                                            (row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {row.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Published{' '}
                                                            {row.published_at ??
                                                                '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.status}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {row.openings}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {
                                                            row.applications_count
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {row.hired_count}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {row.rejected_count}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.closing_date ??
                                                            '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rincian Karyawan</CardTitle>
                        <CardDescription>
                            Rekap absensi, cuti, lembur, dan payroll net per
                            karyawan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Karyawan</TableHead>
                                        <TableHead className="text-right">
                                            Hadir
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Terlambat
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Cuti
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Absen
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Hari Cuti
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Jam Lembur
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Net Payroll
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                Belum ada data karyawan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        employees.map((employee) => (
                                            <TableRow key={employee.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {employee.employee_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {employee.employee_code}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {employee.present_count}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {employee.late_count}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {employee.on_leave_count}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {employee.absent_count}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatNumber(
                                                        employee.leave_days,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatNumber(
                                                        employee.overtime_hours,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        employee.net_salary,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function EmployeeCell({
    row,
}: {
    row: { employee_code: string; employee_name: string };
}) {
    return (
        <>
            <div className="font-medium">{row.employee_name}</div>
            <div className="text-xs text-muted-foreground">
                {row.employee_code}
            </div>
        </>
    );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
    return (
        <TableRow>
            <TableCell
                colSpan={colSpan}
                className="py-8 text-center text-muted-foreground"
            >
                Belum ada data pada periode ini.
            </TableCell>
        </TableRow>
    );
}

function MovementTable({
    title,
    rows,
    dateKey,
    emptyText,
}: {
    title: string;
    rows: Array<{
        employee_id: number;
        employee_code: string;
        employee_name: string;
        employment_status: string;
        hire_date?: string | null;
        offboarded_at?: string | null;
    }>;
    dateKey: 'hire_date' | 'offboarded_at';
    emptyText: string;
}) {
    return (
        <div className="overflow-x-auto">
            <div className="mb-2 text-sm font-medium">{title}</div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={3}
                                className="py-8 text-center text-muted-foreground"
                            >
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => (
                            <TableRow key={row.employee_id}>
                                <TableCell>
                                    <EmployeeCell row={row} />
                                </TableCell>
                                <TableCell>{row[dateKey] ?? '-'}</TableCell>
                                <TableCell>{row.employment_status}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
    return (
        <Card>
            <CardHeader className="px-4 pb-1 pt-3">
                <CardDescription className="truncate text-xs">
                    {label}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
                <div className="text-lg font-semibold tracking-normal">
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}
