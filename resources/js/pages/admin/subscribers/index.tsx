import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Search, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Plan = {
    slug: 'free' | 'core' | 'plus';
    name: string;
    price_per_employee: number;
};

type SubscriberRecord = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company_name: string | null;
    created_at: string | null;
    sub_users_count: number;
    active_employees_count: number;
    subscription: null | {
        id: number;
        plan_slug: 'free' | 'core' | 'plus';
        status: 'trial' | 'active' | 'expired' | 'cancelled';
        employee_count: number;
        current_period_start: string | null;
        current_period_end: string | null;
        trial_ends_at: string | null;
        days_remaining: number;
    };
    latest_invoice: null | {
        id: number;
        invoice_number: string;
        plan_slug: 'free' | 'core' | 'plus';
        status: string;
        amount: number;
        employee_count: number;
        paid_at: string | null;
        due_date: string | null;
        payment_proof: string | null;
    };
};

type PendingInvoice = {
    id: number;
    invoice_number: string;
    user_id: number;
    subscriber_name: string | null;
    subscriber_email: string | null;
    company_name: string | null;
    plan_slug: 'free' | 'core' | 'plus';
    amount: number;
    employee_count: number;
    due_date: string | null;
    created_at: string | null;
    payment_proof: string | null;
    notes: string | null;
};

type PageProps = {
    filters: {
        search: string;
        plan: 'all' | 'free' | 'core' | 'plus';
        status: 'all' | 'trial' | 'active' | 'expired' | 'cancelled' | 'none';
    };
    stats: {
        total_subscribers: number;
        active_subscribers: number;
        trial_subscribers: number;
        expired_subscribers: number;
        pending_invoices: number;
    };
    subscribers: SubscriberRecord[];
    pendingInvoices: PendingInvoice[];
    plans: Plan[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Subscriber', href: '/admin/subscribers' },
];

const money = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const statusBadge: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    trial: 'secondary',
    expired: 'destructive',
    cancelled: 'outline',
    pending: 'secondary',
    paid: 'default',
};

export default function SubscriberManagementPage() {
    const { filters, stats, subscribers, pendingInvoices, plans } =
        usePage<PageProps>().props;
    const [selectedSubscriber, setSelectedSubscriber] =
        useState<SubscriberRecord | null>(subscribers[0] ?? null);

    const filterForm = useForm({
        search: filters.search,
        plan: filters.plan,
        status: filters.status,
    });

    const subscriptionForm = useForm({
        plan_slug:
            selectedSubscriber?.subscription?.plan_slug ?? ('free' as 'free' | 'core' | 'plus'),
        status:
            selectedSubscriber?.subscription?.status ??
            ('trial' as 'trial' | 'active' | 'expired' | 'cancelled'),
        employee_count:
            selectedSubscriber?.subscription?.employee_count ??
            selectedSubscriber?.active_employees_count ??
            0,
        current_period_start:
            selectedSubscriber?.subscription?.current_period_start ?? new Date().toISOString().slice(0, 10),
        current_period_end:
            selectedSubscriber?.subscription?.current_period_end ?? new Date().toISOString().slice(0, 10),
        trial_ends_at: selectedSubscriber?.subscription?.trial_ends_at ?? '',
    });

    useEffect(() => {
        if (!selectedSubscriber) {
            return;
        }

        subscriptionForm.setData({
            plan_slug: selectedSubscriber.subscription?.plan_slug ?? 'free',
            status: selectedSubscriber.subscription?.status ?? 'trial',
            employee_count:
                selectedSubscriber.subscription?.employee_count ??
                selectedSubscriber.active_employees_count,
            current_period_start:
                selectedSubscriber.subscription?.current_period_start ??
                new Date().toISOString().slice(0, 10),
            current_period_end:
                selectedSubscriber.subscription?.current_period_end ??
                new Date().toISOString().slice(0, 10),
            trial_ends_at: selectedSubscriber.subscription?.trial_ends_at ?? '',
        });
    }, [selectedSubscriber, subscriptionForm]);

    const handleFilterSubmit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/subscribers',
            {
                search: filterForm.data.search,
                plan: filterForm.data.plan,
                status: filterForm.data.status,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSubscriptionSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedSubscriber) return;

        subscriptionForm.put(
            `/admin/subscribers/${selectedSubscriber.id}/subscription`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Subscriber" />

            <div className="space-y-6 p-4">
                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard label="Total Subscriber" value={stats.total_subscribers} />
                    <StatCard label="Aktif" value={stats.active_subscribers} />
                    <StatCard label="Trial" value={stats.trial_subscribers} />
                    <StatCard label="Expired" value={stats.expired_subscribers} />
                    <StatCard label="Invoice Pending" value={stats.pending_invoices} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Subscriber</CardTitle>
                        <CardDescription>
                            Cari tenant berdasarkan nama, email, perusahaan, plan, atau status.
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
                                        placeholder="Nama, email, perusahaan"
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
                                            event.target.value as PageProps['filters']['plan'],
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
                                            event.target.value as PageProps['filters']['status'],
                                        )
                                    }
                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                >
                                    <option value="all">Semua status</option>
                                    <option value="trial">Trial</option>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="none">Belum ada subscription</option>
                                </select>
                            </div>
                            <div className="md:col-span-4 flex justify-end">
                                <Button type="submit">Terapkan Filter</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Subscriber</CardTitle>
                            <CardDescription>
                                Klik satu subscriber untuk mengelola status langganan dan detail akunnya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {subscribers.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Tidak ada subscriber yang cocok dengan filter saat ini.
                                </div>
                            ) : (
                                subscribers.map((subscriber) => (
                                    <button
                                        type="button"
                                        key={subscriber.id}
                                        onClick={() => setSelectedSubscriber(subscriber)}
                                        className={`w-full rounded-xl border p-4 text-left transition ${
                                            selectedSubscriber?.id === subscriber.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/40'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">
                                                    {subscriber.company_name || subscriber.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {subscriber.name} · {subscriber.email}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge
                                                    variant={
                                                        statusBadge[
                                                            subscriber.subscription?.status ?? 'none'
                                                        ] ?? 'outline'
                                                    }
                                                >
                                                    {subscriber.subscription?.status ?? 'none'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {subscriber.subscription?.plan_slug ?? 'free'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-4">
                                            <span>
                                                Pegawai aktif: {subscriber.active_employees_count}
                                            </span>
                                            <span>
                                                Slot billing: {subscriber.subscription?.employee_count ?? 0}
                                            </span>
                                            <span>
                                                Sub-user: {subscriber.sub_users_count}
                                            </span>
                                            <span>
                                                Berakhir:{' '}
                                                {subscriber.subscription?.current_period_end ?? '-'}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kelola Subscription</CardTitle>
                            <CardDescription>
                                Update plan, status, dan periode subscription subscriber terpilih.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedSubscriber ? (
                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                    Pilih subscriber di panel kiri terlebih dahulu.
                                </div>
                            ) : (
                                <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
                                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                                        <p className="font-semibold">
                                            {selectedSubscriber.company_name ||
                                                selectedSubscriber.name}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {selectedSubscriber.email}
                                        </p>
                                        <p className="mt-2 text-muted-foreground">
                                            Pegawai aktif aktual:{' '}
                                            {selectedSubscriber.active_employees_count}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="plan_slug">Plan</Label>
                                            <select
                                                id="plan_slug"
                                                value={subscriptionForm.data.plan_slug}
                                                onChange={(event) =>
                                                    subscriptionForm.setData(
                                                        'plan_slug',
                                                        event.target.value as 'free' | 'core' | 'plus',
                                                    )
                                                }
                                                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                            >
                                                {plans.map((plan) => (
                                                    <option key={plan.slug} value={plan.slug}>
                                                        {plan.name} ({money.format(plan.price_per_employee)})
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={subscriptionForm.errors.plan_slug} />
                                        </div>
                                        <div>
                                            <Label htmlFor="status_value">Status</Label>
                                            <select
                                                id="status_value"
                                                value={subscriptionForm.data.status}
                                                onChange={(event) =>
                                                    subscriptionForm.setData(
                                                        'status',
                                                        event.target.value as 'trial' | 'active' | 'expired' | 'cancelled',
                                                    )
                                                }
                                                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                            >
                                                <option value="trial">Trial</option>
                                                <option value="active">Active</option>
                                                <option value="expired">Expired</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <InputError message={subscriptionForm.errors.status} />
                                        </div>
                                        <div>
                                            <Label htmlFor="employee_count">Jumlah karyawan billing</Label>
                                            <Input
                                                id="employee_count"
                                                type="number"
                                                min={0}
                                                value={subscriptionForm.data.employee_count}
                                                onChange={(event) =>
                                                    subscriptionForm.setData(
                                                        'employee_count',
                                                        Number(event.target.value),
                                                    )
                                                }
                                            />
                                            <InputError message={subscriptionForm.errors.employee_count} />
                                        </div>
                                        <div>
                                            <Label htmlFor="trial_ends_at">Trial ends at</Label>
                                            <Input
                                                id="trial_ends_at"
                                                type="date"
                                                value={subscriptionForm.data.trial_ends_at}
                                                onChange={(event) =>
                                                    subscriptionForm.setData(
                                                        'trial_ends_at',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError message={subscriptionForm.errors.trial_ends_at} />
                                        </div>
                                        <div>
                                            <Label htmlFor="current_period_start">Periode mulai</Label>
                                            <Input
                                                id="current_period_start"
                                                type="date"
                                                value={subscriptionForm.data.current_period_start}
                                                onChange={(event) =>
                                                    subscriptionForm.setData(
                                                        'current_period_start',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError message={subscriptionForm.errors.current_period_start} />
                                        </div>
                                        <div>
                                            <Label htmlFor="current_period_end">Periode berakhir</Label>
                                            <Input
                                                id="current_period_end"
                                                type="date"
                                                value={subscriptionForm.data.current_period_end}
                                                onChange={(event) =>
                                                    subscriptionForm.setData(
                                                        'current_period_end',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError message={subscriptionForm.errors.current_period_end} />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={subscriptionForm.processing}>
                                        Simpan Subscription
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Pending</CardTitle>
                        <CardDescription>
                            Approve invoice untuk mengaktifkan subscription, atau batalkan jika pembayaran tidak valid.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingInvoices.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                Tidak ada invoice pending saat ini.
                            </div>
                        ) : (
                            pendingInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="rounded-xl border p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold">
                                                {invoice.invoice_number}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.company_name || invoice.subscriber_name} ·{' '}
                                                {invoice.subscriber_email}
                                            </p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {invoice.plan_slug.toUpperCase()} ·{' '}
                                                {invoice.employee_count} karyawan ·{' '}
                                                {money.format(invoice.amount)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Due date: {invoice.due_date ?? '-'}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {invoice.payment_proof ? (
                                                <Button variant="outline" asChild>
                                                    <a
                                                        href={invoice.payment_proof}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <CreditCard className="mr-2 size-4" />
                                                        Lihat Bukti
                                                    </a>
                                                </Button>
                                            ) : null}
                                            <Button
                                                onClick={() =>
                                                    router.post(
                                                        `/admin/subscribers/invoices/${invoice.id}/approve`,
                                                        {},
                                                        { preserveScroll: true },
                                                    )
                                                }
                                            >
                                                <CheckCircle2 className="mr-2 size-4" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() =>
                                                    router.post(
                                                        `/admin/subscribers/invoices/${invoice.id}/cancel`,
                                                        {},
                                                        { preserveScroll: true },
                                                    )
                                                }
                                            >
                                                <XCircle className="mr-2 size-4" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="mt-2 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    <p className="text-2xl font-semibold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
