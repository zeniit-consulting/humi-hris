import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapboxLocationMap } from '@/components/mapbox-location-map';
import {
    notifyPortal,
    notifyPortalAfterRedirect,
    localDateString,
    requestApi,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type PortalSummary = {
    today: { date: string; formatted: string };
    employee: { id: number } | null;
    shift_options: Array<{
        id: number;
        code: string;
        name: string;
        start_time: string | null;
        end_time: string | null;
        is_day_off: boolean;
    }>;
    quick_action: {
        shift: {
            id: number;
            code: string;
            name: string;
            start_time: string | null;
            end_time: string | null;
            is_day_off: boolean;
        } | null;
        attendance: AttendancePayload | null;
        open_attendance: AttendancePayload | null;
        can_clock_in: boolean;
        can_clock_out: boolean;
    };
    attendance_policy: {
        mode: 'onsite' | 'wfa';
        radius_meters: number;
        primary_location: {
            name: string;
            address: string | null;
            latitude: number;
            longitude: number;
            radius_meters: number;
        } | null;
        locations: Array<{
            name: string;
            address: string | null;
            latitude: number;
            longitude: number;
            radius_meters: number;
        }>;
    };
    links: PortalLinkMap;
};

type AttendancePayload = {
    id: number;
    attendance_date: string | null;
    status: string;
    shift: {
        id: number;
        code: string;
        name: string;
        start_time: string | null;
        end_time: string | null;
        is_day_off: boolean;
    } | null;
    check_in_at: string | null;
    check_in_latitude: number | null;
    check_in_longitude: number | null;
    check_out_at: string | null;
    check_out_latitude: number | null;
    check_out_longitude: number | null;
    notes: string | null;
};

type Coordinates = {
    latitude: number;
    longitude: number;
};

type AttendanceMode = 'clock-in' | 'clock-out';

const geolocationOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

const locationErrorMessage = (error: GeolocationPositionError): string => {
    if (error.code === 1) {
        return 'Akses lokasi ditolak. Aktifkan izin lokasi untuk melanjutkan.';
    }

    if (error.code === 2) {
        return 'Lokasi perangkat tidak ditemukan.';
    }

    if (error.code === 3) {
        return 'Permintaan lokasi melebihi batas waktu.';
    }

    return 'Gagal mengambil lokasi perangkat.';
};

const calculateDistanceMeters = (
    latitudeA: number,
    longitudeA: number,
    latitudeB: number,
    longitudeB: number,
) => {
    const earthRadius = 6371000;
    const latitudeDelta = ((latitudeB - latitudeA) * Math.PI) / 180;
    const longitudeDelta = ((longitudeB - longitudeA) * Math.PI) / 180;

    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos((latitudeA * Math.PI) / 180) *
            Math.cos((latitudeB * Math.PI) / 180) *
            Math.sin(longitudeDelta / 2) ** 2;

    return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(a)));
};

export function PortalAttendanceLocationPage({
    pageTitle,
    mode = 'clock-in',
}: Props & { mode?: AttendanceMode }) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [selectedShiftId, setSelectedShiftId] = useState<string>('');
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const locationWatchId = useRef<number | null>(null);
    const hasStartedLocationCheckRef = useRef(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await requestApi<PortalSummary>(
                    '/portal/api/summary',
                );

                setPortal(response.data);

                const preferredShiftId =
                    response.data.quick_action.shift?.id ??
                    response.data.shift_options[0]?.id;

                setSelectedShiftId(
                    preferredShiftId ? String(preferredShiftId) : '',
                );
            } catch (loadError) {
                notifyPortal(
                    'error',
                    loadError instanceof Error
                        ? translatePortalError(
                              loadError.message,
                              'Halaman absensi tidak bisa dimuat.',
                          )
                        : 'Halaman absensi tidak bisa dimuat.',
                );
            }
        };

        void loadData();
    }, []);

    useEffect(() => {
        return () => {
            if (locationWatchId.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(locationWatchId.current);
            }
        };
    }, []);

    const locations = useMemo(() => {
        const policyLocations = portal?.attendance_policy.locations ?? [];

        if (policyLocations.length > 0) {
            return policyLocations;
        }

        return portal?.attendance_policy.primary_location
            ? [portal.attendance_policy.primary_location]
            : [];
    }, [portal]);

    const selectedShift =
        portal?.shift_options.find(
            (shift) => String(shift.id) === selectedShiftId,
        ) ?? null;
    const openAttendance = portal?.quick_action.open_attendance ?? null;
    const attendanceShift =
        mode === 'clock-out'
            ? (openAttendance?.shift ??
              portal?.quick_action.shift ??
              portal?.quick_action.attendance?.shift ??
              selectedShift)
            : (portal?.quick_action.shift ?? selectedShift);

    const closestLocation = useMemo(() => {
        if (!coordinates || locations.length === 0) {
            return null;
        }

        return locations
            .map((location) => ({
                ...location,
                distance: calculateDistanceMeters(
                    coordinates.latitude,
                    coordinates.longitude,
                    location.latitude,
                    location.longitude,
                ),
            }))
            .sort((a, b) => a.distance - b.distance)[0];
    }, [coordinates, locations]);

    const mapCenter = useMemo<[number, number]>(() => {
        if (coordinates) {
            return [coordinates.latitude, coordinates.longitude];
        }

        if (locations.length > 0) {
            return [locations[0].latitude, locations[0].longitude];
        }

        return [-6.2, 106.816666];
    }, [coordinates, locations]);

    const isWithinRadius =
        !!closestLocation &&
        closestLocation.distance <= closestLocation.radius_meters;
    const isWfa = portal?.attendance_policy.mode === 'wfa';
    const canSubmit =
        !!portal?.employee &&
        !!coordinates &&
        (isWfa || (!!closestLocation && isWithinRadius)) &&
        (mode === 'clock-out'
            ? !!openAttendance && portal.quick_action.can_clock_out
            : portal.quick_action.can_clock_in);
    const isOutsideRadius =
        !isWfa &&
        !!closestLocation &&
        closestLocation.distance > closestLocation.radius_meters;
    const actionButtonText = isOutsideRadius
        ? 'Refresh Lokasi Anda'
        : isSubmitting
          ? mode === 'clock-out'
              ? 'Menyimpan jam pulang...'
              : 'Menyimpan absensi...'
          : isLocating
            ? 'Mengecek lokasi...'
            : mode === 'clock-out'
              ? 'Clock Out'
              : 'Clock In';

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            notifyPortal('error', 'Browser Anda tidak mendukung geolocation.');
            return;
        }

        if (locationWatchId.current !== null) {
            navigator.geolocation.clearWatch(locationWatchId.current);
        }

        setIsLocating(true);
        setIsTrackingLocation(false);

        locationWatchId.current = navigator.geolocation.watchPosition(
            (position) => {
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsLocating(false);
                setIsTrackingLocation(true);
            },
            (positionError) => {
                setIsLocating(false);
                setIsTrackingLocation(false);
                notifyPortal('error', locationErrorMessage(positionError));

                if (locationWatchId.current !== null) {
                    navigator.geolocation.clearWatch(locationWatchId.current);
                    locationWatchId.current = null;
                }
            },
            geolocationOptions,
        );
    };

    useEffect(() => {
        if (!portal || hasStartedLocationCheckRef.current) {
            return;
        }

        hasStartedLocationCheckRef.current = true;
        handleDetectLocation();
    }, [portal]);

    const handleSubmit = async () => {
        if (!portal?.employee || !coordinates) {
            return;
        }

        try {
            setIsSubmitting(true);

            if (mode === 'clock-out') {
                if (!openAttendance) {
                    notifyPortal(
                        'error',
                        'Tidak ada absensi aktif untuk clock out.',
                    );
                    return;
                }

                await requestApi(
                    `/portal/api/attendances/${openAttendance.id}`,
                    'PUT',
                    {
                        employee_id: portal.employee.id,
                        shift_id: attendanceShift?.id ?? null,
                        attendance_date:
                            openAttendance.attendance_date ?? portal.today.date,
                        status: openAttendance.status,
                        check_in_at: openAttendance.check_in_at,
                        check_in_latitude: openAttendance.check_in_latitude,
                        check_in_longitude: openAttendance.check_in_longitude,
                        check_out_at: new Date().toISOString(),
                        check_out_latitude: coordinates.latitude,
                        check_out_longitude: coordinates.longitude,
                        notes: openAttendance.notes,
                    },
                );
            } else {
                await requestApi('/portal/api/attendances', 'POST', {
                    employee_id: portal.employee.id,
                    shift_id: attendanceShift?.id ?? null,
                    attendance_date: localDateString(),
                    status: 'present',
                    check_in_at: new Date().toISOString(),
                    check_in_latitude: coordinates.latitude,
                    check_in_longitude: coordinates.longitude,
                });
            }

            notifyPortalAfterRedirect(
                'success',
                mode === 'clock-out'
                    ? 'Absensi pulang berhasil disimpan.'
                    : 'Absensi masuk berhasil disimpan.',
            );
            window.location.href = '/portal';
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          mode === 'clock-out'
                              ? 'Jam pulang gagal.'
                              : 'Absensi masuk gagal.',
                      )
                    : mode === 'clock-out'
                      ? 'Jam pulang gagal.'
                      : 'Absensi masuk gagal.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow={mode === 'clock-out' ? 'Clock out' : 'Clock in'}
            description={
                mode === 'clock-out'
                    ? 'Pastikan Anda berada di lokasi kerja yang diizinkan sebelum absensi pulang.'
                    : 'Pastikan Anda berada di lokasi kerja yang diizinkan sebelum absensi masuk.'
            }
            active="attendance"
            hideNavbar
            fullBleed
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <section
                data-testid="portal-checkin-canvas"
                className="portal-checkin-canvas relative -mx-4 -mt-4 h-[calc(100svh-5rem)] overflow-hidden"
            >
                <div className="absolute inset-0">
                    <MapboxLocationMap
                        center={{
                            latitude: mapCenter[0],
                            longitude: mapCenter[1],
                        }}
                        zoom={16}
                        className="h-full w-full"
                        locations={locations.map((location) => ({
                            id: `${location.name}-${location.latitude}-${location.longitude}`,
                            name: location.name,
                            address: location.address,
                            latitude: location.latitude,
                            longitude: location.longitude,
                            radiusMeters: location.radius_meters,
                        }))}
                        userLocation={coordinates}
                        isUserPulsing={isLocating || isTrackingLocation}
                        autoCenter={coordinates}
                    />
                </div>

                <div className="portal-checkin-dock pointer-events-none absolute inset-x-0 bottom-0 z-[500]">
                    <div
                        data-testid="portal-checkin-card"
                        className="portal-checkin-card pointer-events-auto"
                    >
                        <div className="portal-checkin-card__header">
                            <h2>Lokasi Absensi</h2>
                            <span
                                aria-live="polite"
                                className={`portal-checkin-status ${
                                    isLocating
                                        ? 'portal-checkin-status--locating'
                                        : isTrackingLocation
                                          ? 'portal-checkin-status--live'
                                          : 'portal-checkin-status--idle'
                                }`}
                            >
                                {isLocating ? (
                                    <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" />
                                ) : null}
                                {isLocating
                                    ? 'Mencari lokasi'
                                    : isTrackingLocation
                                      ? 'GPS aktif'
                                      : 'GPS belum aktif'}
                            </span>
                        </div>

                        <div className="portal-checkin-card__information">
                            {isWfa ? (
                                <div className="min-w-0">
                                    <p className="portal-checkin-card__label">
                                        Mode kerja
                                    </p>
                                    <p className="portal-checkin-card__primary">
                                        WFA aktif
                                    </p>
                                    <p className="portal-checkin-card__secondary">
                                        Koordinat GPS saat ini akan direkam.
                                    </p>
                                </div>
                            ) : closestLocation ? (
                                <>
                                    <div className="min-w-0">
                                        <p className="portal-checkin-card__label">
                                            {isOutsideRadius
                                                ? 'Di luar radius'
                                                : 'Lokasi terdekat'}
                                        </p>
                                        <p className="portal-checkin-card__primary truncate">
                                            {closestLocation.name}
                                        </p>
                                        <p className="portal-checkin-card__secondary line-clamp-1">
                                            {closestLocation.address ??
                                                'Lokasi absensi'}
                                        </p>
                                    </div>
                                    <div className="portal-checkin-card__distance">
                                        <strong>
                                            {Math.round(
                                                closestLocation.distance,
                                            )}
                                            m
                                        </strong>
                                        <span>
                                            radius{' '}
                                            {closestLocation.radius_meters}m
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="min-w-0">
                                    <p className="portal-checkin-card__label">
                                        Validasi radius
                                    </p>
                                    <p className="portal-checkin-card__primary">
                                        {isLocating
                                            ? 'Mengambil koordinat perangkat'
                                            : 'Menunggu izin lokasi'}
                                    </p>
                                    <p className="portal-checkin-card__secondary">
                                        Posisi Anda diperlukan untuk
                                        melanjutkan.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (isOutsideRadius) {
                                    handleDetectLocation();
                                    return;
                                }

                                void handleSubmit();
                            }}
                            disabled={
                                isSubmitting ||
                                isLocating ||
                                (!isOutsideRadius && !canSubmit)
                            }
                            aria-busy={isSubmitting || isLocating}
                            className={`portal-checkin-action portal-focus-ring portal-pressable ${
                                isOutsideRadius
                                    ? 'portal-checkin-action--danger'
                                    : ''
                            }`}
                        >
                            {isSubmitting || isLocating ? (
                                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
                            ) : null}
                            {actionButtonText}
                        </button>
                    </div>
                </div>
            </section>
        </PortalShell>
    );
}

export default function PortalCheckInPage({ pageTitle }: Props) {
    return <PortalAttendanceLocationPage pageTitle={pageTitle} />;
}
