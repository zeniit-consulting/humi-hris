import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ImagePlus,
    LoaderCircle,
    MapPin,
    Plus,
    Trash2,
    Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CompanySettingController from '@/actions/App/Http/Controllers/Settings/CompanySettingController';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { MapboxLocationMap } from '@/components/mapbox-location-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan profil',
        href: edit(),
    },
];

const defaultMapCenter: [number, number] = [-2.548926, 118.0148634];

const parseCoordinate = (value: string): number | null => {
    if (value.trim() === '') {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
};

type LocationMapPickerProps = {
    latitude: string;
    longitude: string;
    onSelect: (latitude: number, longitude: number) => void;
};

function LocationMapPicker({
    latitude,
    longitude,
    onSelect,
}: LocationMapPickerProps) {
    const parsedLatitude = parseCoordinate(latitude);
    const parsedLongitude = parseCoordinate(longitude);
    const hasSelectedPoint =
        parsedLatitude !== null && parsedLongitude !== null;
    const center: [number, number] = hasSelectedPoint
        ? [parsedLatitude, parsedLongitude]
        : defaultMapCenter;

    const selectedLocation = hasSelectedPoint
        ? { latitude: parsedLatitude, longitude: parsedLongitude }
        : null;

    return (
        <MapboxLocationMap
            center={{ latitude: center[0], longitude: center[1] }}
            zoom={hasSelectedPoint ? 16 : 5}
            className="h-80 w-full"
            selectedLocation={selectedLocation}
            autoCenter={selectedLocation}
            onSelect={onSelect}
        />
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
    company,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    company: {
        name: string;
        details: string | null;
        portal_kasbon_enabled: boolean;
        employee_activation_otp_enabled: boolean;
        logo_url: string | null;
        location_name: string | null;
        location_address: string | null;
        location_latitude: string | number | null;
        location_longitude: string | number | null;
        attendance_radius_meters: number;
        attendance_locations: Array<{
            name: string;
            address: string | null;
            latitude: string | number;
            longitude: string | number;
            radius_meters: number;
        }>;
        overtime_hour_divisor: number;
        overtime_multiplier_hour1: number;
        overtime_multiplier_subsequent: number;
    };
}) {
    const { auth } = usePage().props;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        (auth.user.avatar as string | null | undefined) ?? null,
    );
    const [logoPreview, setLogoPreview] = useState<string | null>(
        company.logo_url,
    );
    const [primaryLocation, setPrimaryLocation] = useState({
        address: company.location_address ?? '',
        latitude:
            company.location_latitude !== null &&
            company.location_latitude !== undefined
                ? String(company.location_latitude)
                : '',
        longitude:
            company.location_longitude !== null &&
            company.location_longitude !== undefined
                ? String(company.location_longitude)
                : '',
    });
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
    const [reverseGeocodeError, setReverseGeocodeError] = useState<
        string | null
    >(null);
    const [attendanceLocations, setAttendanceLocations] = useState(
        company.attendance_locations.length > 0
            ? company.attendance_locations
            : [
                  {
                      name: '',
                      address: '',
                      latitude: '',
                      longitude: '',
                      radius_meters: company.attendance_radius_meters ?? 100,
                  },
              ],
    );
    const avatarPreviewRef = useRef<string | null>(null);
    const uploadedPreviewRef = useRef<string | null>(null);
    const reverseGeocodeRequestRef = useRef(0);

    useEffect(() => {
        return () => {
            if (avatarPreviewRef.current) {
                URL.revokeObjectURL(avatarPreviewRef.current);
            }
            if (uploadedPreviewRef.current) {
                URL.revokeObjectURL(uploadedPreviewRef.current);
            }
        };
    }, []);

    const handlePrimaryLocationSelect = async (
        latitude: number,
        longitude: number,
    ) => {
        const requestId = reverseGeocodeRequestRef.current + 1;
        reverseGeocodeRequestRef.current = requestId;
        const nextLatitude = latitude.toFixed(7);
        const nextLongitude = longitude.toFixed(7);

        setPrimaryLocation((current) => ({
            ...current,
            latitude: nextLatitude,
            longitude: nextLongitude,
        }));
        setReverseGeocodeError(null);
        setIsResolvingAddress(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                    nextLatitude,
                )}&lon=${encodeURIComponent(nextLongitude)}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Reverse geocoding failed.');
            }

            const payload = (await response.json()) as {
                display_name?: string;
            };
            const address = payload.display_name?.trim();

            if (reverseGeocodeRequestRef.current !== requestId) {
                return;
            }

            if (address) {
                setPrimaryLocation((current) => ({
                    ...current,
                    address,
                }));
            } else {
                setReverseGeocodeError(
                    'Alamat tidak ditemukan. Koordinat sudah terisi, alamat bisa diisi manual.',
                );
            }
        } catch {
            if (reverseGeocodeRequestRef.current === requestId) {
                setReverseGeocodeError(
                    'Alamat otomatis gagal dimuat. Koordinat sudah terisi, alamat bisa diisi manual.',
                );
            }
        } finally {
            if (reverseGeocodeRequestRef.current === requestId) {
                setIsResolvingAddress(false);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan profil" />

            <h1 className="sr-only">Pengaturan profil</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Informasi profil"
                        description="Perbarui nama, alamat email, dan nomor WhatsApp Anda"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-3">
                                    <Label htmlFor="avatar">Foto profil</Label>

                                    <div className="flex items-center gap-4 rounded-lg border bg-slate-50/60 p-4">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Pratinjau avatar"
                                                className="size-16 rounded-full border object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-16 items-center justify-center rounded-full border bg-white">
                                                <ImagePlus className="size-5 text-slate-400" />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="avatar"
                                                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                                            >
                                                <Upload className="size-4" />
                                                Upload avatar
                                            </label>
                                            <input
                                                id="avatar"
                                                name="avatar"
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(event) => {
                                                    const file =
                                                        event.target.files?.[0];

                                                    if (
                                                        avatarPreviewRef.current
                                                    ) {
                                                        URL.revokeObjectURL(
                                                            avatarPreviewRef.current,
                                                        );
                                                        avatarPreviewRef.current =
                                                            null;
                                                    }

                                                    if (!file) {
                                                        setAvatarPreview(
                                                            (auth.user
                                                                .avatar as
                                                                | string
                                                                | null
                                                                | undefined) ??
                                                                null,
                                                        );
                                                        return;
                                                    }

                                                    const previewUrl =
                                                        URL.createObjectURL(
                                                            file,
                                                        );
                                                    avatarPreviewRef.current =
                                                        previewUrl;
                                                    setAvatarPreview(
                                                        previewUrl,
                                                    );
                                                }}
                                            />

                                            <p className="text-xs text-slate-500">
                                                PNG/JPG/WEBP, maksimum 2MB.
                                            </p>

                                            {(auth.user.avatar as
                                                | string
                                                | null
                                                | undefined) ? (
                                                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                                    <input
                                                        type="checkbox"
                                                        name="remove_avatar"
                                                        value="1"
                                                        onChange={(event) => {
                                                            if (
                                                                event.target
                                                                    .checked
                                                            ) {
                                                                if (
                                                                    avatarPreviewRef.current
                                                                ) {
                                                                    URL.revokeObjectURL(
                                                                        avatarPreviewRef.current,
                                                                    );
                                                                    avatarPreviewRef.current =
                                                                        null;
                                                                }
                                                                setAvatarPreview(
                                                                    null,
                                                                );
                                                            } else {
                                                                setAvatarPreview(
                                                                    (auth.user
                                                                        .avatar as
                                                                        | string
                                                                        | null
                                                                        | undefined) ??
                                                                        null,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    Hapus avatar saat simpan
                                                </label>
                                            ) : null}
                                        </div>
                                    </div>

                                    <InputError
                                        className="mt-2"
                                        message={errors.avatar}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="flex items-start gap-3 rounded-lg border bg-slate-50/60 p-4">
                                    <input
                                        id="portal_kasbon_enabled"
                                        name="portal_kasbon_enabled"
                                        type="checkbox"
                                        value="1"
                                        defaultChecked={company.portal_kasbon_enabled}
                                        className="mt-1 size-4 rounded border-input accent-primary"
                                    />
                                    <div>
                                        <Label htmlFor="portal_kasbon_enabled">
                                            Tampilkan Kasbon di Portal Karyawan
                                        </Label>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Jika dimatikan, menu, halaman, dan API Kasbon tidak dapat diakses karyawan.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-lg border bg-slate-50/60 p-4">
                                    <input
                                        id="employee_activation_otp_enabled"
                                        name="employee_activation_otp_enabled"
                                        type="checkbox"
                                        value="1"
                                        defaultChecked={company.employee_activation_otp_enabled}
                                        className="mt-1 size-4 rounded border-input accent-primary"
                                    />
                                    <div>
                                        <Label htmlFor="employee_activation_otp_enabled">
                                            Wajibkan OTP Aktivasi Karyawan
                                        </Label>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Jika dimatikan, karyawan dapat langsung masuk menggunakan kredensial dari email undangan.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Alamat email</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Alamat email"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        Nomor WhatsApp
                                    </Label>

                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="mt-1 block w-full"
                                        defaultValue={
                                            (auth.user.phone as
                                                | string
                                                | null
                                                | undefined) ?? ''
                                        }
                                        name="phone"
                                        required
                                        autoComplete="tel"
                                        placeholder="081234567890"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.phone}
                                    />

                                    {(auth.user.phone_verified_at as
                                        | string
                                        | null
                                        | undefined) === null ? (
                                        <p className="text-sm text-amber-600">
                                            Nomor WhatsApp belum terverifikasi.
                                        </p>
                                    ) : null}
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Alamat email Anda belum
                                                terverifikasi.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Klik di sini untuk mengirim
                                                    ulang verifikasi email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Tautan verifikasi baru telah
                                                    dikirim ke alamat email
                                                    Anda.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Tersimpan
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>

                    <Heading
                        variant="small"
                        title="Informasi perusahaan"
                        description="Perbarui nama dan detail perusahaan"
                    />

                    <Form
                        {...CompanySettingController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="company_name">
                                        Nama perusahaan
                                    </Label>

                                    <Input
                                        id="company_name"
                                        className="mt-1 block w-full"
                                        defaultValue={company.name}
                                        name="name"
                                        required
                                        placeholder="Nama perusahaan"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="company_details">
                                        Detail perusahaan
                                    </Label>

                                    <textarea
                                        id="company_details"
                                        className="mt-1 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        defaultValue={company.details ?? ''}
                                        name="details"
                                        placeholder="Alamat, NPWP, kontak, atau detail perusahaan lainnya"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.details}
                                    />
                                </div>

                                <div className="rounded-lg border bg-slate-50/60 p-4">
                                    <div className="mb-4 flex items-center gap-2">
                                        <MapPin className="size-4 text-slate-600" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                Lokasi perusahaan
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Lokasi utama kantor dan radius
                                                default attendance.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="location_name">
                                                Nama lokasi utama
                                            </Label>
                                            <Input
                                                id="location_name"
                                                name="location_name"
                                                defaultValue={
                                                    company.location_name ?? ''
                                                }
                                                placeholder="Kantor pusat"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.location_name}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="attendance_radius_meters">
                                                Radius default attendance
                                                (meter)
                                            </Label>
                                            <Input
                                                id="attendance_radius_meters"
                                                name="attendance_radius_meters"
                                                type="number"
                                                min="10"
                                                defaultValue={String(
                                                    company.attendance_radius_meters ??
                                                        100,
                                                )}
                                                placeholder="100"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={
                                                    errors.attendance_radius_meters
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="location_address">
                                                Alamat lokasi utama
                                            </Label>
                                            <textarea
                                                id="location_address"
                                                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={primaryLocation.address}
                                                name="location_address"
                                                onChange={(event) =>
                                                    setPrimaryLocation(
                                                        (current) => ({
                                                            ...current,
                                                            address:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                placeholder="Alamat kantor pusat"
                                            />
                                            {isResolvingAddress ? (
                                                <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                                                    <LoaderCircle className="size-3 animate-spin" />
                                                    Mengambil alamat dari titik
                                                    map...
                                                </p>
                                            ) : null}
                                            {reverseGeocodeError ? (
                                                <p className="text-xs text-amber-600">
                                                    {reverseGeocodeError}
                                                </p>
                                            ) : null}
                                            <InputError
                                                className="mt-2"
                                                message={
                                                    errors.location_address
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-3 md:col-span-2">
                                            <input
                                                type="hidden"
                                                name="location_latitude"
                                                value={primaryLocation.latitude}
                                            />
                                            <input
                                                type="hidden"
                                                name="location_longitude"
                                                value={
                                                    primaryLocation.longitude
                                                }
                                            />

                                            <div>
                                                <Label>
                                                    Pilih titik lokasi di map
                                                </Label>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Klik pada map untuk mengisi
                                                    latitude, longitude, dan
                                                    alamat lokasi utama secara
                                                    otomatis.
                                                </p>
                                            </div>

                                            <div className="overflow-hidden rounded-lg border bg-white">
                                                <LocationMapPicker
                                                    latitude={
                                                        primaryLocation.latitude
                                                    }
                                                    longitude={
                                                        primaryLocation.longitude
                                                    }
                                                    onSelect={
                                                        handlePrimaryLocationSelect
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-3 rounded-md border bg-white p-3 text-sm md:grid-cols-2">
                                                <div>
                                                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                        Latitude
                                                    </p>
                                                    <p className="mt-1 font-mono text-slate-900">
                                                        {primaryLocation.latitude ||
                                                            'Belum dipilih'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                        Longitude
                                                    </p>
                                                    <p className="mt-1 font-mono text-slate-900">
                                                        {primaryLocation.longitude ||
                                                            'Belum dipilih'}
                                                    </p>
                                                </div>
                                            </div>

                                            <InputError
                                                className="mt-2"
                                                message={
                                                    errors.location_latitude
                                                }
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={
                                                    errors.location_longitude
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                Multi-location attendance
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Tambahkan beberapa titik absensi
                                                dengan radius maksimal
                                                masing-masing.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setAttendanceLocations(
                                                    (current) => [
                                                        ...current,
                                                        {
                                                            name: '',
                                                            address: '',
                                                            latitude: '',
                                                            longitude: '',
                                                            radius_meters:
                                                                company.attendance_radius_meters ??
                                                                100,
                                                        },
                                                    ],
                                                )
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Tambah Lokasi
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {attendanceLocations.map(
                                            (location, index) => (
                                                <div
                                                    key={`attendance-location-${index}`}
                                                    className="rounded-md border bg-slate-50/60 p-4"
                                                >
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <p className="text-sm font-medium text-slate-800">
                                                            Lokasi #{index + 1}
                                                        </p>
                                                        {attendanceLocations.length >
                                                        1 ? (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setAttendanceLocations(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current.filter(
                                                                                (
                                                                                    _item,
                                                                                    currentIndex,
                                                                                ) =>
                                                                                    currentIndex !==
                                                                                    index,
                                                                            ),
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Hapus
                                                            </Button>
                                                        ) : null}
                                                    </div>

                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Nama lokasi
                                                            </Label>
                                                            <Input
                                                                name={`attendance_locations[${index}][name]`}
                                                                value={
                                                                    location.name
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setAttendanceLocations(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current.map(
                                                                                (
                                                                                    item,
                                                                                    currentIndex,
                                                                                ) =>
                                                                                    currentIndex ===
                                                                                    index
                                                                                        ? {
                                                                                              ...item,
                                                                                              name: event
                                                                                                  .target
                                                                                                  .value,
                                                                                          }
                                                                                        : item,
                                                                            ),
                                                                    )
                                                                }
                                                                placeholder="Cabang Jakarta"
                                                            />
                                                            <InputError
                                                                className="mt-2"
                                                                message={
                                                                    errors[
                                                                        `attendance_locations.${index}.name` as never
                                                                    ]
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Radius meter
                                                            </Label>
                                                            <Input
                                                                name={`attendance_locations[${index}][radius_meters]`}
                                                                type="number"
                                                                min="10"
                                                                value={String(
                                                                    location.radius_meters,
                                                                )}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setAttendanceLocations(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current.map(
                                                                                (
                                                                                    item,
                                                                                    currentIndex,
                                                                                ) =>
                                                                                    currentIndex ===
                                                                                    index
                                                                                        ? {
                                                                                              ...item,
                                                                                              radius_meters:
                                                                                                  Number(
                                                                                                      event
                                                                                                          .target
                                                                                                          .value ||
                                                                                                          0,
                                                                                                  ),
                                                                                          }
                                                                                        : item,
                                                                            ),
                                                                    )
                                                                }
                                                                placeholder="100"
                                                            />
                                                            <InputError
                                                                className="mt-2"
                                                                message={
                                                                    errors[
                                                                        `attendance_locations.${index}.radius_meters` as never
                                                                    ]
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2 md:col-span-2">
                                                            <Label>
                                                                Alamat
                                                            </Label>
                                                            <textarea
                                                                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                                name={`attendance_locations[${index}][address]`}
                                                                value={
                                                                    location.address ??
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setAttendanceLocations(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current.map(
                                                                                (
                                                                                    item,
                                                                                    currentIndex,
                                                                                ) =>
                                                                                    currentIndex ===
                                                                                    index
                                                                                        ? {
                                                                                              ...item,
                                                                                              address:
                                                                                                  event
                                                                                                      .target
                                                                                                      .value,
                                                                                          }
                                                                                        : item,
                                                                            ),
                                                                    )
                                                                }
                                                                placeholder="Alamat lokasi attendance"
                                                            />
                                                            <InputError
                                                                className="mt-2"
                                                                message={
                                                                    errors[
                                                                        `attendance_locations.${index}.address` as never
                                                                    ]
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Latitude
                                                            </Label>
                                                            <Input
                                                                name={`attendance_locations[${index}][latitude]`}
                                                                type="number"
                                                                step="0.0000001"
                                                                value={String(
                                                                    location.latitude ??
                                                                        '',
                                                                )}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setAttendanceLocations(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current.map(
                                                                                (
                                                                                    item,
                                                                                    currentIndex,
                                                                                ) =>
                                                                                    currentIndex ===
                                                                                    index
                                                                                        ? {
                                                                                              ...item,
                                                                                              latitude:
                                                                                                  event
                                                                                                      .target
                                                                                                      .value,
                                                                                          }
                                                                                        : item,
                                                                            ),
                                                                    )
                                                                }
                                                                placeholder="-6.2000000"
                                                            />
                                                            <InputError
                                                                className="mt-2"
                                                                message={
                                                                    errors[
                                                                        `attendance_locations.${index}.latitude` as never
                                                                    ]
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Longitude
                                                            </Label>
                                                            <Input
                                                                name={`attendance_locations[${index}][longitude]`}
                                                                type="number"
                                                                step="0.0000001"
                                                                value={String(
                                                                    location.longitude ??
                                                                        '',
                                                                )}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setAttendanceLocations(
                                                                        (
                                                                            current,
                                                                        ) =>
                                                                            current.map(
                                                                                (
                                                                                    item,
                                                                                    currentIndex,
                                                                                ) =>
                                                                                    currentIndex ===
                                                                                    index
                                                                                        ? {
                                                                                              ...item,
                                                                                              longitude:
                                                                                                  event
                                                                                                      .target
                                                                                                      .value,
                                                                                          }
                                                                                        : item,
                                                                            ),
                                                                    )
                                                                }
                                                                placeholder="106.8166667"
                                                            />
                                                            <InputError
                                                                className="mt-2"
                                                                message={
                                                                    errors[
                                                                        `attendance_locations.${index}.longitude` as never
                                                                    ]
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="company_logo">
                                        Logo perusahaan
                                    </Label>

                                    <label
                                        htmlFor="company_logo"
                                        className="block cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100"
                                    >
                                        <input
                                            id="company_logo"
                                            name="logo"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={(event) => {
                                                const file =
                                                    event.target.files?.[0];

                                                if (!file) {
                                                    if (
                                                        uploadedPreviewRef.current
                                                    ) {
                                                        URL.revokeObjectURL(
                                                            uploadedPreviewRef.current,
                                                        );
                                                        uploadedPreviewRef.current =
                                                            null;
                                                    }
                                                    setLogoPreview(
                                                        company.logo_url,
                                                    );
                                                    return;
                                                }

                                                if (
                                                    uploadedPreviewRef.current
                                                ) {
                                                    URL.revokeObjectURL(
                                                        uploadedPreviewRef.current,
                                                    );
                                                }

                                                const previewUrl =
                                                    URL.createObjectURL(file);
                                                uploadedPreviewRef.current =
                                                    previewUrl;
                                                setLogoPreview(previewUrl);
                                            }}
                                        />

                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                                                <Upload className="size-5 text-slate-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-slate-800">
                                                    Klik untuk upload atau drag
                                                    file logo
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    PNG/JPG/WEBP. Akan
                                                    dikonversi ke WEBP dan
                                                    dikompres maks 150KB.
                                                </p>
                                            </div>
                                        </div>
                                    </label>

                                    <div className="rounded-md border bg-white p-3">
                                        <p className="mb-2 text-xs text-muted-foreground">
                                            Preview logo aktif
                                        </p>
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Pratinjau logo perusahaan"
                                                className="h-16 w-16 rounded-md border object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-slate-50">
                                                <ImagePlus className="size-5 text-slate-400" />
                                            </div>
                                        )}
                                    </div>

                                    <InputError
                                        className="mt-2"
                                        message={errors.logo}
                                    />
                                </div>

                                <div className="rounded-lg border bg-slate-50/60 p-4">
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-slate-900">
                                            Pengaturan Lembur
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Konfigurasi perhitungan upah lembur
                                            karyawan sesuai regulasi.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="overtime_hour_divisor">
                                                Pembagi Jam (Divisor)
                                            </Label>
                                            <Input
                                                id="overtime_hour_divisor"
                                                name="overtime_hour_divisor"
                                                type="number"
                                                min="1"
                                                defaultValue={String(
                                                    company.overtime_hour_divisor ??
                                                        173,
                                                )}
                                                placeholder="173"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Gaji per jam = Gaji Pokok
                                                &divide; Divisor. Standar
                                                Kemnaker: 173 jam/bulan.
                                            </p>
                                            <InputError
                                                className="mt-2"
                                                message={
                                                    errors.overtime_hour_divisor
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="overtime_multiplier_hour1">
                                                Multiplier Jam Pertama
                                            </Label>
                                            <Input
                                                id="overtime_multiplier_hour1"
                                                name="overtime_multiplier_hour1"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                defaultValue={String(
                                                    company.overtime_multiplier_hour1 ??
                                                        1.5,
                                                )}
                                                placeholder="1.5"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Upah lembur jam pertama.
                                                Standar: 1,5x.
                                            </p>
                                            <InputError
                                                className="mt-2"
                                                message={
                                                    errors.overtime_multiplier_hour1
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="overtime_multiplier_subsequent">
                                                Multiplier Jam Selanjutnya
                                            </Label>
                                            <Input
                                                id="overtime_multiplier_subsequent"
                                                name="overtime_multiplier_subsequent"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                defaultValue={String(
                                                    company.overtime_multiplier_subsequent ??
                                                        2.0,
                                                )}
                                                placeholder="2.0"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Upah lembur jam ke-2 dan
                                                seterusnya. Standar: 2x.
                                            </p>
                                            <InputError
                                                className="mt-2"
                                                message={
                                                    errors.overtime_multiplier_subsequent
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>
                                        Simpan Perusahaan
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Tersimpan
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
