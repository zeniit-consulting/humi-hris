import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CalendarClock,
    CalendarDays,
    ChevronDown,
    Clock3,
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
    contractReminders,
    outsourcing,
}: {
    stats: DashboardStats;
    attendanceChart: AttendancePoint[];
    filters: DashboardFilters;
    actionQueue: ActionQueue;
    attendanceFocus: AttendanceFocus;
    recentRequests: RecentRequests;
    contractReminders: ContractReminders;
    outsourcing: OutsourcingSummary;
}) {
    const { auth, companyFeatures } = usePage().props as {
        auth?: { user?: { name?: string | null } | null };
        companyFeatures?: { show_outsourcing_dashboard?: boolean };
    };
    const [outsourcingOpen, setOutsourcingOpen] = useState(true);
    const maxAttendanceValue = Math.max(
        ...attendanceChart.flatMap((day) => [
            day.present,
            day.late,
            day.on_leave,
            day.absent,
        ]),
        1,
    );
    const genderEntries = [
        { key: 'male', label: 'Laki-laki', color: '#0f766e' },
        { key: 'female', label: 'Perempuan', color: '#14b8a6' },
        { key: 'other', label: 'Lainnya', color: '#f59e0b' },
        { key: 'unknown', label: 'Belum diisi', color: '#cbd5e1' },
    ].map((item) => ({ ...item, total: stats.gender[item.key] ?? 0 }));
    const genderTotal = genderEntries.reduce((total, item) => total + item.total, 0);
    let genderOffset = 0;
    const genderGradient = genderEntries
        .map((item) => {
            const start = genderTotal > 0 ? (genderOffset / genderTotal) * 100 : 0;
            genderOffset += item.total;
            const end = genderTotal > 0 ? (genderOffset / genderTotal) * 100 : 0;
            return `${item.color} ${start}% ${end}%`;
        })
        .join(', ');
    const userName = auth?.user?.name?.trim() || 'User';
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

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <CardTitle>
                                    Selamat datang, {userName}
                                </CardTitle>
                                <CardDescription>
                                    Pantau kondisi tim, kehadiran, dan pekerjaan
                                    HR hari ini dari satu dashboard.
                                </CardDescription>
                            </div>
                            {actionQueue.total > 0 && (
                                <div className="rounded-md border border-rose-200 bg-rose-50/70 px-3 py-2 text-sm text-rose-700 dark:border-rose-950 dark:bg-rose-950/25 dark:text-rose-300">
                                    <span className="font-semibold">
                                        {actionQueue.total}
                                    </span>{' '}
                                    Pending actions
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    {actionQueue.items.length > 0 && (
                        <CardContent>
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
                        </CardContent>
                    )}
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
                    <Card className="gap-2 border-sky-200 bg-sky-50/70 py-3 dark:border-sky-950 dark:bg-sky-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Total Karyawan
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.total_employees}
                            </CardTitle>
                        </CardHeader>
                    </Card>

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
                                Hadir Hari Ini
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.present_today}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="gap-2 border-amber-200 bg-amber-50/70 py-3 dark:border-amber-950 dark:bg-amber-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Terlambat
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.late_today}
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

                    <Card className="gap-2 border-rose-200 bg-rose-50/70 py-3 dark:border-rose-950 dark:bg-rose-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Absen
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.absent_today}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="gap-2 border-cyan-200 bg-cyan-50/70 py-3 dark:border-cyan-950 dark:bg-cyan-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Total Divisi
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.total_divisions}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="gap-2 border-fuchsia-200 bg-fuchsia-50/70 py-3 dark:border-fuchsia-950 dark:bg-fuchsia-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Total Jabatan
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.total_positions}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="gap-0 py-0">
                        <CardHeader className="px-4 py-3">
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
                        <CardContent className="px-4 pb-4">
                            <DashboardList
                                icon={Clock3}
                                title="Perlu Ditindaklanjuti"
                                count={
                                    attendanceFocus.missing_clock_ins_count +
                                    attendanceFocus.late_today_count
                                }
                                empty="Tidak ada absensi yang perlu ditindaklanjuti."
                                items={attendanceFocus.items.map((item) => ({
                                    key: item.id,
                                    label: item.label,
                                    description: item.description,
                                    href: item.href,
                                }))}
                            />
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0">
                        <CardHeader className="px-4 py-3">
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
                        <CardContent className="px-4 pb-4">
                            {recentRequests.items.length === 0 ? (
                                <div className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
                                    Belum ada request terbaru.
                                </div>
                            ) : (
                                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                                    {recentRequests.items.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/40"
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

                    <Card className="gap-0 py-0">
                        <CardHeader className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle>
                                        Reminder Kontrak & Probation
                                    </CardTitle>
                                    <CardDescription>
                                        Berakhir dalam 30 hari ke depan.
                                    </CardDescription>
                                </div>
                                <CalendarClock className="size-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <DashboardList
                                icon={CalendarClock}
                                title="Akan Berakhir"
                                count={contractReminders.total}
                                empty="Tidak ada kontrak atau probation yang segera berakhir."
                                items={contractReminders.items.map((item) => ({
                                    key: `${item.type}-${item.id}`,
                                    label: item.employee_label,
                                    description: `${item.type} · ${item.date_label} · ${item.days_remaining} hari`,
                                    href: item.href,
                                }))}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                <Card className="gap-0 py-0 lg:col-span-9">
                    <CardHeader className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <CardTitle>Chart Kehadiran</CardTitle>
                            <div className="flex flex-wrap gap-1.5">
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
                    <CardContent className="px-4 pb-4">
                        <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                Hadir
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                                <span className="size-2 rounded-full bg-amber-500" />
                                Terlambat
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                                <span className="size-2 rounded-full bg-blue-500" />
                                Cuti
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                                <span className="size-2 rounded-full bg-slate-300" />
                                Absen
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-[680px]">
                                <svg viewBox="0 0 760 240" className="h-56 w-full" role="img" aria-label="Line chart kehadiran">
                                    {[0, 1, 2, 3, 4].map((line) => {
                                        const y = 24 + line * 42;
                                        return <line key={line} x1="36" x2="744" y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="4 4" />;
                                    })}
                                    {[
                                        { key: 'present', color: '#10b981', label: 'Hadir' },
                                        { key: 'late', color: '#f59e0b', label: 'Terlambat' },
                                        { key: 'on_leave', color: '#3b82f6', label: 'Cuti' },
                                        { key: 'absent', color: '#94a3b8', label: 'Absen' },
                                    ].map((series) => {
                                        const points = attendanceChart.map((day, index) => {
                                            const x = attendanceChart.length === 1 ? 380 : 36 + (index / (attendanceChart.length - 1)) * 708;
                                            const y = 204 - (Number(day[series.key as keyof AttendancePoint]) / maxAttendanceValue) * 180;
                                            return `${x},${y}`;
                                        }).join(' ');
                                        return <polyline key={series.key} points={points} fill="none" stroke={series.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
                                    })}
                                </svg>
                                <div className="flex justify-between gap-2 px-6 text-xs text-muted-foreground">
                                    {attendanceChart.map((day) => <span key={day.date}>{day.label}</span>)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Gender Karyawan</CardTitle>
                        <CardDescription>Distribusi karyawan aktif.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mx-auto size-44 rounded-full" style={{ background: `conic-gradient(${genderGradient || '#e2e8f0 0 100%'})` }}>
                            <div className="flex size-full items-center justify-center p-8">
                                <div className="flex size-full items-center justify-center rounded-full bg-card text-center">
                                    <div><p className="text-2xl font-bold">{genderTotal}</p><p className="text-xs text-muted-foreground">Karyawan</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 space-y-2 text-sm">
                            {genderEntries.map((item) => <div key={item.key} className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-semibold">{item.total}</span></div>)}
                        </div>
                    </CardContent>
                </Card>
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
                                                    className="px-3 py-5 text-center text-muted-foreground"
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
                                                <td className="px-3 py-2">
                                                    {client.employees}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {client.attendance_rate}%
                                                    <div className="text-xs text-muted-foreground">
                                                        {client.present_today}{' '}
                                                        hadir,{' '}
                                                        {client.absent_today}{' '}
                                                        absen
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    {client.remaining_manpower}
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
                ) : null}
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
        <div className="rounded-md border p-2.5">
            <div className="mb-2 flex items-center justify-between gap-3">
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
                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {items.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className="block rounded border px-2.5 py-1.5 transition-colors hover:bg-muted/40"
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
