import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CheckCircle,
    History,
    Play,
    Plus,
    RefreshCw,
    Settings2,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index as leavesIndex } from '@/routes/hris/leaves';
import type { BreadcrumbItem } from '@/types';

type BalanceRow = {
    employee_id: number;
    employee_label: string;
    total_quota: number;
    accrued_days: number;
    used_days: number;
    adjusted_days: number;
    remaining_balance: number;
    policy_type: 'lump_sum' | 'accrual';
    has_balance: boolean;
};

type Policy = {
    id: number;
    leave_type: string;
    policy_type: 'lump_sum' | 'accrual';
    yearly_days: number;
    max_days_per_request: number | null;
    is_active: boolean;
};

type PageProps = {
    balances: BalanceRow[];
    employees: { id: number; label: string }[];
    policy: Policy | null;
    year: number;
    leave_type: string;
    filters: { year: string | number; employee_id: string | number };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cuti', href: leavesIndex() },
    { title: 'Jatah Cuti', href: '/hris/leaves/balances' },
];

const currentYear = new Date().getFullYear();
const yearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
];

type PolicyFormData = {
    leave_type: string;
    policy_type: 'lump_sum' | 'accrual';
    yearly_days: string;
    max_days_per_request: string;
};

type AdjustFormData = {
    amount: string;
    description: string;
};

export default function BalancesPage() {
    const { balances, employees, policy, year, leave_type, filters } =
        usePage<PageProps>().props;

    const [filterYear, setFilterYear] = useState(String(filters.year || year));
    const [filterEmployee, setFilterEmployee] = useState(
        filters.employee_id ? String(filters.employee_id) : '',
    );

    const [initDialogOpen, setInitDialogOpen] = useState(false);
    const [accrueDialogOpen, setAccrueDialogOpen] = useState(false);
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [adjustTarget, setAdjustTarget] = useState<BalanceRow | null>(null);

    const policyForm = useForm<PolicyFormData>({
        leave_type,
        policy_type: policy?.policy_type ?? 'lump_sum',
        yearly_days: String(policy?.yearly_days ?? 12),
        max_days_per_request:
            policy?.max_days_per_request != null
                ? String(policy.max_days_per_request)
                : '',
    });

    const adjustForm = useForm<AdjustFormData>({
        amount: '',
        description: '',
    });

    const submitPolicy = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        policyForm.transform((data) => ({
            ...data,
            leave_type,
        }));

        if (policy) {
            policyForm.put(`/hris/leaves/policy/${policy.id}`, {
                preserveScroll: true,
            });
        } else {
            policyForm.post('/hris/leaves/policy', {
                preserveScroll: true,
            });
        }
    };

    const applyFilter = () => {
        router.get(
            '/hris/leaves/balances',
            {
                year: filterYear,
                employee_id: filterEmployee,
                leave_type,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const doInitialize = () => {
        router.post(
            '/hris/leaves/balances/initialize',
            { year: filterYear, leave_type },
            {
                preserveScroll: true,
                onSuccess: () => setInitDialogOpen(false),
            },
        );
    };

    const doAccrue = () => {
        router.post(
            '/hris/leaves/balances/accrue',
            { year: filterYear, leave_type },
            {
                preserveScroll: true,
                onSuccess: () => setAccrueDialogOpen(false),
            },
        );
    };

    const openAdjust = (row: BalanceRow) => {
        setAdjustTarget(row);
        adjustForm.reset();
        adjustForm.clearErrors();
        setAdjustDialogOpen(true);
    };

    const submitAdjust = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!adjustTarget) return;
        adjustForm.transform((data) => ({
            ...data,
            year: filterYear,
            leave_type,
        }));
        adjustForm.put(
            `/hris/leaves/balances/${adjustTarget.employee_id}/adjust`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdjustDialogOpen(false);
                    setAdjustTarget(null);
                },
            },
        );
    };

    const totalEmployees = balances.filter((b) => b.has_balance).length;
    const totalUsed = balances.reduce((acc, b) => acc + b.used_days, 0);
    const totalRemaining = balances.reduce(
        (acc, b) => acc + b.remaining_balance,
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jatah Cuti" />

            <div className="space-y-4 p-4">
                {/* Back link */}
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link href={leavesIndex()}>
                            <ArrowLeft className="size-4" />
                            Kembali ke Pengajuan Cuti
                        </Link>
                    </Button>
                </div>

                {/* Section A: Policy Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings2 className="size-4" />
                            Kebijakan Cuti Tahunan
                        </CardTitle>
                        <CardDescription>
                            Atur kebijakan jatah cuti untuk tipe:{' '}
                            <strong>{leave_type}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submitPolicy}
                            className="grid gap-4 md:grid-cols-[240px_180px_200px_auto]"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="policy_type">
                                    Jenis Kebijakan
                                </Label>
                                <Select
                                    value={policyForm.data.policy_type}
                                    onValueChange={(v) =>
                                        policyForm.setData(
                                            'policy_type',
                                            v as 'lump_sum' | 'accrual',
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="policy_type"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lump_sum">
                                            Lump Sum (langsung)
                                        </SelectItem>
                                        <SelectItem value="accrual">
                                            Accrual (dicicil bulanan)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={policyForm.errors.policy_type}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="yearly_days">
                                    Jatah Hari / Tahun
                                </Label>
                                <Input
                                    id="yearly_days"
                                    type="number"
                                    min={1}
                                    value={policyForm.data.yearly_days}
                                    onChange={(e) =>
                                        policyForm.setData(
                                            'yearly_days',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={policyForm.errors.yearly_days}
                                />
                            </div>

                            {policyForm.data.policy_type === 'lump_sum' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="max_days">
                                        Maks Hari / Pengajuan
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            (opsional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="max_days"
                                        type="number"
                                        min={1}
                                        placeholder="Tidak dibatasi"
                                        value={
                                            policyForm.data.max_days_per_request
                                        }
                                        onChange={(e) =>
                                            policyForm.setData(
                                                'max_days_per_request',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            policyForm.errors
                                                .max_days_per_request
                                        }
                                    />
                                </div>
                            )}

                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={policyForm.processing}
                                >
                                    <CheckCircle className="size-4" />
                                    Simpan Kebijakan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Section B: Toolbar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SlidersHorizontal className="size-4" />
                            Filter &amp; Aksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="filter_year">Tahun</Label>
                                <Select
                                    value={filterYear}
                                    onValueChange={(v) => setFilterYear(v)}
                                >
                                    <SelectTrigger
                                        id="filter_year"
                                        className="w-32"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((y) => (
                                            <SelectItem
                                                key={y}
                                                value={String(y)}
                                            >
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="filter_emp">Karyawan</Label>
                                <SearchableSelect
                                    id="filter_emp"
                                    value={
                                        filterEmployee === ''
                                            ? '__all'
                                            : filterEmployee
                                    }
                                    onValueChange={(v) =>
                                        setFilterEmployee(
                                            v === '__all' ? '' : v,
                                        )
                                    }
                                    placeholder="Semua"
                                    searchPlaceholder="Cari karyawan..."
                                    options={[
                                        {
                                            value: '__all',
                                            label: 'Semua karyawan',
                                        },
                                        ...employees.map((e) => ({
                                            value: String(e.id),
                                            label: e.label,
                                        })),
                                    ]}
                                    className="w-56"
                                />
                            </div>

                            <Button onClick={applyFilter}>
                                <RefreshCw className="size-4" />
                                Terapkan
                            </Button>

                            <div className="ml-auto flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setInitDialogOpen(true)}
                                >
                                    <Plus className="size-4" />
                                    Inisialisasi Jatah
                                </Button>

                                {policy?.policy_type === 'accrual' && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setAccrueDialogOpen(true)
                                        }
                                    >
                                        <Play className="size-4" />
                                        Jalankan Akrual Manual
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section C: Balance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="size-4" />
                            Saldo Cuti Karyawan
                        </CardTitle>
                        <CardDescription>
                            Tahun {filterYear} &mdash; Tipe: {leave_type}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">Karyawan</th>
                                        <th className="px-3 py-2">
                                            Jenis Kebijakan
                                        </th>
                                        <th className="px-3 py-2">
                                            Jatah / Akrual
                                        </th>
                                        <th className="px-3 py-2">Terpakai</th>
                                        <th className="px-3 py-2">Adjusted</th>
                                        <th className="px-3 py-2">Sisa</th>
                                        <th className="px-3 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balances.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-6 text-center text-muted-foreground"
                                            >
                                                Belum ada data saldo cuti.
                                            </td>
                                        </tr>
                                    )}
                                    {balances.map((row) => (
                                        <tr
                                            key={row.employee_id}
                                            className="border-b align-middle"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="font-medium">
                                                    {row.employee_label}
                                                </div>
                                                {!row.has_balance && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1 border-amber-400 text-xs text-amber-600"
                                                    >
                                                        <AlertTriangle className="mr-1 size-3" />
                                                        Belum diinisialisasi
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge variant="secondary">
                                                    {row.policy_type ===
                                                    'lump_sum'
                                                        ? 'Lump Sum'
                                                        : 'Accrual'}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.policy_type ===
                                                'lump_sum' ? (
                                                    <span>
                                                        {row.total_quota} hari
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {row.accrued_days}/
                                                        {policy?.yearly_days ??
                                                            row.total_quota}{' '}
                                                        hari
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.used_days} hari
                                            </td>
                                            <td className="px-3 py-3">
                                                {row.adjusted_days !== 0 && (
                                                    <span
                                                        className={
                                                            row.adjusted_days >
                                                            0
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }
                                                    >
                                                        {row.adjusted_days > 0
                                                            ? '+'
                                                            : ''}
                                                        {row.adjusted_days}
                                                    </span>
                                                )}
                                                {row.adjusted_days === 0 && (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant={
                                                        row.remaining_balance >
                                                        0
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                    className={
                                                        row.remaining_balance >
                                                        0
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                            : ''
                                                    }
                                                >
                                                    {row.remaining_balance} hari
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openAdjust(row)
                                                        }
                                                    >
                                                        <SlidersHorizontal className="size-3.5" />
                                                        Sesuaikan
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={`/hris/leaves/balances/${row.employee_id}/ledger?year=${filterYear}&leave_type=${leave_type}`}
                                                        >
                                                            <History className="size-3.5" />
                                                            Riwayat
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Section D: Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>
                                Karyawan dengan Jatah
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {totalEmployees}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>
                                Total Hari Terpakai
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {totalUsed}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 py-3">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription>Total Hari Sisa</CardDescription>
                            <CardTitle className="text-2xl">
                                {totalRemaining}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* Dialog: Konfirmasi Inisialisasi */}
            <Dialog open={initDialogOpen} onOpenChange={setInitDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Inisialisasi Jatah Cuti</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan membuat entri saldo cuti untuk
                            semua karyawan yang belum memiliki saldo di tahun{' '}
                            <strong>{filterYear}</strong>. Lanjutkan?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setInitDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={doInitialize}>
                            <CheckCircle className="size-4" />
                            Ya, Inisialisasi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Konfirmasi Akrual Manual */}
            <Dialog open={accrueDialogOpen} onOpenChange={setAccrueDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Jalankan Akrual Manual</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan mengakumulasikan saldo cuti bulan
                            ini untuk semua karyawan dengan kebijakan Accrual di
                            tahun <strong>{filterYear}</strong>. Lanjutkan?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAccrueDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={doAccrue}>
                            <Play className="size-4" />
                            Ya, Jalankan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Adjust Balance */}
            <Dialog
                open={adjustDialogOpen}
                onOpenChange={(open) => {
                    setAdjustDialogOpen(open);
                    if (!open) {
                        setAdjustTarget(null);
                        adjustForm.reset();
                        adjustForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sesuaikan Saldo Cuti</DialogTitle>
                        <DialogDescription>
                            {adjustTarget?.employee_label}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAdjust} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="adjust_amount">
                                Jumlah Penyesuaian
                                <span className="ml-1 text-xs text-muted-foreground">
                                    (positif = tambah, negatif = kurangi)
                                </span>
                            </Label>
                            <Input
                                id="adjust_amount"
                                type="number"
                                placeholder="Contoh: 2 atau -1"
                                value={adjustForm.data.amount}
                                onChange={(e) =>
                                    adjustForm.setData('amount', e.target.value)
                                }
                                required
                            />
                            <InputError message={adjustForm.errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="adjust_desc">Keterangan</Label>
                            <Input
                                id="adjust_desc"
                                placeholder="Alasan penyesuaian..."
                                value={adjustForm.data.description}
                                onChange={(e) =>
                                    adjustForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={adjustForm.errors.description}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAdjustDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={adjustForm.processing}
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
