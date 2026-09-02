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
    missing_clock_out_request_days: number;
    require_face_recognition?: boolean;
    attendance_revision_cutoff_day: string;
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
    const form = useForm(settings);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Absensi" />
            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Pengaturan Absensi"
                        description="Atur batas pengajuan lupa absen pulang dan penutupan periode revisi absensi."
                    />

                    <form
                        className="space-y-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch('/settings/attendance', {
                                preserveScroll: true,
                            });
                        }}
                    >
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
                                    value={
                                        form.data.missing_clock_out_request_days
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'missing_clock_out_request_days',
                                            Number(event.target.value),
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Default 2. Absensi tanggal 1 dapat diajukan
                                    sampai tanggal 3.
                                </p>
                                <InputError
                                    message={
                                        form.errors
                                            .missing_clock_out_request_days
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="attendance_revision_cutoff_day">
                                    Tanggal Cut-off Absensi
                                </Label>
                                <select
                                    id="attendance_revision_cutoff_day"
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={
                                        form.data.attendance_revision_cutoff_day
                                    }
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
                                    Absensi periode berjalan ditutup setelah
                                    tanggal ini.
                                </p>
                                <InputError
                                    message={
                                        form.errors
                                            .attendance_revision_cutoff_day
                                    }
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

                        <Button disabled={form.processing}>
                            Simpan Pengaturan
                        </Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
