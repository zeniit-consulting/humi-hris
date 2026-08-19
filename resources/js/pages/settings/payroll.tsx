import { Plus, Trash2 } from 'lucide-react';
import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

type Settings = {
    active_working_days: number;
    auto_deduct_leave_for_missing_checkout: boolean;
    overtime_calculation_mode: 'hourly' | 'threshold_daily';
    overtime_rate_type: 'formula' | 'fixed';
    overtime_fixed_rate_per_hour: number | null;
    overtime_threshold_hours: number;
    overtime_hour_divisor: number;
    overtime_multiplier_hour1: number;
    overtime_multiplier_subsequent: number;
    overtime_events: { name: string; nominal: number }[];
    auto_overtime_from_attendance: boolean;
    auto_overtime_min_minutes: number;
    bpjs_kesehatan_enabled: boolean;
    bpjs_ketenagakerjaan_enabled: boolean;
    bpjs_kesehatan_wage_cap: number;
    bpjs_jp_wage_cap: number;
    bpjs_jkk_rate: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: edit() },
    { title: 'Pengaturan Payroll & Lembur', href: '/settings/payroll' },
];

export default function PayrollSettings({ settings }: { settings: Settings }) {
    const form = useForm({
        ...settings,
        overtime_events: settings.overtime_events ?? [],
        overtime_fixed_rate_per_hour:
            settings.overtime_fixed_rate_per_hour ?? '',
        auto_deduct_leave_for_missing_checkout:
            settings.auto_deduct_leave_for_missing_checkout,
        auto_overtime_from_attendance: settings.auto_overtime_from_attendance,
        auto_overtime_min_minutes: settings.auto_overtime_min_minutes ?? 30,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Payroll & Lembur" />
            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Pengaturan Payroll & Lembur"
                        description="Atur hari kerja, potongan cuti tanpa gaji, dan perhitungan upah lembur."
                    />

                    <form
                        className="space-y-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch('/settings/payroll', {
                                preserveScroll: true,
                            });
                        }}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="active_working_days">
                                    Hari Kerja Aktif
                                </Label>
                                <Input
                                    id="active_working_days"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={form.data.active_working_days}
                                    onChange={(event) =>
                                        form.setData(
                                            'active_working_days',
                                            Number(event.target.value),
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Default 22 hari. Digunakan untuk potongan
                                    cuti tanpa gaji per hari.
                                </p>
                                <InputError
                                    message={form.errors.active_working_days}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_calculation_mode">
                                    Metode Hitung Lembur
                                </Label>
                                <select
                                    id="overtime_calculation_mode"
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={form.data.overtime_calculation_mode}
                                    onChange={(event) =>
                                        form.setData(
                                            'overtime_calculation_mode',
                                            event.target
                                                .value as Settings['overtime_calculation_mode'],
                                        )
                                    }
                                >
                                    <option value="hourly">Per jam</option>
                                    <option value="threshold_daily">
                                        Per ambang jam
                                    </option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Mode ambang menghitung setiap ambang yang
                                    terpenuhi sebagai 8 jam / 1 hari.
                                </p>
                                <InputError
                                    message={
                                        form.errors.overtime_calculation_mode
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_threshold_hours">
                                    Ambang Jam
                                </Label>
                                <Input
                                    id="overtime_threshold_hours"
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={form.data.overtime_threshold_hours}
                                    onChange={(event) =>
                                        form.setData(
                                            'overtime_threshold_hours',
                                            Number(event.target.value),
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Contoh: 10 jam dapat dihitung sebagai 8 jam
                                    / 1 hari.
                                </p>
                                <InputError
                                    message={
                                        form.errors.overtime_threshold_hours
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_rate_type">
                                    Skema Tarif Lembur
                                </Label>
                                <select
                                    id="overtime_rate_type"
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={form.data.overtime_rate_type}
                                    onChange={(event) =>
                                        form.setData(
                                            'overtime_rate_type',
                                            event.target
                                                .value as Settings['overtime_rate_type'],
                                        )
                                    }
                                >
                                    <option value="formula">
                                        Formula Gaji Pokok (Depnaker / Standar)
                                    </option>
                                    <option value="fixed">
                                        Nominal Flat per Jam (Fixed Rate)
                                    </option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Pilih apakah upah lembur per jam dihitung
                                    dari gaji pokok atau nominal tetap.
                                </p>
                                <InputError
                                    message={form.errors.overtime_rate_type}
                                />
                            </div>

                            {form.data.overtime_rate_type === 'fixed' ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="overtime_fixed_rate_per_hour">
                                        Nominal Lembur per Jam (Rp)
                                    </Label>
                                    <Input
                                        id="overtime_fixed_rate_per_hour"
                                        type="number"
                                        min="0"
                                        placeholder="Contoh: 20000"
                                        value={
                                            form.data
                                                .overtime_fixed_rate_per_hour ??
                                            ''
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'overtime_fixed_rate_per_hour',
                                                event.target.value === ''
                                                    ? null
                                                    : Number(
                                                          event.target.value,
                                                      ),
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Nominal tetap per jam yang dibayarkan ke
                                        karyawan tanpa menghitung gaji pokok.
                                    </p>
                                    <InputError
                                        message={
                                            form.errors
                                                .overtime_fixed_rate_per_hour
                                        }
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="overtime_hour_divisor">
                                            Pembagi Jam
                                        </Label>
                                        <Input
                                            id="overtime_hour_divisor"
                                            type="number"
                                            min="1"
                                            value={
                                                form.data.overtime_hour_divisor
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'overtime_hour_divisor',
                                                    Number(event.target.value),
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Gaji per jam = gaji pokok dibagi
                                            divisor. Standar: 173 jam/bulan.
                                        </p>
                                        <InputError
                                            message={
                                                form.errors
                                                    .overtime_hour_divisor
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="overtime_multiplier_hour1">
                                            Multiplier Jam Pertama
                                        </Label>
                                        <Input
                                            id="overtime_multiplier_hour1"
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            value={
                                                form.data
                                                    .overtime_multiplier_hour1
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'overtime_multiplier_hour1',
                                                    Number(event.target.value),
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                form.errors
                                                    .overtime_multiplier_hour1
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="overtime_multiplier_subsequent">
                                            Multiplier Jam Selanjutnya
                                        </Label>
                                        <Input
                                            id="overtime_multiplier_subsequent"
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            value={
                                                form.data
                                                    .overtime_multiplier_subsequent
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'overtime_multiplier_subsequent',
                                                    Number(event.target.value),
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                form.errors
                                                    .overtime_multiplier_subsequent
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Daftar Lembur Event
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Tambahkan jenis kegiatan luar jam kerja
                                        beserta nominal bayarannya.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        form.setData('overtime_events', [
                                            ...form.data.overtime_events,
                                            { name: '', nominal: 0 },
                                        ])
                                    }
                                    className="h-8 gap-1.5 text-xs"
                                >
                                    <Plus className="size-3.5" />
                                    Tambah Event
                                </Button>
                            </div>
                            {form.data.overtime_events.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    {form.data.overtime_events.map(
                                        (event, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <Input
                                                        placeholder="Nama Kegiatan (misal: Jaga Stand Akhir Pekan)"
                                                        value={event.name}
                                                        required
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...form.data
                                                                    .overtime_events,
                                                            ];
                                                            newEvents[
                                                                index
                                                            ].name =
                                                                e.target.value;
                                                            form.setData(
                                                                'overtime_events',
                                                                newEvents,
                                                            );
                                                        }}
                                                    />
                                                    <InputError
                                                        message={
                                                            (
                                                                form.errors as Record<
                                                                    string,
                                                                    string
                                                                >
                                                            )[
                                                                `overtime_events.${index}.name`
                                                            ]
                                                        }
                                                    />
                                                </div>
                                                <div className="w-1/3 space-y-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="Nominal (Rp)"
                                                        min="0"
                                                        value={event.nominal}
                                                        required
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...form.data
                                                                    .overtime_events,
                                                            ];
                                                            newEvents[
                                                                index
                                                            ].nominal = Number(
                                                                e.target.value,
                                                            );
                                                            form.setData(
                                                                'overtime_events',
                                                                newEvents,
                                                            );
                                                        }}
                                                    />
                                                    <InputError
                                                        message={
                                                            (
                                                                form.errors as Record<
                                                                    string,
                                                                    string
                                                                >
                                                            )[
                                                                `overtime_events.${index}.nominal`
                                                            ]
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newEvents = [
                                                            ...form.data
                                                                .overtime_events,
                                                        ];
                                                        newEvents.splice(
                                                            index,
                                                            1,
                                                        );
                                                        form.setData(
                                                            'overtime_events',
                                                            newEvents,
                                                        );
                                                    }}
                                                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                            <InputError
                                message={form.errors.overtime_events as string}
                            />
                        </div>

                        <div className="space-y-4 rounded-lg border bg-slate-50/60 p-4">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="hidden"
                                    name="auto_overtime_from_attendance"
                                    value={
                                        form.data.auto_overtime_from_attendance
                                            ? '1'
                                            : '0'
                                    }
                                />
                                <input
                                    id="auto_overtime_from_attendance"
                                    type="checkbox"
                                    checked={
                                        form.data.auto_overtime_from_attendance
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'auto_overtime_from_attendance',
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-0.5 size-4 rounded border-input accent-primary"
                                />
                                <span>
                                    <span className="block text-sm font-medium">
                                        Otomatis catat lembur jika Clock Out
                                        melebihi jam selesai shift
                                    </span>
                                    <span className="mt-1 block text-xs text-muted-foreground">
                                        Saat karyawan absen pulang melebihi jam
                                        shift, sistem otomatis membuat pengajuan
                                        lembur dengan status &quot;Pending&quot;
                                        (perlu approval).
                                    </span>
                                </span>
                            </label>

                            {form.data.auto_overtime_from_attendance && (
                                <div className="ml-7 grid max-w-sm gap-2 pt-1">
                                    <Label htmlFor="auto_overtime_min_minutes">
                                        Minimal Kelebihan Menit (Batas Awal
                                        Lembur)
                                    </Label>
                                    <Input
                                        id="auto_overtime_min_minutes"
                                        type="number"
                                        min="1"
                                        max="480"
                                        value={
                                            form.data.auto_overtime_min_minutes
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'auto_overtime_min_minutes',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Contoh: 30 menit. Jika pulang lebih dari
                                        30 menit setelah jam shift, kelebihan
                                        tersebut otomatis dicatat lembur.
                                    </p>
                                    <InputError
                                        message={
                                            form.errors
                                                .auto_overtime_min_minutes
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        <label className="flex items-start gap-3 rounded-lg border bg-slate-50/60 p-4">
                            <input
                                type="hidden"
                                name="auto_deduct_leave_for_missing_checkout"
                                value={
                                    form.data
                                        .auto_deduct_leave_for_missing_checkout
                                        ? '1'
                                        : '0'
                                }
                            />
                            <input
                                id="auto_deduct_leave_for_missing_checkout"
                                type="checkbox"
                                checked={
                                    form.data
                                        .auto_deduct_leave_for_missing_checkout
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'auto_deduct_leave_for_missing_checkout',
                                        event.target.checked,
                                    )
                                }
                                className="mt-0.5 size-4 rounded border-input accent-primary"
                            />
                            <span>
                                <span className="block text-sm font-medium">
                                    Potong saldo cuti bila lupa absen pulang
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                    Dijalankan saat Sync Kehadiran atau
                                    sinkronisasi otomatis malam hari.
                                </span>
                            </span>
                        </label>

                        <div className="rounded-lg border bg-card p-5 space-y-4">
                            <div>
                                <h3 className="text-base font-medium">Pengaturan BPJS Perusahaan</h3>
                                <p className="text-xs text-muted-foreground">
                                    Konfigurasi default pemotongan dan tanggungan iuran BPJS Kesehatan dan Ketenagakerjaan.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="flex items-start gap-3 rounded-lg border bg-slate-50/60 p-4">
                                    <input
                                        type="checkbox"
                                        checked={form.data.bpjs_kesehatan_enabled}
                                        onChange={(event) =>
                                            form.setData('bpjs_kesehatan_enabled', event.target.checked)
                                        }
                                        className="mt-0.5 size-4 rounded border-input accent-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium">
                                            Aktifkan BPJS Kesehatan
                                        </span>
                                        <span className="mt-1 block text-xs text-muted-foreground">
                                            Total 5% (4% Perusahaan, 1% Karyawan).
                                        </span>
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 rounded-lg border bg-slate-50/60 p-4">
                                    <input
                                        type="checkbox"
                                        checked={form.data.bpjs_ketenagakerjaan_enabled}
                                        onChange={(event) =>
                                            form.setData('bpjs_ketenagakerjaan_enabled', event.target.checked)
                                        }
                                        className="mt-0.5 size-4 rounded border-input accent-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium">
                                            Aktifkan BPJS Ketenagakerjaan
                                        </span>
                                        <span className="mt-1 block text-xs text-muted-foreground">
                                            Meliputi JKK, JKM, JHT (5.7%), dan JP (3%).
                                        </span>
                                    </span>
                                </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="bpjs_jkk_rate">Tarif JKK Perusahaan (%)</Label>
                                    <Input
                                        id="bpjs_jkk_rate"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={form.data.bpjs_jkk_rate}
                                        onChange={(event) =>
                                            form.setData('bpjs_jkk_rate', Number(event.target.value))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Standar tingkat risiko sangat rendah: 0.24%
                                    </p>
                                    <InputError message={form.errors.bpjs_jkk_rate} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bpjs_kesehatan_wage_cap">Batas Maksimal Upah BPJS Kesehatan (Rp)</Label>
                                    <Input
                                        id="bpjs_kesehatan_wage_cap"
                                        type="number"
                                        min="0"
                                        value={form.data.bpjs_kesehatan_wage_cap}
                                        onChange={(event) =>
                                            form.setData('bpjs_kesehatan_wage_cap', Number(event.target.value))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Default: Rp 12.000.000
                                    </p>
                                    <InputError message={form.errors.bpjs_kesehatan_wage_cap} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bpjs_jp_wage_cap">Batas Maksimal Upah Jaminan Pensiun / JP (Rp)</Label>
                                    <Input
                                        id="bpjs_jp_wage_cap"
                                        type="number"
                                        min="0"
                                        value={form.data.bpjs_jp_wage_cap}
                                        onChange={(event) =>
                                            form.setData('bpjs_jp_wage_cap', Number(event.target.value))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Default: Rp 10.042.300
                                    </p>
                                    <InputError message={form.errors.bpjs_jp_wage_cap} />
                                </div>
                            </div>
                        </div>

                        <Button disabled={form.processing}>
                            Simpan Pengaturan
                        </Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
