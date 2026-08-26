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

export type OvertimeEventItem = {
    code?: string;
    name: string;
    nominal: number;
    unit?: 'kegiatan' | 'hari' | 'jam' | 'kehadiran';
    position_ids?: number[];
};

type PositionOption = {
    id: number;
    code: string;
    name: string;
};

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
    overtime_events: OvertimeEventItem[];
    auto_overtime_from_attendance: boolean;
    auto_overtime_min_minutes: number;
    bpjs_kesehatan_enabled: boolean;
    bpjs_ketenagakerjaan_enabled: boolean;
    bpjs_jkk_enabled: boolean;
    bpjs_jkm_enabled: boolean;
    bpjs_jht_enabled: boolean;
    bpjs_jp_enabled: boolean;
    bpjs_kesehatan_default_class: 'I' | 'II' | 'III';
    private_insurance_enabled: boolean;
    private_insurance_name: string;
    private_insurance_nominal: number;
    bpjs_kesehatan_wage_cap: number;
    bpjs_jp_wage_cap: number;
    bpjs_jkk_rate: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: edit() },
    { title: 'Pengaturan Payroll & Lembur', href: '/settings/payroll' },
];

export default function PayrollSettings({
    settings,
    positions = [],
}: {
    settings: Settings;
    positions?: PositionOption[];
}) {
    const form = useForm({
        ...settings,
        overtime_events: (settings.overtime_events ?? []).map((e) => ({
            code: e.code ?? '',
            name: e.name ?? '',
            nominal: Number(e.nominal ?? 0),
            unit: e.unit ?? 'kegiatan',
            position_ids: e.position_ids ?? [],
        })),
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

                        <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Daftar Event Lembur & Insentif per Jabatan
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Atur kode komponen, tarif, satuan (kegiatan, jam, hari, kehadiran), serta batasan jabatan karyawan yang dapat mengajukan.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        form.setData('overtime_events', [
                                            ...form.data.overtime_events,
                                            { code: '', name: '', nominal: 0, unit: 'kegiatan', position_ids: [] },
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
                                                className="rounded-lg border bg-white p-3 shadow-xs space-y-3"
                                            >
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        Event #{index + 1}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newEvents = [
                                                                ...form.data.overtime_events,
                                                            ];
                                                            newEvents.splice(index, 1);
                                                            form.setData('overtime_events', newEvents);
                                                        }}
                                                        className="h-7 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 gap-1"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        Hapus
                                                    </Button>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-12">
                                                    <div className="sm:col-span-3 space-y-1">
                                                        <Label className="text-xs">Kode</Label>
                                                        <Input
                                                            placeholder="Contoh: OT_STORE_SM"
                                                            value={event.code ?? ''}
                                                            onChange={(e) => {
                                                                const newEvents = [...form.data.overtime_events];
                                                                newEvents[index].code = e.target.value.toUpperCase();
                                                                form.setData('overtime_events', newEvents);
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-4 space-y-1">
                                                        <Label className="text-xs">Nama Kegiatan / Komponen</Label>
                                                        <Input
                                                            placeholder="Contoh: OT Store - Store Manager"
                                                            value={event.name}
                                                            required
                                                            onChange={(e) => {
                                                                const newEvents = [...form.data.overtime_events];
                                                                newEvents[index].name = e.target.value;
                                                                form.setData('overtime_events', newEvents);
                                                            }}
                                                        />
                                                        <InputError
                                                            message={
                                                                (form.errors as Record<string, string>)[
                                                                    `overtime_events.${index}.name`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-3 space-y-1">
                                                        <Label className="text-xs">Tarif (Rp)</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Contoh: 15385"
                                                            min="0"
                                                            value={event.nominal}
                                                            required
                                                            onChange={(e) => {
                                                                const newEvents = [...form.data.overtime_events];
                                                                newEvents[index].nominal = Number(e.target.value);
                                                                form.setData('overtime_events', newEvents);
                                                            }}
                                                        />
                                                        <InputError
                                                            message={
                                                                (form.errors as Record<string, string>)[
                                                                    `overtime_events.${index}.nominal`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-2 space-y-1">
                                                        <Label className="text-xs">Satuan</Label>
                                                        <select
                                                            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs outline-none"
                                                            value={event.unit ?? 'kegiatan'}
                                                            onChange={(e) => {
                                                                const newEvents = [...form.data.overtime_events];
                                                                newEvents[index].unit = e.target.value as OvertimeEventItem['unit'];
                                                                form.setData('overtime_events', newEvents);
                                                            }}
                                                        >
                                                            <option value="kegiatan">kegiatan</option>
                                                            <option value="jam">jam (hitung durasi)</option>
                                                            <option value="hari">hari</option>
                                                            <option value="kehadiran">kehadiran</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 pt-1">
                                                    <Label className="text-xs text-slate-700">
                                                        Berlaku untuk Jabatan (Kosongkan jika berlaku untuk Semua Jabatan):
                                                    </Label>
                                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                                        {positions.map((pos) => {
                                                            const isSelected = (event.position_ids ?? []).includes(pos.id);
                                                            return (
                                                                <button
                                                                    key={pos.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const currentIds = event.position_ids ?? [];
                                                                        const nextIds = isSelected
                                                                            ? currentIds.filter((id) => id !== pos.id)
                                                                            : [...currentIds, pos.id];
                                                                        const newEvents = [...form.data.overtime_events];
                                                                        newEvents[index].position_ids = nextIds;
                                                                        form.setData('overtime_events', newEvents);
                                                                    }}
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs transition-colors cursor-pointer border ${
                                                                        isSelected
                                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    {pos.name}
                                                                </button>
                                                            );
                                                        })}
                                                        {positions.length === 0 && (
                                                            <p className="text-xs text-muted-foreground italic">
                                                                Belum ada master data jabatan. Event berlaku umum.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
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

                        <div className="rounded-lg border bg-card p-5 space-y-6">
                            <div>
                                <h3 className="text-base font-medium">Pengaturan BPJS & Asuransi Perusahaan</h3>
                                <p className="text-xs text-muted-foreground">
                                    Konfigurasi program BPJS Kesehatan, BPJS Ketenagakerjaan (JKK, JKM, JHT, JP), dan Asuransi Swasta Tambahan.
                                </p>
                            </div>

                            {/* BPJS Kesehatan Section */}
                            <div className="rounded-md border p-4 space-y-4 bg-slate-50/50">
                                <label className="flex items-start gap-3">
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
                                            Total 5% (4% Perusahaan, 1% Karyawan) dengan batas maksimal upah.
                                        </span>
                                    </span>
                                </label>

                                {form.data.bpjs_kesehatan_enabled && (
                                    <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                                        <div className="grid gap-2">
                                            <Label htmlFor="bpjs_kesehatan_default_class">Kategori Kelas Default BPJS Kesehatan</Label>
                                            <select
                                                id="bpjs_kesehatan_default_class"
                                                value={form.data.bpjs_kesehatan_default_class}
                                                onChange={(e) =>
                                                    form.setData('bpjs_kesehatan_default_class', e.target.value as 'I' | 'II' | 'III')
                                                }
                                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                <option value="I">Kelas I (Satu)</option>
                                                <option value="II">Kelas II (Dua)</option>
                                                <option value="III">Kelas III (Tiga)</option>
                                            </select>
                                            <p className="text-xs text-muted-foreground">
                                                Dapat disesuaikan secara spesifik pada masing-masing data karyawan.
                                            </p>
                                            <InputError message={form.errors.bpjs_kesehatan_default_class} />
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
                                                Default batas atas: Rp 12.000.000
                                            </p>
                                            <InputError message={form.errors.bpjs_kesehatan_wage_cap} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* BPJS Ketenagakerjaan Section */}
                            <div className="rounded-md border p-4 space-y-4 bg-slate-50/50">
                                <label className="flex items-start gap-3">
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
                                            Pilih program perlindungan jaminan sosial yang dijalankan untuk karyawan.
                                        </span>
                                    </span>
                                </label>

                                {form.data.bpjs_ketenagakerjaan_enabled && (
                                    <div className="space-y-4 pt-2 border-t">
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            <label className="flex items-start gap-2.5 rounded-lg border bg-white p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.bpjs_jkk_enabled}
                                                    onChange={(e) =>
                                                        form.setData('bpjs_jkk_enabled', e.target.checked)
                                                    }
                                                    className="mt-0.5 size-4 rounded border-input accent-primary"
                                                />
                                                <div>
                                                    <span className="text-xs font-semibold block text-slate-900">JKK</span>
                                                    <span className="text-[11px] text-muted-foreground block">
                                                        Jaminan Kecelakaan Kerja ({form.data.bpjs_jkk_rate}%)
                                                    </span>
                                                </div>
                                            </label>

                                            <label className="flex items-start gap-2.5 rounded-lg border bg-white p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.bpjs_jkm_enabled}
                                                    onChange={(e) =>
                                                        form.setData('bpjs_jkm_enabled', e.target.checked)
                                                    }
                                                    className="mt-0.5 size-4 rounded border-input accent-primary"
                                                />
                                                <div>
                                                    <span className="text-xs font-semibold block text-slate-900">JKM</span>
                                                    <span className="text-[11px] text-muted-foreground block">
                                                        Jaminan Kematian (0.3% Perusahaan)
                                                    </span>
                                                </div>
                                            </label>

                                            <label className="flex items-start gap-2.5 rounded-lg border bg-white p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.bpjs_jht_enabled}
                                                    onChange={(e) =>
                                                        form.setData('bpjs_jht_enabled', e.target.checked)
                                                    }
                                                    className="mt-0.5 size-4 rounded border-input accent-primary"
                                                />
                                                <div>
                                                    <span className="text-xs font-semibold block text-slate-900">JHT</span>
                                                    <span className="text-[11px] text-muted-foreground block">
                                                        Jaminan Hari Tua (3.7% + 2%)
                                                    </span>
                                                </div>
                                            </label>

                                            <label className="flex items-start gap-2.5 rounded-lg border bg-white p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.bpjs_jp_enabled}
                                                    onChange={(e) =>
                                                        form.setData('bpjs_jp_enabled', e.target.checked)
                                                    }
                                                    className="mt-0.5 size-4 rounded border-input accent-primary"
                                                />
                                                <div>
                                                    <span className="text-xs font-semibold block text-slate-900">JP</span>
                                                    <span className="text-[11px] text-muted-foreground block">
                                                        Jaminan Pensiun (2% + 1%)
                                                    </span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="bpjs_jkk_rate">Tarif Iuran JKK Perusahaan (%)</Label>
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
                                                <Label htmlFor="bpjs_jp_wage_cap">Batas Maksimal Upah JP (Rp)</Label>
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
                                                    Default batas atas JP: Rp 10.042.300
                                                </p>
                                                <InputError message={form.errors.bpjs_jp_wage_cap} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Asuransi Swasta Tambahan */}
                            <div className="rounded-md border p-4 space-y-4 bg-slate-50/50">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={form.data.private_insurance_enabled}
                                        onChange={(event) =>
                                            form.setData('private_insurance_enabled', event.target.checked)
                                        }
                                        className="mt-0.5 size-4 rounded border-input accent-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium">
                                            Gunakan Asuransi Swasta Tambahan
                                        </span>
                                        <span className="mt-1 block text-xs text-muted-foreground">
                                            Aktifkan jika perusahaan menyediakan atau memfasilitasi asuransi kesehatan swasta tambahan (misal: Prudential, Allianz, AXA, Sinarmas, dll).
                                        </span>
                                    </span>
                                </label>

                                {form.data.private_insurance_enabled && (
                                    <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                                        <div className="grid gap-2">
                                            <Label htmlFor="private_insurance_name">Nama Program Asuransi Swasta</Label>
                                            <Input
                                                id="private_insurance_name"
                                                type="text"
                                                placeholder="Contoh: Asuransi Prudential / Allianz"
                                                value={form.data.private_insurance_name}
                                                onChange={(event) =>
                                                    form.setData('private_insurance_name', event.target.value)
                                                }
                                            />
                                            <InputError message={form.errors.private_insurance_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="private_insurance_nominal">Nominal Iuran / Premi Default per Karyawan (Rp)</Label>
                                            <Input
                                                id="private_insurance_nominal"
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={form.data.private_insurance_nominal}
                                                onChange={(event) =>
                                                    form.setData('private_insurance_nominal', Number(event.target.value))
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Nominal ini juga dapat disesuaikan per individu pada formulir data karyawan.
                                            </p>
                                            <InputError message={form.errors.private_insurance_nominal} />
                                        </div>
                                    </div>
                                )}
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
