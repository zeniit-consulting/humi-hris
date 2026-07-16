import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    ClipboardCheck,
    Filter,
    PackageCheck,
    Plus,
    ShoppingCart,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
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
import {
    formatThousandDigits,
    normalizeDigitInput,
} from '@/lib/currency-input';
import type { BreadcrumbItem } from '@/types';
import {
    index as assetsIndex,
    procurementRequests,
    storeProcurementRequest,
    updateProcurementRequestStatus,
} from './routes';

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginator<T> = {
    data: T[];
    links: PaginatorLink[];
    total: number;
};

type EmployeeOption = {
    id: number;
    label: string;
};

type ProcurementRequest = {
    id: number;
    request_number: string;
    requested_by_employee_id: number | null;
    requested_by_employee_label: string;
    item_name: string;
    category: string | null;
    quantity: number;
    estimated_unit_price: string;
    actual_unit_price: string | null;
    needed_by: string | null;
    priority: string;
    status: string;
    reason: string | null;
    notes: string | null;
    assets: Array<{
        id: number;
        asset_code: string;
        name: string;
    }>;
};

type PageProps = {
    requests: Paginator<ProcurementRequest>;
    filters: {
        status: string;
        priority: string;
        search: string;
    };
    employeeOptions: EmployeeOption[];
    statusOptions: string[];
    priorityOptions: string[];
    summary: {
        pending: number;
        approved: number;
        ordered: number;
        received: number;
    };
};

type RequestFormData = {
    requested_by_employee_id: string;
    item_name: string;
    category: string;
    quantity: string;
    estimated_unit_price: string;
    needed_by: string;
    priority: string;
    reason: string;
    notes: string;
};

type StatusFormData = {
    status: string;
    asset_code_prefix: string;
    purchase_date: string;
    actual_unit_price: string;
    notes: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Asset Management',
        href: assetsIndex.url(),
    },
    {
        title: 'Request Pengadaan',
        href: procurementRequests.url(),
    },
];

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    ordered: 'Dipesan',
    received: 'Diterima',
    cancelled: 'Dibatalkan',
};

const priorityLabels: Record<string, string> = {
    low: 'Rendah',
    normal: 'Normal',
    high: 'Tinggi',
    urgent: 'Urgent',
};

const formatCurrency = (value: null | number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const today = () => new Date().toISOString().slice(0, 10);

const emptyRequestForm = (): RequestFormData => ({
    requested_by_employee_id: '',
    item_name: '',
    category: '',
    quantity: '1',
    estimated_unit_price: '0',
    needed_by: '',
    priority: 'normal',
    reason: '',
    notes: '',
});

export default function AssetProcurementRequestsPage() {
    const {
        requests,
        filters,
        employeeOptions,
        statusOptions,
        priorityOptions,
        summary,
    } = usePage<PageProps>().props;

    const [filterState, setFilterState] = useState(filters);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [receiveRequest, setReceiveRequest] =
        useState<ProcurementRequest | null>(null);

    const requestForm = useForm<RequestFormData>(emptyRequestForm());
    const statusForm = useForm<StatusFormData>({
        status: 'received',
        asset_code_prefix: '',
        purchase_date: today(),
        actual_unit_price: '0',
        notes: '',
    });

    const applyFilters = () => {
        router.get(procurementRequests.url(), filterState, {
            preserveScroll: true,
            replace: true,
        });
    };

    const submitRequest = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        requestForm.post(storeProcurementRequest.url(), {
            preserveScroll: true,
            onSuccess: () => {
                requestForm.setData(emptyRequestForm());
                setDialogOpen(false);
            },
        });
    };

    const postStatus = (
        request: ProcurementRequest,
        status: StatusFormData['status'],
    ) => {
        router.post(
            updateProcurementRequestStatus.url(request.id),
            { status },
            { preserveScroll: true },
        );
    };

    const openReceiveDialog = (request: ProcurementRequest) => {
        setReceiveRequest(request);
        statusForm.clearErrors();
        statusForm.setData({
            status: 'received',
            asset_code_prefix: request.category
                ? request.category.toUpperCase().replace(/[^A-Z0-9]+/g, '-')
                : request.request_number,
            purchase_date: today(),
            actual_unit_price: String(
                Number(
                    request.actual_unit_price ?? request.estimated_unit_price,
                ),
            ),
            notes: request.notes ?? '',
        });
    };

    const submitReceive = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!receiveRequest) {
            return;
        }

        statusForm.post(updateProcurementRequestStatus.url(receiveRequest.id), {
            preserveScroll: true,
            onSuccess: () => setReceiveRequest(null),
        });
    };

    const summaryCards = [
        { label: 'Pending', value: summary.pending },
        { label: 'Disetujui', value: summary.approved },
        { label: 'Dipesan', value: summary.ordered },
        { label: 'Diterima', value: summary.received },
    ];

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            headerActions={
                <Button asChild size="sm" variant="outline">
                    <Link href={assetsIndex.url()}>
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Link>
                </Button>
            }
        >
            <Head title="Request Pengadaan Aset" />

            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="size-4" />
                                Request Pengadaan Aset
                            </CardTitle>
                            <CardDescription>
                                Kelola permintaan pembelian aset sebelum masuk
                                ke inventory.
                            </CardDescription>
                        </div>
                        <Button type="button" onClick={() => setDialogOpen(true)}>
                            <Plus className="size-4" />
                            Buat Request
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-4">
                            {summaryCards.map((item) => (
                                <SummaryTile
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                />
                            ))}
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                            <div className="grid min-w-[220px] gap-2">
                                <Label htmlFor="search">Cari</Label>
                                <Input
                                    id="search"
                                    value={filterState.search}
                                    onChange={(event) =>
                                        setFilterState((current) => ({
                                            ...current,
                                            search: event.target.value,
                                        }))
                                    }
                                    placeholder="Nomor, nama, kategori"
                                />
                            </div>
                            <FilterSelect
                                label="Status"
                                value={filterState.status}
                                options={statusOptions}
                                labels={statusLabels}
                                onChange={(value) =>
                                    setFilterState((current) => ({
                                        ...current,
                                        status: value,
                                    }))
                                }
                            />
                            <FilterSelect
                                label="Prioritas"
                                value={filterState.priority}
                                options={priorityOptions}
                                labels={priorityLabels}
                                onChange={(value) =>
                                    setFilterState((current) => ({
                                        ...current,
                                        priority: value,
                                    }))
                                }
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={applyFilters}
                            >
                                <Filter className="size-4" />
                                Terapkan
                            </Button>
                        </div>

                        <div className="rounded-lg border">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1120px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-3 py-2">
                                                Request
                                            </th>
                                            <th className="px-3 py-2">
                                                Pemohon
                                            </th>
                                            <th className="px-3 py-2">
                                                Jumlah
                                            </th>
                                            <th className="px-3 py-2">
                                                Estimasi
                                            </th>
                                            <th className="px-3 py-2">
                                                Status
                                            </th>
                                            <th className="px-3 py-2">
                                                Asset
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.data.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-3 py-6 text-center text-muted-foreground"
                                                >
                                                    Belum ada request pengadaan.
                                                </td>
                                            </tr>
                                        )}
                                        {requests.data.map((request) => (
                                            <tr
                                                key={request.id}
                                                className="border-b align-top"
                                            >
                                                <td className="px-3 py-3">
                                                    <div className="font-medium">
                                                        {request.request_number}
                                                    </div>
                                                    <p>{request.item_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {request.category ?? '-'}{' '}
                                                        · Dibutuhkan{' '}
                                                        {request.needed_by ??
                                                            '-'}
                                                    </p>
                                                    {request.reason && (
                                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                            {request.reason}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {
                                                        request.requested_by_employee_label
                                                    }
                                                </td>
                                                <td className="px-3 py-3">
                                                    {request.quantity}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <p>
                                                        {formatCurrency(
                                                            request.estimated_unit_price,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Total{' '}
                                                        {formatCurrency(
                                                            Number(
                                                                request.estimated_unit_price,
                                                            ) * request.quantity,
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Badge variant="outline">
                                                        {statusLabels[
                                                            request.status
                                                        ] ?? request.status}
                                                    </Badge>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {priorityLabels[
                                                            request.priority
                                                        ] ?? request.priority}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {request.assets.length ===
                                                        0 && '-'}
                                                    <div className="space-y-1">
                                                        {request.assets.map(
                                                            (asset) => (
                                                                <div
                                                                    key={
                                                                        asset.id
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        asset.asset_code
                                                                    }{' '}
                                                                    -{' '}
                                                                    {asset.name}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        {request.status ===
                                                            'pending' && (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        postStatus(
                                                                            request,
                                                                            'approved',
                                                                        )
                                                                    }
                                                                >
                                                                    <Check className="size-3.5" />
                                                                    Setujui
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        postStatus(
                                                                            request,
                                                                            'rejected',
                                                                        )
                                                                    }
                                                                >
                                                                    <X className="size-3.5" />
                                                                    Tolak
                                                                </Button>
                                                            </>
                                                        )}
                                                        {['pending', 'approved'].includes(
                                                            request.status,
                                                        ) && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    postStatus(
                                                                        request,
                                                                        'ordered',
                                                                    )
                                                                }
                                                            >
                                                                <ClipboardCheck className="size-3.5" />
                                                                Dipesan
                                                            </Button>
                                                        )}
                                                        {request.status !==
                                                            'received' &&
                                                            request.status !==
                                                                'cancelled' &&
                                                            request.status !==
                                                                'rejected' && (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openReceiveDialog(
                                                                            request,
                                                                        )
                                                                    }
                                                                >
                                                                    <PackageCheck className="size-3.5" />
                                                                    Terima
                                                                </Button>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {requests.links.map((link, index) => (
                                <Button
                                    key={`${link.label}-${index}`}
                                    asChild={link.url !== null}
                                    size="sm"
                                    variant={link.active ? 'default' : 'outline'}
                                    disabled={link.url === null}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Link>
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        requestForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Buat Request Pengadaan</DialogTitle>
                        <DialogDescription>
                            Ajukan kebutuhan aset baru untuk diproses.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitRequest} className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field
                                label="Nama Asset"
                                error={requestForm.errors.item_name}
                            >
                                <Input
                                    value={requestForm.data.item_name}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'item_name',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </Field>
                            <Field
                                label="Kategori"
                                error={requestForm.errors.category}
                            >
                                <Input
                                    value={requestForm.data.category}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'category',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Pemohon"
                                error={
                                    requestForm.errors.requested_by_employee_id
                                }
                            >
                                <SearchableSelect
                                    value={
                                        requestForm.data
                                            .requested_by_employee_id === ''
                                            ? '__none'
                                            : requestForm.data
                                                  .requested_by_employee_id
                                    }
                                    onValueChange={(value) =>
                                        requestForm.setData(
                                            'requested_by_employee_id',
                                            value === '__none' ? '' : value,
                                        )
                                    }
                                    placeholder="Pilih karyawan"
                                    searchPlaceholder="Cari karyawan..."
                                    options={[
                                        { value: '__none', label: '-' },
                                        ...employeeOptions.map((employee) => ({
                                            value: String(employee.id),
                                            label: employee.label,
                                        })),
                                    ]}
                                />
                            </Field>
                            <Field
                                label="Prioritas"
                                error={requestForm.errors.priority}
                            >
                                <Select
                                    value={requestForm.data.priority}
                                    onValueChange={(value) =>
                                        requestForm.setData('priority', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((priority) => (
                                            <SelectItem
                                                key={priority}
                                                value={priority}
                                            >
                                                {priorityLabels[priority] ??
                                                    priority}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field
                                label="Jumlah"
                                error={requestForm.errors.quantity}
                            >
                                <Input
                                    type="number"
                                    min="1"
                                    value={requestForm.data.quantity}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'quantity',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </Field>
                            <Field
                                label="Estimasi Harga Unit"
                                error={requestForm.errors.estimated_unit_price}
                            >
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatThousandDigits(
                                        requestForm.data.estimated_unit_price,
                                    )}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'estimated_unit_price',
                                            normalizeDigitInput(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Dibutuhkan Tanggal"
                                error={requestForm.errors.needed_by}
                            >
                                <Input
                                    type="date"
                                    value={requestForm.data.needed_by}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'needed_by',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Field label="Alasan" error={requestForm.errors.reason}>
                            <Input
                                value={requestForm.data.reason}
                                onChange={(event) =>
                                    requestForm.setData(
                                        'reason',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Catatan" error={requestForm.errors.notes}>
                            <Input
                                value={requestForm.data.notes}
                                onChange={(event) =>
                                    requestForm.setData(
                                        'notes',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    requestForm.processing ||
                                    requestForm.data.item_name === ''
                                }
                            >
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={receiveRequest !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setReceiveRequest(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Terima Pengadaan</DialogTitle>
                        <DialogDescription>
                            Asset inventory akan dibuat sesuai jumlah request.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitReceive} className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field
                                label="Prefix Kode Asset"
                                error={statusForm.errors.asset_code_prefix}
                            >
                                <Input
                                    value={statusForm.data.asset_code_prefix}
                                    onChange={(event) =>
                                        statusForm.setData(
                                            'asset_code_prefix',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Tanggal Beli"
                                error={statusForm.errors.purchase_date}
                            >
                                <Input
                                    type="date"
                                    value={statusForm.data.purchase_date}
                                    onChange={(event) =>
                                        statusForm.setData(
                                            'purchase_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Harga Aktual Unit"
                                error={statusForm.errors.actual_unit_price}
                            >
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatThousandDigits(
                                        statusForm.data.actual_unit_price,
                                    )}
                                    onChange={(event) =>
                                        statusForm.setData(
                                            'actual_unit_price',
                                            normalizeDigitInput(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Field label="Catatan" error={statusForm.errors.notes}>
                            <Input
                                value={statusForm.data.notes}
                                onChange={(event) =>
                                    statusForm.setData(
                                        'notes',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReceiveRequest(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={statusForm.processing}>
                                Terima
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function FilterSelect({
    label,
    value,
    options,
    labels,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    labels: Record<string, string>;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid w-[180px] gap-2">
            <Label>{label}</Label>
            <Select
                value={value || '__all'}
                onValueChange={(nextValue) =>
                    onChange(nextValue === '__all' ? '' : nextValue)
                }
            >
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__all">Semua</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {labels[option] ?? option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
