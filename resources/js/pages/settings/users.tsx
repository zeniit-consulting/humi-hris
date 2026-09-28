import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckSquare,
    Laptop,
    Plus,
    Shield,
    ShieldCheck,
    Square,
    UserCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

type AvailableModule = {
    key: string;
    label: string;
    description: string;
};

type EmployeeOption = {
    id: number;
    code: string;
    name: string;
    email: string | null;
    phone: string | null;
    sub_company_id: number | null;
};

type SubUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    employee_id: number | null;
    employee_code: string | null;
    employee_name: string | null;
    permissions: string[] | null;
    client_sub_company_id: number | null;
    client_sub_company_ids: number[];
    client_sub_company_label: string | null;
    created_at: string | null;
};

type SubCompanyOption = { id: number; label: string };

type SubUserFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    employee_id: string;
    permissions: string[];
    client_sub_company_ids: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan pengguna',
        href: edit(),
    },
];

const emptyFormData: SubUserFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin_staff',
    employee_id: '',
    permissions: [],
    client_sub_company_ids: [],
};

const toggleCompanyId = (currentIds: string[], companyId: number) => {
    const value = String(companyId);

    return currentIds.includes(value)
        ? currentIds.filter((id) => id !== value)
        : [...currentIds, value];
};

const togglePermission = (currentPermissions: string[], moduleKey: string) => {
    return currentPermissions.includes(moduleKey)
        ? currentPermissions.filter((key) => key !== moduleKey)
        : [...currentPermissions, moduleKey];
};

export default function SettingsUsersPage({
    subUsers,
    subCompanies,
    employees = [],
    availableModules = [],
}: {
    subUsers: SubUser[];
    subCompanies: SubCompanyOption[];
    employees?: EmployeeOption[];
    availableModules?: AvailableModule[];
}) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SubUser | null>(null);

    const createForm = useForm<SubUserFormData>({ ...emptyFormData });
    const updateForm = useForm<SubUserFormData>({ ...emptyFormData });

    // Handle incoming assign_employee_id URL param
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const assignEmpId = urlParams.get('assign_employee_id');
        if (assignEmpId) {
            const targetEmp = employees.find(
                (emp) => String(emp.id) === assignEmpId,
            );
            if (targetEmp) {
                createForm.setData({
                    ...emptyFormData,
                    employee_id: String(targetEmp.id),
                    name: targetEmp.name,
                    email: targetEmp.email ?? '',
                    role: 'admin_staff',
                    client_sub_company_ids: targetEmp.sub_company_id
                        ? [String(targetEmp.sub_company_id)]
                        : [],
                    permissions: availableModules.map((m) => m.key),
                });
                setCreateDialogOpen(true);
            }
        }
    }, [employees, availableModules]);

    const closeCreateDialog = () => {
        setCreateDialogOpen(false);
        createForm.reset();
        createForm.clearErrors();
    };

    const closeEditDialog = () => {
        setEditingUser(null);
        updateForm.reset();
        updateForm.clearErrors();
    };

    const openEditDialog = (subUser: SubUser) => {
        setEditingUser(subUser);
        updateForm.clearErrors();
        updateForm.setData({
            name: subUser.name,
            email: subUser.email,
            password: '',
            password_confirmation: '',
            role:
                subUser.role === 'client_supervisor'
                    ? 'client_supervisor'
                    : 'admin_staff',
            employee_id: subUser.employee_id ? String(subUser.employee_id) : '',
            permissions: subUser.permissions ?? availableModules.map((m) => m.key),
            client_sub_company_ids: subUser.client_sub_company_ids.map(String),
        });
    };

    const handleEmployeeSelect = (
        empIdStr: string,
        form: typeof createForm | typeof updateForm,
    ) => {
        if (!empIdStr || empIdStr === 'none') {
            form.setData((prev) => ({
                ...prev,
                employee_id: '',
            }));
            return;
        }

        const selectedEmp = employees.find((emp) => String(emp.id) === empIdStr);
        if (selectedEmp) {
            form.setData((prev) => ({
                ...prev,
                employee_id: empIdStr,
                name: selectedEmp.name,
                email: selectedEmp.email ?? prev.email,
                client_sub_company_ids:
                    selectedEmp.sub_company_id &&
                    !prev.client_sub_company_ids.includes(
                        String(selectedEmp.sub_company_id),
                    )
                        ? [...prev.client_sub_company_ids, String(selectedEmp.sub_company_id)]
                        : prev.client_sub_company_ids,
                // Default to all modules if empty
                permissions:
                    prev.permissions.length === 0
                        ? availableModules.map((m) => m.key)
                        : prev.permissions,
            }));
        }
    };

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post('/settings/users', {
            preserveScroll: true,
            onSuccess: closeCreateDialog,
        });
    };

    const submitUpdate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingUser) {
            return;
        }

        updateForm.put(`/settings/users/${editingUser.id}`, {
            preserveScroll: true,
            onSuccess: closeEditDialog,
        });
    };

    const renderSubCompanyChecks = (
        form: typeof createForm | typeof updateForm,
    ) => (
        <div className="grid gap-2">
            <Label>Sub-company yang Ditautkan (Opsional)</Label>
            <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border p-3">
                {subCompanies.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                        Belum ada sub-company (berlaku untuk Internal).
                    </p>
                ) : null}
                {subCompanies.map((company) => (
                    <label
                        key={company.id}
                        className="flex items-center gap-2 text-sm"
                    >
                        <Checkbox
                            checked={form.data.client_sub_company_ids.includes(
                                String(company.id),
                            )}
                            onCheckedChange={() =>
                                form.setData(
                                    'client_sub_company_ids',
                                    toggleCompanyId(
                                        form.data.client_sub_company_ids,
                                        company.id,
                                    ),
                                )
                            }
                        />
                        <span>{company.label}</span>
                    </label>
                ))}
            </div>
            <InputError message={form.errors.client_sub_company_ids} />
        </div>
    );

    const renderModulePermissions = (
        form: typeof createForm | typeof updateForm,
    ) => {
        if (form.data.role !== 'admin_staff') {
            return null;
        }

        const allSelected =
            availableModules.length > 0 &&
            availableModules.every((m) =>
                form.data.permissions.includes(m.key),
            );

        const handleSelectAll = () => {
            if (allSelected) {
                form.setData('permissions', []);
            } else {
                form.setData(
                    'permissions',
                    availableModules.map((m) => m.key),
                );
            }
        };

        return (
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="font-semibold text-primary">
                            Hak Akses Modul (Scope)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Pilih modul apa saja yang boleh dikelola oleh admin
                            ini.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-7 text-xs"
                    >
                        {allSelected ? (
                            <>
                                <Square className="mr-1 size-3.5" /> Batal Semua
                            </>
                        ) : (
                            <>
                                <CheckSquare className="mr-1 size-3.5" /> Pilih Semua
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    {availableModules.map((module) => {
                        const isChecked = form.data.permissions.includes(
                            module.key,
                        );
                        return (
                            <label
                                key={module.key}
                                className={`flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 transition-colors ${
                                    isChecked
                                        ? 'border-primary/40 bg-background shadow-xs'
                                        : 'border-border/60 bg-background/50 hover:bg-background'
                                }`}
                            >
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                        form.setData(
                                            'permissions',
                                            togglePermission(
                                                form.data.permissions,
                                                module.key,
                                            ),
                                        )
                                    }
                                    className="mt-0.5"
                                />
                                <div className="space-y-0.5">
                                    <span className="text-xs font-medium leading-none">
                                        {module.label}
                                    </span>
                                    <p className="text-[11px] leading-tight text-muted-foreground">
                                        {module.description}
                                    </p>
                                </div>
                            </label>
                        );
                    })}
                </div>
                <InputError message={form.errors.permissions} />
            </div>
        );
    };

    const renderSubUserForm = (
        form: typeof createForm | typeof updateForm,
        mode: 'create' | 'edit',
    ) => (
        <div className="grid gap-4">
            {/* Tautkan Karyawan */}
            <div className="grid gap-2">
                <Label htmlFor={`${mode}_employee_id`}>
                    Tautkan ke Karyawan (Assign dari Karyawan)
                </Label>
                <Select
                    value={form.data.employee_id || 'none'}
                    onValueChange={(val) => handleEmployeeSelect(val, form)}
                >
                    <SelectTrigger id={`${mode}_employee_id`}>
                        <SelectValue placeholder="Pilih karyawan (opsional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        <SelectItem value="none">
                            - Bukan Karyawan (Admin Eksternal) -
                        </SelectItem>
                        {employees.map((emp) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>
                                {emp.code} - {emp.name}{' '}
                                {emp.email ? `(${emp.email})` : ''}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.data.employee_id && (
                    <p className="text-xs text-muted-foreground">
                        Akun ini tertaut dengan profil karyawan. Data nama dan email
                        diisi otomatis.
                    </p>
                )}
                <InputError message={form.errors.employee_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${mode}_user_name`}>Nama Pengguna</Label>
                <Input
                    id={`${mode}_user_name`}
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    required
                />
                <InputError message={form.errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${mode}_user_email`}>Email Login</Label>
                <Input
                    id={`${mode}_user_email`}
                    type="email"
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                    required
                />
                <InputError message={form.errors.email} />
            </div>

            <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                    value={form.data.role}
                    onValueChange={(value) => form.setData('role', value)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin_staff">
                            Admin Staff / Sub-Admin
                        </SelectItem>
                        <SelectItem value="client_supervisor">
                            Supervisor Klien
                        </SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={form.errors.role} />
            </div>

            {/* Scope Hak Akses Modul */}
            {renderModulePermissions(form)}

            {/* Sub Company Scope */}
            {renderSubCompanyChecks(form)}

            <div className="grid gap-2">
                <Label htmlFor={`${mode}_user_password`}>
                    {mode === 'create' ? 'Kata Sandi' : 'Password Baru'}
                    {mode === 'edit' || (mode === 'create' && form.data.employee_id) ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                            (opsional jika sudah memiliki akun portal)
                        </span>
                    ) : null}
                </Label>
                <Input
                    id={`${mode}_user_password`}
                    type="password"
                    value={form.data.password}
                    onChange={(event) =>
                        form.setData('password', event.target.value)
                    }
                    required={mode === 'create' && !form.data.employee_id}
                />
                <InputError message={form.errors.password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${mode}_user_password_confirmation`}>
                    Konfirmasi Password
                </Label>
                <Input
                    id={`${mode}_user_password_confirmation`}
                    type="password"
                    value={form.data.password_confirmation}
                    onChange={(event) =>
                        form.setData(
                            'password_confirmation',
                            event.target.value,
                        )
                    }
                    required={Boolean(form.data.password)}
                />
            </div>

            {/* Notice Device Restriction */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                <Laptop className="mt-0.5 size-4 shrink-0" />
                <div>
                    <span className="font-semibold">
                        Akses Admin Khusus Desktop:
                    </span>{' '}
                    Staff sub-admin hanya dapat membuka dashboard admin melalui
                    perangkat Desktop/Laptop. Jika login via ponsel/browser
                    mobile, staff otomatis dialihkan ke Portal Karyawan untuk
                    presensi dan kebutuhan mandiri.
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan pengguna" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <Heading
                                variant="small"
                                title="Pengguna & Sub-Admin"
                                description="Kelola sub-user dan staf yang didelegasikan hak akses admin"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={() => {
                                createForm.clearErrors();
                                createForm.setData({
                                    ...emptyFormData,
                                    permissions: availableModules.map((m) => m.key),
                                });
                                setCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="size-4" />
                            Tambah Sub-user
                        </Button>
                    </div>

                    {/* Banner Info Kebijakan Akses */}
                    <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-900 dark:text-blue-200">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="space-y-1">
                            <p className="font-medium text-blue-950 dark:text-blue-100">
                                Ketentuan Akses Delegasi Admin & Perangkat:
                            </p>
                            <p className="text-muted-foreground">
                                1. Akun Master dapat memilih modul-modul spesifik
                                (Absensi, Jadwal, Cuti, Lembur, Payroll, dll.) yang
                                boleh dibuka oleh masing-masing staff sub-admin.
                            </p>
                            <p className="text-muted-foreground">
                                2. Demi keamanan dan kerapian operasional, panel
                                admin hanya dapat diakses melalui browser Desktop /
                                Laptop. Saat staff sub-admin login via ponsel
                                (mobile), mereka otomatis diarahkan ke Portal
                                Karyawan.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                Daftar Pengguna / Sub-Admin ({subUsers.length})
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <th className="py-2.5">Pengguna / Karyawan</th>
                                        <th className="py-2.5">Email</th>
                                        <th className="py-2.5">Role</th>
                                        <th className="py-2.5">Hak Akses Modul</th>
                                        <th className="py-2.5">Scope Perusahaan</th>
                                        <th className="py-2.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                Belum ada sub-user atau sub-admin yang ditambahkan.
                                            </td>
                                        </tr>
                                    )}
                                    {subUsers.map((subUser) => (
                                        <tr
                                            key={subUser.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="py-2.5">
                                                <div className="space-y-0.5">
                                                    <span className="font-medium">
                                                        {subUser.name}
                                                    </span>
                                                    {subUser.employee_id && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <UserCheck className="size-3 text-emerald-600" />
                                                            <span>
                                                                {subUser.employee_code} - {subUser.employee_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 text-muted-foreground">
                                                {subUser.email}
                                            </td>
                                            <td className="py-2.5">
                                                {subUser.role ===
                                                'client_supervisor' ? (
                                                    <Badge variant="outline">
                                                        Supervisor Klien
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20">
                                                        Admin Staff
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-2.5">
                                                {subUser.role ===
                                                'client_supervisor' ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        Approval Klien
                                                    </span>
                                                ) : !subUser.permissions ||
                                                  subUser.permissions.length ===
                                                      0 ||
                                                  subUser.permissions.length >=
                                                      availableModules.length ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs font-normal"
                                                    >
                                                        Semua Modul
                                                    </Badge>
                                                ) : (
                                                    <div className="flex max-w-xs flex-wrap gap-1">
                                                        {subUser.permissions.map(
                                                            (permKey) => {
                                                                const label =
                                                                    availableModules.find(
                                                                        (m) =>
                                                                            m.key ===
                                                                            permKey,
                                                                    )?.label ??
                                                                    permKey;
                                                                return (
                                                                    <Badge
                                                                        key={permKey}
                                                                        variant="outline"
                                                                        className="text-[10px] font-normal"
                                                                    >
                                                                        {label}
                                                                    </Badge>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 text-xs text-muted-foreground">
                                                {subUser.client_sub_company_label ??
                                                    'Seluruh Internal'}
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs"
                                                        onClick={() =>
                                                            openEditDialog(
                                                                subUser,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => {
                                                            if (
                                                                !window.confirm(
                                                                    `Hapus sub-user ${subUser.name}?`,
                                                                )
                                                            ) {
                                                                return;
                                                            }

                                                            router.delete(
                                                                `/settings/users/${subUser.id}`,
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SettingsLayout>

            {/* Dialog Create */}
            <Dialog
                open={createDialogOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setCreateDialogOpen(true);
                    } else {
                        closeCreateDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="size-5 text-primary" />
                            Tambah Sub-user / Admin
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan akses admin atau tautkan dari karyawan aktif
                            dengan hak modul pilihan Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        {renderSubUserForm(createForm, 'create')}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeCreateDialog}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Simpan Sub-user
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit */}
            <Dialog
                open={editingUser !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEditDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-primary" />
                            Edit Akses Sub-user / Admin
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? `Perbarui akses modul dan pengaturan untuk ${editingUser.name}.`
                                : 'Perbarui akses sub-user.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitUpdate} className="space-y-4">
                        {renderSubUserForm(updateForm, 'edit')}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeEditDialog}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateForm.processing}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
