import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CalendarDays,
    ChevronDown,
    Filter,
    ReceiptText,
    UsersRound,
    WalletCards,
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
    EmployeeMobilityCard,
    InsuranceBurnrateCard,
    PayrollBurnrateCard,
    ReimburseRateCard,
    type EmployeeMobilitySummary,
    type InsuranceBurnrateSummary,
    type PayrollBurnrateSummary,
    type ReimburseRateSummary,
} from '@/components/dashboard-analytics-charts';
import {
    type ExecutiveInsightsData,
} from '@/components/dashboard-executive-qa';
import {
    GenderByDivisionCard,
    PayrollByDivisionCard,
    ReimburseByCategoryCard,
    ReimburseByDivisionCard,
    ResignReasonsCard,
    type PieChartsData,
} from '@/components/dashboard-pie-charts';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type AttendancePoint = {
    date: string;
    label: string;
    present: number;
    late: number;
    on_leave: number;
    absent: number;
    attendance_rate: number;
};

type DashboardStats = {
    total_employees: number;
    active_employees: number;
    total_divisions: number;
    total_positions: number;
    present_today: number;
    late_today: number;
    on_leave_today: number;
    absent_today: number;
    open_positions: number;
    monthly_payroll_burn: number | string;
    attrition_ytd: number;
    resigned_ytd: number;
    today_attendance_rate: number;
    gender: Record<string, number>;
};

type ActionQueueItem = {
    key: string;
    label: string;
    count: number;
    severity: 'high' | 'medium';
    href: string;
};

type ActionQueue = {
    total: number;
    items: ActionQueueItem[];
};

type AttendanceFocusItem = {
    id: number;
    label: string;
    time?: string;
    href: string;
};

type AttendanceFocus = {
    missing_clock_ins_count: number;
    late_today_count: number;
    missingClockIns: AttendanceFocusItem[];
    lateToday: AttendanceFocusItem[];
    items: Array<{
        id: string;
        label: string;
        description: string;
        href: string;
    }>;
};

type RecentRequest = {
    id: string;
    type: string;
    employee_label: string;
    date_label: string;
    status: string;
    href: string;
    created_at: string | null;
};

type RecentRequests = {
    items: RecentRequest[];
};

type ContractReminders = {
    total: number;
    items: Array<{
        id: number;
        type: 'Kontrak' | 'Probation';
        employee_label: string;
        date_label: string;
        days_remaining: number;
        href: string;
    }>;
};

type DashboardFilters = {
    period?: string;
    period_type?: 'month' | 'quarter' | 'semester';
    period_label?: string;
    range: 'today' | 'this_week' | 'this_month';
    outsourcing_period: string;
    outsourcing_sub_company_id: string;
};

type OutsourcingOption = {
    id: number;
    label: string;
};

type OutsourcingStats = {
    active_clients: number;
    outsourced_employees: number;
    internal_employees: number;
    present_today: number;
    absent_today: number;
    attendance_rate: number;
    billed_amount: number;
    paid_amount: number;
    outstanding_amount: number;
    payroll_cost: number;
    gross_margin: number;
    manpower_requests: number;
    remaining_manpower: number;
};

type OutsourcingClientRow = {
    id: number;
    label: string;
    active: boolean;
    employees: number;
    present_today: number;
    absent_today: number;
    attendance_rate: number;
    invoice_total: number;
    payroll_cost: number;
    margin: number;
    remaining_manpower: number;
    outstanding_invoice: number;
    sla_score: number;
    sla_breaches: string[];
};

type OutsourcingSummary = {
    subCompanies: OutsourcingOption[];
    stats: OutsourcingStats;
    perClient: OutsourcingClientRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

const formatRupiahCompact = (value: number | string) => {
    const amount = Number(value ?? 0);

    if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toLocaleString('id-ID', {
            maximumFractionDigits: 1,
        })} M`;
    }

    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', {
            maximumFractionDigits: 1,
        })} jt`;
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function Dashboard({
    stats,
    attendanceChart,
    executiveInsights,
    payrollBurnrate,
    insuranceBurnrate,
    employeeMobility,
    reimburseRate,
    filters,
    availablePeriods = [],
    availablePeriodOptions,
    actionQueue,
    attendanceFocus,
    recentRequests,
    contractReminders,
    outsourcing,
    pieCharts,
}: {
    stats: DashboardStats;
    attendanceChart: AttendancePoint[];
    executiveInsights: ExecutiveInsightsData;
    payrollBurnrate: PayrollBurnrateSummary;
    insuranceBurnrate: InsuranceBurnrateSummary;
    employeeMobility: EmployeeMobilitySummary;
    reimburseRate: ReimburseRateSummary;
    filters: DashboardFilters;
    availablePeriods?: Array<{ value: string; label: string }>;
    availablePeriodOptions?: {
        month: Array<{ value: string; label: string }>;
        quarter: Array<{ value: string; label: string }>;
        semester: Array<{ value: string; label: string }>;
    };
    actionQueue: ActionQueue;
    attendanceFocus: AttendanceFocus;
    recentRequests: RecentRequests;
    contractReminders: ContractReminders;
    outsourcing: OutsourcingSummary;
    pieCharts?: PieChartsData;
}) {
    const { auth, companyFeatures } = usePage().props as {
        auth?: { user?: { name?: string | null } | null };
        companyFeatures?: { show_outsourcing_dashboard?: boolean };
    };
    const [outsourcingOpen, setOutsourcingOpen] = useState(true);
    const userName = auth?.user?.name?.trim() || 'User';
    const applyOutsourcingFilter = (
        next: Partial<
            Pick<
                DashboardFilters,
                'outsourcing_period' | 'outsourcing_sub_company_id'
            >
        >,
    ) => {
        router.get(
            dashboard.url(),
            { ...filters, ...next },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const activePeriodType: 'month' | 'quarter' | 'semester' =
        filters.period_type ||
        (filters.period?.includes('-Q')
            ? 'quarter'
            : filters.period?.includes('-S')
              ? 'semester'
              : 'month');

    const monthOptions = availablePeriodOptions?.month?.length
        ? availablePeriodOptions.month
        : availablePeriods.length > 0
          ? availablePeriods
          : [{ value: filters.period || new Date().toISOString().slice(0, 7), label: filters.period || new Date().toISOString().slice(0, 7) }];

    const quarterOptions = availablePeriodOptions?.quarter ?? [];
    const semesterOptions = availablePeriodOptions?.semester ?? [];

    const currentOptions =
        activePeriodType === 'quarter'
            ? quarterOptions
            : activePeriodType === 'semester'
              ? semesterOptions
              : monthOptions;

    const currentPeriod =
        filters.period ||
        (activePeriodType === 'month' ? filters.outsourcing_period : '') ||
        (currentOptions[0]?.value ?? new Date().toISOString().slice(0, 7));

    const handlePeriodTypeChange = (nextType: 'month' | 'quarter' | 'semester') => {
        if (nextType === activePeriodType) return;
        const targetOptions =
            nextType === 'quarter'
                ? quarterOptions
                : nextType === 'semester'
                  ? semesterOptions
                  : monthOptions;
        const newPeriod = targetOptions[0]?.value ?? '';
        router.get(
            dashboard.url(),
            {
                ...filters,
                period_type: nextType,
                period: newPeriod,
                ...(nextType === 'month' && newPeriod ? { outsourcing_period: newPeriod } : {}),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            dashboard.url(),
            {
                ...filters,
                period: newPeriod,
                period_type: activePeriodType,
                ...(activePeriodType === 'month' ? { outsourcing_period: newPeriod } : {}),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Selamat datang, {userName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pantau kondisi tim, kehadiran, dan pekerjaan HR hari ini dari satu dashboard.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Segmented Period Type Filter: Per Bulan, Per Kuartal, Per Semester */}
                        <div className="inline-flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs">
                            <button
                                type="button"
                                onClick={() => handlePeriodTypeChange('month')}
                                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                                    activePeriodType === 'month'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Per Bulan
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePeriodTypeChange('quarter')}
                                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                                    activePeriodType === 'quarter'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Per Kuartal
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePeriodTypeChange('semester')}
                                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                                    activePeriodType === 'semester'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Per Semester
                            </button>
                        </div>

                        {/* Period Selector Dropdown */}
                        <Select
                            value={currentPeriod}
                            onValueChange={handlePeriodChange}
                        >
                            <SelectTrigger className="h-8 w-[190px] bg-background text-xs">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent align="end">
                                {currentOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {actionQueue.total > 0 && (
                            <div className="rounded-md border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-950 dark:bg-rose-950/25 dark:text-rose-300">
                                <span className="font-semibold">
                                    {actionQueue.total}
                                </span>{' '}
                                Pending actions
                            </div>
                        )}
                    </div>
                </div>

                {actionQueue.items.length > 0 && (
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                        {actionQueue.items.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50/70 px-3 py-2 text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-950 dark:bg-rose-950/25 dark:text-rose-300 dark:hover:bg-rose-950/40"
                            >
                                <p className="truncate text-sm font-medium">
                                    {item.label}
                                </p>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="text-lg font-semibold tabular-nums">
                                        {item.count}
                                    </span>
                                    <AlertTriangle className="size-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Stats Widget: Karyawan Aktif, Hadir, Cuti, Total Payroll, Turnover Rate */}
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    <Card className="gap-2 border-emerald-200 bg-emerald-50/70 py-3 dark:border-emerald-950 dark:bg-emerald-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Karyawan Aktif
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.active_employees}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="gap-2 border-violet-200 bg-violet-50/70 py-3 dark:border-violet-950 dark:bg-violet-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Hadir
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.present_today}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="gap-2 border-indigo-200 bg-indigo-50/70 py-3 dark:border-indigo-950 dark:bg-indigo-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Cuti
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.on_leave_today}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="gap-2 border-sky-200 bg-sky-50/70 py-3 dark:border-sky-950 dark:bg-sky-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Total Payroll
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {formatRupiahCompact(stats.monthly_payroll_burn)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="gap-2 border-rose-200 bg-rose-50/70 py-3 dark:border-rose-950 dark:bg-rose-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Turnover Rate
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.attrition_ytd}%
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Row 1: Total Payroll per Divisi (20%), Tren Payroll (40%), Social Insurance (40%) */}
                <div className="grid gap-3 grid-cols-1 lg:grid-cols-10">
                    <div className="lg:col-span-2">
                        {pieCharts?.payroll_by_division && (
                            <PayrollByDivisionCard
                                data={pieCharts.payroll_by_division}
                                periodLabel={filters.period_label}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-4">
                        <PayrollBurnrateCard data={payrollBurnrate} />
                    </div>
                    <div className="lg:col-span-4">
                        <InsuranceBurnrateCard data={insuranceBurnrate} />
                    </div>
                </div>

                {/* Row 2: Total Reimburse by Kategori (30%), Sebaran Reimbursement (70%) */}
                <div className="grid gap-3 grid-cols-1 lg:grid-cols-10">
                    <div className="lg:col-span-3">
                        {pieCharts?.reimburse_by_category && (
                            <ReimburseByCategoryCard
                                data={pieCharts.reimburse_by_category}
                                periodLabel={filters.period_label}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-7">
                        <ReimburseRateCard data={reimburseRate} />
                    </div>
                </div>

                {/* Row 3: Employee Mobility (60%), Offboarding Reason (20%), Gender per Divisi (20% far right) */}
                <div className="grid gap-3 grid-cols-1 lg:grid-cols-10">
                    <div className="lg:col-span-6">
                        <EmployeeMobilityCard data={employeeMobility} />
                    </div>
                    <div className="lg:col-span-2">
                        {pieCharts?.resign_reasons && (
                            <ResignReasonsCard
                                data={pieCharts.resign_reasons}
                                periodLabel={filters.period_label}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-2">
                        {pieCharts?.gender_by_division && (
                            <GenderByDivisionCard
                                data={pieCharts.gender_by_division}
                                periodLabel={filters.period_label}
                            />
                        )}
                    </div>
                </div>

                {companyFeatures?.show_outsourcing_dashboard !== false ? (
                    <Collapsible
                        open={outsourcingOpen}
                        onOpenChange={setOutsourcingOpen}
                        className="rounded-lg border bg-card text-card-foreground shadow-xs"
                    >
                        <div className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between md:px-4">
                            <div>
                                <h2 className="text-base font-semibold">
                                    Operasional Outsourcing
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Headcount, absensi, manpower demand, invoice
                                    klien, payroll cost, dan margin.
                                </p>
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                >
                                    <ChevronDown
                                        className={`size-4 transition-transform ${outsourcingOpen ? 'rotate-180' : ''}`}
                                    />
                                    {outsourcingOpen
                                        ? 'Sembunyikan'
                                        : 'Tampilkan'}
                                </Button>
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent>
                            <div className="space-y-4 border-t p-4">
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="grid w-full gap-1.5 sm:w-[180px]">
                                        <Label htmlFor="outsourcing-period">
                                            Periode
                                        </Label>
                                        <Input
                                            id="outsourcing-period"
                                            type="month"
                                            value={filters.outsourcing_period}
                                            onChange={(event) =>
                                                applyOutsourcingFilter({
                                                    outsourcing_period:
                                                        event.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="grid w-full gap-1.5 sm:w-[280px]">
                                        <Label htmlFor="outsourcing-client">
                                            Sub-company
                                        </Label>
                                        <Select
                                            value={
                                                filters.outsourcing_sub_company_id ||
                                                '__all'
                                            }
                                            onValueChange={(value) =>
                                                applyOutsourcingFilter({
                                                    outsourcing_sub_company_id:
                                                        value === '__all'
                                                            ? ''
                                                            : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger id="outsourcing-client">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all">
                                                    Semua sub-company
                                                </SelectItem>
                                                {outsourcing.subCompanies.map(
                                                    (company) => (
                                                        <SelectItem
                                                            key={company.id}
                                                            value={String(
                                                                company.id,
                                                            )}
                                                        >
                                                            {company.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.get(
                                                dashboard.url(),
                                                { range: filters.range },
                                                {
                                                    replace: true,
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                    >
                                        <Filter className="size-4" />
                                        Reset
                                    </Button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <OutsourcingStat
                                        icon={Building2}
                                        label="Klien Aktif"
                                        value={outsourcing.stats.active_clients}
                                        description={`${outsourcing.stats.outsourced_employees} karyawan outsourcing`}
                                    />
                                    <OutsourcingStat
                                        icon={UsersRound}
                                        label="Karyawan Internal"
                                        value={
                                            outsourcing.stats.internal_employees
                                        }
                                        description="Tidak terikat sub-company"
                                    />
                                    <OutsourcingStat
                                        icon={CalendarDays}
                                        label="Kehadiran Hari Ini"
                                        value={`${outsourcing.stats.attendance_rate}%`}
                                        description={`${outsourcing.stats.present_today} hadir, ${outsourcing.stats.absent_today} absen`}
                                    />
                                    <OutsourcingStat
                                        icon={UsersRound}
                                        label="Kebutuhan Tenaga"
                                        value={
                                            outsourcing.stats.remaining_manpower
                                        }
                                        description={`${outsourcing.stats.manpower_requests} request open/diproses`}
                                    />
                                    <OutsourcingStat
                                        icon={ReceiptText}
                                        label="Total Tagihan Klien"
                                        value={formatRupiahCompact(
                                            outsourcing.stats.billed_amount,
                                        )}
                                        description={`${formatRupiahCompact(outsourcing.stats.paid_amount)} paid`}
                                    />
                                    <OutsourcingStat
                                        icon={ReceiptText}
                                        label="Outstanding"
                                        value={formatRupiahCompact(
                                            outsourcing.stats
                                                .outstanding_amount,
                                        )}
                                        description="Draft + terkirim"
                                    />
                                    <OutsourcingStat
                                        icon={WalletCards}
                                        label="Payroll Cost"
                                        value={formatRupiahCompact(
                                            outsourcing.stats.payroll_cost,
                                        )}
                                        description="Payroll reguler atau fallback gaji pokok"
                                    />
                                    <OutsourcingStat
                                        icon={WalletCards}
                                        label="Gross Margin"
                                        value={formatRupiahCompact(
                                            outsourcing.stats.gross_margin,
                                        )}
                                        description="Tagihan klien - payroll cost"
                                    />
                                </div>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[1250px] text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/30 text-left">
                                                <th className="px-3 py-2">
                                                    Sub-company
                                                </th>
                                                <th className="px-3 py-2">
                                                    SLA Score
                                                </th>
                                                <th className="px-3 py-2">
                                                    Headcount
                                                </th>
                                                <th className="px-3 py-2">
                                                    Attendance
                                                </th>
                                                <th className="px-3 py-2">
                                                    Manpower Gap
                                                </th>
                                                <th className="px-3 py-2">
                                                    Invoice
                                                </th>
                                                <th className="px-3 py-2">
                                                    Outstanding
                                                </th>
                                                <th className="px-3 py-2">
                                                    Payroll Cost
                                                </th>
                                                <th className="px-3 py-2">
                                                    Margin
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {outsourcing.perClient.length ===
                                                0 && (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        className="px-3 py-5 text-center text-muted-foreground"
                                                    >
                                                        Belum ada sub-company.
                                                    </td>
                                                </tr>
                                            )}
                                            {outsourcing.perClient.map(
                                                (client) => (
                                                    <tr
                                                        key={client.id}
                                                        className="border-b align-top last:border-0"
                                                    >
                                                        <td className="px-3 py-2 font-medium">
                                                            {client.label}
                                                            <div className="text-xs text-muted-foreground">
                                                                {client.active
                                                                    ? 'Aktif'
                                                                    : 'Nonaktif'}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div
                                                                className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                                                                    client.sla_score >=
                                                                    75
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : client.sla_score >=
                                                                            50
                                                                          ? 'bg-amber-50 text-amber-700'
                                                                          : 'bg-rose-50 text-rose-700'
                                                                }`}
                                                            >
                                                                {
                                                                    client.sla_score
                                                                }
                                                            </div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                {client
                                                                    .sla_breaches
                                                                    .length ===
                                                                0
                                                                    ? 'On track'
                                                                    : client.sla_breaches.join(
                                                                          ', ',
                                                                      )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {client.employees}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {
                                                                client.attendance_rate
                                                            }
                                                            %
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    client.present_today
                                                                }{' '}
                                                                hadir,{' '}
                                                                {
                                                                    client.absent_today
                                                                }{' '}
                                                                absen
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {
                                                                client.remaining_manpower
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {formatRupiahCompact(
                                                                client.invoice_total,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {formatRupiahCompact(
                                                                client.outstanding_invoice,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {formatRupiahCompact(
                                                                client.payroll_cost,
                                                            )}
                                                        </td>
                                                        <td
                                                            className={`px-3 py-2 font-semibold ${
                                                                client.margin <
                                                                0
                                                                    ? 'text-destructive'
                                                                    : 'text-emerald-600'
                                                            }`}
                                                        >
                                                            {formatRupiahCompact(
                                                                client.margin,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ) : null}
            </div>
        </AppLayout>
    );
}

function OutsourcingStat({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: typeof Building2;
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <Card className="gap-1 py-2">
            <CardHeader className="px-3 pb-0">
                <div className="flex items-center justify-between gap-3">
                    <CardDescription>{label}</CardDescription>
                    <Icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pt-0 pb-1">
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
