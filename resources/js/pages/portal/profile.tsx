import { CreditCard, Mail, Phone, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { notifyPortal, requestApi, translatePortalError } from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type ProfileData = {
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
    };
    bank_accounts: Array<{
        id: number;
        bank_name: string;
        account_number: string;
        account_holder_name: string;
        is_primary: boolean;
    }>;
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

export default function PortalProfilePage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formProfile, setFormProfile] = useState({
        phone: '',
        address: '',
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
                requestApi<ProfileData>('/api/mobile/v1/profile'),
            ]);

            setPortal(portalResponse.data);
            setProfile(profileResponse.data);

            if (profileResponse.data.employee) {
                setFormProfile({
                    phone: profileResponse.data.employee.phone || '',
                    address: profileResponse.data.employee.address || '',
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

            await requestApi('/api/mobile/v1/profile', 'PUT', formProfile);
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
                '/api/mobile/v1/profile/bank-account',
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

    const bankAccounts = profile?.bank_accounts || [];
    const primaryBank = bankAccounts.find((b) => b.is_primary);

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
            <section className="mb-5 rounded-[16px] border border-slate-200 bg-white px-5 py-5">
                <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                    Ringkasan karyawan
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-950">
                    {portal?.employee?.full_name ?? 'Profil karyawan'}
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-xs text-slate-500">Kode</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {portal?.employee?.employee_code ?? '-'}
                        </p>
                    </div>
                    <div className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {portal?.employee?.employment_status ?? '-'}
                        </p>
                    </div>
                    <div className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-xs text-slate-500">Divisi</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {portal?.employee?.division?.name ?? '-'}
                        </p>
                    </div>
                    <div className="rounded-[10px] border border-stone-200 bg-stone-50 px-4 py-3">
                        <p className="text-xs text-slate-500">Posisi</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {portal?.employee?.position?.name ?? '-'}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <Phone className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Informasi Pribadi
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Data Kontak
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-900">
                            Nomor Telepon
                        </label>
                        <input
                            type="tel"
                            value={formProfile.phone}
                            onChange={(e) =>
                                setFormProfile((cur) => ({
                                    ...cur,
                                    phone: e.target.value,
                                }))
                            }
                            placeholder="+62812345678 atau 081234567890"
                            className="mt-2 h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-stone-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900">
                            Alamat
                        </label>
                        <textarea
                            value={formProfile.address}
                            onChange={(e) =>
                                setFormProfile((cur) => ({
                                    ...cur,
                                    address: e.target.value.slice(0, 500),
                                }))
                            }
                            placeholder="Masukkan alamat lengkap Anda"
                            maxLength={500}
                            className="mt-2 min-h-24 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            {formProfile.address.length}/500 karakter
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="portal-primary-bg inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9px] text-sm font-semibold disabled:opacity-60"
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

            <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <CreditCard className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Rekening Bank
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Data Bank
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSaveBank} className="mt-5 space-y-4">
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
                            className="mt-2 h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-stone-400"
                            required
                        >
                            <option value="">Pilih Bank</option>
                            <option value="BCA">BCA (Bank Central Asia)</option>
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
                            <option value="Maybank">Maybank Indonesia</option>
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
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 30) {
                                    setFormBank((cur) => ({
                                        ...cur,
                                        account_number: val,
                                    }));
                                }
                            }}
                            placeholder="Contoh: 1234567890"
                            maxLength={30}
                            className="mt-2 h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-stone-400"
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
                            className="mt-2 h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-stone-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="portal-primary-bg inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9px] text-sm font-semibold disabled:opacity-60"
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

            <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        <Mail className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Email
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            {profile?.employee.email || 'Email tidak terdaftar'}
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
        </PortalShell>
    );
}
