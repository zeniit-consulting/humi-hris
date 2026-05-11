import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

type Transaction = {
    id: number;
    amount: number;
    type: 'grant' | 'accrual' | 'usage' | 'reversal' | 'adjustment';
    description: string | null;
    balance_after: number;
    effective_date: string;
    leave_request_id: number | null;
};

type PageProps = {
    transactions: Transaction[];
    employee: { id: number; label: string };
    balance: BalanceRow | null;
    year: number;
    leave_type: string;
};

const typeLabelMap: Record<Transaction['type'], string> = {
    grant: 'Grant',
    accrual: 'Akrual',
    usage: 'Penggunaan',
    reversal: 'Reversal',
    adjustment: 'Penyesuaian',
};

const typeBadgeClass: Record<Transaction['type'], string> = {
    grant: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    accrual: 'bg-green-100 text-green-800 hover:bg-green-100',
    usage: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    reversal: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    adjustment: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
};

function formatDateId(dateStr: string): string {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function LedgerPage() {
    const { transactions, employee, balance, year, leave_type } =
        usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cuti', href: leavesIndex() },
        { title: 'Jatah Cuti', href: `/hris/leaves/balances?year=${year}&leave_type=${leave_type}` },
        { title: employee.label, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Riwayat Saldo — ${employee.label}`} />

            <div className="space-y-4 p-4">
                {/* Back + Header */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                        <Link
                            href={`/hris/leaves/balances?year=${year}&leave_type=${leave_type}`}
                        >
                            <ArrowLeft className="size-4" />
                            Kembali ke Jatah Cuti
                        </Link>
                    </Button>
                </div>

                <div>
                    <h1 className="text-xl font-semibold">
                        Riwayat Saldo Cuti — {employee.label}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tahun {year} &mdash; Tipe: {leave_type}
                    </p>
                </div>

                {/* Balance summary */}
                {balance ? (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>
                                    {balance.policy_type === 'lump_sum'
                                        ? 'Jatah Total'
                                        : 'Akrual'}
                                </CardDescription>
                                <CardTitle className="text-2xl">
                                    {balance.policy_type === 'lump_sum'
                                        ? balance.total_quota
                                        : balance.accrued_days}{' '}
                                    hari
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>Terpakai</CardDescription>
                                <CardTitle className="text-2xl">
                                    {balance.used_days} hari
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>Penyesuaian</CardDescription>
                                <CardTitle
                                    className={`text-2xl ${
                                        balance.adjusted_days > 0
                                            ? 'text-green-600'
                                            : balance.adjusted_days < 0
                                              ? 'text-red-600'
                                              : ''
                                    }`}
                                >
                                    {balance.adjusted_days > 0 ? '+' : ''}
                                    {balance.adjusted_days} hari
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>Sisa Saldo</CardDescription>
                                <CardTitle
                                    className={`text-2xl ${
                                        balance.remaining_balance > 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {balance.remaining_balance} hari
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                ) : (
                    <Card className="py-4">
                        <CardContent className="text-center text-muted-foreground text-sm">
                            Belum ada data saldo untuk karyawan ini.
                        </CardContent>
                    </Card>
                )}

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="size-4" />
                            Riwayat Transaksi
                        </CardTitle>
                        <CardDescription>
                            Semua mutasi saldo cuti karyawan ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Tipe</th>
                                        <th className="px-3 py-2">Keterangan</th>
                                        <th className="px-3 py-2 text-right">Jumlah</th>
                                        <th className="px-3 py-2 text-right">
                                            Saldo Setelah
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-3 py-6 text-center text-muted-foreground"
                                            >
                                                Belum ada transaksi.
                                            </td>
                                        </tr>
                                    )}
                                    {transactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b align-middle"
                                        >
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                {formatDateId(tx.effective_date)}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={typeBadgeClass[tx.type]}
                                                >
                                                    {typeLabelMap[tx.type]}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                                {tx.description ?? '—'}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium tabular-nums">
                                                <span
                                                    className={
                                                        tx.amount > 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {tx.amount > 0 ? '+' : ''}
                                                    {tx.amount}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right tabular-nums">
                                                {tx.balance_after}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
