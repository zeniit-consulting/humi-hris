import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    client_sub_company_label: string | null;
    created_at: string | null;
};
type SubCompanyOption = { id: number; label: string };

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan pengguna',
        href: edit(),
    },
];

export default function SettingsUsersPage({ subUsers, subCompanies }: { subUsers: SubUser[]; subCompanies: SubCompanyOption[] }) {
    const [editingUser, setEditingUser] = useState<SubUser | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin_staff',
        client_sub_company_id: '',
    });

    const updateForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin_staff',
        client_sub_company_id: '',
    });

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post('/settings/users', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
            },
        });
    };

    const submitUpdate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingUser) {
            return;
        }

        updateForm.put(`/settings/users/${editingUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUser(null);
                updateForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan pengguna" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Pengguna"
                        description="Kelola sub-user di bawah akun admin Anda"
                    />

                    <form onSubmit={submitCreate} className="space-y-4 rounded-lg border p-4">
                        <p className="text-sm font-medium">Tambah Sub-user</p>
                        <div className="grid gap-2">
                            <Label htmlFor="new_user_name">Nama</Label>
                            <Input
                                id="new_user_name"
                                value={createForm.data.name}
                                onChange={(event) =>
                                    createForm.setData('name', event.target.value)
                                }
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new_user_email">Email</Label>
                            <Input
                                id="new_user_email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(event) =>
                                    createForm.setData('email', event.target.value)
                                }
                                required
                            />
                            <InputError message={createForm.errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Select
                                value={createForm.data.role}
                                onValueChange={(value) => {
                                    createForm.setData('role', value);
                                    if (value !== 'client_supervisor') {
                                        createForm.setData('client_sub_company_id', '');
                                    }
                                }}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin_staff">Admin Staff</SelectItem>
                                    <SelectItem value="client_supervisor">Supervisor Klien</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.role} />
                        </div>
                        {createForm.data.role === 'client_supervisor' && (
                            <div className="grid gap-2">
                                <Label>Sub-company yang Diawasi</Label>
                                <Select
                                    value={createForm.data.client_sub_company_id || ''}
                                    onValueChange={(value) => createForm.setData('client_sub_company_id', value)}
                                >
                                    <SelectTrigger><SelectValue placeholder="Pilih sub-company" /></SelectTrigger>
                                    <SelectContent>
                                        {subCompanies.map((company) => (
                                            <SelectItem key={company.id} value={String(company.id)}>{company.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.client_sub_company_id} />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="new_user_password">Kata sandi</Label>
                            <Input
                                id="new_user_password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(event) =>
                                    createForm.setData('password', event.target.value)
                                }
                                required
                            />
                            <InputError message={createForm.errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new_user_password_confirmation">
                                Konfirmasi Password
                            </Label>
                            <Input
                                id="new_user_password_confirmation"
                                type="password"
                                value={createForm.data.password_confirmation}
                                onChange={(event) =>
                                    createForm.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                        </div>
                        <Button disabled={createForm.processing}>Tambah</Button>
                    </form>

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
                                        <tr key={subUser.id} className="border-b">
                                            <td className="py-2">{subUser.name}</td>
                                            <td className="py-2">{subUser.email}</td>
                                            <td className="py-2">{subUser.role === 'client_supervisor' ? 'Supervisor Klien' : 'Admin Staff'}</td>
                                            <td className="py-2">{subUser.client_sub_company_label ?? '-'}</td>
                                            <td className="py-2">
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingUser(subUser);
                                                            updateForm.setData({
                                                                name: subUser.name,
                                                                email: subUser.email,
                                                                password: '',
                                                                password_confirmation:
                                                                    '',
                                                                role: subUser.role === 'client_supervisor' ? 'client_supervisor' : 'admin_staff',
                                                                client_sub_company_id: subUser.client_sub_company_id ? String(subUser.client_sub_company_id) : '',
                                                            });
                                                            updateForm.clearErrors();
                                                        }}
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

                    {editingUser && (
                        <form
                            onSubmit={submitUpdate}
                            className="space-y-4 rounded-lg border p-4"
                        >
                            <p className="text-sm font-medium">
                                Edit Sub-user: {editingUser.name}
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_user_name">Nama</Label>
                                <Input
                                    id="edit_user_name"
                                    value={updateForm.data.name}
                                    onChange={(event) =>
                                        updateForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={updateForm.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_user_email">Email</Label>
                                <Input
                                    id="edit_user_email"
                                    type="email"
                                    value={updateForm.data.email}
                                    onChange={(event) =>
                                        updateForm.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={updateForm.errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Select
                                    value={updateForm.data.role}
                                    onValueChange={(value) => {
                                        updateForm.setData('role', value);
                                        if (value !== 'client_supervisor') {
                                            updateForm.setData('client_sub_company_id', '');
                                        }
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin_staff">Admin Staff</SelectItem>
                                        <SelectItem value="client_supervisor">Supervisor Klien</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={updateForm.errors.role} />
                            </div>
                            {updateForm.data.role === 'client_supervisor' && (
                                <div className="grid gap-2">
                                    <Label>Sub-company yang Diawasi</Label>
                                    <Select
                                        value={updateForm.data.client_sub_company_id || ''}
                                        onValueChange={(value) => updateForm.setData('client_sub_company_id', value)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Pilih sub-company" /></SelectTrigger>
                                        <SelectContent>
                                            {subCompanies.map((company) => (
                                                <SelectItem key={company.id} value={String(company.id)}>{company.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={updateForm.errors.client_sub_company_id} />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="edit_user_password">
                                    Password Baru (opsional)
                                </Label>
                                <Input
                                    id="edit_user_password"
                                    type="password"
                                    value={updateForm.data.password}
                                    onChange={(event) =>
                                        updateForm.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={updateForm.errors.password}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_user_password_confirmation">
                                    Konfirmasi Password Baru
                                </Label>
                                <Input
                                    id="edit_user_password_confirmation"
                                    type="password"
                                    value={updateForm.data.password_confirmation}
                                    onChange={(event) =>
                                        updateForm.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button disabled={updateForm.processing}>
                                    Simpan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
