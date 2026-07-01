import { Head, router, usePage } from '@inertiajs/react';
import { Filter, MapPinned, Route, Timer, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MapboxLocationMap } from '@/components/mapbox-location-map';
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
import AppLayout from '@/layouts/app-layout';
import { formatDeviceDateTime } from '@/lib/utils';
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
};

type RoutePoint = {
    id: number;
    client_name: string;
    clock_in_at: string | null;
    clock_in_latitude: number | null;
    clock_in_longitude: number | null;
    clock_out_at: string | null;
    clock_out_latitude: number | null;
    clock_out_longitude: number | null;
};

type EmployeeSummary = {
    employee_id: number;
    employee_label: string;
    total_visits: number;
    total_duration_seconds: number;
    total_duration_label: string;
    route_points: RoutePoint[];
};

type PageProps = {
    visits: Paginator<ClientVisit>;
    filters: {
        date: string;
        employee_id: string;
        division_id: string;
        position_id: string;
    };
    employees: Option[];
    divisions: Option[];
    positions: Option[];
    summary: {
        total_visits: number;
        total_duration_seconds: number;
        total_duration_label: string;
        employees: EmployeeSummary[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kunjungan Client', href: '/hris/client-visits' },
];

const statusLabel = (status: string) =>
    status === 'completed' ? 'Selesai' : 'Berjalan';

export default function ClientVisitsIndex() {
    const { visits, filters, employees, divisions, positions, summary } =
        usePage<PageProps>().props;
    const [filterState, setFilterState] = useState(filters);

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

    const mapLocations = useMemo(() => {
        return summary.employees.flatMap((employee) =>
            employee.route_points.flatMap((point) => {
                const locations = [];

                if (
                    point.clock_in_latitude !== null &&
                    point.clock_in_longitude !== null
                ) {
                    locations.push({
                        id: `in-${point.id}`,
                        name: `${point.client_name} - Clock in`,
                        address: formatDeviceDateTime(point.clock_in_at),
                        latitude: Number(point.clock_in_latitude),
                        longitude: Number(point.clock_in_longitude),
                    });
                }

                if (
                    point.clock_out_latitude !== null &&
                    point.clock_out_longitude !== null
                ) {
                    locations.push({
                        id: `out-${point.id}`,
                        name: `${point.client_name} - Clock out`,
                        address: formatDeviceDateTime(point.clock_out_at),
                        latitude: Number(point.clock_out_latitude),
                        longitude: Number(point.clock_out_longitude),
                    });
                }

                return locations;
            }),
        );
    }, [summary.employees]);

    const routeLines = useMemo(() => {
        return summary.employees.flatMap((employee) =>
            employee.route_points
                .filter(
                    (point) =>
                        point.clock_in_latitude !== null &&
                        point.clock_in_longitude !== null &&
                        point.clock_out_latitude !== null &&
                        point.clock_out_longitude !== null,
                )
                .map((point) => ({
                    id: `route-${point.id}`,
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
                })),
        );
    }, [summary.employees]);

    const mapCenter = mapLocations[0] ?? {
        latitude: -6.2,
        longitude: 106.816666,
    };

    const submitFilters = () => {
        router.get('/hris/client-visits', filterState, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kunjungan Client" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            HRIS
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Kunjungan Client
                        </h1>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <MetricCard
                        icon={MapPinned}
                        label="Total kunjungan"
                        value={summary.total_visits.toLocaleString('id-ID')}
                    />
                    <MetricCard
                        icon={Timer}
                        label="Total durasi"
                        value={summary.total_duration_label}
                    />
                    <MetricCard
                        icon={UsersRound}
                        label="Karyawan"
                        value={summary.employees.length.toLocaleString('id-ID')}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="size-4" />
                            Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-5">
                        <Input
                            type="date"
                            value={filterState.date}
                            onChange={(event) =>
                                setFilterState({
                                    ...filterState,
                                    date: event.target.value,
                                })
                            }
                        />
                        <Select
                            value={filterState.employee_id}
                            onChange={(value) =>
                                setFilterState({
                                    ...filterState,
                                    employee_id: value,
                                })
                            }
                            options={employees}
                            placeholder="Semua karyawan"
                        />
                        <Select
                            value={filterState.division_id}
                            onChange={(value) =>
                                setFilterState({
                                    ...filterState,
                                    division_id: value,
                                    position_id: '',
                                })
                            }
                            options={divisions}
                            placeholder="Semua divisi"
                        />
                        <Select
                            value={filterState.position_id}
                            onChange={(value) =>
                                setFilterState({
                                    ...filterState,
                                    position_id: value,
                                })
                            }
                            options={filteredPositions}
                            placeholder="Semua posisi"
                        />
                        <Button type="button" onClick={submitFilters}>
                            Terapkan
                        </Button>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Riwayat Harian</CardTitle>
                        <CardDescription>
                            {visits.total} kunjungan pada {filters.date}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-3 py-2">Karyawan</th>
                                    <th className="px-3 py-2">Klien</th>
                                    <th className="px-3 py-2">Clock in</th>
                                    <th className="px-3 py-2">Clock out</th>
                                    <th className="px-3 py-2">Durasi</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visits.data.length ? (
                                    visits.data.map((visit) => (
                                        <tr
                                            key={visit.id}
                                            className="border-b align-top"
                                        >
                                            <td className="px-3 py-3">
                                                <p className="font-medium">
                                                    {visit.employee_label}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {visit.division ?? '-'} ·{' '}
                                                    {visit.position ?? '-'}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3 font-medium">
                                                {visit.client_name}
                                            </td>
                                            <td className="px-3 py-3">
                                                {formatDeviceDateTime(
                                                    visit.clock_in_at,
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {formatDeviceDateTime(
                                                    visit.clock_out_at,
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {visit.duration_label}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant={
                                                        visit.status ===
                                                        'completed'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {statusLabel(visit.status)}
                                                </Badge>
                                            </td>
                                            <td className="max-w-sm px-3 py-3 text-muted-foreground">
                                                {visit.work_description}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-3 py-8 text-center text-muted-foreground"
                                        >
                                            Belum ada kunjungan client.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Route className="size-4" />
                            Rute Kunjungan
                        </CardTitle>
                        <CardDescription>
                            Garis dari titik clock-in ke clock-out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[360px] overflow-hidden rounded-lg border">
                            <MapboxLocationMap
                                center={mapCenter}
                                zoom={12}
                                locations={mapLocations}
                                routeLines={routeLines}
                            />
                        </div>
                        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {summary.employees.map((employee) => (
                                <div
                                    key={employee.employee_id}
                                    className="rounded-lg bg-muted/50 px-3 py-2 text-sm"
                                >
                                    <p className="font-medium">
                                        {employee.employee_label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {employee.total_visits} kunjungan ·{' '}
                                        {employee.total_duration_label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" />
                </span>
            </CardContent>
        </Card>
    );
}

function Select({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder: string;
}) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.id} value={String(option.id)}>
                    {option.label ?? option.name}
                </option>
            ))}
        </select>
    );
}
