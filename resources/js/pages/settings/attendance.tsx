import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Clock, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

export type LatePenaltyTier = {
    from_minute: number;
    to_minute: number | null | '';
    penalty_amount: number;
    description?: string;
};

type Settings = {
    missing_clock_out_request_days: number;
    require_face_recognition?: boolean;
    attendance_revision_cutoff_day: string;
    late_penalty_enabled?: boolean;
    late_tolerance_minutes: number;
    late_penalty_type: 'tiered' | 'progressive';
    late_penalty_tiers?: LatePenaltyTier[];
    late_base_penalty_minutes?: number;
    late_base_penalty_amount?: number;
    late_incremental_penalty_amount?: number;
    late_incremental_unit_minutes?: number;
    late_half_day_enabled?: boolean;
    late_half_day_cutoff_minutes?: number;
    late_half_day_penalty_amount?: number;
    late_half_day_deduct_leave?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: edit() },
    { title: 'Pengaturan Absensi', href: '/settings/attendance' },
];

export default function AttendanceSettings({
    settings,
}: {
    settings: Settings;
}) {
    const form = useForm<Settings>({
        missing_clock_out_request_days: settings.missing_clock_out_request_days ?? 2,
        require_face_recognition: settings.require_face_recognition ?? false,
        attendance_revision_cutoff_day: settings.attendance_revision_cutoff_day ?? 'end_of_month',
        late_penalty_enabled: settings.late_penalty_enabled ?? false,
        late_tolerance_minutes: settings.late_tolerance_minutes ?? 15,
        late_penalty_type: settings.late_penalty_type ?? 'tiered',
        late_penalty_tiers: settings.late_penalty_tiers ?? [
            { from_minute: 1, to_minute: 15, penalty_amount: 0, description: 'Toleransi' },
            { from_minute: 16, to_minute: 30, penalty_amount: 20000, description: 'Terlambat 16-30 menit' },
            { from_minute: 31, to_minute: 60, penalty_amount: 50000, description: 'Terlambat 31-60 menit' },
        ],
        late_base_penalty_minutes: settings.late_base_penalty_minutes ?? 15,
        late_base_penalty_amount: settings.late_base_penalty_amount ?? 0,
        late_incremental_penalty_amount: settings.late_incremental_penalty_amount ?? 0,
        late_incremental_unit_minutes: settings.late_incremental_unit_minutes ?? 1,
        late_half_day_enabled: settings.late_half_day_enabled ?? false,
        late_half_day_cutoff_minutes: settings.late_half_day_cutoff_minutes ?? 60,
        late_half_day_penalty_amount: settings.late_half_day_penalty_amount ?? 0,
        late_half_day_deduct_leave: settings.late_half_day_deduct_leave ?? true,
    });

    const addTierRow = () => {
        const currentTiers = form.data.late_penalty_tiers ?? [];
        const lastTier = currentTiers[currentTiers.length - 1];
        const nextFrom = lastTier && typeof lastTier.to_minute === 'number' ? lastTier.to_minute + 1 : 1;
        
        form.setData('late_penalty_tiers', [
            ...currentTiers,
            {
                from_minute: nextFrom,
                to_minute: nextFrom + 30,
                penalty_amount: 0,
                description: `Terlambat ${nextFrom} - ${nextFrom + 30} menit`,
            },
        ]);
    };

    const removeTierRow = (index: number) => {
        const currentTiers = [...(form.data.late_penalty_tiers ?? [])];
        currentTiers.splice(index, 1);
        form.setData('late_penalty_tiers', currentTiers);
    };

    const updateTierField = (index: number, field: keyof LatePenaltyTier, value: any) => {
        const currentTiers = [...(form.data.late_penalty_tiers ?? [])];
        currentTiers[index] = {
            ...currentTiers[index],
            [field]: value,
        };
        form.setData('late_penalty_tiers', currentTiers);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Absensi" />
            <SettingsLayout>
                <div className="space-y-8">
                    <Heading
                        variant="small"
                        title="Pengaturan Absensi & Keterlambatan"
                        description="Atur batas toleransi keterlambatan, skema denda bertahap, aturan cuti setengah hari, serta parameter kehadiran perusahaan."
                    />

                    <form
                        className="space-y-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch('/settings/attendance', {
                                preserveScroll: true,
                            });
                        }}
                    >
                        {/* Section 1: Toleransi & Aturan Keterlambatan */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <Clock className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-base">Aturan Toleransi & Denda Keterlambatan</h3>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="late_tolerance_minutes" className="font-medium">
                                        Batas Toleransi Keterlambatan (Menit)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="late_tolerance_minutes"
                                            type="number"
                                            min="0"
                                            max="480"
                                            value={form.data.late_tolerance_minutes}
                                            onChange={(e) =>
                                                form.setData('late_tolerance_minutes', Number(e.target.value))
                                            }
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                                            menit
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Karyawan yang check-in sebelum melewati batas toleransi ini tetap dianggap hadir tepat waktu (misal jam masuk 09.00 dengan toleransi 15 menit, hingga 09.15 tidak dianggap terlambat).
                                    </p>
                                    <InputError message={form.errors.late_tolerance_minutes} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="late_penalty_type" className="font-medium">
                                        Skema / Metode Denda Keterlambatan
                                    </Label>
                                    <select
                                        id="late_penalty_type"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary"
                                        value={form.data.late_penalty_type}
                                        onChange={(e) =>
                                            form.setData('late_penalty_type', e.target.value as 'tiered' | 'progressive')
                                        }
                                    >
                                        <option value="tiered">Bertahap per Jenjang Waktu (Tiered Range)</option>
                                        <option value="progressive">Progresif per Tambahan Menit</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        Pilih apakah denda dihitung berdasarkan rentang waktu bertingkat atau tambahan per kelipatan menit.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={form.data.late_penalty_enabled}
                                        onChange={(e) =>
                                            form.setData('late_penalty_enabled', e.target.checked)
                                        }
                                    />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium leading-none">
                                            Aktifkan Denda Keterlambatan
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            Saat diaktifkan, keterlambatan check-in akan otomatis menghitung nominal denda pada data absensi dan diakumulasikan ke potongan denda saat generate payroll.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Sub-section: Tiered Configuration Table */}
                            {form.data.late_penalty_enabled && form.data.late_penalty_type === 'tiered' && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="font-medium">Tabel Jenjang Denda Bertahap</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Tentukan rentang menit keterlambatan (dihitung dari jam shift masuk) dan besaran dendanya.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addTierRow}
                                            className="h-8 gap-1 text-xs"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Tambah Jenjang
                                        </Button>
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground uppercase">
                                                <tr>
                                                    <th className="px-3 py-2">Dari (Menit)</th>
                                                    <th className="px-3 py-2">Sampai (Menit)</th>
                                                    <th className="px-3 py-2">Nominal Denda (Rp)</th>
                                                    <th className="px-3 py-2">Keterangan</th>
                                                    <th className="px-3 py-2 text-center w-12">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {(form.data.late_penalty_tiers ?? []).map((tier, index) => (
                                                    <tr key={index} className="hover:bg-muted/30">
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                className="h-8 w-24 text-xs"
                                                                value={tier.from_minute}
                                                                onChange={(e) =>
                                                                    updateTierField(index, 'from_minute', Number(e.target.value))
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                placeholder="Tak terhingga"
                                                                className="h-8 w-28 text-xs"
                                                                value={tier.to_minute ?? ''}
                                                                onChange={(e) =>
                                                                    updateTierField(
                                                                        index,
                                                                        'to_minute',
                                                                        e.target.value === '' ? null : Number(e.target.value),
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="1000"
                                                                className="h-8 w-36 text-xs font-mono"
                                                                value={tier.penalty_amount}
                                                                onChange={(e) =>
                                                                    updateTierField(index, 'penalty_amount', Number(e.target.value))
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="text"
                                                                className="h-8 text-xs"
                                                                value={tier.description ?? ''}
                                                                placeholder="Contoh: Terlambat 16-30 menit"
                                                                onChange={(e) =>
                                                                    updateTierField(index, 'description', e.target.value)
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeTierRow(index)}
                                                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(form.data.late_penalty_tiers ?? []).length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="py-4 text-center text-xs text-muted-foreground">
                                                            Belum ada jenjang denda. Klik "Tambah Jenjang" untuk menambahkan tingkatan denda.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Sub-section: Progressive/Per-minute Configuration */}
                            {form.data.late_penalty_enabled && form.data.late_penalty_type === 'progressive' && (
                                <div className="grid gap-4 sm:grid-cols-3 pt-2 bg-muted/20 p-4 rounded-lg border">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="late_base_penalty_minutes" className="text-xs font-medium">
                                            Mulai Denda Setelah (Menit)
                                        </Label>
                                        <Input
                                            id="late_base_penalty_minutes"
                                            type="number"
                                            min="0"
                                            className="h-8 text-xs"
                                            value={form.data.late_base_penalty_minutes}
                                            onChange={(e) =>
                                                form.setData('late_base_penalty_minutes', Number(e.target.value))
                                            }
                                        />
                                        <span className="text-[11px] text-muted-foreground">Contoh: Menit ke-15</span>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="late_base_penalty_amount" className="text-xs font-medium">
                                            Denda Pertama (Rp)
                                        </Label>
                                        <Input
                                            id="late_base_penalty_amount"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="h-8 text-xs font-mono"
                                            value={form.data.late_base_penalty_amount}
                                            onChange={(e) =>
                                                form.setData('late_base_penalty_amount', Number(e.target.value))
                                            }
                                        />
                                        <span className="text-[11px] text-muted-foreground">Contoh: Rp 10.000</span>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="late_incremental_penalty_amount" className="text-xs font-medium">
                                            Tambahan Denda per Menit (Rp)
                                        </Label>
                                        <Input
                                            id="late_incremental_penalty_amount"
                                            type="number"
                                            min="0"
                                            step="500"
                                            className="h-8 text-xs font-mono"
                                            value={form.data.late_incremental_penalty_amount}
                                            onChange={(e) =>
                                                form.setData('late_incremental_penalty_amount', Number(e.target.value))
                                            }
                                        />
                                        <span className="text-[11px] text-muted-foreground">Contoh: Rp 1.000 / menit berikutnya</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Aturan Cuti Setengah Hari & Maksimal Keterlambatan */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <h3 className="font-semibold text-base">Aturan Keterlambatan Maksimal & Cuti Setengah Hari</h3>
                            </div>

                            <div className="rounded-lg border bg-muted/40 p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={form.data.late_half_day_enabled}
                                        onChange={(e) =>
                                            form.setData('late_half_day_enabled', e.target.checked)
                                        }
                                    />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium leading-none">
                                            Aktifkan Aturan Keterlambatan Cuti Setengah Hari
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            Jika karyawan terlambat melebihi batas menit maksimal yang ditentukan, kehadiran otomatis ditandai sebagai cuti setengah hari.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {form.data.late_half_day_enabled && (
                                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="late_half_day_cutoff_minutes" className="font-medium">
                                            Batas Maksimal Terlambat (Menit)
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="late_half_day_cutoff_minutes"
                                                type="number"
                                                min="1"
                                                max="480"
                                                value={form.data.late_half_day_cutoff_minutes}
                                                onChange={(e) =>
                                                    form.setData('late_half_day_cutoff_minutes', Number(e.target.value))
                                                }
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                                                menit
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Contoh: 60 menit. Karyawan yang terlambat ≥ 60 menit dari jam masuk akan dianggap cuti setengah hari.
                                        </p>
                                        <InputError message={form.errors.late_half_day_cutoff_minutes} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="late_half_day_penalty_amount" className="font-medium">
                                            Nominal Denda Tambahan (Rp)
                                        </Label>
                                        <Input
                                            id="late_half_day_penalty_amount"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="font-mono"
                                            value={form.data.late_half_day_penalty_amount}
                                            onChange={(e) =>
                                                form.setData('late_half_day_penalty_amount', Number(e.target.value))
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Besaran denda yang dikenakan saat terlambat mencapai batas cuti setengah hari (opsional).
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2 rounded-lg border bg-amber-500/10 border-amber-500/20 p-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={form.data.late_half_day_deduct_leave}
                                                onChange={(e) =>
                                                    form.setData('late_half_day_deduct_leave', e.target.checked)
                                                }
                                            />
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium leading-none text-foreground">
                                                    Otomatis Potong Saldo Cuti Tahunan (0.5 Hari)
                                                </span>
                                                <p className="text-xs text-muted-foreground">
                                                    Jika dicentang, sistem akan otomatis mencatatkan pemotongan saldo cuti tahunan sebesar 0.5 hari untuk tanggal keterlambatan tersebut.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Pengaturan Umum Absensi & Verifikasi */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-base">Pengaturan Umum & Keamanan Absensi</h3>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="missing_clock_out_request_days">
                                        Batas Lupa Absen Pulang (H+N)
                                    </Label>
                                    <Input
                                        id="missing_clock_out_request_days"
                                        type="number"
                                        min="0"
                                        max="31"
                                        value={form.data.missing_clock_out_request_days}
                                        onChange={(event) =>
                                            form.setData(
                                                'missing_clock_out_request_days',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Default 2. Absensi tanggal 1 dapat diajukan sampai tanggal 3.
                                    </p>
                                    <InputError
                                        message={form.errors.missing_clock_out_request_days}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="attendance_revision_cutoff_day">
                                        Tanggal Cut-off Absensi Bulanan
                                    </Label>
                                    <select
                                        id="attendance_revision_cutoff_day"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary"
                                        value={form.data.attendance_revision_cutoff_day}
                                        onChange={(event) =>
                                            form.setData(
                                                'attendance_revision_cutoff_day',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {Array.from({ length: 28 }, (_, index) => (
                                            <option
                                                key={index + 1}
                                                value={String(index + 1)}
                                            >
                                                Tanggal {index + 1}
                                            </option>
                                        ))}
                                        <option value="end_of_month">
                                            Akhir Bulan
                                        </option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        Revisi absensi periode berjalan ditutup setelah tanggal ini.
                                    </p>
                                    <InputError
                                        message={form.errors.attendance_revision_cutoff_day}
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={form.data.require_face_recognition}
                                        onChange={(e) =>
                                            form.setData(
                                                'require_face_recognition',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium leading-none">
                                            Wajibkan Face Recognition (Pengenalan Wajah)
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            Saat diaktifkan, karyawan wajib melakukan verifikasi live detection wajah yang cocok dengan master foto wajah sebelum dapat clock-in atau clock-out.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button disabled={form.processing} className="min-w-[150px]">
                                {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </Button>
                            {form.recentlySuccessful && (
                                <span className="text-xs text-emerald-600 font-medium animate-fade-in">
                                    Pengaturan berhasil disimpan!
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
