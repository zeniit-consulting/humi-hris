import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    FileText,
    Search,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Invoice = {
    id: number;
    invoice_number: string;
    subscriber_name: string | null;
    subscriber_email: string | null;
    company_name: string | null;
    plan_slug: 'free' | 'core' | 'plus';
    amount: number;
    employee_count: number;
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    due_date: string | null;
    paid_at: string | null;
    created_at: string | null;
    payment_proof: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedInvoices = {
    data: Invoice[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type PageProps = {
    filters: {
        search: string;
        plan: 'all' | 'free' | 'core' | 'plus';
        status: 'all' | 'pending' | 'paid' | 'cancelled' | 'expired';
    };
    stats: {
        total_invoices: number;
        pending_invoices: number;
        paid_invoices: number;
        cancelled_invoices: number;
        paid_revenue: number;
    };
    invoices: PaginatedInvoices;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Invoice', href: '/admin/invoices' },
];

const money = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const statusBadge: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    pending: 'secondary',
    paid: 'default',
    cancelled: 'outline',
    expired: 'destructive',
};

export default function AdminInvoicesPage() {
    const { filters, stats, invoices } = usePage<PageProps>().props;
    const filterForm = useForm({
        search: filters.search,
        plan: filters.plan,
        status: filters.status,
    });

    const handleFilterSubmit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/invoices',
            {
                search: filterForm.data.search,
                plan: filterForm.data.plan,
                status: filterForm.data.status,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Invoice" />

            <div className="space-y-6 p-4">
                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard
                        label="Total Invoice"
                        value={stats.total_invoices}
                    />
                    <StatCard label="Pending" value={stats.pending_invoices} />
                    <StatCard label="Paid" value={stats.paid_invoices} />
                    <StatCard
                        label="Cancelled"
                        value={stats.cancelled_invoices}
                    />
                    <StatCard
                        label="Revenue Paid"
                        value={money.format(stats.paid_revenue)}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Invoice</CardTitle>
                        <CardDescription>
                            Cari invoice berdasarkan nomor, tenant, email, plan,
                            atau status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleFilterSubmit}
                            className="grid gap-3 md:grid-cols-4"
                        >
                            <div className="md:col-span-2">
                                <Label htmlFor="search">Cari</Label>
                                <div className="relative mt-1">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        value={filterForm.data.search}
                                        onChange={(event) =>
                                            filterForm.setData(
                                                'search',
                                                event.target.value,
                                            )
                                        }
                                        className="pl-9"
                                        placeholder="Nomor invoice, tenant, email"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="plan">Plan</Label>
                                <select
                                    id="plan"
                                    value={filterForm.data.plan}
                                    onChange={(event) =>
                                        filterForm.setData(
                                            'plan',
                                            event.target
                                                .value as PageProps['filters']['plan'],
                                        )
                                    }
                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                >
                                    <option value="all">Semua plan</option>
                                    <option value="free">Free</option>
                                    <option value="core">Core</option>
                                    <option value="plus">Plus</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={filterForm.data.status}
                                    onChange={(event) =>
                                        filterForm.setData(
                                            'status',
                                            event.target
                                                .value as PageProps['filters']['status'],
                                        )
                                    }
                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                >
                                    <option value="all">Semua status</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                            <div className="flex justify-end md:col-span-4">
                                <Button type="submit">Terapkan Filter</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Semua Invoice</CardTitle>
                        <CardDescription>
                            Data invoice lintas tenant untuk operasional billing
                            platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                Tidak ada invoice yang cocok dengan filter saat
                                ini.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Due/Paid</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.data.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>
                                                <p className="font-mono text-xs">
                                                    {invoice.invoice_number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {invoice.created_at ?? '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">
                                                    {invoice.company_name ||
                                                        invoice.subscriber_name ||
                                                        '-'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {invoice.subscriber_email ??
                                                        '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium uppercase">
                                                    {invoice.plan_slug}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {invoice.employee_count}{' '}
                                                    karyawan
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {money.format(invoice.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        statusBadge[
                                                            invoice.status
                                                        ] ?? 'outline'
                                                    }
                                                >
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-xs">
                                                    Due:{' '}
                                                    {invoice.due_date ?? '-'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Paid:{' '}
                                                    {invoice.paid_at ?? '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    {invoice.payment_proof ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a
                                                                href={
                                                                    invoice.payment_proof
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <CreditCard className="mr-2 size-4" />
                                                                Bukti
                                                            </a>
                                                        </Button>
                                                    ) : null}
                                                    {invoice.status ===
                                                    'pending' ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.post(
                                                                        `/admin/subscribers/invoices/${invoice.id}/approve`,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle2 className="mr-2 size-4" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    router.post(
                                                                        `/admin/subscribers/invoices/${invoice.id}/cancel`,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <XCircle className="mr-2 size-4" />
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <Pagination links={invoices.links} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="mt-2 flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <p className="text-2xl font-semibold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function Pagination({ links }: { links: PaginationLink[] }) {
    const cleanLabel = (label: string) =>
        label.replace('&laquo;', '‹').replace('&raquo;', '›');

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link, index) => (
                <Button
                    key={`${link.label}-${index}`}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    asChild={Boolean(link.url)}
                >
                    {link.url ? (
                        <Link href={link.url} preserveScroll>
                            {cleanLabel(link.label)}
                        </Link>
                    ) : (
                        <span>{cleanLabel(link.label)}</span>
                    )}
                </Button>
            ))}
        </div>
    );
}
