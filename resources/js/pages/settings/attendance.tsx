import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Clock, Plus, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
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

export type EmployeeOption = {
    id: number;
    label: string;
};

type Settings = {
    missing_clock_out_request_days: number;
    require_face_recognition?: boolean;
    backup_attendance_enabled?: boolean;
    attendance_revision_cutoff_day: string;
    payroll_cutoff_day?: string;
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
    late_half_day_penalty_type?: 'nominal' | 'prorate_half_day';
    late_half_day_deduct_leave?: boolean;
    unrecorded_cutoff_penalty_enabled?: boolean;
    active_working_days?: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: edit() },
    { title: 'Pengaturan Absensi', href: '/settings/attendance' },
];

export default function AttendanceSettings({
    settings,
    employees = [],
}: {
    settings: Settings;
    employees?: EmployeeOption[];
}) {
    const form = useForm<Settings>({
        missing_clock_out_request_days: settings.missing_clock_out_request_days ?? 2,
        require_face_recognition: settings.require_face_recognition ?? false,
        backup_attendance_enabled: settings.backup_attendance_enabled ?? false,
        attendance_revision_cutoff_day: settings.attendance_revision_cutoff_day ?? 'end_of_month',
        payroll_cutoff_day: settings.payroll_cutoff_day ?? settings.attendance_revision_cutoff_day ?? 'end_of_month',
        unrecorded_cutoff_penalty_enabled: settings.unrecorded_cutoff_penalty_enabled ?? false,
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
        late_half_day_penalty_type: settings.late_half_day_penalty_type ?? 'prorate_half_day',
        late_half_day_deduct_leave: settings.late_half_day_deduct_leave ?? false,
        active_working_days: settings.active_working_days ?? 22,
    });

    const [syncLatenessOpen, setSyncLatenessOpen] = useState(false);
    const [syncScope, setSyncScope] = useState<'range' | 'all'>('range');
    const [syncStartDate, setSyncStartDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [syncEndDate, setSyncEndDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [syncEmployeeId, setSyncEmployeeId] = useState('__all');
    const [isSyncingLateness, setIsSyncingLateness] = useState(false);

    const submitSyncLateness = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSyncingLateness(true);
        router.post(
            '/settings/attendance/sync-lateness',
            {
                start_date: syncScope === 'range' ? syncStartDate : null,
                end_date: syncScope === 'range' ? syncEndDate : null,
                employee_id: syncEmployeeId === '__all' ? null : syncEmployeeId,
                all: syncScope === 'all',
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSyncingLateness(false);
                    setSyncLatenessOpen(false);
                },
            },
        );
    };

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
                <div className="space-y-8 w-full min-w-0 max-w-full">
                    <Heading
                        variant="small"
                        title="Pengaturan Absensi & Keterlambatan"
                        description="Atur batas toleransi keterlambatan, skema denda bertahap, aturan cuti setengah hari, serta parameter kehadiran perusahaan."
                    />

                    <form
                        className="space-y-6 w-full min-w-0 max-w-full"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch('/settings/attendance', {
                                preserveScroll: true,
                            });
                        }}
                    >
                        {/* Section 1: Toleransi & Aturan Keterlambatan */}
                        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm space-y-5 w-full min-w-0 max-w-full overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b w-full min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Clock className="h-5 w-5 text-primary shrink-0" />
                                    <h3 className="font-semibold text-base truncate">Aturan Toleransi & Denda Keterlambatan</h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 w-full sm:w-auto"
                                    onClick={() => setSyncLatenessOpen(true)}
                                >
                                    <Clock className="mr-1.5 size-4" />
                                    Sync Keterlambatan
                                </Button>
                            </div>

                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full min-w-0">
                                <div className="grid gap-2 min-w-0 w-full">
                                    <Label htmlFor="late_tolerance_minutes" className="font-medium truncate">
                                        Batas Toleransi Keterlambatan (Menit)
                                    </Label>
                                    <div className="relative w-full">
                                        <Input
                                            id="late_tolerance_minutes"
                                            type="number"
                                            min="0"
                                            max="480"
                                            className="w-full pr-16"
                                            value={form.data.late_tolerance_minutes}
                                            onChange={(e) =>
                                                form.setData('late_tolerance_minutes', Number(e.target.value))
                                            }
                                        />
                                        <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                                            menit
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Karyawan yang check-in sebelum melewati batas toleransi ini tetap dianggap hadir tepat waktu (misal jam masuk 09.00 dengan toleransi 15 menit, hingga 09.15 tidak dianggap terlambat).
                                    </p>
                                    <InputError message={form.errors.late_tolerance_minutes} />
                                </div>

                                <div className="grid gap-2 min-w-0 w-full">
                                    <Label htmlFor="late_penalty_type" className="font-medium truncate">
                                        Skema / Metode Denda Keterlambatan
                                    </Label>
                                    <select
                                        id="late_penalty_type"
                                        className="h-9 w-full max-w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary truncate"
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
                                <div className="space-y-3 pt-2 w-full min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full min-w-0">
                                        <div className="min-w-0">
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
                                            className="h-8 gap-1 text-xs shrink-0 self-start sm:self-auto"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Tambah Jenjang
                                        </Button>
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border w-full max-w-full">
                                        <table className="w-full min-w-[500px] text-left text-sm">
                                            <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground uppercase">
                                                <tr>
                                                    <th className="px-3 py-2 whitespace-nowrap w-24">Dari (Menit)</th>
                                                    <th className="px-3 py-2 whitespace-nowrap w-28">Sampai (Menit)</th>
                                                    <th className="px-3 py-2 whitespace-nowrap w-36">Nominal Denda (Rp)</th>
                                                    <th className="px-3 py-2 whitespace-nowrap">Keterangan</th>
                                                    <th className="px-3 py-2 text-center w-12 whitespace-nowrap">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {(form.data.late_penalty_tiers ?? []).map((tier, index) => (
                                                    <tr key={index} className="hover:bg-muted/30">
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                className="h-8 w-20 sm:w-24 text-xs"
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
                                                                className="h-8 w-24 sm:w-28 text-xs"
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
                                                                className="h-8 w-28 sm:w-36 text-xs font-mono"
                                                                value={tier.penalty_amount}
                                                                onChange={(e) =>
                                                                    updateTierField(index, 'penalty_amount', Number(e.target.value))
                                                                }
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="text"
                                                                className="h-8 text-xs min-w-[120px] w-full"
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
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 pt-2 bg-muted/20 p-4 rounded-lg border w-full min-w-0">
                                    <div className="grid gap-1.5 min-w-0 w-full">
                                        <Label htmlFor="late_base_penalty_minutes" className="text-xs font-medium truncate">
                                            Mulai Denda Setelah (Menit)
                                        </Label>
                                        <Input
                                            id="late_base_penalty_minutes"
                                            type="number"
                                            min="0"
                                            className="h-8 text-xs w-full"
                                            value={form.data.late_base_penalty_minutes}
                                            onChange={(e) =>
                                                form.setData('late_base_penalty_minutes', Number(e.target.value))
                                            }
                                        />
                                        <span className="text-[11px] text-muted-foreground">Contoh: Menit ke-15</span>
                                    </div>

                                    <div className="grid gap-1.5 min-w-0 w-full">
                                        <Label htmlFor="late_base_penalty_amount" className="text-xs font-medium truncate">
                                            Denda Pertama (Rp)
                                        </Label>
                                        <Input
                                            id="late_base_penalty_amount"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="h-8 text-xs font-mono w-full"
                                            value={form.data.late_base_penalty_amount}
                                            onChange={(e) =>
                                                form.setData('late_base_penalty_amount', Number(e.target.value))
                                            }
                                        />
                                        <span className="text-[11px] text-muted-foreground">Contoh: Rp 10.000</span>
                                    </div>

                                    <div className="grid gap-1.5 min-w-0 w-full">
                                        <Label htmlFor="late_incremental_penalty_amount" className="text-xs font-medium truncate">
                                            Tambahan Denda per Menit (Rp)
                                        </Label>
                                        <Input
                                            id="late_incremental_penalty_amount"
                                            type="number"
                                            min="0"
                                            step="500"
                                            className="h-8 text-xs font-mono w-full"
                                            value={form.data.late_incremental_penalty_amount}
                                            onChange={(e) =>
                                                form.setData('late_incremental_penalty_amount', Number(e.target.value))
                                            }
                                        />
                                        <span className="text-[11px] text-muted-foreground">Contoh: Rp 1.000 / menit</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Aturan Potong Prorata Harian (Keterlambatan Maksimal) */}
                        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm space-y-5 w-full min-w-0 max-w-full overflow-hidden">
                            <div className="flex items-center gap-2 pb-2 border-b w-full min-w-0">
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                                <h3 className="font-semibold text-base truncate">Aturan Keterlambatan Maksimal (Potong Prorata Harian)</h3>
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
                                            Potong Prorata Harian
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            Jika karyawan terlambat melebihi batas menit maksimal yang ditentukan, otomatis potong denda senilai 50% dari prorata harian (gaji pokok + tunjangan tetap dibagi total hari kerja standar).
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {form.data.late_half_day_enabled && (
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 pt-2 w-full min-w-0">
                                    <div className="grid gap-2 min-w-0 w-full">
                                        <Label htmlFor="late_half_day_cutoff_minutes" className="font-medium truncate">
                                            Batas Maksimal Terlambat (Menit)
                                        </Label>
                                        <div className="relative w-full">
                                            <Input
                                                id="late_half_day_cutoff_minutes"
                                                type="number"
                                                min="1"
                                                max="480"
                                                className="w-full pr-16"
                                                value={form.data.late_half_day_cutoff_minutes}
                                                onChange={(e) =>
                                                    form.setData('late_half_day_cutoff_minutes', Number(e.target.value))
                                                }
                                            />
                                            <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                                                menit
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Contoh: 60 menit. Karyawan yang terlambat ≥ 60 menit dari jam masuk akan dikenakan denda potong prorata harian (50%).
                                        </p>
                                        <InputError message={form.errors.late_half_day_cutoff_minutes} />
                                    </div>

                                    <div className="grid gap-2 min-w-0 w-full">
                                        <Label htmlFor="late_half_day_penalty_type" className="font-medium truncate">
                                            Metode Denda Keterlambatan Maksimal
                                        </Label>
                                        <select
                                            id="late_half_day_penalty_type"
                                            className="h-9 w-full max-w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary truncate"
                                            value={form.data.late_half_day_penalty_type}
                                            onChange={(e) =>
                                                form.setData('late_half_day_penalty_type', e.target.value as 'nominal' | 'prorate_half_day')
                                            }
                                        >
                                            <option value="prorate_half_day">Potong Setengah Hari Prorate Gaji</option>
                                            <option value="nominal">Nominal Tetap (Rp)</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            {form.data.late_half_day_penalty_type === 'prorate_half_day'
                                                ? 'Denda dihitung otomatis: 50% × (Gaji Pokok + Tunjangan Tetap) ÷ Hari Kerja Standar per Bulan.'
                                                : 'Denda menggunakan nominal rupiah tetap.'}
                                        </p>
                                    </div>

                                    {form.data.late_half_day_penalty_type === 'prorate_half_day' && (
                                        <div className="sm:col-span-2 rounded-lg border bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 p-3.5 text-xs text-blue-900 dark:text-blue-200 w-full min-w-0">
                                            <p className="font-semibold mb-1">Rumus Perhitungan Potong Prorata Harian (50%):</p>
                                            <p className="font-mono text-[11px] bg-background/80 p-2 rounded border border-blue-200 dark:border-blue-800 break-words">
                                                Denda = 50% × (Gaji Pokok + Total Tunjangan Tetap Aktif) ÷ {settings.active_working_days ?? 22} Hari Kerja
                                            </p>
                                            <p className="mt-1 text-muted-foreground text-[11px]">
                                                Nilai denda ini otomatis dicatat pada kehadiran dan dipotongkan pada draft slip gaji (Denda Keterlambatan).
                                            </p>
                                        </div>
                                    )}

                                    {form.data.late_half_day_penalty_type === 'nominal' && (
                                        <div className="grid gap-2 min-w-0 w-full">
                                            <Label htmlFor="late_half_day_penalty_amount" className="font-medium truncate">
                                                Nominal Denda Tambahan (Rp)
                                            </Label>
                                            <Input
                                                id="late_half_day_penalty_amount"
                                                type="number"
                                                min="0"
                                                step="1000"
                                                className="font-mono w-full"
                                                value={form.data.late_half_day_penalty_amount}
                                                onChange={(e) =>
                                                    form.setData('late_half_day_penalty_amount', Number(e.target.value))
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Besaran denda tetap yang dikenakan saat terlambat mencapai batas menit maksimal.
                                            </p>
                                        </div>
                                    )}

                                    <div className="sm:col-span-2 rounded-lg border bg-amber-500/10 border-amber-500/20 p-4 w-full min-w-0">
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
                                                    Jika dicentang, sistem juga akan otomatis mencatatkan pemotongan saldo cuti tahunan sebesar 0.5 hari untuk tanggal keterlambatan tersebut.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Pengaturan Umum Absensi & Verifikasi */}
                        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm space-y-5 w-full min-w-0 max-w-full overflow-hidden">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-base">Pengaturan Umum & Keamanan Absensi</h3>
                            </div>

                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full min-w-0">
                                <div className="grid gap-2 min-w-0 w-full">
                                    <Label htmlFor="missing_clock_out_request_days" className="font-medium truncate">
                                        Batas Lupa Absen Pulang (H+N)
                                    </Label>
                                    <Input
                                        id="missing_clock_out_request_days"
                                        type="number"
                                        min="0"
                                        max="31"
                                        className="w-full"
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

                                <div className="grid gap-2 min-w-0 w-full">
                                    <Label className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                        Siklus Cut-off Terintegrasi (Payroll & Absensi)
                                    </Label>
                                    <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 p-3 text-xs space-y-1.5 w-full min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-blue-900 dark:text-blue-200 truncate">
                                                {form.data.attendance_revision_cutoff_day === 'end_of_month'
                                                    ? 'Akhir Bulan (Tgl 1 s/d Akhir Bulan)'
                                                    : `Tanggal ${form.data.attendance_revision_cutoff_day} Setiap Bulan`}
                                            </span>
                                            <Link
                                                href="/settings/payroll"
                                                className="text-[11px] font-medium text-primary hover:underline shrink-0"
                                            >
                                                Ubah di Payroll →
                                            </Link>
                                        </div>
                                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                                            Tanggal batas cut-off tersinkronisasi otomatis dengan siklus penggajian untuk menjaga konsistensi akumulasi kehadiran, lembur, dan denda.
                                        </p>
                                    </div>
                                    <input
                                        type="hidden"
                                        name="attendance_revision_cutoff_day"
                                        value={form.data.attendance_revision_cutoff_day}
                                    />
                                </div>

                                <div className="sm:col-span-2 rounded-lg border bg-muted/40 p-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={form.data.unrecorded_cutoff_penalty_enabled}
                                            onChange={(e) =>
                                                form.setData(
                                                    'unrecorded_cutoff_penalty_enabled',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <div className="space-y-1">
                                            <span className="text-sm font-medium leading-none">
                                                Potong Setengah Hari Prorate Jika Karyawan Tidak Absen Sampai Masa Cutoff
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                Jika diaktifkan, jadwal kerja yang tidak memiliki catatan absensi (tidak clock in/out) hingga melewati batas cutoff bulanan akan otomatis dikenakan potongan denda setengah hari prorate (0.5 × [Gaji Pokok + Tunjangan Tetap] / Hari Kerja).
                                            </p>
                                        </div>
                                    </label>
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

                            <div className="rounded-lg border p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={form.data.backup_attendance_enabled}
                                        onChange={(e) =>
                                            form.setData(
                                                'backup_attendance_enabled',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium leading-none">
                                            Aktifkan Fitur Backup Absensi (Kehadiran Rekan Kerja)
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            Saat diaktifkan, karyawan dapat melakukan absensi backup untuk rekan kerja yang berhalangan hadir dalam satu company / sub-company melalui menu backup kehadiran di portal karyawan.
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

            <Dialog open={syncLatenessOpen} onOpenChange={setSyncLatenessOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <Clock className="size-5 text-primary" />
                            <DialogTitle>Sinkronisasi Keterlambatan Presensi</DialogTitle>
                        </div>
                        <DialogDescription>
                            Sistem akan menghitung ulang menit keterlambatan, status kehadiran (hadir / terlambat), level denda, dan aturan cuti setengah hari untuk data presensi yang sudah tercatat berdasarkan jadwal kerja dan toleransi terbaru.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitSyncLateness} className="space-y-4 pt-2">
                        <div className="space-y-2.5 rounded-lg border bg-muted/40 p-3">
                            <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Cakupan Data Presensi
                            </Label>
                            <div className="grid gap-2">
                                <label className="flex items-center gap-2.5 text-sm cursor-pointer font-medium">
                                    <input
                                        type="radio"
                                        name="sync_scope"
                                        checked={syncScope === 'range'}
                                        onChange={() => setSyncScope('range')}
                                        className="size-4 text-primary"
                                    />
                                    <span>Rentang Tanggal Tertentu</span>
                                </label>
                                <label className="flex items-center gap-2.5 text-sm cursor-pointer font-medium">
                                    <input
                                        type="radio"
                                        name="sync_scope"
                                        checked={syncScope === 'all'}
                                        onChange={() => setSyncScope('all')}
                                        className="size-4 text-primary"
                                    />
                                    <span>Seluruh Riwayat Data Presensi</span>
                                </label>
                            </div>
                        </div>

                        {syncScope === 'range' && (
                            <div className="grid gap-2">
                                <Label>Rentang Tanggal Sinkronisasi</Label>
                                <DateRangePicker
                                    value={{
                                        from: syncStartDate,
                                        to: syncEndDate,
                                    }}
                                    onChange={(range) => {
                                        setSyncStartDate(range.from);
                                        setSyncEndDate(range.to ?? range.from);
                                    }}
                                    placeholder="Pilih rentang tanggal sinkronisasi..."
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="sync_employee_id">Filter Karyawan (Opsional)</Label>
                            <SearchableSelect
                                id="sync_employee_id"
                                value={syncEmployeeId}
                                onValueChange={setSyncEmployeeId}
                                placeholder="Semua karyawan"
                                searchPlaceholder="Cari karyawan..."
                                options={[
                                    { value: '__all', label: 'Semua Karyawan' },
                                    ...employees.map((emp) => ({
                                        value: String(emp.id),
                                        label: emp.label,
                                    })),
                                ]}
                                className="w-full"
                            />
                        </div>

                        <div className="rounded-md bg-blue-50/80 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                            <p className="font-semibold flex items-center gap-1.5">
                                <Clock className="size-3.5" />
                                Informasi Aturan:
                            </p>
                            <p>
                                • Presensi yang check-in sebelum melewati batas toleransi akan otomatis diperbarui menjadi <strong>Hadir</strong> (denda &amp; menit keterlambatan direset).
                            </p>
                            <p>
                                • Presensi yang melebihi batas toleransi akan diperbarui menjadi <strong>Terlambat</strong> dan dendanya dihitung ulang sesuai skema denda aktif.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSyncLatenessOpen(false)}
                                disabled={isSyncingLateness}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSyncingLateness}>
                                {isSyncingLateness ? (
                                    <>
                                        <RotateCcw className="size-4 animate-spin mr-1.5" />
                                        Menyinkronkan...
                                    </>
                                ) : (
                                    <>
                                        <Clock className="size-4 mr-1.5" />
                                        Mulai Sinkronisasi
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
