import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    ExternalLink,
    Filter,
    RotateCcw,
    WalletCards,
    X,
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Row = {
    id: number;
    employee_label: string;
    division_name: string | null;
    title: string;
    description: string;
    amount: string;
    status: string;
    receipt_url: string | null;
    receipt_name: string | null;
    rejection_reason: string | null;
    finance_notes: string | null;
};
type PageProps = {
    requests: { data: Row[]; total: number };
    filters: { status: string; employee_id: string };
    statusOptions: string[];
    employees: Array<{ id: number; label: string }>;
    stats: Record<string, number>;
};
type RejectTarget = Row | null;
const pageUrl = '/hris/reimbursements';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reimbursement', href: pageUrl },
];
const labels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    processing: 'Diproses Finance',
    paid: 'Dibayar',
};
const money = (value: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

export default function ReimbursementsPage() {
    const { requests, filters, statusOptions, employees, stats } =
        usePage<PageProps>().props;
    const [status, setStatus] = useState(filters.status);
    const [employeeId, setEmployeeId] = useState(filters.employee_id);
    const [rejectRow, setRejectRow] = useState<RejectTarget>(null);
    const rejectForm = useForm({ rejection_reason: '' });
    const apply = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            pageUrl,
            { status, employee_id: employeeId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };
    const reject = (event: FormEvent) => {
        event.preventDefault();
        if (!rejectRow) return;
        rejectForm.post(`${pageUrl}/${rejectRow.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectRow(null);
                rejectForm.reset();
            },
        });
    };
    const updateStatus = (row: Row, nextStatus: 'processing' | 'paid') =>
        router.post(
            `${pageUrl}/${row.id}/status`,
            { status: nextStatus },
            { preserveScroll: true },
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reimbursement" />
            <div className="space-y-4 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        'pending',
                        'approved',
                        'processing',
                        'paid',
                        'rejected',
                    ].map((key) => (
                        <Card key={key} className="gap-1 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>{labels[key]}</CardDescription>
                                <CardTitle className="text-2xl">
                                    {stats[key] ?? 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Filter reimbursement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={apply}
                            className="grid gap-3 md:grid-cols-[220px_260px_auto]"
                        >
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={status || '__all'}
                                    onValueChange={(v) =>
                                        setStatus(v === '__all' ? '' : v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all">
                                            Semua status
                                        </SelectItem>
                                        {statusOptions.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {labels[item] ?? item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Karyawan</Label>
                                <Select
                                    value={employeeId || '__all'}
                                    onValueChange={(v) =>
                                        setEmployeeId(v === '__all' ? '' : v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua karyawan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all">
                                            Semua karyawan
                                        </SelectItem>
                                        {employees.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button type="submit">
                                    <Filter className="size-4" />
                                    Terapkan
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setStatus('pending');
                                        setEmployeeId('');
                                        router.get(
                                            pageUrl,
                                            { status: 'pending' },
                                            { replace: true },
                                        );
                                    }}
                                >
                                    <RotateCcw className="size-4" />
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar reimbursement</CardTitle>
                        <CardDescription>
                            Total data: {requests.total}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">Karyawan</th>
                                        <th className="px-3 py-2">Pengajuan</th>
                                        <th className="px-3 py-2">Nominal</th>
                                        <th className="px-3 py-2">Nota</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-3 py-8 text-center text-muted-foreground"
                                            >
                                                Tidak ada pengajuan.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.data.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b align-top"
                                            >
                                                <td className="px-3 py-3 font-medium">
                                                    {row.employee_label}
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.division_name ??
                                                            '-'}
                                                    </div>
                                                </td>
                                                <td className="max-w-[320px] px-3 py-3">
                                                    <div className="font-semibold">
                                                        {row.title}
                                                    </div>
                                                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        {row.description}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 font-semibold">
                                                    {money(row.amount)}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {row.receipt_url ? (
                                                        <a
                                                            href={
                                                                row.receipt_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                                                        >
                                                            <ExternalLink className="size-4" />
                                                            Lihat nota
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Badge>
                                                        {labels[row.status] ??
                                                            row.status}
                                                    </Badge>
                                                    {row.rejection_reason ? (
                                                        <div className="mt-1 max-w-[180px] text-xs text-rose-700">
                                                            {
                                                                row.rejection_reason
                                                            }
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {row.status ===
                                                    'pending' ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.post(
                                                                        `${pageUrl}/${row.id}/approve`,
                                                                        undefined,
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <Check className="size-4" />
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setRejectRow(
                                                                        row,
                                                                    )
                                                                }
                                                            >
                                                                <X className="size-4" />
                                                                Tolak
                                                            </Button>
                                                        </div>
                                                    ) : row.status ===
                                                      'approved' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    row,
                                                                    'processing',
                                                                )
                                                            }
                                                        >
                                                            <WalletCards className="size-4" />
                                                            Kirim ke Finance
                                                        </Button>
                                                    ) : row.status ===
                                                      'processing' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    row,
                                                                    'paid',
                                                                )
                                                            }
                                                        >
                                                            Tandai dibayar
                                                        </Button>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Dialog
                open={rejectRow !== null}
                onOpenChange={(open) => !open && setRejectRow(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak reimbursement</DialogTitle>
                        <DialogDescription>
                            {rejectRow?.title}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={reject} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Alasan penolakan</Label>
                            <textarea
                                required
                                className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                                value={rejectForm.data.rejection_reason}
                                onChange={(event) =>
                                    rejectForm.setData(
                                        'rejection_reason',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={rejectForm.errors.rejection_reason}
                            />
                        </div>
                        <Button
                            variant="destructive"
                            disabled={rejectForm.processing}
                        >
                            Tolak
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
