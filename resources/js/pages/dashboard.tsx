import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CalendarClock,
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

    const reminders = [
        ...attendanceFocus.items
            .filter((item) => item.description.startsWith('Telat'))
            .map((item) => {
                const parts = item.description.split('·');
                const datePart = parts.length >= 3 ? parts[2].trim() : (parts.length === 2 ? parts[1].trim() : 'Hari Ini');
                return {
                    id: item.id,
                    name: item.label,
                    type: 'Absensi (Terlambat)',
                    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
                    date: datePart,
                    href: item.href,
                };
            }),
        ...recentRequests.items.map((item) => ({
            id: item.id,
            name: item.employee_label,
            type: `Request: ${item.type}`,
            badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
            date: item.date_label || item.created_at || '-',
            href: item.href,
        })),
        ...contractReminders.items.map((item) => ({
            id: `contract-${item.id}`,
            name: item.employee_label,
            type: `Reminder: ${item.type}`,
            badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
            date: `${item.date_label} (${item.days_remaining} hari)`,
            href: item.href,
        })),
    ].slice(0, 20);

    const currentPeriod = filters.period || filters.outsourcing_period || (availablePeriods[0]?.value ?? new Date().toISOString().slice(0, 7));

    const periodOptions = availablePeriods.length > 0
        ? availablePeriods
        : [{
            value: currentPeriod,
            label: currentPeriod,
        }];

    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            dashboard.url(),
            {
                ...filters,
                period: newPeriod,
                outsourcing_period: newPeriod,
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
                    <div className="flex flex-wrap items-center gap-3">
                        <Select
                            value={currentPeriod}
                            onValueChange={handlePeriodChange}
                        >
                            <SelectTrigger className="h-9 w-[180px] bg-background">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                {periodOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {actionQueue.total > 0 && (
                            <div className="rounded-md border border-rose-200 bg-rose-50/70 px-3 py-2 text-sm text-rose-700 dark:border-rose-950 dark:bg-rose-950/25 dark:text-rose-300">
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

                {/* Baris 1 (3 Charts): Gender per Divisi, Total Payroll per Divisi, Total Reimburse per Divisi */}
                {pieCharts && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <GenderByDivisionCard data={pieCharts.gender_by_division} />
                        <PayrollByDivisionCard data={pieCharts.payroll_by_division} />
                        <ReimburseByDivisionCard data={pieCharts.reimburse_by_division} />
                    </div>
                )}

                {/* Baris 2 (3 Charts): Payroll Burnrate, Insurance Burnrate, Reimburse Rate */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <PayrollBurnrateCard data={payrollBurnrate} />
                    <InsuranceBurnrateCard data={insuranceBurnrate} />
                    <ReimburseRateCard data={reimburseRate} />
                </div>

                {/* Baris 3 (2 Charts, Rasio 70-30): Employee Mobility & Offboarding Reason */}
                <div className="grid gap-3 lg:grid-cols-10">
                    <div className={pieCharts?.resign_reasons ? 'lg:col-span-7' : 'lg:col-span-10'}>
                        <EmployeeMobilityCard data={employeeMobility} />
                    </div>
                    {pieCharts?.resign_reasons && (
                        <div className="lg:col-span-3">
                            <ResignReasonsCard data={pieCharts.resign_reasons} />
                        </div>
                    )}
                </div>

                {/* Reminder Terkini */}
                <Card className="flex flex-col gap-0 py-0 shadow-xs">
                    <CardHeader className="px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Reminder Terkini
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Aktivitas penting, keterlambatan absensi, pengajuan cuti/klaim, dan jatuh tempo kontrak.
                                </CardDescription>
                            </div>
                            <CalendarClock className="size-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 px-4 pb-4">
                        {reminders.length === 0 ? (
                            <div className="flex h-32 items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                Tidak ada reminder atau aktivitas terkini.
                            </div>
                        ) : (
                            <div className="max-h-[360px] overflow-y-auto pr-1">
                                <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {reminders.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className="block rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="truncate text-sm font-semibold">
                                                    {item.name}
                                                </p>
                                                <span
                                                    className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${item.badgeColor}`}
                                                >
                                                    {item.type}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Tanggal:</span>
                                                <span className="font-medium text-foreground">
                                                    {item.date}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
