import {
    CheckCircle2,
    BellRing,
    Camera,
    ChevronDown,
    CreditCard,
    FileBadge,
    Mail,
    Phone,
    Save,
    ScanFace,
    Trash2,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    formatDate,
    notifyPortal,
    requestApi,
    shouldShowAttendanceNotificationSetup,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { enableAttendancePush } from './lib/firebase-messaging';
import {
    enableWebPush,
    serializeWebPushSubscription,
    webPushIsSupported,
} from './lib/web-push';
import { PortalShell } from './shell';

// Hallmark · genre: modern-minimal · macrostructure: Long Document · theme: Quiet · enrichment: none
// Hallmark · compact profile ledger · pre-emit critique: P5 H5 E5 S5 R5 V5

type Props = {
    pageTitle: string;
};

type ProfileData = {
    employee: {
        id: number;
        employee_code: string | null;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        gender: string | null;
        birth_date: string | null;
        last_education: string | null;
        marital_status: string | null;
        children_count: number | null;
        hire_date: string | null;
        employment_status: string | null;
        employment_type: string | null;
        ptkp_category: string | null;
        family_card_number: string | null;
        ktp_number: string | null;
        bpjs_kesehatan_number: string | null;
        bpjs_ketenagakerjaan_number: string | null;
        sim_a_number: string | null;
        sim_b_number: string | null;
        sim_c_number: string | null;
        biological_mother_name: string | null;
        emergency_contact_name: string | null;
        emergency_contact_phone: string | null;
        face_enrolled?: boolean;
        face_photo_url?: string | null;
        face_enrolled_at?: string | null;
        division: { id: number; name: string } | null;
        position: { id: number; name: string } | null;
    };
    bank_accounts: Array<{
        id: number;
        bank_name: string;
        account_number: string;
        account_holder_name: string;
        is_primary: boolean;
    }>;
    profile_completion: {
        completed: number;
        total: number;
        missing_count: number;
        percent: number;
        is_complete: boolean;
        items: Array<{
            key: string;
            label: string;
            complete: boolean;
            description: string;
        }>;
    };
    has_push_notification_device: boolean;
    company?: {
        name?: string | null;
        logo_url?: string | null;
    } | null;
};

type PortalSummary = {
    company?: {
        name?: string | null;
        logo_url?: string | null;
    } | null;
    employee: {
        id: number;
        employee_code?: string;
        full_name?: string;
        email?: string | null;
        employment_status?: string | null;
        employment_type?: string | null;
        division?: { id: number; name: string } | null;
        position?: { id: number; name: string } | null;
    } | null;
    links: PortalLinkMap;
};

const genderLabels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    other: 'Lainnya',
};

const maritalStatusLabels: Record<string, string> = {
    single: 'Belum menikah',
    married: 'Menikah',
    divorced: 'Cerai hidup',
    widowed: 'Cerai mati',
};

const formatProfileValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value);
};

const initials = (value: string) =>
    value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'HK';

function ProfileAccordion({
    section,
    title,
    description,
    icon: Icon,
    isOpen,
    onOpen,
    children,
}: {
    section: string;
    title: string;
    description: string;
    icon: LucideIcon;
    isOpen: boolean;
    onOpen: (section: string) => void;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] shadow-[var(--portal-shadow-raised)]">
            <button
                type="button"
                onClick={() => onOpen(section)}
                className="portal-pressable portal-focus-ring flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
                aria-expanded={isOpen}
            >
                <span className="portal-primary-soft inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--portal-radius-control)]">
                    <Icon className="portal-primary-text size-5" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[var(--portal-color-ink)]">
                        {title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--portal-color-muted)]">
                        {description}
                    </span>
                </span>
                <ChevronDown
                    className={`size-5 shrink-0 text-[var(--portal-color-muted)] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {isOpen ? (
                <div className="border-t border-[var(--portal-color-rule)] px-4 py-4">
                    {children}
                </div>
            ) : null}
        </section>
    );
}

export default function PortalProfilePage({ pageTitle }: Props) {
    const { companyLogoUrl } = usePage<{ companyLogoUrl?: string | null }>().props;
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEnablingPush, setIsEnablingPush] = useState(false);
    const [openSection, setOpenSection] = useState('personal');

    const effectiveAvatarUrl =
        profile?.employee?.face_photo_url ||
        profile?.company?.logo_url ||
        portal?.company?.logo_url ||
        companyLogoUrl;

    // Face recognition enrollment state
    const [isEnrollingFace, setIsEnrollingFace] = useState(false);
    const [isDeletingFace, setIsDeletingFace] = useState(false);
    const [isConfirmDeleteFaceOpen, setIsConfirmDeleteFaceOpen] = useState(false);
    const [faceEnrollError, setFaceEnrollError] = useState<string | null>(null);
    const [faceEnrollSuccess, setFaceEnrollSuccess] = useState<string | null>(null);
    const [isFaceCameraOpen, setIsFaceCameraOpen] = useState(false);
    const [faceModelLoading, setFaceModelLoading] = useState(false);

    const [formProfile, setFormProfile] = useState({
        phone: '',
        address: '',
        gender: '',
        birth_date: '',
        last_education: '',
        marital_status: '',
        children_count: '',
        family_card_number: '',
        ktp_number: '',
        bpjs_kesehatan_number: '',
        bpjs_ketenagakerjaan_number: '',
        sim_a_number: '',
        sim_b_number: '',
        sim_c_number: '',
        biological_mother_name: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    });

    const [formBank, setFormBank] = useState({
        bank_name: '',
        account_number: '',
        account_holder_name: '',
    });

    const loadData = async () => {
        try {
            const [portalResponse, profileResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<ProfileData>('/portal/api/profile'),
            ]);

            setPortal(portalResponse.data);
            setProfile(profileResponse.data);

            if (profileResponse.data.employee) {
                const employee = profileResponse.data.employee;

                setFormProfile({
                    phone: employee.phone || '',
                    address: employee.address || '',
                    gender: employee.gender || '',
                    birth_date: employee.birth_date || '',
                    last_education: employee.last_education || '',
                    marital_status: employee.marital_status || '',
                    children_count:
                        employee.children_count === null
                            ? ''
                            : String(employee.children_count),
                    family_card_number: employee.family_card_number || '',
                    ktp_number: employee.ktp_number || '',
                    bpjs_kesehatan_number: employee.bpjs_kesehatan_number || '',
                    bpjs_ketenagakerjaan_number:
                        employee.bpjs_ketenagakerjaan_number || '',
                    sim_a_number: employee.sim_a_number || '',
                    sim_b_number: employee.sim_b_number || '',
                    sim_c_number: employee.sim_c_number || '',
                    biological_mother_name:
                        employee.biological_mother_name || '',
                    emergency_contact_name:
                        employee.emergency_contact_name || '',
                    emergency_contact_phone:
                        employee.emergency_contact_phone || '',
                });
            }

            if (profileResponse.data.bank_accounts.length > 0) {
                const primary = profileResponse.data.bank_accounts.find(
                    (b) => b.is_primary,
                );
                if (primary) {
                    setFormBank({
                        bank_name: primary.bank_name,
                        account_number: primary.account_number,
                        account_holder_name: primary.account_holder_name,
                    });
                }
            }
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data profil tidak bisa dimuat.',
                      )
                    : 'Data profil tidak bisa dimuat.',
            );
        }
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!portal?.employee) return;

        try {
            setIsSaving(true);

            await requestApi('/portal/api/profile', 'PUT', {
                ...formProfile,
                children_count:
                    formProfile.children_count === ''
                        ? null
                        : Number(formProfile.children_count),
            });
            notifyPortal('success', 'Profil berhasil diperbarui.');

            await loadData();
        } catch (err) {
            notifyPortal(
                'error',
                err instanceof Error
                    ? translatePortalError(
                          err.message,
                          'Gagal menyimpan profil.',
                      )
                    : 'Gagal menyimpan profil.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBank = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!portal?.employee) return;

        try {
            setIsSaving(true);

            await requestApi(
                '/portal/api/profile/bank-account',
                'PUT',
                formBank,
            );
            notifyPortal('success', 'Rekening bank berhasil disimpan.');

            await loadData();
        } catch (err) {
            notifyPortal(
                'error',
                err instanceof Error
                    ? translatePortalError(
                          err.message,
                          'Gagal menyimpan rekening bank.',
                      )
                    : 'Gagal menyimpan rekening bank.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    const updateProfileField = (
        field: keyof typeof formProfile,
        value: string,
    ) => {
        setFormProfile((cur) => ({
            ...cur,
            [field]: value,
        }));
    };

    const enablePushNotifications = async () => {
        try {
            setIsEnablingPush(true);
            const response = webPushIsSupported()
                ? await requestApi<{ test_notification_sent: boolean }>(
                      '/portal/api/web-push-subscriptions',
                      'POST',
                      serializeWebPushSubscription(await enableWebPush()),
                  )
                : await requestApi<{ test_notification_sent: boolean }>(
                      '/portal/api/push-devices',
                      'POST',
                      { token: await enableAttendancePush() },
                  );
            if (!response.data.test_notification_sent) {
                notifyPortal(
                    'error',
                    'Perangkat tersimpan, tetapi notifikasi uji belum terkirim. Periksa konfigurasi Firebase server.',
                );

                return;
            }
            setProfile((current) =>
                current
                    ? { ...current, has_push_notification_device: true }
                    : current,
            );
            notifyPortal(
                'success',
                'Notifikasi uji berhasil dikirim ke perangkat ini.',
            );
        } catch (error) {
            notifyPortal(
                'error',
                error instanceof Error
                    ? error.message
                    : 'Notifikasi belum dapat diaktifkan.',
            );
        } finally {
            setIsEnablingPush(false);
        }
    };

    const handleEnrollFromFile = async (file: File) => {
        setFaceEnrollError(null);
        setFaceEnrollSuccess(null);
        setIsEnrollingFace(true);

        try {
            // Create image element to feed face-api
            const img = document.createElement('img');
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Gagal memuat gambar foto'));
            });

            // Convert to base64 for upload
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(img.width, 600);
            canvas.height = Math.round((canvas.width / img.width) * img.height);
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const base64Photo = canvas.toDataURL('image/jpeg', 0.85);

            setFaceModelLoading(true);
            const { extractFaceDescriptor } = await import('@/lib/face-recognition');
            const faceResult = await extractFaceDescriptor(img);
            URL.revokeObjectURL(objectUrl);

            if (!faceResult) {
                throw new Error('Wajah tidak terdeteksi pada foto. Pastikan foto wajah tegak lurus dan pencahayaan terang.');
            }

            await requestApi('/portal/api/profile/enroll-face', 'POST', {
                face_embedding: faceResult.descriptor,
                face_photo: base64Photo,
            });

            setFaceEnrollSuccess('Master wajah berhasil disimpan! Anda sekarang dapat melakukan presensi dengan verifikasi wajah.');
            notifyPortal('success', 'Master wajah berhasil disimpan.');
            await loadData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memproses pendaftaran wajah.';
            setFaceEnrollError(message);
            notifyPortal('error', message);
        } finally {
            setIsEnrollingFace(false);
            setFaceModelLoading(false);
        }
    };

    const handleDeleteFace = async () => {
        try {
            setIsDeletingFace(true);
            setFaceEnrollError(null);
            setFaceEnrollSuccess(null);

            await requestApi('/portal/api/profile/delete-face', 'POST');

            setIsConfirmDeleteFaceOpen(false);
            setFaceEnrollSuccess('Data master verifikasi wajah berhasil dihapus.');
            notifyPortal('success', 'Data verifikasi wajah berhasil dihapus.');
            await loadData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Gagal menghapus data verifikasi wajah.';
            setFaceEnrollError(message);
            notifyPortal('error', message);
        } finally {
            setIsDeletingFace(false);
        }
    };
    const primaryBank = (profile?.bank_accounts ?? []).find((b) => b.is_primary);
    const showAttendanceNotificationSetup =
        shouldShowAttendanceNotificationSetup(
            profile?.has_push_notification_device ?? false,
        );
    const personalDetails = profile?.employee
        ? [
              {
                  label: 'Nama lengkap',
                  value: profile.employee.full_name,
              },
              {
                  label: 'Kode karyawan',
                  value: profile.employee.employee_code,
              },
              {
                  label: 'Email',
                  value: profile.employee.email,
              },
              {
                  label: 'Gender',
                  value: profile.employee.gender
                      ? (genderLabels[profile.employee.gender] ??
                        profile.employee.gender)
                      : null,
              },
              {
                  label: 'Tanggal lahir',
                  value: formatDate(profile.employee.birth_date),
              },
              {
                  label: 'Pendidikan',
                  value: profile.employee.last_education,
              },
              {
                  label: 'Status nikah',
                  value: profile.employee.marital_status
                      ? (maritalStatusLabels[profile.employee.marital_status] ??
                        profile.employee.marital_status)
                      : null,
              },
              {
                  label: 'Jumlah anak',
                  value: profile.employee.children_count,
              },
              {
                  label: 'Tanggal masuk',
                  value: formatDate(profile.employee.hire_date),
              },
              {
                  label: 'Status kerja',
                  value: profile.employee.employment_status,
              },
              {
                  label: 'Tipe kerja',
                  value: profile.employee.employment_type,
              },
              {
                  label: 'Divisi',
                  value: profile.employee.division?.name,
              },
              {
                  label: 'Posisi',
                  value: profile.employee.position?.name,
              },
              {
                  label: 'PTKP',
                  value: profile.employee.ptkp_category,
              },
              {
                  label: 'No. KK',
                  value: profile.employee.family_card_number,
              },
              {
                  label: 'No. KTP',
                  value: profile.employee.ktp_number,
              },
              {
                  label: 'BPJS Kesehatan',
                  value: profile.employee.bpjs_kesehatan_number,
              },
              {
                  label: 'BPJS Ketenagakerjaan',
                  value: profile.employee.bpjs_ketenagakerjaan_number,
              },
              {
                  label: 'SIM A',
                  value: profile.employee.sim_a_number,
              },
              {
                  label: 'SIM B',
                  value: profile.employee.sim_b_number,
              },
              {
                  label: 'SIM C',
                  value: profile.employee.sim_c_number,
              },
              {
                  label: 'Nama ibu kandung',
                  value: profile.employee.biological_mother_name,
              },
              {
                  label: 'Kontak darurat',
                  value: profile.employee.emergency_contact_name,
              },
              {
                  label: 'No. kontak darurat',
                  value: profile.employee.emergency_contact_phone,
              },
          ]
        : [];

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Profil"
            description="Kelola data kontak, rekening utama, dan ringkasan status kepegawaian Anda."
            active="profile"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <div className="min-w-0 space-y-3">
                <section className="profile-identity-hero overflow-hidden rounded-[var(--portal-radius-surface)] bg-[var(--portal-color-accent-strong)] px-4 py-5 text-[var(--portal-color-paper)] shadow-[var(--portal-shadow-material)]">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-lg font-extrabold text-[var(--portal-color-paper)]">
                            <span>
                                {initials(
                                    portal?.employee?.full_name ?? 'Humi Karyawan',
                                )}
                            </span>
                            {effectiveAvatarUrl ? (
                                <img
                                    src={effectiveAvatarUrl}
                                    alt={portal?.employee?.full_name ?? 'Profil'}
                                    className="absolute inset-0 size-full rounded-full object-cover bg-white"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : null}
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--portal-color-paper)] uppercase">
                                Profil karyawan
                            </p>
                            <h2 className="mt-1 truncate text-lg font-bold text-[var(--portal-color-paper)]">
                                {portal?.employee?.full_name ??
                                    'Profil karyawan'}
                            </h2>
                            <p className="mt-1 truncate text-xs text-[var(--portal-color-paper)]">
                                {portal?.employee?.position?.name ??
                                    'Posisi belum diisi'}
                                {' · '}
                                {portal?.employee?.division?.name ??
                                    'Divisi belum diisi'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-5 flex min-w-0 items-center justify-between gap-4 border-t border-white/20 pt-3">
                        <span className="min-w-0">
                            <span className="block text-xs text-[var(--portal-color-paper)]">
                                Kode karyawan
                            </span>
                            <span className="mt-1 block truncate text-sm font-bold text-[var(--portal-color-paper)]">
                                {portal?.employee?.employee_code ?? '-'}
                            </span>
                        </span>
                        <span className="shrink-0 rounded-[var(--portal-radius-pill)] bg-white/15 px-3 py-1.5 text-xs font-bold text-[var(--portal-color-paper)]">
                            {portal?.employee?.employment_status ?? '-'}
                        </span>
                    </div>
                </section>

                {showAttendanceNotificationSetup ? (
                    <section className="rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] p-4 shadow-[var(--portal-shadow-raised)]">
                        <div className="flex items-center gap-3">
                            <span className="portal-primary-soft inline-flex size-10 items-center justify-center rounded-[var(--portal-radius-control)]">
                                <BellRing className="portal-primary-text size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-[var(--portal-color-ink)]">
                                    Pengingat absensi
                                </p>
                                <p className="mt-0.5 text-xs text-[var(--portal-color-muted)]">
                                    Terima pengingat clock in dan clock out 15
                                    menit sebelum jadwal.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => void enablePushNotifications()}
                            disabled={isEnablingPush}
                            className="portal-primary-bg portal-pressable portal-focus-ring mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--portal-radius-control)] px-4 text-sm font-bold disabled:opacity-60"
                        >
                            {isEnablingPush
                                ? 'Mengaktifkan…'
                                : 'Aktifkan notifikasi'}
                        </button>
                    </section>
                ) : null}

                <ProfileAccordion
                    section="personal"
                    title="Data Pribadi"
                    description="Informasi kepegawaian dan data dasar"
                    icon={UserRound}
                    isOpen={openSection === 'personal'}
                    onOpen={setOpenSection}
                >
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        {personalDetails.slice(0, 14).map((item) => (
                            <div key={item.label} className="min-w-0">
                                <dt className="text-xs font-medium text-[var(--portal-color-muted)]">
                                    {item.label}
                                </dt>
                                <dd className="mt-0.5 text-sm font-semibold text-[var(--portal-color-ink)] [overflow-wrap:anywhere]">
                                    {formatProfileValue(item.value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </ProfileAccordion>

                <ProfileAccordion
                    section="identity"
                    title="Identitas & Kepesertaan"
                    description="KK, KTP, BPJS, dan SIM"
                    icon={FileBadge}
                    isOpen={openSection === 'identity'}
                    onOpen={setOpenSection}
                >
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        {personalDetails.slice(14, 22).map((item) => (
                            <div key={item.label} className="min-w-0">
                                <dt className="text-xs font-medium text-[var(--portal-color-muted)]">
                                    {item.label}
                                </dt>
                                <dd className="mt-0.5 text-sm font-semibold text-[var(--portal-color-ink)] [overflow-wrap:anywhere]">
                                    {formatProfileValue(item.value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </ProfileAccordion>

                <ProfileAccordion
                    section="contact"
                    title="Kontak & Data Keluarga"
                    description="Perbarui informasi yang dapat Anda kelola"
                    icon={Phone}
                    isOpen={openSection === 'contact'}
                    onOpen={setOpenSection}
                >
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <p className="text-sm font-bold text-[var(--portal-color-ink)]">
                                Perbarui data kontak dan keluarga
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--portal-color-muted)]">
                                Isi informasi yang diperlukan agar profil kepegawaian Anda tetap akurat.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                    Gender
                                </label>
                                <select
                                    value={formProfile.gender}
                                    onChange={(e) =>
                                        updateProfileField(
                                            'gender',
                                            e.target.value,
                                        )
                                    }
                                    className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                >
                                    <option value="">Pilih gender</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    value={formProfile.birth_date}
                                    onChange={(e) =>
                                        updateProfileField(
                                            'birth_date',
                                            e.target.value,
                                        )
                                    }
                                    className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                    Pendidikan Terakhir
                                </label>
                                <input
                                    type="text"
                                    value={formProfile.last_education}
                                    onChange={(e) =>
                                        updateProfileField(
                                            'last_education',
                                            e.target.value.slice(0, 100),
                                        )
                                    }
                                    placeholder="Contoh: S1"
                                    className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                    Status Pernikahan
                                </label>
                                <select
                                    value={formProfile.marital_status}
                                    onChange={(e) =>
                                        updateProfileField(
                                            'marital_status',
                                            e.target.value,
                                        )
                                    }
                                    className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                >
                                    <option value="">Pilih status</option>
                                    <option value="single">
                                        Belum menikah
                                    </option>
                                    <option value="married">Menikah</option>
                                    <option value="divorced">
                                        Cerai hidup
                                    </option>
                                    <option value="widowed">Cerai mati</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                    Jumlah Anak
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={formProfile.children_count}
                                    onChange={(e) =>
                                        updateProfileField(
                                            'children_count',
                                            e.target.value,
                                        )
                                    }
                                    className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                    Nomor Telepon
                                </label>
                                <input
                                    type="tel"
                                    value={formProfile.phone}
                                    onChange={(e) =>
                                        updateProfileField(
                                            'phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="+62812345678 atau 081234567890"
                                    className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                Alamat
                            </label>
                            <textarea
                                value={formProfile.address}
                                onChange={(e) =>
                                    updateProfileField(
                                        'address',
                                        e.target.value.slice(0, 500),
                                    )
                                }
                                placeholder="Masukkan alamat lengkap Anda"
                                maxLength={500}
                                rows={3}
                                className="portal-focus-ring mt-1.5 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-ink)]"
                                required
                            />
                            <p className="mt-1 text-[11px] text-[var(--portal-color-muted)]">
                                {formProfile.address.length}/500 karakter
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                ['family_card_number', 'No. KK'],
                                ['ktp_number', 'No. KTP'],
                                ['bpjs_kesehatan_number', 'BPJS Kesehatan'],
                                [
                                    'bpjs_ketenagakerjaan_number',
                                    'BPJS Ketenagakerjaan',
                                ],
                                ['sim_a_number', 'SIM A'],
                                ['sim_b_number', 'SIM B'],
                                ['sim_c_number', 'SIM C'],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                        {label}
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            formProfile[
                                                field as keyof typeof formProfile
                                            ]
                                        }
                                        onChange={(e) =>
                                            updateProfileField(
                                                field as keyof typeof formProfile,
                                                e.target.value.slice(0, 32),
                                            )
                                        }
                                        className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                ['biological_mother_name', 'Nama Ibu Kandung'],
                                ['emergency_contact_name', 'Kontak Darurat'],
                                [
                                    'emergency_contact_phone',
                                    'No. Telepon Kontak Darurat',
                                ],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                        {label}
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            formProfile[
                                                field as keyof typeof formProfile
                                            ]
                                        }
                                        onChange={(e) =>
                                            updateProfileField(
                                                field as keyof typeof formProfile,
                                                e.target.value.slice(0, 100),
                                            )
                                        }
                                        className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="portal-primary-bg portal-pressable portal-focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--portal-radius-control)] text-sm font-bold disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <div className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span>Simpan Profil</span>
                                </>
                            )}
                        </button>
                    </form>
                </ProfileAccordion>

                <ProfileAccordion
                    section="bank"
                    title="Rekening Utama"
                    description="Rekening untuk kebutuhan payroll"
                    icon={CreditCard}
                    isOpen={openSection === 'bank'}
                    onOpen={setOpenSection}
                >
                    <form onSubmit={handleSaveBank} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                Nama Bank
                            </label>
                            <select
                                value={formBank.bank_name}
                                onChange={(e) =>
                                    setFormBank((cur) => ({
                                        ...cur,
                                        bank_name: e.target.value,
                                    }))
                                }
                                className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                required
                            >
                                <option value="">Pilih Bank</option>
                                <option value="BCA">
                                    BCA (Bank Central Asia)
                                </option>
                                <option value="Mandiri">
                                    Mandiri (Bank Mandiri)
                                </option>
                                <option value="BNI">
                                    BNI (Bank Nasional Indonesia)
                                </option>
                                <option value="BRI">
                                    BRI (Bank Rakyat Indonesia)
                                </option>
                                <option value="CIMB Niaga">CIMB Niaga</option>
                                <option value="OCBC NISP">OCBC NISP</option>
                                <option value="Permata">Bank Permata</option>
                                <option value="Danamon">Bank Danamon</option>
                                <option value="Maybank">
                                    Maybank Indonesia
                                </option>
                                <option value="OVO">OVO</option>
                                <option value="GCash">GCash</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                Nomor Rekening
                            </label>
                            <input
                                type="text"
                                value={formBank.account_number}
                                onChange={(e) => {
                                    const val = e.target.value.replace(
                                        /\D/g,
                                        '',
                                    );
                                    if (val.length <= 30) {
                                        setFormBank((cur) => ({
                                            ...cur,
                                            account_number: val,
                                        }));
                                    }
                                }}
                                placeholder="Contoh: 1234567890"
                                maxLength={30}
                                className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                required
                            />
                            <p className="mt-1 text-[11px] text-[var(--portal-color-muted)]">
                                10-30 digit angka rekening
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                Nama Pemilik Rekening
                            </label>
                            <input
                                type="text"
                                value={formBank.account_holder_name}
                                onChange={(e) =>
                                    setFormBank((cur) => ({
                                        ...cur,
                                        account_holder_name: e.target.value,
                                    }))
                                }
                                placeholder="Nama lengkap pemilik rekening"
                                className="portal-focus-ring mt-1.5 min-h-11 w-full rounded-[var(--portal-radius-control)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-3 text-sm text-[var(--portal-color-ink)]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="portal-primary-bg portal-pressable portal-focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--portal-radius-control)] text-sm font-bold disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <div className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span>Simpan Rekening</span>
                                </>
                            )}
                        </button>
                    </form>

                    {primaryBank ? (
                        <div className="mt-4 rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface-raised)] p-3.5">
                            <p className="text-xs font-semibold tracking-wider text-[var(--portal-color-muted)] uppercase">
                                Rekening Tersimpan
                            </p>
                            <div className="mt-2.5 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--portal-color-muted)]">
                                        Bank
                                    </span>
                                    <span className="font-semibold text-[var(--portal-color-ink)]">
                                        {primaryBank.bank_name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--portal-color-muted)]">
                                        Nomor Rekening
                                    </span>
                                    <span className="font-semibold text-[var(--portal-color-ink)]">
                                        ****{primaryBank.account_number.slice(-4)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--portal-color-muted)]">
                                        Atas Nama
                                    </span>
                                    <span className="font-semibold text-[var(--portal-color-ink)]">
                                        {primaryBank.account_holder_name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </ProfileAccordion>

                <ProfileAccordion
                    section="email"
                    title="Email akun"
                    description={
                        profile?.employee?.email ?? 'Email tidak terdaftar'
                    }
                    icon={Mail}
                    isOpen={openSection === 'email'}
                    onOpen={setOpenSection}
                >
                    <div className="rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)] px-4 py-3">
                        <p className="text-xs text-[var(--portal-color-muted)] leading-relaxed">
                            Untuk mengubah email akun, silakan hubungi tim HR atau administrator sistem Anda.
                        </p>
                    </div>
                </ProfileAccordion>

                <ProfileAccordion
                    section="face_recognition"
                    title="Biometrik Wajah (Face Recognition)"
                    description={
                        profile?.employee?.face_enrolled
                            ? 'Wajah terdaftar • Siap untuk presensi'
                            : 'Wajah belum didaftarkan'
                    }
                    icon={ScanFace}
                    isOpen={openSection === 'face_recognition'}
                    onOpen={setOpenSection}
                >
                    <div className="space-y-4">
                        <p className="text-xs leading-relaxed text-[var(--portal-color-muted)]">
                            Daftarkan foto wajah Anda sekali untuk digunakan sebagai verifikasi biometrik saat melakukan presensi (Clock-in / Clock-out).
                        </p>

                        {profile?.employee?.face_enrolled ? (
                            <div className="rounded-[var(--portal-radius-control)] border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-3">
                                <div className="flex items-center gap-3.5">
                                    {profile.employee.face_photo_url ? (
                                        <img
                                            src={profile.employee.face_photo_url}
                                            alt="Foto Master Wajah"
                                            onError={(e) => {
                                                // Fallback if image path 404s
                                                e.currentTarget.style.display = 'none';
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    const fallback = parent.querySelector('.face-fallback-icon');
                                                    if (fallback) fallback.classList.remove('hidden');
                                                }
                                            }}
                                            className="size-14 rounded-xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                                        />
                                    ) : null}
                                    <div className={`size-14 rounded-xl border-2 border-emerald-500 bg-emerald-100/80 flex items-center justify-center text-emerald-700 shadow-xs shrink-0 face-fallback-icon ${profile.employee.face_photo_url ? 'hidden' : ''}`}>
                                        <ScanFace className="size-7" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                            <CheckCircle2 className="size-3.5" />
                                            Master Wajah Terverifikasi
                                        </span>
                                        <p className="mt-1 text-xs text-emerald-950 font-medium">
                                            Wajah Anda sudah aktif untuk presensi biometrik.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-emerald-200/70 pt-2.5">
                                    <span className="text-xs text-[var(--portal-color-muted)]">
                                        Hapus data biometrik wajah ini?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmDeleteFaceOpen(true)}
                                        disabled={isDeletingFace}
                                        className="portal-pressable portal-focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-50 disabled:opacity-50"
                                    >
                                        <Trash2 className="size-3.5 text-rose-600" />
                                        <span>Hapus Wajah</span>
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {faceEnrollError && (
                            <div className="rounded-[var(--portal-radius-control)] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
                                {faceEnrollError}
                            </div>
                        )}

                        {faceEnrollSuccess && (
                            <div className="rounded-[var(--portal-radius-control)] border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
                                {faceEnrollSuccess}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-[var(--portal-color-ink-soft)]">
                                {profile?.employee?.face_enrolled
                                    ? 'Perbarui Foto Master Wajah'
                                    : 'Upload Foto Master Wajah'}
                            </label>
                            <p className="text-xs text-[var(--portal-color-muted)]">
                                Ambil selfie atau upload foto wajah dari galeri yang jelas menghadap ke depan tanpa masker/kacamata hitam.
                            </p>

                            <div className="pt-1">
                                <label className="portal-pressable portal-focus-ring flex flex-col items-center justify-center rounded-[var(--portal-radius-surface)] border-2 border-dashed border-[var(--portal-color-rule)] bg-[var(--portal-color-surface-raised)] p-5 hover:bg-[var(--portal-color-surface)] transition cursor-pointer">
                                    <Camera className="size-7 text-[var(--portal-color-muted)] mb-1.5" />
                                    <span className="text-xs font-bold text-[var(--portal-color-ink)]">
                                        {isEnrollingFace
                                            ? (faceModelLoading ? 'Memuat model AI...' : 'Mengekstrak vektor wajah...')
                                            : 'Pilih / Ambil Foto Wajah'}
                                    </span>
                                    <span className="text-[11px] text-[var(--portal-color-muted)] mt-0.5">
                                        JPG, JPEG, PNG (Maks 5MB)
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        disabled={isEnrollingFace}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                void handleEnrollFromFile(file);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </ProfileAccordion>
            </div>

            {/* Modal Konfirmasi Hapus Wajah */}
            <Dialog
                open={isConfirmDeleteFaceOpen}
                onOpenChange={setIsConfirmDeleteFaceOpen}
            >
                <DialogContent className="max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <Trash2 className="size-6" />
                        </div>
                        <DialogTitle className="text-center text-base font-bold text-slate-900">
                            Hapus Verifikasi Wajah?
                        </DialogTitle>
                        <DialogDescription className="text-center text-xs text-slate-500 pt-1 leading-relaxed">
                            Data master biometrik dan foto wajah Anda akan dihapus dari sistem. Anda tidak akan dapat melakukan presensi dengan verifikasi wajah sebelum mendaftarkan kembali foto wajah Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex flex-row gap-2 sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setIsConfirmDeleteFaceOpen(false)}
                            disabled={isDeletingFace}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteFace}
                            disabled={isDeletingFace}
                            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 active:bg-rose-800 disabled:opacity-60 transition"
                        >
                            {isDeletingFace ? 'Menghapus...' : 'Ya, Hapus Wajah'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PortalShell>
    );
}
