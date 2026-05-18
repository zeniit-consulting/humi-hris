import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentProps, FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

    const filterForm = useForm({
        search: filters.search,
        status: filters.status,
    });
    const companyForm = useForm<SubCompanyFormData>(SUB_COMPANY_DEFAULT);
    const locationForm = useForm<LocationFormData>(LOCATION_DEFAULT);

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
    };

    const resetLocationForm = () => {
        setEditingLocation(null);
        locationForm.clearErrors();
        locationForm.setData(LOCATION_DEFAULT);
    };

    const submitLocation = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedCompany) return;

        if (editingLocation) {
            locationForm.put(
                `/hris/sub-companies/${selectedCompany.id}/locations/${editingLocation.id}`,
                {
                    preserveScroll: true,
                    onSuccess: resetLocationForm,
                },
            );
            return;
        }

        locationForm.post(
            `/hris/sub-companies/${selectedCompany.id}/locations`,
            {
                preserveScroll: true,
                onSuccess: resetLocationForm,
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
                    <StatCard label="Sub-company" value={stats.total} />
                    <StatCard label="Aktif" value={stats.active} />
                    <StatCard label="Lokasi Absen" value={stats.locations} />
                    <StatCard
                        label="Karyawan Outsourcing"
                        value={stats.outsourced_employees}
                    />
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <CardTitle>Daftar Sub Company</CardTitle>
                                    <CardDescription>
                                        Kelola perusahaan klien yang menampung
                                        karyawan outsourcing.
                                    </CardDescription>
                                </div>
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

                            <div className="flex flex-wrap gap-2">
                                {subCompanies.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        asChild={link.url !== null}
                                        size="sm"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        disabled={link.url === null}
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveScroll
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </Link>
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => editCompany(selectedCompany)}
                            >
                                <Pencil className="size-4" />
                                Edit Company
                            </Button>
                        ) : null}
                    </CardHeader>
                    <CardContent className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
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

                        <form onSubmit={submitLocation} className="space-y-3">
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="font-semibold">
                                    {editingLocation
                                        ? 'Edit Lokasi'
                                        : 'Tambah Lokasi'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Lokasi aktif dipakai sebagai radius absen
                                    karyawan outsourcing di sub-company ini.
                                </p>
                            </div>
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
                                onChange={(value) =>
                                    locationForm.setData('address', value)
                                }
                                error={locationForm.errors.address}
                            />
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field
                                    id="latitude"
                                    label="Latitude"
                                    type="number"
                                    step="0.0000001"
                                    value={locationForm.data.latitude}
                                    onChange={(value) =>
                                        locationForm.setData('latitude', value)
                                    }
                                    error={locationForm.errors.latitude}
                                    required
                                />
                                <Field
                                    id="longitude"
                                    label="Longitude"
                                    type="number"
                                    step="0.0000001"
                                    value={locationForm.data.longitude}
                                    onChange={(value) =>
                                        locationForm.setData('longitude', value)
                                    }
                                    error={locationForm.errors.longitude}
                                    required
                                />
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
                            <div className="flex justify-between gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetLocationForm}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        !selectedCompany ||
                                        locationForm.processing
                                    }
                                >
                                    <MapPin className="size-4" />
                                    {editingLocation
                                        ? 'Update Lokasi'
                                        : 'Tambah Lokasi'}
                                </Button>
                            </div>
                        </form>
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
        </AppLayout>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card className="gap-2 py-3">
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
