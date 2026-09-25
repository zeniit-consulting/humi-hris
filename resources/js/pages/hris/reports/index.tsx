import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarClock,
    CalendarDays,
    Clock,
    Download,
    Filter,
    RotateCcw,
    ShieldCheck,
    SlidersHorizontal,
    Timer,
} from 'lucide-react';
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
        pending_days?: number;
        rejected_days?: number;
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
        format?: 'currency' | 'integer' | 'percent';
    }>;
};

type SopSummary = {
    company_name: string;
    working_days: number;
    cutoff: {
        day: string;
        label: string;
        description: string;
    };
    attendance: {
        late_tolerance_minutes: number;
        late_penalty_enabled: boolean;
        late_penalty_type: string;
        late_penalty_tiers: Array<{
            from_minute: number;
            to_minute: number | null | '';
            penalty_amount: number;
            description?: string;
        }>;
        late_base_penalty_minutes: number;
        late_base_penalty_amount: number;
        late_incremental_penalty_amount: number;
        late_half_day_enabled: boolean;
        late_half_day_cutoff_minutes: number;
        late_half_day_penalty_type: string;
        late_half_day_penalty_amount: number;
        late_half_day_deduct_leave: boolean;
        unrecorded_cutoff_penalty_enabled: boolean;
        missing_clock_out_request_days: number;
        require_face_recognition: boolean;
    };
    overtime: {
        calculation_mode: string;
        rate_type: string;
        fixed_rate: number | null;
        hour_divisor: number;
        multiplier_h1: number;
        multiplier_subsequent: number;
        auto_overtime_from_attendance: boolean;
        auto_overtime_min_minutes: number;
    };
    bpjs_insurance: {
        bpjs_kesehatan_enabled: boolean;
        bpjs_kesehatan_default_class: string;
        bpjs_ketenagakerjaan_enabled: boolean;
        jkk_enabled: boolean;
        jkm_enabled: boolean;
        jht_enabled: boolean;
        jp_enabled: boolean;
        private_insurance_enabled: boolean;
        private_insurance_name: string;
        private_insurance_nominal: number;
    };
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
    sopSummary?: SopSummary;
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

const formatAnalyticsValue = (card: Analytics['cards'][number]) => {
    if (card.format === 'currency') {
        return formatCurrency(card.value);
    }

    if (card.format === 'integer') {
        return `${new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 0,
        }).format(
            Number(card.value ?? 0),
        )}${card.suffix ? ` ${card.suffix}` : ''}`;
    }

    if (card.format === 'percent') {
        return `${new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 1,
        }).format(Number(card.value ?? 0))}%`;
    }

    return `${formatNumber(card.value)}${card.suffix ? ` ${card.suffix}` : ''}`;
};

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
        sopSummary,
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
                        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                            {analytics.cards.map((card, index) => (
                                <AnalyticsMetricCard
                                    key={card.key}
                                    label={card.label}
                                    value={formatAnalyticsValue(card)}
                                    tone={index}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {sopSummary && (
                    <Card className="border-indigo-100/90 bg-linear-to-b from-indigo-50/30 via-background to-background dark:border-indigo-950/40">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-base text-indigo-950 dark:text-indigo-200">
                                        <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        Ringkasan SOP & Kebijakan HR Periode {period.label}
                                    </CardTitle>
                                    <CardDescription>
                                        Parameter standar operasional presensi, batas toleransi, denda, cut-off, upah lembur, dan jaminan sosial yang berlaku.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300">
                                        <Link href="/settings/payroll">
                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                            Kelola Kebijakan
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                                {/* 1. Kebijakan Kerja & Cut-off */}
                                <div className="rounded-xl border border-slate-200/80 bg-card p-4 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-1.5 border-b">
                                        <CalendarClock className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-semibold text-xs uppercase tracking-wider">Kerja & Cut-off</h4>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Hari Kerja Standar:</span>
                                            <span className="font-medium text-right font-mono">{sopSummary.working_days} hari/bln</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Siklus Cut-off:</span>
                                            <span className="font-medium text-right text-blue-600 dark:text-blue-400">
                                                {sopSummary.cutoff.day === 'end_of_month' ? 'Akhir Bulan' : `Tanggal ${sopSummary.cutoff.day}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Batas Lupa Pulang:</span>
                                            <span className="font-medium text-right">Maks. H+{sopSummary.attendance.missing_clock_out_request_days} hari</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Verifikasi Presensi:</span>
                                            <span className="font-medium text-right">
                                                {sopSummary.attendance.require_face_recognition ? 'Face Recognition' : 'GPS / Geofence'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Presensi & Sanksi Keterlambatan */}
                                <div className="rounded-xl border border-slate-200/80 bg-card p-4 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-1.5 border-b">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                        <h4 className="font-semibold text-xs uppercase tracking-wider">Presensi & Denda</h4>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Toleransi Masuk:</span>
                                            <span className="font-medium text-right font-mono">{sopSummary.attendance.late_tolerance_minutes} menit</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Skema Denda:</span>
                                            <span className="font-medium text-right">
                                                {sopSummary.attendance.late_penalty_enabled
                                                    ? (sopSummary.attendance.late_penalty_type === 'tiered' ? 'Bertahap (Tiered)' : 'Progresif per Menit')
                                                    : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Terlambat Maksimal:</span>
                                            <span className="font-medium text-right text-amber-600 dark:text-amber-400">
                                                {sopSummary.attendance.late_half_day_enabled
                                                    ? `50% Prorate (≥${sopSummary.attendance.late_half_day_cutoff_minutes} m)`
                                                    : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Tanpa Absen Cutoff:</span>
                                            <span className="font-medium text-right">
                                                {sopSummary.attendance.unrecorded_cutoff_penalty_enabled ? 'Potong Prorata' : 'Tidak dipotong'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Kebijakan Lembur */}
                                <div className="rounded-xl border border-slate-200/80 bg-card p-4 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-1.5 border-b">
                                        <Timer className="h-4 w-4 text-indigo-600" />
                                        <h4 className="font-semibold text-xs uppercase tracking-wider">Lembur (Overtime)</h4>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Metode Upah:</span>
                                            <span className="font-medium text-right">
                                                {sopSummary.overtime.rate_type === 'formula' ? `Depnaker (1/${sopSummary.overtime.hour_divisor})` : 'Nominal Flat'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Multiplier Jam:</span>
                                            <span className="font-medium text-right font-mono">1.5x / 2.0x</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Auto-Lembur:</span>
                                            <span className="font-medium text-right">
                                                {sopSummary.overtime.auto_overtime_from_attendance
                                                    ? `Aktif (>${sopSummary.overtime.auto_overtime_min_minutes} mnt)`
                                                    : 'Manual / Form'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Mode Ambang:</span>
                                            <span className="font-medium text-right capitalize">
                                                {sopSummary.overtime.calculation_mode === 'threshold_daily' ? 'Ambang Jam' : 'Jam Riil'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. BPJS & Jaminan Sosial */}
                                <div className="rounded-xl border border-slate-200/80 bg-card p-4 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 pb-1.5 border-b">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <h4 className="font-semibold text-xs uppercase tracking-wider">BPJS & Asuransi</h4>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">BPJS Kesehatan:</span>
                                            <span className="font-medium text-right">
                                                {sopSummary.bpjs_insurance.bpjs_kesehatan_enabled ? `Kelas ${sopSummary.bpjs_insurance.bpjs_kesehatan_default_class}` : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">BPJS TK Program:</span>
                                            <span className="font-medium text-right text-emerald-600 dark:text-emerald-400">
                                                {sopSummary.bpjs_insurance.bpjs_ketenagakerjaan_enabled
                                                    ? [
                                                          sopSummary.bpjs_insurance.jkk_enabled && 'JKK',
                                                          sopSummary.bpjs_insurance.jkm_enabled && 'JKM',
                                                          sopSummary.bpjs_insurance.jht_enabled && 'JHT',
                                                          sopSummary.bpjs_insurance.jp_enabled && 'JP',
                                                      ].filter(Boolean).join(', ')
                                                    : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Asuransi Swasta:</span>
                                            <span className="font-medium text-right truncate max-w-[120px]" title={sopSummary.bpjs_insurance.private_insurance_name}>
                                                {sopSummary.bpjs_insurance.private_insurance_enabled
                                                    ? (sopSummary.bpjs_insurance.private_insurance_name || 'Aktif')
                                                    : 'Tidak Ada'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-muted-foreground">Iuran Default:</span>
                                            <span className="font-medium text-right font-mono">
                                                {sopSummary.bpjs_insurance.private_insurance_enabled
                                                    ? formatCurrency(sopSummary.bpjs_insurance.private_insurance_nominal)
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                                {formatNumber(row.pending_days)}
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
                                                        {row.applications_count}
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

function MetricCard({
    label,
    value,
}: {
    label: string;
    value: number | string;
}) {
    return (
        <Card>
            <CardHeader className="px-4 pt-3 pb-1">
                <CardDescription className="truncate text-xs">
                    {label}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-3">
                <div className="text-lg font-semibold tracking-normal">
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}

function AnalyticsMetricCard({
    label,
    value,
    tone,
}: {
    label: string;
    value: number | string;
    tone: number;
}) {
    const tones = [
        'border-sky-200 bg-sky-50/70 text-sky-950',
        'border-emerald-200 bg-emerald-50/70 text-emerald-950',
        'border-amber-200 bg-amber-50/70 text-amber-950',
        'border-rose-200 bg-rose-50/70 text-rose-950',
        'border-indigo-200 bg-indigo-50/70 text-indigo-950',
        'border-teal-200 bg-teal-50/70 text-teal-950',
    ];
    const dotTones = [
        'bg-sky-500',
        'bg-emerald-500',
        'bg-amber-500',
        'bg-rose-500',
        'bg-indigo-500',
        'bg-teal-500',
    ];

    return (
        <div
            className={`rounded-lg border px-3 py-2 shadow-sm ${tones[tone % tones.length]}`}
        >
            <div className="flex items-center gap-1.5">
                <span
                    className={`size-1.5 shrink-0 rounded-full ${dotTones[tone % dotTones.length]}`}
                />
                <p className="min-w-0 truncate text-[11px] font-medium opacity-75">
                    {label}
                </p>
            </div>
            <p className="mt-1 text-lg leading-tight font-semibold tracking-normal">
                {value}
            </p>
        </div>
    );
}
