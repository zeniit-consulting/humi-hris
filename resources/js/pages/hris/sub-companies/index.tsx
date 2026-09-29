import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Loader2,
    MapPin,
    Navigation,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentProps, FormEvent } from 'react';
import { geocodeAddress } from '@/lib/geocoding';
import InputError from '@/components/input-error';
import { MapboxLocationMap } from '@/components/mapbox-location-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimplePagination } from '@/components/ui/simple-pagination';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginator<T> = {
    data: T[];
    links: PaginatorLink[];
    total: number;
};

type AttendanceLocation = {
    id: number;
    name: string;
    address: string | null;
    latitude: string;
    longitude: string;
    radius_meters: number;
    is_active: boolean;
};

type SubCompany = {
    id: number;
    code: string;
    name: string;
    contact_person: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
    employees_count: number;
    attendance_locations_count: number;
    attendance_locations: AttendanceLocation[];
};

type PageProps = {
    filters: {
        search: string;
        status: 'all' | 'active' | 'inactive';
    };
    subCompanies: Paginator<SubCompany>;
    stats: {
        total: number;
        active: number;
        locations: number;
        outsourced_employees: number;
    };
};

type SubCompanyFormData = {
    code: string;
    name: string;
    contact_person: string;
    contact_phone: string;
    contact_email: string;
    address: string;
    notes: string;
    is_active: boolean;
};

type LocationFormData = {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    radius_meters: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sub Company', href: '/hris/sub-companies' },
];

const SUB_COMPANY_DEFAULT: SubCompanyFormData = {
    code: '',
    name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    notes: '',
    is_active: true,
};

const LOCATION_DEFAULT: LocationFormData = {
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius_meters: '100',
    is_active: true,
};

const DEFAULT_MAP_CENTER = { latitude: -6.2088, longitude: 106.8456 };

const parseCoordinate = (value: string): number | null => {
    if (!value || value.trim() === '') {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export default function SubCompaniesIndex() {
    const { filters, subCompanies, stats } = usePage<PageProps>().props;
    const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
        subCompanies.data[0]?.id ?? null,
    );
    const [editingCompany, setEditingCompany] = useState<SubCompany | null>(
        null,
    );
    const [editingLocation, setEditingLocation] =
        useState<AttendanceLocation | null>(null);
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [geocodeMessage, setGeocodeMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const filterForm = useForm({
        search: filters.search,
        status: filters.status,
    });
    const companyForm = useForm<SubCompanyFormData>(SUB_COMPANY_DEFAULT);
    const locationForm = useForm<LocationFormData>(LOCATION_DEFAULT);

    const parsedLatitude = parseCoordinate(locationForm.data.latitude);
    const parsedLongitude = parseCoordinate(locationForm.data.longitude);
    const hasCoordinates = parsedLatitude !== null && parsedLongitude !== null;

    const mapCenter = useMemo(() => {
        if (hasCoordinates) {
            return { latitude: parsedLatitude, longitude: parsedLongitude };
        }
        return DEFAULT_MAP_CENTER;
    }, [hasCoordinates, parsedLatitude, parsedLongitude]);

    const selectedMapLocation = useMemo(() => {
        if (!hasCoordinates) {
            return null;
        }
        return { latitude: parsedLatitude, longitude: parsedLongitude };
    }, [hasCoordinates, parsedLatitude, parsedLongitude]);

    const mapLocations = useMemo(() => {
        if (!hasCoordinates) {
            return [];
        }
        return [
            {
                name: locationForm.data.name || 'Lokasi Absen',
                address: locationForm.data.address || null,
                latitude: parsedLatitude,
                longitude: parsedLongitude,
                radiusMeters: Math.max(
                    10,
                    Number(locationForm.data.radius_meters) || 100,
                ),
            },
        ];
    }, [
        hasCoordinates,
        locationForm.data.name,
        locationForm.data.address,
        locationForm.data.radius_meters,
        parsedLatitude,
        parsedLongitude,
    ]);

    const handleMapSelect = async (latitude: number, longitude: number) => {
        locationForm.clearErrors('latitude', 'longitude');
        const latStr = latitude.toFixed(7);
        const lngStr = longitude.toFixed(7);

        locationForm.setData((current) => ({
            ...current,
            latitude: latStr,
            longitude: lngStr,
        }));

        if (!locationForm.data.address || locationForm.data.address.trim() === '') {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                        latStr,
                    )}&lon=${encodeURIComponent(lngStr)}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );
                if (response.ok) {
                    const data = (await response.json()) as {
                        display_name?: string;
                    };
                    if (data.display_name) {
                        locationForm.setData((current) => ({
                            ...current,
                            address: current.address || data.display_name || '',
                        }));
                    }
                }
            } catch {
                // Silently ignore reverse geocode error
            }
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation tidak didukung oleh browser Anda.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                handleMapSelect(
                    position.coords.latitude,
                    position.coords.longitude,
                );
            },
            (error) => {
                setIsLocating(false);
                console.error('Gagal mendapatkan lokasi perangkat:', error);
                alert(
                    'Gagal mendeteksi lokasi saat ini. Pastikan izin lokasi aktif pada browser Anda.',
                );
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const handleTrackAddress = async () => {
        const address = locationForm.data.address?.trim();
        if (!address) {
            setGeocodeMessage({
                type: 'error',
                text: 'Ketik alamat lokasi terlebih dahulu untuk melacak titik di peta.',
            });
            return;
        }

        setIsGeocoding(true);
        setGeocodeMessage(null);

        try {
            const result = await geocodeAddress(address);
            if (result) {
                handleMapSelect(result.latitude, result.longitude);
                setGeocodeMessage({
                    type: 'success',
                    text: 'Titik koordinat berhasil ditemukan dan disematkan di peta.',
                });
            } else {
                setGeocodeMessage({
                    type: 'error',
                    text: 'Alamat tidak ditemukan di peta. Coba perjelas nama jalan, kelurahan, atau kota.',
                });
            }
        } catch {
            setGeocodeMessage({
                type: 'error',
                text: 'Terjadi kesalahan saat melacak alamat. Silakan coba lagi.',
            });
        } finally {
            setIsGeocoding(false);
        }
    };

    const selectedCompany = useMemo(
        () =>
            subCompanies.data.find(
                (company) => company.id === selectedCompanyId,
            ) ??
            subCompanies.data[0] ??
            null,
        [selectedCompanyId, subCompanies.data],
    );

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/hris/sub-companies', filterForm.data, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetCompanyForm = () => {
        setEditingCompany(null);
        companyForm.clearErrors();
        companyForm.setData(SUB_COMPANY_DEFAULT);
    };

    const editCompany = (company: SubCompany) => {
        setCompanyDialogOpen(true);
        setEditingCompany(company);
        companyForm.clearErrors();
        companyForm.setData({
            code: company.code,
            name: company.name,
            contact_person: company.contact_person ?? '',
            contact_phone: company.contact_phone ?? '',
            contact_email: company.contact_email ?? '',
            address: company.address ?? '',
            notes: company.notes ?? '',
            is_active: company.is_active,
        });
    };

    const submitCompany = (event: FormEvent) => {
        event.preventDefault();

        if (editingCompany) {
            companyForm.put(`/hris/sub-companies/${editingCompany.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    resetCompanyForm();
                    setCompanyDialogOpen(false);
                },
            });
            return;
        }

        companyForm.post('/hris/sub-companies', {
            preserveScroll: true,
            onSuccess: () => {
                resetCompanyForm();
                setCompanyDialogOpen(false);
            },
        });
    };

    const deleteCompany = (company: SubCompany) => {
        if (!confirm(`Hapus sub-company ${company.name}?`)) return;
        router.delete(`/hris/sub-companies/${company.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                resetCompanyForm();
                setCompanyDialogOpen(false);
            },
        });
    };

    const editLocation = (location: AttendanceLocation) => {
        setEditingLocation(location);
        locationForm.clearErrors();
        locationForm.setData({
            name: location.name,
            address: location.address ?? '',
            latitude: location.latitude,
            longitude: location.longitude,
            radius_meters: String(location.radius_meters),
            is_active: location.is_active,
        });
        setLocationDialogOpen(true);
    };

    const resetLocationForm = () => {
        setEditingLocation(null);
        locationForm.clearErrors();
        locationForm.setData(LOCATION_DEFAULT);
        setGeocodeMessage(null);
    };

    const openCreateLocationDialog = () => {
        resetLocationForm();
        setLocationDialogOpen(true);
    };

    const closeLocationDialog = () => {
        setLocationDialogOpen(false);
        resetLocationForm();
    };

    const submitLocation = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedCompany) return;

        if (!locationForm.data.latitude || !locationForm.data.longitude) {
            locationForm.setError(
                'latitude',
                'Silakan klik titik lokasi pada peta Mapbox terlebih dahulu.',
            );
            return;
        }

        if (editingLocation) {
            locationForm.put(
                `/hris/sub-companies/${selectedCompany.id}/locations/${editingLocation.id}`,
                {
                    preserveScroll: true,
                    onSuccess: closeLocationDialog,
                },
            );
            return;
        }

        locationForm.post(
            `/hris/sub-companies/${selectedCompany.id}/locations`,
            {
                preserveScroll: true,
                onSuccess: closeLocationDialog,
            },
        );
    };

    const deleteLocation = (location: AttendanceLocation) => {
        if (!selectedCompany) return;
        if (!confirm(`Hapus lokasi ${location.name}?`)) return;

        router.delete(
            `/hris/sub-companies/${selectedCompany.id}/locations/${location.id}`,
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sub Company" />

            <div className="space-y-6 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                        label="Sub-company"
                        value={stats.total}
                        tone="sky"
                    />
                    <StatCard
                        label="Aktif"
                        value={stats.active}
                        tone="emerald"
                    />
                    <StatCard
                        label="Lokasi Absen"
                        value={stats.locations}
                        tone="amber"
                    />
                    <StatCard
                        label="Karyawan Outsourcing"
                        value={stats.outsourced_employees}
                        tone="violet"
                    />
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>Daftar Sub Company</CardTitle>
                                    <CardDescription>
                                        Kelola perusahaan klien yang menampung
                                        karyawan outsourcing.
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <SimplePagination data={subCompanies} />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            resetCompanyForm();
                                            setCompanyDialogOpen(true);
                                        }}
                                    >
                                        <Plus className="size-4" />
                                        Tambah Sub Company
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form
                                onSubmit={submitFilters}
                                className="grid gap-3 md:grid-cols-[1fr_180px_auto]"
                            >
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={filterForm.data.search}
                                        onChange={(event) =>
                                            filterForm.setData(
                                                'search',
                                                event.target.value,
                                            )
                                        }
                                        className="pl-9"
                                        placeholder="Cari kode, nama, kontak"
                                    />
                                </div>
                                <select
                                    value={filterForm.data.status}
                                    onChange={(event) =>
                                        filterForm.setData(
                                            'status',
                                            event.target
                                                .value as PageProps['filters']['status'],
                                        )
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                >
                                    <option value="all">Semua status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                                <Button type="submit">Filter</Button>
                            </form>

                            {subCompanies.data.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Belum ada sub-company yang cocok dengan
                                    filter.
                                </div>
                            ) : (
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    Sub Company
                                                </TableHead>
                                                <TableHead>PIC</TableHead>
                                                <TableHead>Alamat</TableHead>
                                                <TableHead className="text-right">
                                                    Karyawan
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Lokasi
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-[96px] text-right">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subCompanies.data.map(
                                                (company) => (
                                                    <TableRow
                                                        key={company.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-selected={
                                                            selectedCompany?.id ===
                                                            company.id
                                                        }
                                                        className={
                                                            selectedCompany?.id ===
                                                            company.id
                                                                ? 'bg-primary/5'
                                                                : undefined
                                                        }
                                                        onClick={() =>
                                                            setSelectedCompanyId(
                                                                company.id,
                                                            )
                                                        }
                                                        onKeyDown={(event) => {
                                                            if (
                                                                event.key ===
                                                                    'Enter' ||
                                                                event.key ===
                                                                    ' '
                                                            ) {
                                                                event.preventDefault();
                                                                setSelectedCompanyId(
                                                                    company.id,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <div className="min-w-56">
                                                                <p className="font-semibold">
                                                                    {
                                                                        company.code
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        company.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Klik baris
                                                                    untuk kelola
                                                                    lokasi
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="min-w-44">
                                                                <p>
                                                                    {company.contact_person ||
                                                                        'Tanpa PIC'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {company.contact_phone ||
                                                                        company.contact_email ||
                                                                        '-'}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[320px] truncate text-muted-foreground">
                                                            {company.address ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {
                                                                company.employees_count
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {
                                                                company.attendance_locations_count
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    company.is_active
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                            >
                                                                {company.is_active
                                                                    ? 'Aktif'
                                                                    : 'Nonaktif'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        editCompany(
                                                                            company,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle>Lokasi Absensi Sub Company</CardTitle>
                            <CardDescription>
                                {selectedCompany
                                    ? `${selectedCompany.code} - ${selectedCompany.name}`
                                    : 'Pilih sub-company untuk mengelola lokasi.'}
                            </CardDescription>
                        </div>
                        {selectedCompany ? (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => editCompany(selectedCompany)}
                                >
                                    <Pencil className="size-4" />
                                    Edit Company
                                </Button>
                                <Button
                                    type="button"
                                    onClick={openCreateLocationDialog}
                                >
                                    <Plus className="size-4" />
                                    Tambah Lokasi
                                </Button>
                            </div>
                        ) : null}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {!selectedCompany ? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Pilih sub-company terlebih dahulu.
                                </div>
                            ) : selectedCompany.attendance_locations.length ===
                              0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Belum ada lokasi absensi untuk sub-company
                                    ini.
                                </div>
                            ) : (
                                selectedCompany.attendance_locations.map(
                                    (location) => (
                                        <div
                                            key={location.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">
                                                        {location.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {location.address ||
                                                            '-'}
                                                    </p>
                                                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                                                        {location.latitude},{' '}
                                                        {location.longitude} ·{' '}
                                                        {location.radius_meters}{' '}
                                                        m
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge
                                                        variant={
                                                            location.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {location.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            editLocation(
                                                                location,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            deleteLocation(
                                                                location,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={companyDialogOpen}
                onOpenChange={(open) => {
                    setCompanyDialogOpen(open);
                    if (!open) {
                        resetCompanyForm();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCompany
                                ? 'Edit Sub Company'
                                : 'Tambah Sub Company'}
                        </DialogTitle>
                        <DialogDescription>
                            Karyawan dengan `sub_company_id` kosong dianggap
                            karyawan internal.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCompany} className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field
                                id="code"
                                label="Kode"
                                value={companyForm.data.code}
                                onChange={(value) =>
                                    companyForm.setData('code', value)
                                }
                                error={companyForm.errors.code}
                                required
                            />
                            <Field
                                id="name"
                                label="Nama perusahaan"
                                value={companyForm.data.name}
                                onChange={(value) =>
                                    companyForm.setData('name', value)
                                }
                                error={companyForm.errors.name}
                                required
                            />
                            <Field
                                id="contact_person"
                                label="PIC"
                                value={companyForm.data.contact_person}
                                onChange={(value) =>
                                    companyForm.setData('contact_person', value)
                                }
                                error={companyForm.errors.contact_person}
                            />
                            <Field
                                id="contact_phone"
                                label="Telepon PIC"
                                value={companyForm.data.contact_phone}
                                onChange={(value) =>
                                    companyForm.setData('contact_phone', value)
                                }
                                error={companyForm.errors.contact_phone}
                            />
                        </div>
                        <Field
                            id="contact_email"
                            label="Email PIC"
                            type="email"
                            value={companyForm.data.contact_email}
                            onChange={(value) =>
                                companyForm.setData('contact_email', value)
                            }
                            error={companyForm.errors.contact_email}
                        />
                        <TextareaField
                            id="address"
                            label="Alamat"
                            value={companyForm.data.address}
                            onChange={(value) =>
                                companyForm.setData('address', value)
                            }
                            error={companyForm.errors.address}
                        />
                        <TextareaField
                            id="notes"
                            label="Catatan"
                            value={companyForm.data.notes}
                            onChange={(value) =>
                                companyForm.setData('notes', value)
                            }
                            error={companyForm.errors.notes}
                        />
                        <CheckboxField
                            id="company_active"
                            label="Sub-company aktif"
                            checked={companyForm.data.is_active}
                            onChange={(checked) =>
                                companyForm.setData('is_active', checked)
                            }
                        />
                        <div className="flex flex-wrap justify-between gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetCompanyForm}
                            >
                                Reset
                            </Button>
                            <div className="flex gap-2">
                                {editingCompany ? (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() =>
                                            deleteCompany(editingCompany)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                        Hapus
                                    </Button>
                                ) : null}
                                <Button
                                    type="submit"
                                    disabled={companyForm.processing}
                                >
                                    {editingCompany ? (
                                        <Pencil className="size-4" />
                                    ) : (
                                        <Plus className="size-4" />
                                    )}
                                    {editingCompany ? 'Update' : 'Tambah'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={locationDialogOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setLocationDialogOpen(true);
                    } else {
                        closeLocationDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi'}
                        </DialogTitle>
                        <DialogDescription>
                            Lokasi aktif dipakai sebagai radius absen karyawan
                            outsourcing di sub-company ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitLocation} className="space-y-3">
                        <Field
                            id="location_name"
                            label="Nama lokasi"
                            value={locationForm.data.name}
                            onChange={(value) =>
                                locationForm.setData('name', value)
                            }
                            error={locationForm.errors.name}
                            required
                        />
                        <TextareaField
                            id="location_address"
                            label="Alamat lokasi"
                            value={locationForm.data.address}
                            onChange={(value) => {
                                locationForm.setData('address', value);
                                setGeocodeMessage(null);
                            }}
                            error={locationForm.errors.address}
                        />
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <Label className="text-sm font-medium">
                                        Titik Lokasi Absen (Peta Mapbox){' '}
                                        <span className="text-rose-500">*</span>
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Klik kursor pada peta atau gunakan tombol di samping untuk menentukan titik koordinat lokasi absen.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTrackAddress}
                                        disabled={isGeocoding}
                                        className="h-8 gap-1.5 text-xs"
                                    >
                                        {isGeocoding ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Search className="size-3.5" />
                                        )}
                                        {isGeocoding ? 'Melacak...' : 'Lacak dari Alamat'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isLocating}
                                        className="h-8 gap-1.5 text-xs"
                                    >
                                        {isLocating ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Navigation className="size-3.5" />
                                        )}
                                        {isLocating ? 'Mencari...' : 'Lokasi Saya'}
                                    </Button>
                                </div>
                            </div>

                            {geocodeMessage ? (
                                <p
                                    className={`text-xs ${
                                        geocodeMessage.type === 'success'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                    }`}
                                >
                                    {geocodeMessage.text}
                                </p>
                            ) : null}

                            <div className="overflow-hidden rounded-lg border bg-muted/20">
                                <MapboxLocationMap
                                    center={mapCenter}
                                    zoom={hasCoordinates ? 16 : 5}
                                    className="h-72 w-full"
                                    locations={mapLocations}
                                    selectedLocation={selectedMapLocation}
                                    autoCenter={selectedMapLocation}
                                    onSelect={handleMapSelect}
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <MapPin className="size-3.5 text-primary shrink-0" />
                                    <span>Titik Koordinat:</span>
                                </div>
                                {hasCoordinates ? (
                                    <div className="flex items-center gap-3 font-mono text-xs font-semibold text-foreground">
                                        <span>Lat: {locationForm.data.latitude}</span>
                                        <span className="text-muted-foreground/50">|</span>
                                        <span>Lng: {locationForm.data.longitude}</span>
                                    </div>
                                ) : (
                                    <span className="italic text-amber-600 dark:text-amber-400">
                                        Belum dipilih (klik kursor pada peta)
                                    </span>
                                )}
                            </div>

                            {(locationForm.errors.latitude ||
                                locationForm.errors.longitude) && (
                                <InputError
                                    message={
                                        locationForm.errors.latitude ||
                                        locationForm.errors.longitude ||
                                        'Titik koordinat lokasi wajib dipilih pada peta.'
                                    }
                                />
                            )}
                        </div>
                        <Field
                            id="radius_meters"
                            label="Radius meter"
                            type="number"
                            min="10"
                            value={locationForm.data.radius_meters}
                            onChange={(value) =>
                                locationForm.setData('radius_meters', value)
                            }
                            error={locationForm.errors.radius_meters}
                            required
                        />
                        <CheckboxField
                            id="location_active"
                            label="Lokasi aktif"
                            checked={locationForm.data.is_active}
                            onChange={(checked) =>
                                locationForm.setData('is_active', checked)
                            }
                        />
                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeLocationDialog}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !selectedCompany || locationForm.processing
                                }
                            >
                                <MapPin className="size-4" />
                                {editingLocation
                                    ? 'Update Lokasi'
                                    : 'Tambah Lokasi'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function StatCard({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'sky' | 'emerald' | 'amber' | 'violet';
}) {
    const styles = {
        sky: 'border-sky-200 bg-sky-50/70 dark:border-sky-950 dark:bg-sky-950/25',
        emerald:
            'border-emerald-200 bg-emerald-50/70 dark:border-emerald-950 dark:bg-emerald-950/25',
        amber: 'border-amber-200 bg-amber-50/70 dark:border-amber-950 dark:bg-amber-950/25',
        violet: 'border-violet-200 bg-violet-50/70 dark:border-violet-950 dark:bg-violet-950/25',
    }[tone];
    return (
        <Card className={`gap-2 py-3 ${styles}`}>
            <CardHeader className="px-4 pb-0">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Building2 className="size-5 text-primary" />
                    {value}
                </CardTitle>
            </CardHeader>
        </Card>
    );
}

function Field({
    id,
    label,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    ...props
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    required?: boolean;
} & Omit<ComponentProps<typeof Input>, 'onChange' | 'value' | 'id'>) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                {...props}
            />
            <InputError message={error} />
        </div>
    );
}

function TextareaField({
    id,
    label,
    value,
    onChange,
    error,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <textarea
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <InputError message={error} />
        </div>
    );
}

function CheckboxField({
    id,
    label,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(value) => onChange(value === true)}
            />
            <Label htmlFor={id}>{label}</Label>
            {checked ? <CheckCircle2 className="size-4 text-primary" /> : null}
        </div>
    );
}
