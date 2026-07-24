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
    overtime_threshold_hours: number;
    overtime_hour_divisor: number;
    overtime_multiplier_hour1: number;
    overtime_multiplier_subsequent: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: edit() },
    { title: 'Pengaturan Payroll & Lembur', href: '/settings/payroll' },
];

export default function PayrollSettings({ settings }: { settings: Settings }) {
    const form = useForm({
        ...settings,
        auto_deduct_leave_for_missing_checkout: settings.auto_deduct_leave_for_missing_checkout,
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
                            form.patch('/settings/payroll', { preserveScroll: true });
                        }}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="active_working_days">Hari Kerja Aktif</Label>
                                <Input id="active_working_days" type="number" min="1" max="31" value={form.data.active_working_days} onChange={(event) => form.setData('active_working_days', Number(event.target.value))} />
                                <p className="text-xs text-muted-foreground">Default 22 hari. Digunakan untuk potongan cuti tanpa gaji per hari.</p>
                                <InputError message={form.errors.active_working_days} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_calculation_mode">Metode Hitung Lembur</Label>
                                <select id="overtime_calculation_mode" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.data.overtime_calculation_mode} onChange={(event) => form.setData('overtime_calculation_mode', event.target.value as Settings['overtime_calculation_mode'])}>
                                    <option value="hourly">Per jam</option>
                                    <option value="threshold_daily">Per ambang jam</option>
                                </select>
                                <p className="text-xs text-muted-foreground">Mode ambang menghitung setiap ambang yang terpenuhi sebagai 8 jam / 1 hari.</p>
                                <InputError message={form.errors.overtime_calculation_mode} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_threshold_hours">Ambang Jam</Label>
                                <Input id="overtime_threshold_hours" type="number" min="1" max="24" value={form.data.overtime_threshold_hours} onChange={(event) => form.setData('overtime_threshold_hours', Number(event.target.value))} />
                                <p className="text-xs text-muted-foreground">Contoh: 10 jam dapat dihitung sebagai 8 jam / 1 hari.</p>
                                <InputError message={form.errors.overtime_threshold_hours} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_hour_divisor">Pembagi Jam</Label>
                                <Input id="overtime_hour_divisor" type="number" min="1" value={form.data.overtime_hour_divisor} onChange={(event) => form.setData('overtime_hour_divisor', Number(event.target.value))} />
                                <p className="text-xs text-muted-foreground">Gaji per jam = gaji pokok dibagi divisor. Standar: 173 jam/bulan.</p>
                                <InputError message={form.errors.overtime_hour_divisor} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_multiplier_hour1">Multiplier Jam Pertama</Label>
                                <Input id="overtime_multiplier_hour1" type="number" step="0.1" min="1" value={form.data.overtime_multiplier_hour1} onChange={(event) => form.setData('overtime_multiplier_hour1', Number(event.target.value))} />
                                <InputError message={form.errors.overtime_multiplier_hour1} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime_multiplier_subsequent">Multiplier Jam Selanjutnya</Label>
                                <Input id="overtime_multiplier_subsequent" type="number" step="0.1" min="1" value={form.data.overtime_multiplier_subsequent} onChange={(event) => form.setData('overtime_multiplier_subsequent', Number(event.target.value))} />
                                <InputError message={form.errors.overtime_multiplier_subsequent} />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 rounded-lg border bg-slate-50/60 p-4">
                            <input type="hidden" name="auto_deduct_leave_for_missing_checkout" value={form.data.auto_deduct_leave_for_missing_checkout ? '1' : '0'} />
                            <input id="auto_deduct_leave_for_missing_checkout" type="checkbox" checked={form.data.auto_deduct_leave_for_missing_checkout} onChange={(event) => form.setData('auto_deduct_leave_for_missing_checkout', event.target.checked)} className="mt-0.5 size-4 rounded border-input accent-primary" />
                            <span>
                                <span className="block text-sm font-medium">Potong saldo cuti bila lupa absen pulang</span>
                                <span className="mt-1 block text-xs text-muted-foreground">Dijalankan saat Sync Kehadiran atau sinkronisasi otomatis malam hari.</span>
                            </span>
                        </label>

                        <Button disabled={form.processing}>Simpan Pengaturan</Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
