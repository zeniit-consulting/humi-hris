import { Head, router, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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

type SubUser = {
    id: number;
    name: string;
    email: string;
    role: string;
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
    client_sub_company_ids: [],
};

const toggleCompanyId = (currentIds: string[], companyId: number) => {
    const value = String(companyId);

    return currentIds.includes(value)
        ? currentIds.filter((id) => id !== value)
        : [...currentIds, value];
};

export default function SettingsUsersPage({
    subUsers,
    subCompanies,
}: {
    subUsers: SubUser[];
    subCompanies: SubCompanyOption[];
}) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SubUser | null>(null);

    const createForm = useForm<SubUserFormData>({ ...emptyFormData });
    const updateForm = useForm<SubUserFormData>({ ...emptyFormData });

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
            client_sub_company_ids: subUser.client_sub_company_ids.map(String),
        });
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
            <Label>Sub-company yang Ditautkan</Label>
            <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border p-3">
                {subCompanies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Belum ada sub-company.
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

    const renderSubUserForm = (
        form: typeof createForm | typeof updateForm,
        mode: 'create' | 'edit',
    ) => (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor={`${mode}_user_name`}>Nama</Label>
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
                <Label htmlFor={`${mode}_user_email`}>Email</Label>
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
                        <SelectItem value="admin_staff">Admin Staff</SelectItem>
                        <SelectItem value="client_supervisor">
                            Supervisor Klien
                        </SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={form.errors.role} />
            </div>

            {renderSubCompanyChecks(form)}

            <div className="grid gap-2">
                <Label htmlFor={`${mode}_user_password`}>
                    {mode === 'create' ? 'Kata sandi' : 'Password Baru'}
                    {mode === 'edit' ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                            (opsional)
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
                    required={mode === 'create'}
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
                    required={mode === 'create'}
                />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan pengguna" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <Heading
                            variant="small"
                            title="Pengguna"
                            description="Kelola sub-user di bawah akun admin Anda"
                        />
                        <Button
                            type="button"
                            onClick={() => {
                                createForm.clearErrors();
                                createForm.setData({ ...emptyFormData });
                                setCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="size-4" />
                            Tambah Sub-user
                        </Button>
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                        <p className="text-sm font-medium">Daftar Sub-user</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2">Nama</th>
                                        <th className="py-2">Email</th>
                                        <th className="py-2">Role</th>
                                        <th className="py-2">Scope Klien</th>
                                        <th className="py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-5 text-center text-muted-foreground"
                                            >
                                                Belum ada sub-user.
                                            </td>
                                        </tr>
                                    )}
                                    {subUsers.map((subUser) => (
                                        <tr
                                            key={subUser.id}
                                            className="border-b"
                                        >
                                            <td className="py-2">
                                                {subUser.name}
                                            </td>
                                            <td className="py-2">
                                                {subUser.email}
                                            </td>
                                            <td className="py-2">
                                                {subUser.role ===
                                                'client_supervisor'
                                                    ? 'Supervisor Klien'
                                                    : 'Admin Staff'}
                                            </td>
                                            <td className="py-2">
                                                {subUser.client_sub_company_label ??
                                                    '-'}
                                            </td>
                                            <td className="py-2">
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
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
                                                        variant="destructive"
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
                                                                    preserveScroll:
                                                                        true,
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
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Sub-user</DialogTitle>
                        <DialogDescription>
                            Buat akses sub-user dan pilih sub-company yang bisa
                            dikelola.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        {renderSubUserForm(createForm, 'create')}
                        <div className="flex justify-end gap-2">
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
                                Tambah
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editingUser !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEditDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Sub-user</DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? `Perbarui akses untuk ${editingUser.name}.`
                                : 'Perbarui akses sub-user.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitUpdate} className="space-y-4">
                        {renderSubUserForm(updateForm, 'edit')}
                        <div className="flex justify-end gap-2">
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
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
