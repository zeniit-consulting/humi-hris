import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CalendarDays,
    ChevronDown,
    Clock3,
    Filter,
    ReceiptText,
    UserX,
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

type DashboardFilters = {
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
    filters,
    actionQueue,
    attendanceFocus,
    recentRequests,
    outsourcing,
}: {
    stats: DashboardStats;
    attendanceChart: AttendancePoint[];
    filters: DashboardFilters;
    actionQueue: ActionQueue;
    attendanceFocus: AttendanceFocus;
    recentRequests: RecentRequests;
    outsourcing: OutsourcingSummary;
}) {
    const [outsourcingOpen, setOutsourcingOpen] = useState(true);
    const maxEmployees = Math.max(stats.active_employees, 1);
    const rangeOptions: Array<{
        value: DashboardFilters['range'];
        label: string;
    }> = [
        { value: 'today', label: 'Hari Ini' },
        { value: 'this_week', label: 'Minggu Ini' },
        { value: 'this_month', label: 'Bulan Ini' },
    ];
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-4 p-4">
                <Card className="border-rose-200 bg-rose-50/70">
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>Action Queue</CardTitle>
                                <CardDescription>
                                    Pekerjaan operasional yang perlu ditangani.
                                </CardDescription>
                            </div>
                            <div className="rounded-md border border-rose-200 bg-white/70 px-3 py-2 text-sm">
                                <span className="font-semibold">
                                    {actionQueue.total}
                                </span>{' '}
                                pending
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {actionQueue.items.length === 0 ? (
                            <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                Tidak ada action pending.
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                {actionQueue.items.map((item) => (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className="rounded-md border border-rose-200 bg-white/80 p-3 transition-colors hover:bg-white"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 text-2xl font-semibold">
                                                    {item.count}
                                                </p>
                                            </div>
                                            <AlertTriangle
                                                className={`size-5 ${
                                                    item.severity === 'high'
                                                        ? 'text-destructive'
                                                        : 'text-amber-600'
                                                }`}
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Card className="gap-2 py-2">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Total Employees</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.total_employees}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pt-0 pb-2">
                            <p className="text-sm text-muted-foreground">
                                Active: {stats.active_employees}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 py-2">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Present Today</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.present_today}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pt-0 pb-2">
                            <p className="text-sm text-muted-foreground">
                                Late: {stats.late_today}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 py-2">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>On Leave</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.on_leave_today}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pt-0 pb-2">
                            <p className="text-sm text-muted-foreground">
                                Absent: {stats.absent_today}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 py-2">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Open Positions</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.open_positions}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pt-0 pb-2">
                            <p className="text-sm text-muted-foreground">
                                Published vacancies
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="gap-2 py-2">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>
                                Monthly Payroll Burn
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {formatRupiahCompact(
                                    stats.monthly_payroll_burn,
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pt-0 pb-2">
                            <p className="text-sm text-muted-foreground">
                                Current period net salary
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle>Absensi Hari Ini</CardTitle>
                                    <CardDescription>
                                        Nama karyawan yang perlu dicek admin.
                                    </CardDescription>
                                </div>
                                <CalendarDays className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <DashboardList
                                icon={UserX}
                                title="Belum Clock In"
                                count={attendanceFocus.missing_clock_ins_count}
                                empty="Semua karyawan aktif sudah memiliki data absensi."
                                items={attendanceFocus.missingClockIns.map(
                                    (item) => ({
                                        key: String(item.id),
                                        label: item.label,
                                        description: 'Belum ada data hari ini',
                                        href: item.href,
                                    }),
                                )}
                            />
                            <DashboardList
                                icon={Clock3}
                                title="Telat"
                                count={attendanceFocus.late_today_count}
                                empty="Belum ada karyawan telat hari ini."
                                items={attendanceFocus.lateToday.map(
                                    (item) => ({
                                        key: String(item.id),
                                        label: item.label,
                                        description: `Clock in ${item.time ?? '-'}`,
                                        href: item.href,
                                    }),
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle>Request Terbaru</CardTitle>
                                    <CardDescription>
                                        Aktivitas terbaru dari karyawan dan
                                        supervisor.
                                    </CardDescription>
                                </div>
                                <AlertTriangle className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentRequests.items.length === 0 ? (
                                <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    Belum ada request terbaru.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentRequests.items.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className="flex items-start justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-medium">
                                                        {item.type}
                                                    </p>
                                                    <StatusPill
                                                        status={item.status}
                                                    />
                                                </div>
                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {item.employee_label}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.date_label}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-xs text-muted-foreground">
                                                {item.created_at ?? ''}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>Chart Kehadiran</CardTitle>
                            <div className="flex gap-2">
                                {rangeOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        size="sm"
                                        variant={
                                            filters.range === option.value
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() =>
                                            router.get(
                                                dashboard.url(),
                                                { range: option.value },
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                },
                                            )
                                        }
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <CardDescription>
                            Komposisi hadir, terlambat, cuti, dan absen per
                            hari.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2 text-xs">
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                Hadir
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                <span className="size-2 rounded-full bg-amber-500" />
                                Terlambat
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                <span className="size-2 rounded-full bg-blue-500" />
                                Cuti
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-1">
                                <span className="size-2 rounded-full bg-slate-300" />
                                Absen
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="flex min-w-[720px] items-end gap-3">
                                {attendanceChart.map((day) => (
                                    <div
                                        key={day.date}
                                        className="flex flex-1 flex-col items-center gap-2"
                                    >
                                        <div className="flex h-52 w-full max-w-16 items-end overflow-hidden rounded-md border bg-muted/20">
                                            <div className="flex h-full w-full flex-col justify-end">
                                                <div
                                                    className="bg-slate-300"
                                                    style={{
                                                        height: `${(day.absent / maxEmployees) * 100}%`,
                                                    }}
                                                    title={`Absen: ${day.absent}`}
                                                />
                                                <div
                                                    className="bg-blue-500"
                                                    style={{
                                                        height: `${(day.on_leave / maxEmployees) * 100}%`,
                                                    }}
                                                    title={`Cuti: ${day.on_leave}`}
                                                />
                                                <div
                                                    className="bg-amber-500"
                                                    style={{
                                                        height: `${(day.late / maxEmployees) * 100}%`,
                                                    }}
                                                    title={`Terlambat: ${day.late}`}
                                                />
                                                <div
                                                    className="bg-emerald-500"
                                                    style={{
                                                        height: `${(day.present / maxEmployees) * 100}%`,
                                                    }}
                                                    title={`Hadir: ${day.present}`}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium">
                                            {day.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {day.attendance_rate}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Collapsible
                    open={outsourcingOpen}
                    onOpenChange={setOutsourcingOpen}
                    className="rounded-lg border bg-card text-card-foreground shadow-xs"
                >
                    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Operasional Outsourcing
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Headcount, absensi, manpower demand, invoice
                                klien, payroll cost, dan margin.
                            </p>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                                <ChevronDown
                                    className={`size-4 transition-transform ${outsourcingOpen ? 'rotate-180' : ''}`}
                                />
                                {outsourcingOpen ? 'Sembunyikan' : 'Tampilkan'}
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                        <div className="space-y-4 border-t p-4">
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="grid w-[180px] gap-2">
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
                                <div className="grid w-[280px] gap-2">
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
                                    value={outsourcing.stats.internal_employees}
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
                                    value={outsourcing.stats.remaining_manpower}
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
                                        outsourcing.stats.outstanding_amount,
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
                                        {outsourcing.perClient.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    className="px-3 py-8 text-center text-muted-foreground"
                                                >
                                                    Belum ada sub-company.
                                                </td>
                                            </tr>
                                        )}
                                        {outsourcing.perClient.map((client) => (
                                            <tr
                                                key={client.id}
                                                className="border-b align-top last:border-0"
                                            >
                                                <td className="px-3 py-3 font-medium">
                                                    {client.label}
                                                    <div className="text-xs text-muted-foreground">
                                                        {client.active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
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
                                                        {client.sla_score}
                                                    </div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {client.sla_breaches
                                                            .length === 0
                                                            ? 'On track'
                                                            : client.sla_breaches.join(
                                                                  ', ',
                                                              )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {client.employees}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {client.attendance_rate}%
                                                    <div className="text-xs text-muted-foreground">
                                                        {client.present_today}{' '}
                                                        hadir,{' '}
                                                        {client.absent_today}{' '}
                                                        absen
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {client.remaining_manpower}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatRupiahCompact(
                                                        client.invoice_total,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatRupiahCompact(
                                                        client.outstanding_invoice,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatRupiahCompact(
                                                        client.payroll_cost,
                                                    )}
                                                </td>
                                                <td
                                                    className={`px-3 py-3 font-semibold ${
                                                        client.margin < 0
                                                            ? 'text-destructive'
                                                            : 'text-emerald-600'
                                                    }`}
                                                >
                                                    {formatRupiahCompact(
                                                        client.margin,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </AppLayout>
    );
}

function DashboardList({
    icon: Icon,
    title,
    count,
    empty,
    items,
}: {
    icon: typeof Building2;
    title: string;
    count: number;
    empty: string;
    items: Array<{
        key: string;
        label: string;
        description: string;
        href: string;
    }>;
}) {
    return (
        <div className="rounded-md border p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{title}</p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                    {count}
                </span>
            </div>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{empty}</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className="block rounded border px-3 py-2 transition-colors hover:bg-muted/40"
                        >
                            <p className="truncate text-sm font-medium">
                                {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.description}
                            </p>
                        </Link>
                    ))}
                    {count > items.length && (
                        <p className="text-xs text-muted-foreground">
                            +{count - items.length} lainnya
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        pending: 'Pending',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        cancelled: 'Dibatalkan',
    };

    const color =
        status === 'approved'
            ? 'bg-emerald-50 text-emerald-700'
            : status === 'rejected' || status === 'cancelled'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-amber-50 text-amber-700';

    return (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
            {labelMap[status] ?? status}
        </span>
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
        <Card className="gap-2 py-3">
            <CardHeader className="px-4 pb-0">
                <div className="flex items-center justify-between gap-3">
                    <CardDescription>{label}</CardDescription>
                    <Icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-2">
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
