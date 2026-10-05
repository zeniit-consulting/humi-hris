import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock,
    ExternalLink,
    Eye,
    Filter,
    MapPin,
    MapPinned,
    Navigation,
    RotateCcw,
    Search,
    Timer,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ActionIconButton from '@/components/action-icon-button';
import { MapboxLocationMap } from '@/components/mapbox-location-map';
import type { MapCoordinates } from '@/components/mapbox-location-map';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SimplePagination } from '@/components/ui/simple-pagination';
import AppLayout from '@/layouts/app-layout';
import { formatDeviceDateTime, formatLongDate } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Paginator<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

type Option = {
    id: number;
    label?: string;
    name?: string;
    division_id?: number | null;
    position_id?: number | null;
};

type ClientVisit = {
    id: number;
    employee_id: number;
    employee_label: string;
    employee_code?: string | null;
    employee_name?: string | null;
    division: string | null;
    position: string | null;
    client_name: string;
    work_description: string;
    visit_date: string | null;
    clock_in_at: string | null;
    clock_in_latitude: number | null;
    clock_in_longitude: number | null;
    clock_out_at: string | null;
    clock_out_latitude: number | null;
    clock_out_longitude: number | null;
    duration_seconds: number;
    duration_label: string;
    status: string;
    notes?: string | null;
};

type RoutePoint = {
    id: number;
    client_name: string;
    work_description?: string;
    visit_date?: string | null;
    clock_in_at: string | null;
    clock_in_latitude: number | null;
    clock_in_longitude: number | null;
    clock_out_at: string | null;
    clock_out_latitude: number | null;
    clock_out_longitude: number | null;
    duration_label?: string;
    status?: string;
    notes?: string | null;
};

type EmployeeSummary = {
    employee_id: number;
    employee_label: string;
    employee_code?: string | null;
    employee_name?: string | null;
    division?: string | null;
    position?: string | null;
    total_visits: number;
    completed_visits?: number;
    in_progress_visits?: number;
    total_duration_seconds: number;
    total_duration_label: string;
    route_points: RoutePoint[];
};

type Filters = {
    date?: string;
    start_date?: string;
    end_date?: string;
    employee_id: string;
    division_id: string;
    position_id: string;
    status?: string;
    search?: string;
};

type OfficeLocation = {
    id: string;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    radius_meters: number;
    is_primary?: boolean;
};

type PageProps = {
    visits: Paginator<ClientVisit>;
    filters: Filters;
    employees: Option[];
    divisions: Option[];
    positions: Option[];
    office_locations?: OfficeLocation[];
    summary: {
        total_visits: number;
        completed_visits?: number;
        in_progress_visits?: number;
        total_duration_seconds: number;
        total_duration_label: string;
        total_employees?: number;
        employees: EmployeeSummary[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kunjungan Klien', href: '/hris/client-visits' },
];

const ROUTE_COLORS = [
    '#2563eb', // blue
    '#16a34a', // green
    '#d97706', // amber
    '#9333ea', // purple
    '#e11d48', // rose
    '#0891b2', // cyan
    '#ea580c', // orange
    '#4f46e5', // indigo
];

export default function ClientVisitsIndex() {
    const {
        visits,
        filters,
        employees,
        divisions,
        positions,
        office_locations = [],
        summary,
    } = usePage<PageProps>().props;

    const [filterState, setFilterState] = useState<Filters>({
        date: filters.date ?? '',
        start_date: filters.start_date ?? filters.date ?? '',
        end_date: filters.end_date ?? filters.date ?? '',
        employee_id: filters.employee_id ?? '',
        division_id: filters.division_id ?? '',
        position_id: filters.position_id ?? '',
        status: filters.status ?? '',
        search: filters.search ?? '',
    });

    const [selectedVisit, setSelectedVisit] = useState<ClientVisit | null>(null);
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<number | 'all'>('all');
    const [autoCenter, setAutoCenter] = useState<MapCoordinates | null>(null);
    const mapSectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setFilterState({
            date: filters.date ?? '',
            start_date: filters.start_date ?? filters.date ?? '',
            end_date: filters.end_date ?? filters.date ?? '',
            employee_id: filters.employee_id ?? '',
            division_id: filters.division_id ?? '',
            position_id: filters.position_id ?? '',
            status: filters.status ?? '',
            search: filters.search ?? '',
        });
    }, [filters]);

    const filteredPositions = useMemo(
        () =>
            filterState.division_id
                ? positions.filter(
                      (position) =>
                          String(position.division_id ?? '') ===
                          filterState.division_id,
                  )
                : positions,
        [filterState.division_id, positions],
    );

    // Filter employees displayed on map
    const displayedEmployees = useMemo(() => {
        if (selectedEmployeeFilter === 'all') {
            return summary.employees;
        }
        return summary.employees.filter(
            (emp) => emp.employee_id === selectedEmployeeFilter,
        );
    }, [summary.employees, selectedEmployeeFilter]);

    const officeMapLocations = useMemo(() => {
        return office_locations.map((loc) => ({
            id: loc.id,
            name: `Kantor: ${loc.name}${loc.is_primary ? ' (Utama)' : ''}`,
            address: loc.address
                ? `${loc.address} • Radius Presensi: ${loc.radius_meters}m`
                : `Radius Presensi: ${loc.radius_meters}m`,
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude),
            radiusMeters: Number(loc.radius_meters),
            variant: 'office' as const,
        }));
    }, [office_locations]);

    const visitMapLocations = useMemo(() => {
        return displayedEmployees.flatMap((employee) =>
            employee.route_points.flatMap((point) => {
                const locations = [];

                if (
                    point.clock_in_latitude !== null &&
                    point.clock_in_longitude !== null
                ) {
                    locations.push({
                        id: `in-${point.id}`,
                        name: `${employee.employee_label} • ${point.client_name} (Clock In)`,
                        address: `${point.work_description ? point.work_description + ' — ' : ''}Clock in: ${formatDeviceDateTime(point.clock_in_at)}`,
                        latitude: Number(point.clock_in_latitude),
                        longitude: Number(point.clock_in_longitude),
                        variant: 'user' as const,
                    });
                }

                if (
                    point.clock_out_latitude !== null &&
                    point.clock_out_longitude !== null
                ) {
                    locations.push({
                        id: `out-${point.id}`,
                        name: `${employee.employee_label} • ${point.client_name} (Clock Out)`,
                        address: `Clock out: ${formatDeviceDateTime(point.clock_out_at)} (Durasi: ${point.duration_label ?? '-'})`,
                        latitude: Number(point.clock_out_latitude),
                        longitude: Number(point.clock_out_longitude),
                        variant: 'user' as const,
                    });
                }

                return locations;
            }),
        );
    }, [displayedEmployees]);

    const mapLocations = useMemo(() => {
        return [...officeMapLocations, ...visitMapLocations];
    }, [officeMapLocations, visitMapLocations]);

    const routeLines = useMemo(() => {
        return displayedEmployees.flatMap((employee, empIdx) => {
            const color = ROUTE_COLORS[empIdx % ROUTE_COLORS.length];
            return employee.route_points
                .filter(
                    (point) =>
                        point.clock_in_latitude !== null &&
                        point.clock_in_longitude !== null &&
                        point.clock_out_latitude !== null &&
                        point.clock_out_longitude !== null,
                )
                .map((point) => ({
                    id: `route-${point.id}`,
                    color,
                    coordinates: [
                        {
                            latitude: Number(point.clock_in_latitude),
                            longitude: Number(point.clock_in_longitude),
                        },
                        {
                            latitude: Number(point.clock_out_latitude),
                            longitude: Number(point.clock_out_longitude),
                        },
                    ],
                }));
        });
    }, [displayedEmployees]);

    const mapCenter = useMemo(() => {
        return (
            visitMapLocations[0] ??
            officeMapLocations[0] ?? {
                latitude: -6.2,
                longitude: 106.816666,
            }
        );
    }, [visitMapLocations, officeMapLocations]);

    const applyFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/hris/client-visits', filterState, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        const reset: Filters = {
            date: '',
            start_date: '',
            end_date: '',
            employee_id: '',
            division_id: '',
            position_id: '',
            status: '',
            search: '',
        };
        setFilterState(reset);
        router.get('/hris/client-visits', reset, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const focusOnMap = (lat: number | null, lng: number | null) => {
        if (lat !== null && lng !== null) {
            setAutoCenter({ latitude: Number(lat), longitude: Number(lng) });
            mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const completedCount = summary.completed_visits ?? 0;
    const inProgressCount = summary.in_progress_visits ?? 0;
    const totalEmployeesCount = summary.total_employees ?? summary.employees.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kunjungan Klien - Waktu Kerja" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Kunjungan Klien
                            </h1>
                            <Badge variant="outline" className="text-xs">
                                Waktu Kerja
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Monitoring aktivitas kunjungan klien, status perjalanan, durasi kerja lapangan, dan rute lokasi karyawan.
                        </p>
                    </div>
                </div>

                {/* Metric / Stat Cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Card 1: Total Kunjungan */}
                    <Card
                        role="button"
                        onClick={() => {
                            if (filterState.status) {
                                const next = { ...filterState, status: '' };
                                setFilterState(next);
                                router.get('/hris/client-visits', next, {
                                    preserveState: true,
                                    preserveScroll: true,
                                    replace: true,
                                });
                            }
                        }}
                        className={`cursor-pointer transition-all hover:scale-[1.01] ${
                            filterState.status === '' ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                    >
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Total Kunjungan
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    {summary.total_visits.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Seluruh aktivitas
                                </p>
                            </div>
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <MapPinned className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Kunjungan Selesai */}
                    <Card
                        role="button"
                        onClick={() => {
                            const nextStatus = filterState.status === 'completed' ? '' : 'completed';
                            const next = { ...filterState, status: nextStatus };
                            setFilterState(next);
                            router.get('/hris/client-visits', next, {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            });
                        }}
                        className={`cursor-pointer border-emerald-200 bg-emerald-50/50 transition-all hover:scale-[1.01] dark:border-emerald-950 dark:bg-emerald-950/20 ${
                            filterState.status === 'completed'
                                ? 'ring-2 ring-emerald-500 ring-offset-2'
                                : ''
                        }`}
                    >
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                    Kunjungan Selesai
                                </p>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                    {completedCount.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                    Clock out tercatat
                                </p>
                            </div>
                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Sedang Berjalan */}
                    <Card
                        role="button"
                        onClick={() => {
                            const nextStatus = filterState.status === 'in_progress' ? '' : 'in_progress';
                            const next = { ...filterState, status: nextStatus };
                            setFilterState(next);
                            router.get('/hris/client-visits', next, {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            });
                        }}
                        className={`cursor-pointer border-amber-200 bg-amber-50/50 transition-all hover:scale-[1.01] dark:border-amber-950 dark:bg-amber-950/20 ${
                            filterState.status === 'in_progress'
                                ? 'ring-2 ring-amber-500 ring-offset-2'
                                : ''
                        }`}
                    >
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                                    </span>
                                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                                        Sedang Berjalan
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    {inProgressCount.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                    Di lokasi klien
                                </p>
                            </div>
                            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                                <Activity className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: Total Durasi */}
                    <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-950 dark:bg-blue-950/20">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                                    Total Durasi
                                </p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                    {summary.total_duration_label}
                                </p>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400">
                                    Waktu kunjungan
                                </p>
                            </div>
                            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                <Timer className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 5: Karyawan Bertugas */}
                    <Card className="border-indigo-200 bg-indigo-50/40 dark:border-indigo-950 dark:bg-indigo-950/20">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">
                                    Karyawan Lapangan
                                </p>
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                    {totalEmployeesCount.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                                    Personil aktif
                                </p>
                            </div>
                            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                                <UsersRound className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="size-4 text-muted-foreground" />
                            Filter Data Kunjungan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilter}
                            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
                        >
                            {/* Date range picker */}
                            <div className="grid gap-1.5 sm:col-span-2">
                                <Label htmlFor="date-range" className="text-xs">
                                    Rentang Tanggal
                                </Label>
                                <DateRangePicker
                                    value={{
                                        from: filterState.start_date || filterState.date || undefined,
                                        to: filterState.end_date || filterState.date || undefined,
                                    }}
                                    onChange={(range) => {
                                        setFilterState((p) => ({
                                            ...p,
                                            start_date: range.from || '',
                                            end_date: range.to ?? range.from ?? '',
                                            date: range.from || '',
                                        }));
                                    }}
                                    placeholder="Pilih rentang tanggal..."
                                />
                            </div>

                            {/* Employee select */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs">Karyawan</Label>
                                <SearchableSelect
                                    value={filterState.employee_id || '__all'}
                                    onValueChange={(val) =>
                                        setFilterState((p) => ({
                                            ...p,
                                            employee_id: val === '__all' ? '' : val,
                                        }))
                                    }
                                    placeholder="Semua karyawan"
                                    searchPlaceholder="Cari karyawan..."
                                    options={[
                                        { value: '__all', label: 'Semua karyawan' },
                                        ...employees.map((e) => ({
                                            value: String(e.id),
                                            label: e.label ?? e.name ?? '-',
                                        })),
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            {/* Division select */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs">Divisi</Label>
                                <Select
                                    value={filterState.division_id || '__all'}
                                    onValueChange={(val) =>
                                        setFilterState((p) => ({
                                            ...p,
                                            division_id: val === '__all' ? '' : val,
                                            position_id: '',
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua divisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all">Semua divisi</SelectItem>
                                        {divisions.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Position select */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs">Posisi</Label>
                                <Select
                                    value={filterState.position_id || '__all'}
                                    onValueChange={(val) =>
                                        setFilterState((p) => ({
                                            ...p,
                                            position_id: val === '__all' ? '' : val,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua posisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all">Semua posisi</SelectItem>
                                        {filteredPositions.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status select */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs">Status</Label>
                                <Select
                                    value={filterState.status || '__all'}
                                    onValueChange={(val) =>
                                        setFilterState((p) => ({
                                            ...p,
                                            status: val === '__all' ? '' : val,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all">Semua status</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                        <SelectItem value="in_progress">Sedang Berjalan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Keyword search & action buttons */}
                            <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-6">
                                <div className="relative min-w-[240px] flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={filterState.search ?? ''}
                                        onChange={(e) =>
                                            setFilterState((p) => ({
                                                ...p,
                                                search: e.target.value,
                                            }))
                                        }
                                        placeholder="Cari nama klien, agenda kerja, atau catatan..."
                                        className="pl-9"
                                    />
                                </div>
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

                {/* Table Card: Riwayat Kunjungan Klien */}
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg">Riwayat Kunjungan Klien</CardTitle>
                            <CardDescription>
                                Total {visits.total} kunjungan tercatat pada periode{' '}
                                {filters.start_date && filters.end_date && filters.start_date !== filters.end_date
                                    ? `${formatLongDate(filters.start_date)} s/d ${formatLongDate(filters.end_date)}`
                                    : formatLongDate(filters.date || filters.start_date)}
                            </CardDescription>
                        </div>
                        <SimplePagination data={visits} />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <th className="px-3 py-3">Karyawan</th>
                                        <th className="px-3 py-3">Klien & Agenda</th>
                                        <th className="px-3 py-3">Tanggal & Waktu</th>
                                        <th className="px-3 py-3">Durasi</th>
                                        <th className="px-3 py-3">Status</th>
                                        <th className="px-3 py-3">Lokasi GPS</th>
                                        <th className="px-3 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {visits.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-10 text-center text-muted-foreground"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <MapPinned className="size-8 text-muted-foreground/50" />
                                                    <p className="font-medium">
                                                        Belum ada data kunjungan klien.
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Sesuaikan filter tanggal atau karyawan di atas.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        visits.data.map((visit) => {
                                            const hasInCoords =
                                                visit.clock_in_latitude !== null &&
                                                visit.clock_in_longitude !== null;
                                            const hasOutCoords =
                                                visit.clock_out_latitude !== null &&
                                                visit.clock_out_longitude !== null;

                                            return (
                                                <tr
                                                    key={visit.id}
                                                    className="transition-colors hover:bg-muted/40"
                                                >
                                                    {/* Karyawan */}
                                                    <td className="px-3 py-3.5 align-top">
                                                        <div className="flex items-start gap-2.5">
                                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                                {visit.employee_name
                                                                    ? visit.employee_name
                                                                          .split(' ')
                                                                          .map((n) => n[0])
                                                                          .slice(0, 2)
                                                                          .join('')
                                                                          .toUpperCase()
                                                                    : 'K'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    {visit.employee_name ?? visit.employee_label}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {visit.employee_code && (
                                                                        <span className="font-mono text-[11px]">
                                                                            {visit.employee_code} •{' '}
                                                                        </span>
                                                                    )}
                                                                    {[visit.division, visit.position]
                                                                        .filter(Boolean)
                                                                        .join(' — ') || '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Klien & Agenda */}
                                                    <td className="max-w-[260px] px-3 py-3.5 align-top">
                                                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                            <Building2 className="size-3.5 text-primary shrink-0" />
                                                            <span>{visit.client_name}</span>
                                                        </div>
                                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                            {visit.work_description || '-'}
                                                        </p>
                                                        {visit.notes && (
                                                            <p className="mt-1 text-[11px] italic text-amber-700 dark:text-amber-400">
                                                                Catatan: {visit.notes}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Tanggal & Waktu */}
                                                    <td className="px-3 py-3.5 align-top whitespace-nowrap">
                                                        <p className="text-xs font-medium text-foreground">
                                                            {formatLongDate(visit.visit_date)}
                                                        </p>
                                                        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                                                                <span>In: {formatDeviceDateTime(visit.clock_in_at)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="inline-block size-1.5 rounded-full bg-rose-500" />
                                                                <span>
                                                                    Out: {visit.clock_out_at
                                                                        ? formatDeviceDateTime(visit.clock_out_at)
                                                                        : <span className="text-amber-600 font-medium">Belum clock-out</span>}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Durasi */}
                                                    <td className="px-3 py-3.5 align-top whitespace-nowrap">
                                                        <Badge variant="outline" className="gap-1 font-mono text-xs">
                                                            <Timer className="size-3 text-muted-foreground" />
                                                            {visit.duration_label}
                                                        </Badge>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-3 py-3.5 align-top whitespace-nowrap">
                                                        {visit.status === 'completed' ? (
                                                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                                Selesai
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 gap-1.5"
                                                            >
                                                                <span className="relative flex size-1.5">
                                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                                                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                                                                </span>
                                                                Sedang Berjalan
                                                            </Badge>
                                                        )}
                                                    </td>

                                                    {/* Lokasi GPS */}
                                                    <td className="px-3 py-3.5 align-top whitespace-nowrap">
                                                        {hasInCoords ? (
                                                            <div className="space-y-1 text-xs">
                                                                <a
                                                                    href={`https://www.google.com/maps?q=${visit.clock_in_latitude},${visit.clock_in_longitude}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-primary hover:underline"
                                                                    title="Buka titik GPS Clock In di Google Maps"
                                                                >
                                                                    <MapPin className="size-3 shrink-0 text-emerald-600" />
                                                                    <span>Titik In ({visit.clock_in_latitude?.toFixed(4)}, {visit.clock_in_longitude?.toFixed(4)})</span>
                                                                    <ExternalLink className="size-2.5 opacity-70" />
                                                                </a>
                                                                {hasOutCoords && (
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${visit.clock_out_latitude},${visit.clock_out_longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 text-primary hover:underline"
                                                                        title="Buka titik GPS Clock Out di Google Maps"
                                                                    >
                                                                        <MapPin className="size-3 shrink-0 text-rose-600" />
                                                                        <span>Titik Out ({visit.clock_out_latitude?.toFixed(4)}, {visit.clock_out_longitude?.toFixed(4)})</span>
                                                                        <ExternalLink className="size-2.5 opacity-70" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                GPS tidak aktif
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="px-3 py-3.5 align-top text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <ActionIconButton
                                                                label="Lihat Detail Kunjungan"
                                                                icon={Eye}
                                                                variant="outline"
                                                                onClick={() => setSelectedVisit(visit)}
                                                            />
                                                            {hasInCoords && (
                                                                <ActionIconButton
                                                                    label="Fokus di Peta"
                                                                    icon={Navigation}
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        focusOnMap(
                                                                            visit.clock_in_latitude,
                                                                            visit.clock_in_longitude,
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Section: Rute & Timeline Kunjungan */}
                <div ref={mapSectionRef} className="space-y-4">
                    <Card className="w-full">
                        <CardHeader className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Navigation className="size-5 text-primary" />
                                        Peta & Rute Kunjungan Lapangan
                                    </CardTitle>
                                    <CardDescription>
                                        Visualisasi lokasi kantor, titik check-in/out klien, dan rute per karyawan.
                                    </CardDescription>
                                </div>

                                {/* Office quick focus buttons */}
                                {office_locations.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                            <Building2 className="size-3.5 text-primary" />
                                            Fokus Kantor:
                                        </span>
                                        {office_locations.map((office) => (
                                            <Button
                                                key={office.id}
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => focusOnMap(office.latitude, office.longitude)}
                                                className="h-7 text-xs gap-1.5 border-primary/30 hover:bg-primary/5 hover:border-primary"
                                                title={`Fokus ke ${office.name} (Radius presensi: ${office.radius_meters}m)`}
                                            >
                                                <img
                                                    src="/map-marker-office.png"
                                                    alt="Office"
                                                    className="size-3.5 object-contain"
                                                />
                                                <span className="truncate max-w-[130px] font-medium">
                                                    {office.name}
                                                </span>
                                                {office.is_primary && (
                                                    <span className="rounded bg-primary/10 px-1 py-0.2 text-[10px] font-semibold text-primary">
                                                        Pusat
                                                    </span>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Employee Route Filter Chips */}
                            <div className="flex flex-wrap items-center gap-1.5 border-t pt-2">
                                <span className="text-xs text-muted-foreground mr-1">Rute Karyawan:</span>
                                <Button
                                    size="sm"
                                    variant={selectedEmployeeFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setSelectedEmployeeFilter('all')}
                                    className="h-7 text-xs"
                                >
                                    Semua ({summary.employees.length})
                                </Button>
                                {summary.employees.map((emp, idx) => {
                                    const isSelected = selectedEmployeeFilter === emp.employee_id;
                                    const dotColor = ROUTE_COLORS[idx % ROUTE_COLORS.length];
                                    return (
                                        <Button
                                            key={emp.employee_id}
                                            size="sm"
                                            variant={isSelected ? 'default' : 'outline'}
                                            onClick={() => setSelectedEmployeeFilter(emp.employee_id)}
                                            className="h-7 text-xs gap-1.5"
                                        >
                                            <span
                                                className="size-2 rounded-full shrink-0"
                                                style={{ backgroundColor: dotColor }}
                                            />
                                            <span className="truncate max-w-[120px]">
                                                {emp.employee_name ?? emp.employee_label}
                                            </span>
                                            <span className="ml-0.5 rounded bg-muted/60 px-1 py-0.2 text-[10px]">
                                                {emp.total_visits}
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Mapbox Map */}
                            <div className="h-[420px] overflow-hidden rounded-xl border shadow-inner">
                                <MapboxLocationMap
                                    center={mapCenter}
                                    zoom={12}
                                    locations={mapLocations}
                                    routeLines={routeLines}
                                    autoCenter={autoCenter}
                                />
                            </div>

                            {/* Map Legend */}
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            src="/map-marker-office.png"
                                            alt="Kantor"
                                            className="size-4 object-contain"
                                        />
                                        <span className="font-semibold text-foreground">Lokasi Kantor</span>
                                        <span className="text-[11px] text-muted-foreground">(Area hijau = Radius presensi)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            src="/map-marker-employee.png"
                                            alt="Kunjungan"
                                            className="size-4 object-contain"
                                        />
                                        <span className="font-semibold text-foreground">Titik Kunjungan Klien</span>
                                        <span className="text-[11px] text-muted-foreground">(Check-in & Check-out)</span>
                                    </div>
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    Garis berwarna menghubungkan urutan kunjungan klien per karyawan
                                </div>
                            </div>

                            {/* Chronological Route Stops per Employee */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Urutan Kunjungan Klien ({displayedEmployees.length} Karyawan)
                                </h3>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {displayedEmployees.map((employee, empIdx) => {
                                        const routeColor = ROUTE_COLORS[empIdx % ROUTE_COLORS.length];
                                        return (
                                            <Card
                                                key={employee.employee_id}
                                                className="border bg-card/60 transition-all hover:shadow-sm"
                                            >
                                                <CardHeader className="p-3.5 pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="size-2.5 rounded-full shrink-0"
                                                                style={{ backgroundColor: routeColor }}
                                                            />
                                                            <p className="font-semibold text-sm leading-tight text-foreground">
                                                                {employee.employee_name ?? employee.employee_label}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="text-[11px] font-mono">
                                                            {employee.total_duration_label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground pl-4.5">
                                                        {[employee.division, employee.position].filter(Boolean).join(' • ') || '-'}
                                                    </p>
                                                </CardHeader>

                                                <CardContent className="p-3.5 pt-0">
                                                    <div className="space-y-2.5 mt-2 border-t pt-2.5">
                                                        {employee.route_points.length === 0 ? (
                                                            <p className="text-xs text-muted-foreground italic">
                                                                Tidak ada titik rute tercatat.
                                                            </p>
                                                        ) : (
                                                            employee.route_points.map((stop, stopIdx) => {
                                                                const hasCoords =
                                                                    stop.clock_in_latitude !== null &&
                                                                    stop.clock_in_longitude !== null;

                                                                return (
                                                                    <div
                                                                        key={stop.id}
                                                                        className="flex items-start gap-2.5 text-xs rounded-lg p-2 transition-colors hover:bg-muted/50"
                                                                    >
                                                                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                                            {stopIdx + 1}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-semibold truncate text-foreground">
                                                                                {stop.client_name}
                                                                            </p>
                                                                            <p className="text-muted-foreground text-[11px] truncate">
                                                                                {stop.work_description || 'Tanpa keterangan'}
                                                                            </p>
                                                                            <div className="mt-1 flex items-center justify-between text-[11px]">
                                                                                <span className="text-muted-foreground font-mono">
                                                                                    {stop.clock_in_at ? stop.clock_in_at.slice(11, 16) : '-'}
                                                                                    {' - '}
                                                                                    {stop.clock_out_at ? stop.clock_out_at.slice(11, 16) : 'Aktif'}
                                                                                </span>
                                                                                {hasCoords && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            focusOnMap(
                                                                                                stop.clock_in_latitude,
                                                                                                stop.clock_in_longitude,
                                                                                            )
                                                                                        }
                                                                                        className="text-primary hover:underline flex items-center gap-0.5 font-medium"
                                                                                    >
                                                                                        <MapPin className="size-3" />
                                                                                        Lihat
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Detail Dialog Modal */}
            <Dialog
                open={selectedVisit !== null}
                onOpenChange={(open) => !open && setSelectedVisit(null)}
            >
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-4">
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Building2 className="size-5 text-primary" />
                                {selectedVisit?.client_name}
                            </DialogTitle>
                            {selectedVisit && (
                                <Badge
                                    className={
                                        selectedVisit.status === 'completed'
                                            ? 'bg-emerald-600 text-white'
                                            : 'border-amber-400 bg-amber-50 text-amber-800'
                                    }
                                >
                                    {selectedVisit.status === 'completed'
                                        ? 'Selesai'
                                        : 'Sedang Berjalan'}
                                </Badge>
                            )}
                        </div>
                        <DialogDescription>
                            Informasi detail kunjungan lapangan karyawan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedVisit && (
                        <div className="space-y-4 text-sm">
                            {/* Employee info card */}
                            <div className="rounded-lg border bg-muted/30 p-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Informasi Karyawan
                                </p>
                                <div className="mt-1 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-foreground text-base">
                                            {selectedVisit.employee_name ?? selectedVisit.employee_label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedVisit.employee_code && (
                                                <span>NIK: {selectedVisit.employee_code} • </span>
                                            )}
                                            {[selectedVisit.division, selectedVisit.position]
                                                .filter(Boolean)
                                                .join(' — ') || '-'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Durasi</p>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {selectedVisit.duration_label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Date and Time info */}
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                                        <CalendarDays className="size-3.5" />
                                        <span>Tanggal Kunjungan</span>
                                    </div>
                                    <p className="font-semibold text-foreground">
                                        {formatLongDate(selectedVisit.visit_date)}
                                    </p>
                                </div>

                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                                        <Clock className="size-3.5" />
                                        <span>Waktu Check-In & Check-Out</span>
                                    </div>
                                    <p className="text-xs text-foreground font-mono">
                                        In: {formatDeviceDateTime(selectedVisit.clock_in_at)}
                                    </p>
                                    <p className="text-xs text-foreground font-mono mt-0.5">
                                        Out: {selectedVisit.clock_out_at
                                            ? formatDeviceDateTime(selectedVisit.clock_out_at)
                                            : <span className="text-amber-600 font-sans font-medium">Sedang berlangsung</span>}
                                    </p>
                                </div>
                            </div>

                            {/* Location GPS info */}
                            <div className="rounded-lg border p-3 space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Koordinat & Titik Lokasi
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                                    {/* Clock in location */}
                                    <div className="rounded bg-muted/40 p-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                                <MapPin className="size-3 text-emerald-600" />
                                                Clock In GPS
                                            </span>
                                            {selectedVisit.clock_in_latitude !== null && (
                                                <a
                                                    href={`https://www.google.com/maps?q=${selectedVisit.clock_in_latitude},${selectedVisit.clock_in_longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-0.5 text-[11px]"
                                                >
                                                    Google Maps <ExternalLink className="size-2.5" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="mt-1 font-mono text-muted-foreground text-[11px]">
                                            {selectedVisit.clock_in_latitude !== null
                                                ? `${selectedVisit.clock_in_latitude}, ${selectedVisit.clock_in_longitude}`
                                                : 'Tidak ada data koordinat'}
                                        </p>
                                    </div>

                                    {/* Clock out location */}
                                    <div className="rounded bg-muted/40 p-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-rose-700 dark:text-rose-400 flex items-center gap-1">
                                                <MapPin className="size-3 text-rose-600" />
                                                Clock Out GPS
                                            </span>
                                            {selectedVisit.clock_out_latitude !== null && (
                                                <a
                                                    href={`https://www.google.com/maps?q=${selectedVisit.clock_out_latitude},${selectedVisit.clock_out_longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-0.5 text-[11px]"
                                                >
                                                    Google Maps <ExternalLink className="size-2.5" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="mt-1 font-mono text-muted-foreground text-[11px]">
                                            {selectedVisit.clock_out_latitude !== null
                                                ? `${selectedVisit.clock_out_latitude}, ${selectedVisit.clock_out_longitude}`
                                                : 'Belum clock out'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Work description */}
                            <div className="rounded-lg border p-3 space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Deskripsi / Agenda Pekerjaan
                                </p>
                                <p className="whitespace-pre-line text-foreground">
                                    {selectedVisit.work_description || '-'}
                                </p>
                            </div>

                            {/* Notes */}
                            {selectedVisit.notes && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-950 dark:bg-amber-950/20 space-y-1">
                                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                                        Catatan Kunjungan
                                    </p>
                                    <p className="whitespace-pre-line text-amber-900 dark:text-amber-200 text-xs">
                                        {selectedVisit.notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                {selectedVisit.clock_in_latitude !== null && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const lat = selectedVisit.clock_in_latitude;
                                            const lng = selectedVisit.clock_in_longitude;
                                            setSelectedVisit(null);
                                            focusOnMap(lat, lng);
                                        }}
                                        className="gap-1.5"
                                    >
                                        <Navigation className="size-4" />
                                        Fokus Peta
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    onClick={() => setSelectedVisit(null)}
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
