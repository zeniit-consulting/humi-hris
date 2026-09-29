import {
    AlertCircle,
    Camera,
    CheckCircle2,
    Clock,
    History,
    LoaderCircle,
    MapPin,
    RefreshCw,
    Send,
    UserCheck,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    notifyPortal,
    requestApi,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type Colleague = {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    full_name: string;
    position_name: string;
    sub_company_name: string | null;
    is_wfa: boolean;
    has_attendance_today: boolean;
    attendance_status: string;
    today_shift: {
        code: string;
        name: string;
        is_day_off: boolean;
    } | null;
};

type BackupRecord = {
    id: number;
    attendance_date: string | null;
    status: string;
    is_backup: boolean;
    backup_for_employee: {
        id: number;
        employee_code: string;
        full_name: string;
    } | null;
    shift: {
        id: number;
        code: string;
        name: string;
        start_time: string | null;
        end_time: string | null;
    } | null;
    check_in_at: string | null;
    check_out_at: string | null;
    check_in_photo_url: string | null;
    check_out_photo_url: string | null;
    notes: string | null;
};

type Coordinates = {
    latitude: number;
    longitude: number;
};

export default function PortalBackupAttendancePage({ pageTitle }: Props) {
    const [colleagues, setColleagues] = useState<Colleague[]>([]);
    const [selectedColleagueId, setSelectedColleagueId] = useState<string>('');
    const [activeBackup, setActiveBackup] = useState<BackupRecord | null>(null);
    const [recentHistory, setRecentHistory] = useState<BackupRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    // Location state
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Camera / Photo state
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fallbackLinks: PortalLinkMap = {
        attendance: '/portal/attendance',
        backup_attendance: '/portal/backup-attendance',
        leaves: '/portal/leaves',
        overtimes: '/portal/overtimes',
        payroll: '/portal/payroll',
        dashboard: '/portal',
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [colleaguesRes, statusRes] = await Promise.all([
                requestApi<{ colleagues: Colleague[] }>('/portal/api/backup-attendance/colleagues'),
                requestApi<{
                    is_enabled: boolean;
                    active_backup: BackupRecord | null;
                    today_backups: BackupRecord[];
                    recent_history: BackupRecord[];
                }>('/portal/api/backup-attendance/status'),
            ]);

            setColleagues(colleaguesRes.data.colleagues || []);
            setActiveBackup(statusRes.data.active_backup || null);
            setRecentHistory(statusRes.data.recent_history || []);
        } catch (err) {
            notifyPortal(
                'error',
                err instanceof Error
                    ? translatePortalError(err.message, 'Gagal memuat data backup absensi.')
                    : 'Gagal memuat data backup absensi.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
        detectLocation();

        return () => {
            stopCamera();
        };
    }, []);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Perangkat Anda tidak mendukung geolokasi.');
            return;
        }

        setIsLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoordinates({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                if (err.code === 1) {
                    setLocationError('Izin lokasi ditolak. Harap izinkan akses lokasi.');
                } else if (err.code === 2) {
                    setLocationError('Lokasi perangkat tidak dapat ditemukan.');
                } else {
                    setLocationError('Gagal mendeteksi lokasi.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch {
            // Camera permission denied or not available; fallback to file input
            setIsCameraOpen(false);
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhotoFromVideo = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 480;
        canvas.height = videoRef.current.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Mirror selfie view
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }
        const base64 = canvas.toDataURL('image/jpeg', 0.82);
        setCapturedPhoto(base64);
        stopCamera();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setCapturedPhoto(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedColleagueId) {
            notifyPortal('error', 'Pilih rekan kerja yang akan dibackup.');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                backup_for_employee_id: Number(selectedColleagueId),
                check_in_latitude: coordinates?.latitude ?? null,
                check_in_longitude: coordinates?.longitude ?? null,
                check_in_photo: capturedPhoto,
                notes: notes.trim() || null,
            };

            await requestApi('/portal/api/backup-attendance/check-in', 'POST', payload);
            notifyPortal('success', 'Backup absensi masuk berhasil dicatat.');
            setCapturedPhoto(null);
            setNotes('');
            setSelectedColleagueId('');
            await loadData();
        } catch (err) {
            notifyPortal(
                'error',
                err instanceof Error
                    ? translatePortalError(err.message, 'Gagal melakukan backup absensi.')
                    : 'Gagal melakukan backup absensi.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckOut = async () => {
        if (!activeBackup) return;

        try {
            setIsSubmitting(true);
            const payload = {
                check_out_latitude: coordinates?.latitude ?? null,
                check_out_longitude: coordinates?.longitude ?? null,
                check_out_photo: capturedPhoto,
            };

            await requestApi('/portal/api/backup-attendance/check-out', 'POST', payload);
            notifyPortal('success', 'Backup absensi pulang berhasil dicatat.');
            setCapturedPhoto(null);
            await loadData();
        } catch (err) {
            notifyPortal(
                'error',
                err instanceof Error
                    ? translatePortalError(err.message, 'Gagal clock out backup absensi.')
                    : 'Gagal clock out backup absensi.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedColleague = colleagues.find((c) => String(c.id) === selectedColleagueId);

    return (
        <PortalShell
            title="BACKUP ABSENSI"
            eyebrow="Absensi Pengganti Rekan"
            active="attendance"
            links={fallbackLinks}
        >
            <div className="space-y-6 pb-8">
                {/* Banner Info */}
                <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-950 sm:text-sm">
                    <div className="flex items-start gap-3">
                        <UserCheck className="mt-0.5 size-5 shrink-0 text-teal-700" />
                        <div>
                            <p className="font-semibold text-teal-900">
                                Fitur Backup Absensi Kehadiran
                            </p>
                            <p className="mt-1 leading-relaxed text-teal-800">
                                Ketika rekan kerja dalam company / sub-company yang sama tidak dapat hadir kerja,
                                Anda dapat melakukan backup kehadiran untuk menggantikannya.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Location indicator */}
                <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="size-4 shrink-0 text-stone-500" />
                        <span className="truncate text-stone-700">
                            {coordinates
                                ? `Lokasi GPS: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                                : isLocating
                                  ? 'Mendeteksi lokasi...'
                                  : locationError || 'Lokasi belum terdeteksi'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={detectLocation}
                        disabled={isLocating}
                        className="portal-pressable flex shrink-0 items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50"
                    >
                        <RefreshCw className={`size-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                        <LoaderCircle className="size-8 animate-spin" />
                        <p className="mt-2 text-xs">Memuat data...</p>
                    </div>
                ) : activeBackup ? (
                    /* Active Backup Attendance Card (Needs Clock Out) */
                    <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-800">
                            <Clock className="size-5 shrink-0" />
                            <h2 className="text-sm font-bold uppercase tracking-wider">
                                Backup Sedang Berjalan
                            </h2>
                        </div>

                        <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-white p-4 text-xs sm:text-sm">
                            <div className="flex justify-between border-b border-stone-100 pb-2">
                                <span className="text-stone-500">Membackup Rekan:</span>
                                <span className="font-bold text-stone-900">
                                    {activeBackup.backup_for_employee?.full_name} ({activeBackup.backup_for_employee?.employee_code})
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-stone-100 pb-2">
                                <span className="text-stone-500">Jam Masuk (Clock In):</span>
                                <span className="font-semibold text-stone-900">
                                    {activeBackup.check_in_at || '—'}
                                </span>
                            </div>
                            {activeBackup.shift && (
                                <div className="flex justify-between border-b border-stone-100 pb-2">
                                    <span className="text-stone-500">Shift Kerja:</span>
                                    <span className="font-semibold text-stone-900">
                                        {activeBackup.shift.name} ({activeBackup.shift.start_time} - {activeBackup.shift.end_time})
                                    </span>
                                </div>
                            )}
                            {activeBackup.notes && (
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Catatan:</span>
                                    <span className="text-stone-900">{activeBackup.notes}</span>
                                </div>
                            )}
                        </div>

                        {/* Photo capture for clock out */}
                        <div className="mt-4">
                            {capturedPhoto ? (
                                <div className="relative mx-auto w-36 overflow-hidden rounded-xl border border-stone-200">
                                    <img src={capturedPhoto} alt="Selfie Clock Out" className="h-44 w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setCapturedPhoto(null)}
                                        className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white shadow"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ) : isCameraOpen ? (
                                <div className="relative mx-auto w-48 overflow-hidden rounded-xl border border-stone-300 bg-black">
                                    <video ref={videoRef} playsInline autoPlay muted className="h-56 w-full object-cover" />
                                    <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={capturePhotoFromVideo}
                                            className="rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white shadow"
                                        >
                                            Ambil Foto
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopCamera}
                                            className="rounded-full bg-stone-700 px-3 py-1 text-xs font-semibold text-white shadow"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="portal-pressable inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
                                    >
                                        <Camera className="size-4 text-stone-500" />
                                        <span>Ambil Foto Pulang (Opsional)</span>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckOut}
                            disabled={isSubmitting}
                            className="portal-pressable mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <LoaderCircle className="size-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="size-4" />
                                    <span>Selesaikan Backup (Clock Out)</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Check In Form */
                    <form onSubmit={handleCheckIn} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                            Formulir Backup Kehadiran
                        </h2>

                        {/* Select Colleague */}
                        <div>
                            <label htmlFor="colleague-select" className="block text-xs font-semibold text-stone-700">
                                Pilih Rekan Kerja yang Tidak Hadir <span className="text-rose-500">*</span>
                            </label>
                            <p className="mt-0.5 text-[11px] text-stone-500">
                                Hanya menampilkan rekan dalam company / sub-company yang sama.
                            </p>
                            <select
                                id="colleague-select"
                                value={selectedColleagueId}
                                onChange={(e) => setSelectedColleagueId(e.target.value)}
                                required
                                className="portal-focus-ring mt-2 block w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs text-stone-900 shadow-sm focus:border-teal-600 focus:outline-none sm:text-sm"
                            >
                                <option value="">-- Pilih Rekan Kerja --</option>
                                {colleagues.map((colleague) => (
                                    <option
                                        key={colleague.id}
                                        value={colleague.id}
                                        disabled={colleague.has_attendance_today}
                                    >
                                        {colleague.full_name} ({colleague.employee_code}) - {colleague.position_name}
                                        {colleague.has_attendance_today ? ' [Sudah Hadir/Dibackup]' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedColleague && (
                            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Divisi / Posisi:</span>
                                    <span className="font-semibold text-stone-800">
                                        {selectedColleague.position_name}
                                    </span>
                                </div>
                                {selectedColleague.sub_company_name && (
                                    <div className="mt-1 flex justify-between">
                                        <span className="text-stone-500">Sub-Company:</span>
                                        <span className="font-semibold text-stone-800">
                                            {selectedColleague.sub_company_name}
                                        </span>
                                    </div>
                                )}
                                {selectedColleague.today_shift && (
                                    <div className="mt-1 flex justify-between">
                                        <span className="text-stone-500">Shift Hari Ini:</span>
                                        <span className="font-semibold text-teal-800">
                                            {selectedColleague.today_shift.name} ({selectedColleague.today_shift.code})
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selfie Camera / Photo */}
                        <div>
                            <span className="block text-xs font-semibold text-stone-700">
                                Foto Selfie Masuk (Opsional)
                            </span>
                            <div className="mt-2">
                                {capturedPhoto ? (
                                    <div className="relative mx-auto w-36 overflow-hidden rounded-xl border border-stone-200">
                                        <img src={capturedPhoto} alt="Selfie Backup" className="h-44 w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setCapturedPhoto(null)}
                                            className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white shadow"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ) : isCameraOpen ? (
                                    <div className="relative mx-auto w-48 overflow-hidden rounded-xl border border-stone-300 bg-black">
                                        <video ref={videoRef} playsInline autoPlay muted className="h-56 w-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={capturePhotoFromVideo}
                                                className="rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white shadow"
                                            >
                                                Ambil Foto
                                            </button>
                                            <button
                                                type="button"
                                                onClick={stopCamera}
                                                className="rounded-full bg-stone-700 px-3 py-1 text-xs font-semibold text-white shadow"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={startCamera}
                                            className="portal-pressable inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-stone-50 py-3 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-100"
                                        >
                                            <Camera className="size-4 text-stone-500" />
                                            <span>Buka Kamera Selfie</span>
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            capture="user"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes-input" className="block text-xs font-semibold text-stone-700">
                                Catatan / Keterangan (Opsional)
                            </label>
                            <textarea
                                id="notes-input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Contoh: Menggantikan shift pagi karena rekan sakit"
                                className="portal-focus-ring mt-1 block w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 shadow-sm focus:border-teal-600 focus:outline-none sm:text-sm"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedColleagueId}
                            className="portal-pressable mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-800 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <LoaderCircle className="size-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="size-5" />
                                    <span>Mulai Backup Kehadiran (Clock In)</span>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* History Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <History className="size-4 text-stone-500" />
                        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                            Riwayat Backup Absensi
                        </h2>
                    </div>

                    {recentHistory.length === 0 ? (
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-xs text-stone-400">
                            Belum ada riwayat backup kehadiran.
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                            {recentHistory.map((item) => (
                                <div key={item.id} className="p-4 text-xs sm:text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-stone-900">
                                            {item.backup_for_employee?.full_name || 'Rekan Kerja'}
                                        </span>
                                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                                            {item.attendance_date}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-stone-500">
                                        NIK: {item.backup_for_employee?.employee_code || '—'}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-stone-600">
                                        <span>
                                            Masuk: <strong className="text-stone-900">{item.check_in_at ? item.check_in_at.slice(11, 16) : '—'}</strong>
                                        </span>
                                        <span>
                                            Pulang: <strong className="text-stone-900">{item.check_out_at ? item.check_out_at.slice(11, 16) : 'Belum pulang'}</strong>
                                        </span>
                                    </div>
                                    {item.notes && (
                                        <p className="mt-2 text-[11px] text-stone-500 italic">
                                            "{item.notes}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PortalShell>
    );
}
