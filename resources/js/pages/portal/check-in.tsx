import { Crosshair, LoaderCircle, MapPin, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Circle,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import { notifyPortal, requestApi, translatePortalError } from './lib';
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
        can_clock_in: boolean;
    };
    attendance_policy: {
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

type Coordinates = {
    latitude: number;
    longitude: number;
};

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

const officeIcon = new L.DivIcon({
    className: 'leaflet-portal-marker-wrapper',
    html: '<div class="leaflet-portal-marker leaflet-portal-marker-office"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const createUserIcon = (isLocating: boolean) =>
    new L.DivIcon({
        className: 'leaflet-portal-marker-wrapper',
        html: `<div class="leaflet-portal-marker leaflet-portal-marker-user ${
            isLocating ? 'leaflet-portal-marker-pulse' : ''
        }"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });

function MapAutoCenter({ coordinates }: { coordinates: Coordinates | null }) {
    const map = useMap();

    useEffect(() => {
        if (!coordinates) {
            return;
        }

        map.flyTo(
            [coordinates.latitude, coordinates.longitude],
            Math.max(map.getZoom(), 16),
            {
                animate: true,
                duration: 0.8,
            },
        );
    }, [coordinates, map]);

    return null;
}

export default function PortalCheckInPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [selectedShiftId, setSelectedShiftId] = useState<string>('');
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const locationWatchId = useRef<number | null>(null);

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
    const hasTodayShift = Boolean(portal?.quick_action.shift);
    const attendanceShift = portal?.quick_action.shift ?? selectedShift;

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

    const canSubmit =
        !!portal?.employee &&
        !!attendanceShift &&
        !!closestLocation &&
        closestLocation.distance <= closestLocation.radius_meters &&
        portal.quick_action.can_clock_in;

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

    const handleSubmit = async () => {
        if (!portal?.employee || !attendanceShift || !coordinates) {
            return;
        }

        try {
            setIsSubmitting(true);

            await requestApi('/portal/api/attendances', 'POST', {
                employee_id: portal.employee.id,
                shift_id: attendanceShift.id,
                attendance_date: portal.today.date,
                status: 'present',
                check_in_at: new Date().toISOString(),
                check_in_latitude: coordinates.latitude,
                check_in_longitude: coordinates.longitude,
            });

            window.location.href = '/portal';
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Absensi masuk gagal.',
                      )
                    : 'Absensi masuk gagal.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Clock in"
            description="Pastikan Anda berada di lokasi kerja yang diizinkan sebelum absensi masuk."
            active="attendance"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <Crosshair className="size-5" />
                    </span>
                    <div>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Cek Radius Lokasi Absensi
                        </h2>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <div className="rounded-[12px] border border-stone-200 bg-stone-50 px-4 py-4">
                        <p className="text-xs tracking-[0.18em] text-slate-500 uppercase">
                            Shift hari ini
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                            {attendanceShift
                                ? `${attendanceShift.name}${attendanceShift.start_time && attendanceShift.end_time ? ` • ${attendanceShift.start_time.slice(0, 5)}-${attendanceShift.end_time.slice(0, 5)}` : ''}`
                                : 'Belum ada shift terdaftar'}
                        </p>
                    </div>

                    {!hasTodayShift ? (
                        <select
                            value={selectedShiftId}
                            onChange={(event) =>
                                setSelectedShiftId(event.target.value)
                            }
                            className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                        >
                            <option value="">Pilih shift</option>
                            {portal?.shift_options.map((shift) => (
                                <option key={shift.id} value={shift.id}>
                                    {shift.name} ({shift.code})
                                </option>
                            ))}
                        </select>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9px] border border-slate-200 bg-white text-sm font-semibold text-slate-900 disabled:opacity-60"
                    >
                        {isLocating ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <MapPin className="size-4" />
                        )}
                        {isLocating
                            ? 'Mengecek lokasi...'
                            : isTrackingLocation
                              ? 'Lokasi tersinkron'
                              : 'Cek lokasi saya'}
                    </button>
                </div>
            </section>

            <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="mt-4 overflow-hidden rounded-[12px] border border-stone-200">
                    <MapContainer
                        center={mapCenter}
                        zoom={16}
                        scrollWheelZoom={false}
                        className="h-72 w-full"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
                            url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
                        />
                        <MapAutoCenter coordinates={coordinates} />

                        {locations.map((location) => (
                            <Circle
                                key={`${location.name}-${location.latitude}-${location.longitude}`}
                                center={[location.latitude, location.longitude]}
                                radius={location.radius_meters}
                                pathOptions={{
                                    color: '#0f766e',
                                    fillColor: '#5eead4',
                                    fillOpacity: 0.18,
                                    weight: 2,
                                }}
                            />
                        ))}

                        {locations.map((location) => (
                            <Marker
                                key={`marker-${location.name}-${location.latitude}-${location.longitude}`}
                                position={[
                                    location.latitude,
                                    location.longitude,
                                ]}
                                icon={officeIcon}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-semibold">
                                            {location.name}
                                        </p>
                                        <p>
                                            {location.address ??
                                                'Lokasi absensi'}
                                        </p>
                                        <p>
                                            Radius: {location.radius_meters} m
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {coordinates ? (
                            <Marker
                                position={[
                                    coordinates.latitude,
                                    coordinates.longitude,
                                ]}
                                icon={createUserIcon(
                                    isLocating || isTrackingLocation,
                                )}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-semibold">
                                            Posisi Anda
                                        </p>
                                        <p>
                                            {coordinates.latitude.toFixed(6)},{' '}
                                            {coordinates.longitude.toFixed(6)}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ) : null}
                    </MapContainer>
                </div>

                {closestLocation ? (
                    <div className="mt-4 space-y-3">
                        <div className="rounded-[12px] border border-stone-200 bg-stone-50 px-4 py-4">
                            <p className="text-sm font-semibold text-slate-900">
                                {closestLocation.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {closestLocation.address ??
                                    'Alamat belum diisi'}
                            </p>
                            <p className="mt-3 text-sm text-slate-700">
                                Jarak Anda:{' '}
                                {Math.round(closestLocation.distance)} m
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                                Radius diizinkan:{' '}
                                {closestLocation.radius_meters} m
                            </p>
                        </div>

                        <div
                            className={`rounded-[12px] px-4 py-4 text-sm ${
                                closestLocation.distance <=
                                closestLocation.radius_meters
                                    ? 'portal-primary-text border border-[#b9dfe0] bg-[#f3fbfb]'
                                    : 'border border-amber-200 bg-amber-50 text-amber-900'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                <p>
                                    {closestLocation.distance <=
                                    closestLocation.radius_meters
                                        ? 'Anda berada dalam radius absensi dan bisa melakukan clock in.'
                                        : 'Anda berada di luar radius absensi. Dekati lokasi kerja yang diizinkan untuk melanjutkan.'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                        Lakukan pengecekan lokasi untuk melihat status radius
                        absensi.
                    </div>
                )}
            </section>

            <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || isSubmitting}
                className="portal-primary-bg mt-5 inline-flex h-12 w-full items-center justify-center rounded-[9px] text-sm font-semibold disabled:opacity-60"
            >
                {isSubmitting ? 'Menyimpan absensi...' : 'Lanjut absensi masuk'}
            </button>
        </PortalShell>
    );
}
