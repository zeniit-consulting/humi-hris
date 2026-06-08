import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
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
import { formatDeviceDateTime } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type AuditLog = {
    id: number;
    action: string;
    description: string;
    metadata: Record<string, unknown>;
    ip_address: string | null;
    created_at: string | null;
    actor: null | {
        id: number;
        name: string;
        email: string;
    };
    target_user: null | {
        id: number;
        name: string;
        email: string;
        company_name: string | null;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedLogs = {
    data: AuditLog[];
    links: PaginationLink[];
};

type PageProps = {
    filters: {
        search: string;
        action: string;
    };
    logs: PaginatedLogs;
    actions: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Audit Log', href: '/admin/audit-logs' },
];

export default function AuditLogsPage() {
    const { filters, logs, actions } = usePage<PageProps>().props;
    const filterForm = useForm({
        search: filters.search,
        action: filters.action,
    });

    const handleFilterSubmit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/audit-logs',
            {
                search: filterForm.data.search,
                action: filterForm.data.action,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Audit Log</CardTitle>
                        <CardDescription>
                            Cari riwayat aksi superadmin berdasarkan aksi,
                            target, actor, atau deskripsi.
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
                                        placeholder="Actor, target, aksi, deskripsi"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="action">Action</Label>
                                <select
                                    id="action"
                                    value={filterForm.data.action}
                                    onChange={(event) =>
                                        filterForm.setData(
                                            'action',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                >
                                    <option value="">Semua action</option>
                                    {actions.map((action) => (
                                        <option key={action} value={action}>
                                            {action}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end justify-end">
                                <Button type="submit">Terapkan Filter</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Aksi Superadmin</CardTitle>
                        <CardDescription>
                            Catatan perubahan subscription, invoice, dan status
                            tenant.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {logs.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                Belum ada audit log yang cocok dengan filter
                                saat ini.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Actor</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs">
                                                {formatDeviceDateTime(
                                                    log.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">
                                                    {log.actor?.name ?? '-'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {log.actor?.email ?? '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">
                                                    {log.target_user
                                                        ?.company_name ||
                                                        log.target_user?.name ||
                                                        '-'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {log.target_user?.email ??
                                                        '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="max-w-md whitespace-normal">
                                                <p>{log.description}</p>
                                                {Object.keys(log.metadata)
                                                    .length > 0 ? (
                                                    <pre className="mt-2 max-h-28 overflow-auto rounded-md bg-muted p-2 text-xs">
                                                        {JSON.stringify(
                                                            log.metadata,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {log.ip_address ?? '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <Pagination links={logs.links} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
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
