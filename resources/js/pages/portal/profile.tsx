import { CheckCircle2, CreditCard, Mail, Phone, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    formatDate,
    notifyPortal,
    requestApi,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
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
};

type PortalSummary = {
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

export default function PortalProfilePage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const bankAccounts = profile?.bank_accounts || [];
    const primaryBank = bankAccounts.find((b) => b.is_primary);
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
                <section className="rounded-[var(--portal-radius-surface)] bg-[var(--portal-color-ink)] px-4 py-4 text-[var(--portal-color-paper)] shadow-[var(--portal-shadow-material)]">
                    <p className="font-semibold tracking-[0.16em] text-[var(--portal-color-accent-soft)] text-[var(--portal-text-label)] uppercase">
                        Profil karyawan
                    </p>
                    <h2 className="mt-2 min-w-0 font-bold tracking-[-0.04em] [overflow-wrap:anywhere] text-[var(--portal-text-lg)]">
                        {portal?.employee?.full_name ?? 'Profil karyawan'}
                    </h2>
                    <p className="mt-1 text-[var(--portal-color-accent-soft)] text-[var(--portal-text-sm)]">
                        {portal?.employee?.position?.name ??
                            'Posisi belum diisi'}
                        {' · '}
                        {portal?.employee?.division?.name ??
                            'Divisi belum diisi'}
                    </p>
                    <div className="mt-3 flex min-w-0 items-center justify-between gap-4 border-t border-[var(--portal-color-accent)] pt-3">
                        <span className="min-w-0">
                            <span className="block text-[var(--portal-color-accent-soft)] text-[var(--portal-text-xs)]">
                                Kode karyawan
                            </span>
                            <span className="mt-1 block truncate font-semibold text-[var(--portal-text-sm)]">
                                {portal?.employee?.employee_code ?? '-'}
                            </span>
                        </span>
                        <span className="shrink-0 rounded-[var(--portal-radius-pill)] bg-[var(--portal-color-accent)] px-3 py-1.5 font-semibold text-[var(--portal-color-accent-ink)] text-[var(--portal-text-xs)]">
                            {portal?.employee?.employment_status ?? '-'}
                        </span>
                    </div>
                </section>

                {profile?.profile_completion && (
                    <section className="rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-4 py-4 shadow-[var(--portal-shadow-raised)]">
                        <div className="flex min-w-0 items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="font-semibold tracking-[0.14em] text-[var(--portal-color-muted)] text-[var(--portal-text-label)] uppercase">
                                    Kelengkapan profil
                                </p>
                                <h2 className="mt-1 font-bold tracking-[-0.04em] text-[var(--portal-color-ink)] text-[var(--portal-text-md)]">
                                    {profile.profile_completion.percent}%
                                    lengkap
                                </h2>
                            </div>
                            <span
                                className={`shrink-0 rounded-[var(--portal-radius-pill)] px-3 py-1.5 font-semibold text-[var(--portal-text-xs)] ${
                                    profile.profile_completion.is_complete
                                        ? 'bg-[var(--portal-color-success-soft)] text-[var(--portal-color-success)]'
                                        : 'bg-[var(--portal-color-warning-soft)] text-[var(--portal-color-warning)]'
                                }`}
                            >
                                {profile.profile_completion.is_complete
                                    ? 'Lengkap'
                                    : `${profile.profile_completion.missing_count} perlu diisi`}
                            </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-[var(--portal-radius-pill)] bg-[var(--portal-color-surface-raised)]">
                            <div
                                className={`h-full rounded-[var(--portal-radius-pill)] ${
                                    profile.profile_completion.is_complete
                                        ? 'bg-[var(--portal-color-success)]'
                                        : 'bg-[var(--portal-color-warning)]'
                                }`}
                                style={{
                                    width: `${profile.profile_completion.percent}%`,
                                }}
                            />
                        </div>
                        <details className="mt-3 rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)] px-3 py-2.5">
                            <summary className="cursor-pointer font-semibold text-[var(--portal-color-ink)] text-[var(--portal-text-sm)]">
                                Lihat detail kelengkapan
                            </summary>
                            <div className="mt-2 space-y-1.5">
                                {profile.profile_completion.items.map(
                                    (item) => (
                                        <div
                                            key={item.key}
                                            className="flex min-w-0 items-start gap-2"
                                        >
                                            <CheckCircle2
                                                className={`mt-0.5 size-4 shrink-0 ${
                                                    item.complete
                                                        ? 'text-[var(--portal-color-success)]'
                                                        : 'text-[var(--portal-color-muted)]'
                                                }`}
                                                aria-hidden="true"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[var(--portal-color-ink)] text-[var(--portal-text-sm)]">
                                                    {item.label}
                                                </p>
                                                <p className="text-[var(--portal-color-muted)] text-[var(--portal-text-xs)]">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </details>
                    </section>
                )}

                <section className="rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-4 py-4 shadow-[var(--portal-shadow-raised)]">
                    <div className="flex items-center gap-3">
                        <span className="portal-primary-soft inline-flex size-9 items-center justify-center rounded-lg">
                            <Phone className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                Informasi Pribadi
                            </p>
                            <h2 className="mt-1 text-lg font-bold tracking-[-0.04em]">
                                Data Diri & Identitas
                            </h2>
                        </div>
                    </div>

                    <details className="mt-3 rounded-[var(--portal-radius-control)] bg-[var(--portal-color-surface-raised)] px-3 py-2.5">
                        <summary className="cursor-pointer font-semibold text-[var(--portal-color-ink)] text-[var(--portal-text-sm)]">
                            Lihat data tersimpan
                        </summary>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                            {personalDetails.map((item) => (
                                <div key={item.label} className="min-w-0">
                                    <dt className="text-[var(--portal-color-muted)] text-[var(--portal-text-xs)]">
                                        {item.label}
                                    </dt>
                                    <dd className="mt-0.5 truncate font-semibold text-[var(--portal-color-ink)] text-[var(--portal-text-sm)]">
                                        {formatProfileValue(item.value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </details>

                    <form
                        onSubmit={handleSaveProfile}
                        className="mt-4 space-y-3"
                    >
                        <div className="border-t border-[var(--portal-color-rule)] pt-4">
                            <p className="font-semibold tracking-[0.14em] text-[var(--portal-color-muted)] text-[var(--portal-text-label)] uppercase">
                                Perbarui data
                            </p>
                            <p className="mt-1 text-[var(--portal-color-muted)] text-[var(--portal-text-sm)]">
                                Isi informasi yang diperlukan agar profil tetap
                                akurat.
                            </p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900">
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
                                    className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                >
                                    <option value="">Pilih gender</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900">
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
                                    className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900">
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
                                    className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900">
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
                                    className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
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

                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900">
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
                                    className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900">
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
                                    className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900">
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
                                className="mt-1.5 min-h-20 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-400"
                                required
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                {formProfile.address.length}/500 karakter
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
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
                                    <label className="block text-sm font-semibold text-slate-900">
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
                                        className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {[
                                ['biological_mother_name', 'Nama Ibu Kandung'],
                                ['emergency_contact_name', 'Kontak Darurat'],
                                [
                                    'emergency_contact_phone',
                                    'No. Telepon Kontak Darurat',
                                ],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <label className="block text-sm font-semibold text-slate-900">
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
                                        className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="portal-primary-bg inline-flex h-11 w-full items-center justify-center gap-2 rounded-[9px] text-sm font-semibold disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <div className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Simpan Profil
                                </>
                            )}
                        </button>
                    </form>
                </section>

                <section className="rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-4 py-4 shadow-[var(--portal-shadow-raised)]">
                    <div className="flex items-center gap-3">
                        <span className="portal-primary-soft inline-flex size-9 items-center justify-center rounded-lg">
                            <CreditCard className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                Rekening Bank
                            </p>
                            <h2 className="mt-1 text-lg font-bold tracking-[-0.04em]">
                                Data Bank
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSaveBank} className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-900">
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
                                className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
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
                            <label className="block text-sm font-semibold text-slate-900">
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
                                className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                required
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                10-30 digit angka
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900">
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
                                className="mt-1.5 h-11 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-stone-400"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="portal-primary-bg inline-flex h-11 w-full items-center justify-center gap-2 rounded-[9px] text-sm font-semibold disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <div className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Simpan Rekening
                                </>
                            )}
                        </button>
                    </form>

                    {primaryBank ? (
                        <div className="mt-5 rounded-[12px] border border-stone-200 bg-stone-50 p-4">
                            <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                                Rekening Tersimpan
                            </p>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">
                                        Bank
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {primaryBank.bank_name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">
                                        Nomor Rekening
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        ****
                                        {primaryBank.account_number.slice(-4)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">
                                        Atas Nama
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {primaryBank.account_holder_name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </section>

                <section className="rounded-[var(--portal-radius-surface)] border border-[var(--portal-color-rule)] bg-[var(--portal-color-surface)] px-4 py-4 shadow-[var(--portal-shadow-raised)]">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                            <Mail className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                Email
                            </p>
                            <h2 className="mt-1 text-lg font-bold tracking-[-0.04em]">
                                {profile?.employee.email ||
                                    'Email tidak terdaftar'}
                            </h2>
                        </div>
                    </div>

                    <div className="mt-4 rounded-[9px] border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-sm text-slate-600">
                            Untuk mengubah email, silakan hubungi HR atau
                            administrator sistem.
                        </p>
                    </div>
                </section>
            </div>
        </PortalShell>
    );
}
