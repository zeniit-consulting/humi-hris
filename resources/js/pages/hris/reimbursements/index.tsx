import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    ExternalLink,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    FileSpreadsheet,
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
    period: string;
    sort: { by: SortKey; direction: SortDirection };
    stats: Record<string, number>;
};
type SortKey = 'employee' | 'title' | 'amount' | 'receipt' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';
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
const statStyles: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50/70',
    approved: 'border-emerald-200 bg-emerald-50/70',
    processing: 'border-sky-200 bg-sky-50/70',
    paid: 'border-teal-200 bg-teal-50/70',
    rejected: 'border-rose-200 bg-rose-50/70',
};
const money = (value: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

const periodOptions = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);

    return {
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: new Intl.DateTimeFormat('id-ID', {
            month: 'long',
            year: 'numeric',
        }).format(date),
    };
});

function SortableHeader({
    label,
    sortKey,
    activeSort,
    direction,
    onSort,
}: {
    label: string;
    sortKey: SortKey;
    activeSort: SortKey;
    direction: SortDirection;
    onSort: (key: SortKey) => void;
}) {
    const active = activeSort === sortKey;
    const SortIcon = !active
        ? ArrowUpDown
        : direction === 'asc'
          ? ArrowUp
          : ArrowDown;

    return (
        <th
            className="px-3 py-2"
            aria-sort={
                active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
            }
        >
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className="inline-flex min-h-8 items-center gap-1 rounded-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                title={`Urutkan berdasarkan ${label}`}
            >
                {label}
                <SortIcon className={`size-3.5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
            </button>
        </th>
    );
}

export default function ReimbursementsPage() {
    const { requests, period, sort, stats } =
        usePage<PageProps>().props;
    const [rejectRow, setRejectRow] = useState<RejectTarget>(null);
    const rejectForm = useForm({ rejection_reason: '' });
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
    const toggleSort = (sortKey: SortKey) => {
        const direction: SortDirection =
            sort.by === sortKey && sort.direction === 'asc' ? 'desc' : 'asc';
        router.get(
            pageUrl,
            { period, sort_by: sortKey, sort_dir: direction },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };
    const exportUrl = `${pageUrl}/export?period=${period}&sort_by=${sort.by}&sort_dir=${sort.direction}`;

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
                        <Card
                            key={key}
                            className={`gap-1 py-3 ${statStyles[key] ?? ''}`}
                        >
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
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle>Daftar reimbursement</CardTitle>
                            <CardDescription>
                                Total data: {requests.total}
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Select
                                value={period}
                                onValueChange={(value) =>
                                    router.get(
                                        pageUrl,
                                        {
                                            period: value,
                                            sort_by: sort.by,
                                            sort_dir: sort.direction,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true,
                                        },
                                    )
                                }
                            >
                                <SelectTrigger
                                    className="w-[190px]"
                                    aria-label="Filter periode reimbursement"
                                >
                                    <SelectValue placeholder="Pilih periode" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" asChild>
                                <a href={exportUrl}>
                                    <FileSpreadsheet className="size-4" />
                                    Export Excel
                                </a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <SortableHeader label="Karyawan" sortKey="employee" activeSort={sort.by} direction={sort.direction} onSort={toggleSort} />
                                        <SortableHeader label="Pengajuan" sortKey="title" activeSort={sort.by} direction={sort.direction} onSort={toggleSort} />
                                        <SortableHeader label="Nominal" sortKey="amount" activeSort={sort.by} direction={sort.direction} onSort={toggleSort} />
                                        <SortableHeader label="Nota" sortKey="receipt" activeSort={sort.by} direction={sort.direction} onSort={toggleSort} />
                                        <SortableHeader label="Status" sortKey="status" activeSort={sort.by} direction={sort.direction} onSort={toggleSort} />
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
