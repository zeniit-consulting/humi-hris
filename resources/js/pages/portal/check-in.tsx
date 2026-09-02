import {
    Camera,
    CheckCircle2,
    LoaderCircle,
    RotateCcw,
    ScanFace,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapboxLocationMap } from '@/components/mapbox-location-map';
import {
    extractFaceDescriptor,
    loadFaceRecognitionModels,
    matchFace,
} from '@/lib/face-recognition';
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
    employee: {
        id: number;
        full_name?: string;
        face_enrolled?: boolean;
        face_embedding?: number[] | null;
        face_photo_url?: string | null;
    } | null;
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
        require_face_recognition?: boolean;
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
    check_in_photo_url?: string | null;
    check_out_at: string | null;
    check_out_latitude: number | null;
    check_out_longitude: number | null;
    check_out_photo_url?: string | null;
    face_similarity_score?: number | null;
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

    // Face Recognition Verification Modal & State
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isScanningFace, setIsScanningFace] = useState(false);
    const [faceDetectionStatus, setFaceDetectionStatus] = useState<
        'idle' | 'detecting' | 'matched' | 'mismatched' | 'no_face' | 'error'
    >('idle');
    const [faceStatusMessage, setFaceStatusMessage] = useState<string>('');
    const [capturedPhotoBase64, setCapturedPhotoBase64] = useState<string | null>(null);
    const [similarityScore, setSimilarityScore] = useState<number | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            stopCamera();
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
            : portal?.attendance_policy.require_face_recognition
              ? mode === 'clock-out'
                  ? 'Verifikasi Wajah & Clock Out'
                  : 'Verifikasi Wajah & Clock In'
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

    // ================= FACE RECOGNITION CAMERA & VERIFICATION =================
    const startCamera = async () => {
        try {
            setFaceDetectionStatus('detecting');
            setFaceStatusMessage('Memulai kamera & memuat model AI...');
            setIsCameraActive(true);

            await loadFaceRecognitionModels();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: false,
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setFaceStatusMessage('Posisikan wajah Anda di dalam lingkaran...');
            startFaceScanning();
        } catch (err) {
            setFaceDetectionStatus('error');
            setFaceStatusMessage(
                err instanceof Error
                    ? err.message
                    : 'Gagal mengakses kamera depan perangkat.',
            );
        }
    };

    const stopCamera = () => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const startFaceScanning = () => {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

        let matchStreak = 0;

        scanIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
                return;
            }

            try {
                const faceResult = await extractFaceDescriptor(videoRef.current);

                if (!faceResult) {
                    matchStreak = 0;
                    setFaceDetectionStatus('no_face');
                    setFaceStatusMessage('Wajah tidak terdeteksi. Harap menghadap ke kamera.');
                    return;
                }

                const masterEmbedding = portal?.employee?.face_embedding;
                if (!masterEmbedding || masterEmbedding.length === 0) {
                    // If no master embedding is enrolled, capture selfie photo with verified face detection
                    matchStreak++;
                    setFaceDetectionStatus('matched');
                    setFaceStatusMessage('Wajah terdeteksi! Mengambil snapshot...');

                    if (matchStreak >= 2) {
                        captureSnapshotAndSubmit(null);
                    }
                    return;
                }

                // Match with enrolled master embedding
                const match = matchFace(masterEmbedding, faceResult.descriptor, 0.52);

                if (match.isMatch) {
                    matchStreak++;
                    setFaceDetectionStatus('matched');
                    setSimilarityScore(match.similarityPercent);
                    setFaceStatusMessage(
                        `Wajah Cocok (${match.similarityPercent}%)! Memproses absensi...`,
                    );

                    if (matchStreak >= 2) {
                        captureSnapshotAndSubmit(match.similarityPercent / 100);
                    }
                } else {
                    matchStreak = 0;
                    setFaceDetectionStatus('mismatched');
                    setFaceStatusMessage('Wajah tidak sesuai dengan master profil.');
                }
            } catch {
                // Ignore transient frame errors
            }
        }, 650);
    };

    const captureSnapshotAndSubmit = (score: number | null) => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 480;
        canvas.height = videoRef.current.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Mirror image horizontally for standard selfie view
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }
        const base64 = canvas.toDataURL('image/jpeg', 0.82);
        setCapturedPhotoBase64(base64);
        stopCamera();

        // Submit attendance with face photo payload
        void executeAttendanceSubmit(base64, score);
    };

    const handleActionClick = () => {
        if (isOutsideRadius) {
            handleDetectLocation();
            return;
        }

        if (!canSubmit) return;

        // If face recognition is enabled or employee has master face enrolled, open face scan modal
        if (portal?.attendance_policy.require_face_recognition) {
            setIsFaceModalOpen(true);
            void startCamera();
            return;
        }

        // Direct submit if face recognition is not required
        void executeAttendanceSubmit(null, null);
    };

    const executeAttendanceSubmit = async (
        photoBase64: string | null,
        faceScore: number | null,
    ) => {
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
                        check_out_photo: photoBase64,
                        face_similarity_score: faceScore,
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
                    check_in_photo: photoBase64,
                    face_similarity_score: faceScore,
                });
            }

            setIsFaceModalOpen(false);
            notifyPortalAfterRedirect(
                'success',
                mode === 'clock-out'
                    ? 'Absensi pulang berhasil disimpan.'
                    : 'Absensi masuk berhasil disimpan.',
            );
            window.location.href = '/portal';
        } catch (submitError) {
            setIsFaceModalOpen(false);
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
                            onClick={handleActionClick}
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
                            ) : portal?.attendance_policy.require_face_recognition ? (
                                <ScanFace className="size-4 mr-1.5" />
                            ) : null}
                            {actionButtonText}
                        </button>
                    </div>
                </div>

                {/* Face Recognition Modal */}
                {isFaceModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                        <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col items-center p-6 text-center">
                            <div className="flex items-center justify-between w-full mb-3">
                                <div className="flex items-center gap-2">
                                    <ScanFace className="size-5 text-indigo-600" />
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Verifikasi Wajah
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        stopCamera();
                                        setIsFaceModalOpen(false);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold p-1"
                                >
                                    Batal
                                </button>
                            </div>

                            {/* Camera Viewport with circular scan guide */}
                            <div className="relative size-60 rounded-full overflow-hidden border-4 border-dashed border-indigo-500 shadow-inner bg-slate-900 flex items-center justify-center my-3">
                                <video
                                    ref={videoRef}
                                    playsInline
                                    muted
                                    className={`size-full object-cover scale-x-[-1] transition-all ${
                                        faceDetectionStatus === 'matched'
                                            ? 'ring-8 ring-emerald-500 ring-inset'
                                            : faceDetectionStatus === 'mismatched'
                                              ? 'ring-8 ring-rose-500 ring-inset'
                                              : ''
                                    }`}
                                />

                                {/* Visual Feedback Overlay */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    {faceDetectionStatus === 'matched' && (
                                        <div className="rounded-full bg-emerald-500/80 p-3 text-white animate-bounce">
                                            <CheckCircle2 className="size-8" />
                                        </div>
                                    )}
                                    {faceDetectionStatus === 'mismatched' && (
                                        <div className="rounded-full bg-rose-500/80 p-3 text-white">
                                            <XCircle className="size-8" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status and instructions */}
                            <div className="mt-2 min-h-12 flex flex-col items-center justify-center">
                                <p
                                    className={`text-sm font-semibold transition-colors ${
                                        faceDetectionStatus === 'matched'
                                            ? 'text-emerald-600'
                                            : faceDetectionStatus === 'mismatched'
                                              ? 'text-rose-600'
                                              : 'text-slate-700'
                                    }`}
                                >
                                    {faceStatusMessage || 'Memindai wajah...'}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Arahkan kamera ke wajah tanpa masker
                                </p>
                            </div>

                            {faceDetectionStatus === 'error' && (
                                <button
                                    type="button"
                                    onClick={() => void startCamera()}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                >
                                    <RotateCcw className="size-3.5" />
                                    Coba Lagi Kamera
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </PortalShell>
    );
}

export default function PortalCheckInPage({ pageTitle }: Props) {
    return <PortalAttendanceLocationPage pageTitle={pageTitle} />;
}
