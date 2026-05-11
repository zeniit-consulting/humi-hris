import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Lock,
    Receipt,
    Sparkles,
    Upload,
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
    CardFooter,
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
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SubscriptionInfo } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Invoice = {
    id: number;
    invoice_number: string;
    plan_slug: 'free' | 'core' | 'plus';
    employee_count: number;
    amount: number;
    status: 'pending' | 'paid' | 'expired' | 'cancelled';
    issued_at: string;
    paid_at: string | null;
    proof_url: string | null;
};

type PageProps = {
    subscription: SubscriptionInfo | null;
    invoices: Invoice[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing & Langganan', href: '/billing' },
];

const PRICE_CORE = 2900;
const PRICE_PLUS = 7500;

const planLabels: Record<string, string> = {
    free: 'Free',
    core: 'Core',
    plus: 'Plus',
};

const statusConfig: Record<
    Invoice['status'],
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
    pending: { label: 'Menunggu Pembayaran', variant: 'secondary' },
    paid: { label: 'Lunas', variant: 'default' },
    expired: { label: 'Kedaluwarsa', variant: 'destructive' },
    cancelled: { label: 'Dibatalkan', variant: 'outline' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function formatDate(iso: string | null) {
    if (!iso) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(iso));
}

// ── Banner Status ─────────────────────────────────────────────────────────────

function SubscriptionBanner({ sub }: { sub: SubscriptionInfo }) {
    if (sub.status === 'expired') {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
                <AlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-300">
                        Langganan Anda telah kedaluwarsa
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                        Upgrade ke paket berbayar untuk melanjutkan akses penuh.
                    </p>
                </div>
            </div>
        );
    }

    if (sub.is_trial || sub.plan_slug === 'free') {
        const pct = sub.max_employees
            ? Math.min(100, (sub.employee_count / sub.max_employees) * 100)
            : 0;
        return (
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Clock className="size-5 text-muted-foreground" />
                        <span className="font-medium">Paket Free (Trial)</span>
                        {sub.days_remaining > 0 && (
                            <Badge variant="secondary">{sub.days_remaining} hari tersisa</Badge>
                        )}
                    </div>
                    {sub.current_period_end && (
                        <span className="text-sm text-muted-foreground">
                            Berakhir: {formatDate(sub.current_period_end)}
                        </span>
                    )}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Penggunaan Karyawan</span>
                        <span className="font-medium">
                            {sub.employee_count} / {sub.max_employees ?? '∞'} karyawan
                        </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <CheckCircle2 className="size-5 shrink-0 text-green-600 dark:text-green-400" />
            <div className="flex-1">
                <p className="font-medium">Paket {planLabels[sub.plan_slug]} — Aktif</p>
                <p className="text-sm text-muted-foreground">
                    {sub.employee_count} karyawan aktif · Perpanjangan:{' '}
                    {formatDate(sub.current_period_end)}
                    {sub.days_remaining > 0 && ` · ${sub.days_remaining} hari lagi`}
                </p>
            </div>
        </div>
    );
}

// ── Upgrade Dialog ────────────────────────────────────────────────────────────

type UpgradeDialogProps = {
    open: boolean;
    onClose: () => void;
    planSlug: 'core' | 'plus';
    defaultEmployees: number;
};

function UpgradeDialog({ open, onClose, planSlug, defaultEmployees }: UpgradeDialogProps) {
    const price = planSlug === 'core' ? PRICE_CORE : PRICE_PLUS;
    const planLabel = planSlug === 'core' ? 'Core' : 'Plus';

    const { data, setData, post, processing, errors, reset } = useForm({
        plan_slug: planSlug,
        employee_count: defaultEmployees,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/billing/invoices', {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upgrade ke Paket {planLabel}</DialogTitle>
                    <DialogDescription>
                        Konfirmasi jumlah karyawan untuk menghitung total tagihan bulanan Anda.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1 rounded-md bg-muted/50 p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Paket</span>
                            <span className="font-medium">{planLabel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Harga per karyawan</span>
                            <span className="font-medium">{fmt.format(price)}/bulan</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                            <span className="text-muted-foreground">Estimasi Total</span>
                            <span className="font-semibold text-primary">
                                {fmt.format(data.employee_count * price)}/bulan
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="employee_count">Jumlah Karyawan</Label>
                        <Input
                            id="employee_count"
                            type="number"
                            min={1}
                            value={data.employee_count}
                            onChange={(e) =>
                                setData('employee_count', Math.max(1, Number(e.target.value)))
                            }
                        />
                        <InputError message={errors.employee_count} />
                        <p className="text-xs text-muted-foreground">
                            Total: {fmt.format(data.employee_count * price)} / bulan
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Memproses…' : `Buat Invoice Paket ${planLabel}`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Upload Proof Dialog ───────────────────────────────────────────────────────

function UploadProofDialog({
    open,
    invoiceId,
    onClose,
}: {
    open: boolean;
    invoiceId: number | null;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        proof: File | null;
    }>({ proof: null });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!invoiceId) return;
        post(`/billing/invoices/${invoiceId}/proof`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
                    <DialogDescription>
                        Upload foto/scan bukti transfer untuk invoice ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="proof_file">File Bukti Bayar</Label>
                        <Input
                            id="proof_file"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setData('proof', e.target.files?.[0] ?? null)}
                        />
                        <InputError message={errors.proof} />
                        <p className="text-xs text-muted-foreground">Format: JPG, PNG, PDF. Maks 5 MB.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.proof}>
                            <Upload className="mr-2 size-4" />
                            {processing ? 'Mengunggah…' : 'Upload'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Plan Features ─────────────────────────────────────────────────────────────

const coreFeaturesIncluded = [
    'Manajemen Karyawan',
    'Kehadiran & Absensi',
    'Jadwal Kerja',
    'Cuti & Izin',
    'Lembur',
    'Notifikasi',
    'Survey',
    'Struktur Organisasi',
];

const coreFeatureLocked = ['Rekrutmen', 'Penggajian', 'Kasbon', 'Asset Management'];
const plusFeatures = [...coreFeaturesIncluded, ...coreFeatureLocked];

// ── Plan Card ─────────────────────────────────────────────────────────────────

type PlanCardProps = {
    title: string;
    priceLabel: string;
    priceDetail?: string;
    estimatedTotal?: string;
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    features: string[];
    lockedFeatures?: string[];
    isActive: boolean;
    onSelect?: () => void;
    highlight?: boolean;
};

function PlanCard({
    title, priceLabel, priceDetail, estimatedTotal,
    badge, badgeVariant = 'secondary',
    features, lockedFeatures,
    isActive, onSelect, highlight,
}: PlanCardProps) {
    return (
        <Card className={`flex flex-col ${highlight ? 'border-primary shadow-md' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {badge && (
                        <Badge variant={badgeVariant} className="shrink-0 text-xs">{badge}</Badge>
                    )}
                </div>
                <div>
                    <span className="text-3xl font-bold">{priceLabel}</span>
                    {priceDetail && (
                        <span className="ml-1 text-sm text-muted-foreground">{priceDetail}</span>
                    )}
                </div>
                {estimatedTotal && (
                    <CardDescription>
                        Estimasi: <strong>{estimatedTotal}</strong>/bulan
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-1 space-y-1.5">
                {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                        <span>{f}</span>
                    </div>
                ))}
                {lockedFeatures?.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="size-4 shrink-0" />
                        <span>{f}</span>
                    </div>
                ))}
            </CardContent>

            <CardFooter>
                {isActive ? (
                    <Button className="w-full" disabled variant="outline">Paket Aktif</Button>
                ) : onSelect ? (
                    <Button
                        className="w-full"
                        variant={highlight ? 'default' : 'outline'}
                        onClick={onSelect}
                    >
                        Pilih Paket {title}
                    </Button>
                ) : null}
            </CardFooter>
        </Card>
    );
}

// ── Invoice Table ─────────────────────────────────────────────────────────────

function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
    const [uploadInvoiceId, setUploadInvoiceId] = useState<number | null>(null);
    const { delete: destroy, processing: cancelling } = useForm({});

    const handleCancel = (id: number) => {
        if (!confirm('Batalkan invoice ini?')) return;
        destroy(`/billing/invoices/${id}`, { preserveScroll: true });
    };

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center text-muted-foreground">
                <Receipt className="mb-3 size-8 opacity-40" />
                <p className="text-sm">Belum ada riwayat invoice.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No. Invoice</TableHead>
                            <TableHead>Paket</TableHead>
                            <TableHead className="text-right">Karyawan</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((inv) => {
                            const sc = statusConfig[inv.status];
                            return (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                                    <TableCell>{planLabels[inv.plan_slug] ?? inv.plan_slug}</TableCell>
                                    <TableCell className="text-right">{inv.employee_count}</TableCell>
                                    <TableCell className="text-right font-medium">{fmt.format(inv.amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={sc.variant}>{sc.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(inv.issued_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {inv.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setUploadInvoiceId(inv.id)}>
                                                    <Upload className="mr-1 size-3" />
                                                    Upload Bukti
                                                </Button>
                                                <Button size="sm" variant="destructive" disabled={cancelling} onClick={() => handleCancel(inv.id)}>
                                                    <X className="mr-1 size-3" />
                                                    Batalkan
                                                </Button>
                                            </div>
                                        )}
                                        {inv.status === 'paid' && inv.proof_url && (
                                            <Button size="sm" variant="ghost" asChild>
                                                <a href={inv.proof_url} target="_blank" rel="noopener noreferrer">
                                                    Lihat Bukti
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <UploadProofDialog
                open={uploadInvoiceId !== null}
                invoiceId={uploadInvoiceId}
                onClose={() => setUploadInvoiceId(null)}
            />
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BillingPage() {
    const { subscription, invoices } = usePage<PageProps>().props;
    const [upgradeDialog, setUpgradeDialog] = useState<'core' | 'plus' | null>(null);

    const employeeCount = subscription?.employee_count ?? 1;
    const currentPlan = subscription?.plan_slug ?? 'free';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Langganan" />

            <div className="space-y-6 p-4">
                {subscription && <SubscriptionBanner sub={subscription} />}

                <section>
                    <h2 className="mb-3 text-base font-semibold">Paket Langganan</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <PlanCard
                            title="Free"
                            priceLabel="Gratis"
                            badge="GRATIS"
                            badgeVariant="secondary"
                            features={[
                                'Manajemen Karyawan', 'Kehadiran & Absensi', 'Jadwal Kerja',
                                'Cuti & Izin', 'Lembur', 'Notifikasi', 'Survey',
                                'Struktur Organisasi', 'Maks. 10 karyawan', 'Maks. 2 bulan',
                            ]}
                            lockedFeatures={['Rekrutmen', 'Penggajian', 'Kasbon', 'Asset Management']}
                            isActive={currentPlan === 'free'}
                        />

                        <PlanCard
                            title="Core"
                            priceLabel={fmt.format(PRICE_CORE)}
                            priceDetail="/ karyawan / bulan"
                            estimatedTotal={fmt.format(employeeCount * PRICE_CORE)}
                            features={coreFeaturesIncluded}
                            lockedFeatures={coreFeatureLocked}
                            isActive={currentPlan === 'core' && subscription?.status === 'active'}
                            onSelect={() => setUpgradeDialog('core')}
                        />

                        <PlanCard
                            title="Plus"
                            priceLabel={fmt.format(PRICE_PLUS)}
                            priceDetail="/ karyawan / bulan"
                            estimatedTotal={fmt.format(employeeCount * PRICE_PLUS)}
                            badge="REKOMENDASI"
                            badgeVariant="default"
                            features={plusFeatures}
                            isActive={currentPlan === 'plus' && subscription?.status === 'active'}
                            onSelect={() => setUpgradeDialog('plus')}
                            highlight
                        />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        <Sparkles className="mr-1 inline size-3" />
                        Harga belum termasuk PPN. Pembayaran via transfer bank. Invoice dibuat setelah konfirmasi.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-base font-semibold">Riwayat Invoice</h2>
                    <InvoiceTable invoices={invoices ?? []} />
                </section>
            </div>

            {(upgradeDialog === 'core' || upgradeDialog === 'plus') && (
                <UpgradeDialog
                    open={upgradeDialog !== null}
                    onClose={() => setUpgradeDialog(null)}
                    planSlug={upgradeDialog}
                    defaultEmployees={employeeCount}
                />
            )}
        </AppLayout>
    );
}
