import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Calculator,
    AlertTriangle,
    CheckCircle2,
    Coins,
    Download,
    Filter,
    Pencil,
    Plus,
    Send,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { LockedFeatureBanner } from '@/components/locked-feature-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { formatDeviceDateTime } from '@/lib/utils';
import {
    generate as generatePayroll,
    index as payrollsIndex,
    save as savePayroll,
    sendPayslips,
} from '@/routes/hris/payrolls';
import type { BreadcrumbItem } from '@/types';

type PayrollRun = {
    id: number;
    period: string;
    period_start: string;
    period_end: string;
    generated_at: string | null;
    is_saved: boolean;
    saved_at: string | null;
    employees_count: number;
    total_base_salary: string;
    total_allowances: string;
    total_deductions: string;
    total_net_salary: string;
    unfiltered_employees_count?: number;
    unfiltered_total_net_salary?: string;
    type: string;
    thr_reference_date?: string | null;
};

type PayrollItem = {
    id: number;
    employee_id: number;
    employee_label: string;
    sub_company_label: string;
    can_send_payslip: boolean;
    base_salary: string;
    allowances_total: string;
    is_prorated: boolean;
    proration_working_days: number | null;
    proration_payable_days: number | null;
    proration_factor: string | number;
    pph21_method: string | null;
    pph21_rate: string | number;
    pph21_allowance: string | number;
    pph21_deduction: string | number;
    pph21_company_borne: string | number;
    kasbon_deduction: string;
    denda_deduction: string;
    unpaid_leave_deduction: string;
    deductions_total: string;
    net_salary: string;
    allowance_breakdown: Record<string, number>;
    variable_allowance_breakdown: Record<string, number>;
    bonus_breakdown: Record<string, number>;
    overtime_hours: string | number;
    overtime_pay: string | number;
    thr_months_of_service?: number | null;
    thr_amount?: string | number;
};

type CompensationRow = { name: string; amount: string };

type PageProps = {
    period: string;
    run: PayrollRun | null;
    items: PayrollItem[];
    type: string;
    sub_company_id: string;
    employeeOptions: Array<{
        id: number;
        label: string;
        sub_company_label: string;
    }>;
    subCompanies: Array<{ id: number; label: string }>;
    payrollReadiness: {
        period: string;
        status: 'ready' | 'warning' | 'error';
        warning_count: number;
        error_count: number;
        checks: Array<{
            key: string;
            label: string;
            complete: boolean;
            severity: 'warning' | 'error';
            description: string;
        }>;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll',
        href: payrollsIndex(),
    },
];

const formatCurrency = (value: null | number | string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
};

const formNumber = (value: null | number | string | undefined) =>
    value == null ? '' : String(Math.round(Number(value)));

const parseEmployeeLabel = (label: string) => {
    const [code, ...nameParts] = label.split(' - ');
    return {
        code: code ?? '-',
        name: nameParts.join(' - ') || label,
    };
};

const pph21Label = (method: string | null) => {
    if (method === 'ter_harian') {
        return 'TER Harian';
    }

    if (method === 'gross') {
        return 'Gross';
    }

    if (method === 'net') {
        return 'Net';
    }

    if (method === 'gross_up') {
        return 'Gross Up';
    }

    return '-';
};

export default function PayrollPage() {
    const {
        period,
        run,
        items,
        type,
        sub_company_id,
        employeeOptions,
        subCompanies,
        payrollReadiness,
    } = usePage<PageProps>().props;
    const { subscription } = usePage().props;
    const isLocked =
        subscription?.locked_features?.includes('payroll') ?? false;

    const [periodState, setPeriodState] = useState(period);
    const [subCompanyState, setSubCompanyState] = useState(
        sub_company_id || '__all',
    );
    const [sendingPayslips, setSendingPayslips] = useState(false);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [sendingPayslipItemIds, setSendingPayslipItemIds] = useState<
        number[]
    >([]);
    const generateForm = useForm({
        period,
        employee_scope: 'all',
        excluded_employee_ids: [] as number[],
    });
    const [editingItem, setEditingItem] = useState<PayrollItem | null>(null);
    const editItemForm = useForm({
        base_salary: '',
        allowances_total: '',
        variable_allowances: [] as CompensationRow[],
        bonuses: [] as CompensationRow[],
        overtime_hours: '',
        overtime_pay: '',
        pph21_rate: '',
        pph21_allowance: '',
        pph21_deduction: '',
        pph21_company_borne: '',
        kasbon_deduction: '',
        denda_deduction: '',
    });
    const thrForm = useForm({ reference_date: '' });

    const totals = useMemo(() => {
        const overtime = items.reduce(
            (sum, item) => sum + Number(item.overtime_pay ?? 0),
            0,
        );
        const thr = items.reduce(
            (sum, item) => sum + Number(item.thr_amount ?? 0),
            0,
        );

        if (run) {
            return {
                employees: run.employees_count,
                gross:
                    Number(run.total_base_salary ?? 0) +
                    Number(run.total_allowances ?? 0),
                deductions: Number(run.total_deductions ?? 0),
                net: Number(run.total_net_salary ?? 0),
                overtime,
                thr,
            };
        }

        const gross = items.reduce(
            (sum, item) =>
                sum +
                Number(item.base_salary ?? 0) +
                Number(item.allowances_total ?? 0),
            0,
        );
        const deductions = items.reduce(
            (sum, item) => sum + Number(item.deductions_total ?? 0),
            0,
        );
        const net = items.reduce(
            (sum, item) => sum + Number(item.net_salary ?? 0),
            0,
        );

        return {
            employees: items.length,
            gross,
            deductions,
            net,
            overtime,
            thr,
        };
    }, [items, run]);

    const applyPeriodFilter = () => {
        router.get(
            payrollsIndex.url(),
            {
                period: periodState,
                type,
                sub_company_id:
                    subCompanyState === '__all' ? undefined : subCompanyState,
            },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleGenerate = () => {
        generateForm.setData('period', periodState);
        generateForm.post(generatePayroll.url(), {
            preserveScroll: true,
            onSuccess: () => setGenerateDialogOpen(false),
        });
    };

    const toggleExcludedEmployee = (employeeId: number, checked: boolean) => {
        const nextIds = checked
            ? [...generateForm.data.excluded_employee_ids, employeeId]
            : generateForm.data.excluded_employee_ids.filter(
                  (id) => id !== employeeId,
              );

        generateForm.setData('excluded_employee_ids', [...new Set(nextIds)]);
    };

    const handleGenerateTHR = () => {
        thrForm.post('/hris/payrolls/thr/generate', {
            preserveScroll: true,
            onSuccess: () => setGenerateDialogOpen(false),
        });
    };

    const startEditItem = (item: PayrollItem) => {
        setEditingItem(item);
        editItemForm.setData({
            base_salary: formNumber(item.base_salary),
            allowances_total: formNumber(item.allowances_total),
            variable_allowances: Object.entries(
                item.variable_allowance_breakdown ?? {},
            ).map(([name, amount]) => ({
                name,
                amount: formNumber(amount),
            })),
            bonuses: Object.entries(item.bonus_breakdown ?? {}).map(
                ([name, amount]) => ({
                    name,
                    amount: formNumber(amount),
                }),
            ),
            overtime_hours: String(Number(item.overtime_hours ?? 0)),
            overtime_pay: formNumber(item.overtime_pay),
            pph21_rate: formNumber(item.pph21_rate),
            pph21_allowance: formNumber(item.pph21_allowance),
            pph21_deduction: formNumber(item.pph21_deduction),
            pph21_company_borne: formNumber(item.pph21_company_borne),
            kasbon_deduction: formNumber(item.kasbon_deduction),
            denda_deduction: formNumber(item.denda_deduction),
        });
    };

    const closeEditItem = () => {
        setEditingItem(null);
        editItemForm.clearErrors();
        editItemForm.reset();
    };

    const submitEditItem = () => {
        if (!run || !editingItem) {
            return;
        }

        editItemForm.put(`/hris/payrolls/${run.id}/items/${editingItem.id}`, {
            preserveScroll: true,
            onSuccess: closeEditItem,
        });
    };

    const handleSave = () => {
        if (!run) {
            return;
        }

        router.post(
            savePayroll.url(run.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleSendPayslips = () => {
        if (!run) {
            return;
        }

        setSendingPayslips(true);

        router.post(
            sendPayslips.url(run.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setSendingPayslips(false),
            },
        );
    };

    const handleSendPayslip = (item: PayrollItem) => {
        if (!run) {
            return;
        }

        setSendingPayslipItemIds((current) => [...current, item.id]);

        router.post(
            `/hris/payrolls/${run.id}/items/${item.id}/send-payslip`,
            {},
            {
                preserveScroll: true,
                onFinish: () =>
                    setSendingPayslipItemIds((current) =>
                        current.filter((id) => id !== item.id),
                    ),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll" />

            {isLocked && (
                <LockedFeatureBanner
                    featureName="Penggajian"
                    planRequired="core"
                />
            )}

            <div className="space-y-4 p-4">
                {isLocked && (
                    <LockedFeatureBanner
                        featureName="Penggajian"
                        planRequired="core"
                    />
                )}

                <div className="flex gap-2">
                    <Button
                        variant={type === 'regular' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                            router.get(
                                payrollsIndex.url(),
                                {
                                    period,
                                    type: 'regular',
                                    sub_company_id:
                                        subCompanyState === '__all'
                                            ? undefined
                                            : subCompanyState,
                                },
                                { replace: true, preserveScroll: true },
                            )
                        }
                    >
                        Payroll Reguler
                    </Button>
                    <Button
                        variant={type === 'thr' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                            router.get(
                                payrollsIndex.url(),
                                {
                                    period,
                                    type: 'thr',
                                    sub_company_id:
                                        subCompanyState === '__all'
                                            ? undefined
                                            : subCompanyState,
                                },
                                { replace: true, preserveScroll: true },
                            )
                        }
                    >
                        THR
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <CardTitle>
                                    {type === 'thr'
                                        ? 'Generate THR'
                                        : 'Generate Payroll'}
                                </CardTitle>
                                <CardDescription>
                                    Periode {periodState || '-'} ·{' '}
                                    {subCompanyState === '__all'
                                        ? 'Semua karyawan'
                                        : (subCompanies.find(
                                              (company) =>
                                                  String(company.id) ===
                                                  subCompanyState,
                                          )?.label ?? 'Sub-company')}
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setGenerateDialogOpen(true)}
                                disabled={isLocked}
                            >
                                <Calculator className="size-4" />
                                {type === 'thr'
                                    ? 'Buka Generate THR'
                                    : 'Buka Generate Payroll'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                            {type === 'regular' ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleSave}
                                        disabled={!run || run.is_saved}
                                        className="whitespace-nowrap"
                                    >
                                        <Sparkles className="size-4" />
                                        {run?.is_saved
                                            ? 'Payroll Tersimpan'
                                            : 'Simpan Payroll'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSendPayslips}
                                        disabled={
                                            !run ||
                                            !run.is_saved ||
                                            items.length === 0 ||
                                            sendingPayslips
                                        }
                                        className="whitespace-nowrap"
                                    >
                                        <Send className="size-4" />
                                        {sendingPayslips
                                            ? 'Masuk queue...'
                                            : 'Kirim Payslip WA'}
                                    </Button>
                                    {run && run.is_saved && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={`/hris/payrolls/${run.id}/export/mandiri${subCompanyState !== '__all' ? `?sub_company_id=${subCompanyState}` : ''}`}
                                                >
                                                    <Download className="mr-1.5 size-3.5" />
                                                    Export Mandiri
                                                </a>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={`/hris/payrolls/${run.id}/export/bca${subCompanyState !== '__all' ? `?sub_company_id=${subCompanyState}` : ''}`}
                                                >
                                                    <Download className="mr-1.5 size-3.5" />
                                                    Export BCA
                                                </a>
                                            </Button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleSave}
                                    disabled={!run || run.is_saved}
                                    className="whitespace-nowrap"
                                >
                                    <Sparkles className="size-4" />
                                    {run?.is_saved
                                        ? 'THR Tersimpan'
                                        : 'Simpan THR'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {type === 'regular' && run && !run.is_saved && (
                    <Card
                        className={
                            payrollReadiness.status === 'ready'
                                ? 'border-emerald-200 bg-emerald-50/60'
                                : payrollReadiness.status === 'error'
                                  ? 'border-red-200 bg-red-50/60'
                                  : 'border-amber-200 bg-amber-50/60'
                        }
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                {payrollReadiness.status === 'ready' ? (
                                    <CheckCircle2 className="size-4 text-emerald-700" />
                                ) : (
                                    <AlertTriangle className="size-4 text-amber-700" />
                                )}
                                Checklist sebelum payroll disimpan
                            </CardTitle>
                            <CardDescription>
                                {payrollReadiness.warning_count === 0 &&
                                payrollReadiness.error_count === 0
                                    ? 'Payroll siap disimpan.'
                                    : `${payrollReadiness.warning_count} warning dan ${payrollReadiness.error_count} error ditemukan. Warning tidak memblokir penyimpanan.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 md:grid-cols-2">
                                {payrollReadiness.checks.map((check) => (
                                    <div
                                        key={check.key}
                                        className="flex items-start gap-2 rounded-md border border-white/70 bg-white/70 px-3 py-2"
                                    >
                                        {check.complete ? (
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                                        ) : (
                                            <AlertTriangle
                                                className={`mt-0.5 size-4 shrink-0 ${
                                                    check.severity === 'error'
                                                        ? 'text-red-700'
                                                        : 'text-amber-700'
                                                }`}
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-950">
                                                {check.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {check.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {type === 'thr' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>
                                    Total Karyawan THR
                                </CardDescription>
                                <CardTitle className="text-2xl">
                                    {totals.employees}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>Total THR</CardDescription>
                                <CardTitle className="text-2xl">
                                    {formatCurrency(totals.thr)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>
                                    Jumlah Karyawan
                                </CardDescription>
                                <CardTitle className="text-2xl">
                                    {totals.employees}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>Total Bruto</CardDescription>
                                <CardTitle className="text-2xl">
                                    {formatCurrency(totals.gross)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>Total Lembur</CardDescription>
                                <CardTitle className="text-2xl">
                                    {formatCurrency(totals.overtime)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>
                                    Total Potongan
                                </CardDescription>
                                <CardTitle className="text-2xl">
                                    {formatCurrency(totals.deductions)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="gap-2 py-3">
                            <CardHeader className="px-4 pb-0">
                                <CardDescription>
                                    Total Take Home Pay
                                </CardDescription>
                                <CardTitle className="text-2xl">
                                    {formatCurrency(totals.net)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {type === 'thr'
                                ? `Preview THR ${periodState}`
                                : `Preview Payroll ${periodState}`}
                        </CardTitle>
                        <CardDescription>
                            {run?.generated_at
                                ? run.is_saved
                                    ? `Generated ${formatDeviceDateTime(run.generated_at)} • Disimpan ${formatDeviceDateTime(run.saved_at)}`
                                    : `Generated pada ${formatDeviceDateTime(run.generated_at)} • Belum disimpan`
                                : type === 'thr'
                                  ? 'Belum ada data THR untuk periode ini. Klik "Generate THR".'
                                  : 'Belum ada data payroll untuk periode ini. Klik "Generate Payroll".'}
                        </CardDescription>
                        {run &&
                            subCompanyState !== '__all' &&
                            run.unfiltered_employees_count != null && (
                                <CardDescription>
                                    Filter sub-company aktif: {totals.employees}{' '}
                                    dari {run.unfiltered_employees_count}{' '}
                                    karyawan payroll. Total seluruh payroll:{' '}
                                    {formatCurrency(
                                        run.unfiltered_total_net_salary ?? 0,
                                    )}
                                </CardDescription>
                            )}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            {type === 'thr' ? (
                                <table className="w-full min-w-[700px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="sticky left-0 z-20 bg-background px-3 py-2">
                                                Karyawan
                                            </th>
                                            <th className="px-3 py-2">
                                                Gaji Pokok
                                            </th>
                                            <th className="px-3 py-2">
                                                Masa Kerja
                                            </th>
                                            <th className="px-3 py-2">THR</th>
                                            <th className="px-3 py-2 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-3 py-8 text-center text-muted-foreground"
                                                >
                                                    Belum ada data THR di
                                                    periode ini.
                                                </td>
                                            </tr>
                                        )}
                                        {items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b align-top"
                                            >
                                                <td className="sticky left-0 z-10 bg-background px-3 py-3 font-medium">
                                                    <div className="leading-tight">
                                                        <p className="text-sm font-medium">
                                                            {
                                                                parseEmployeeLabel(
                                                                    item.employee_label,
                                                                ).name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                parseEmployeeLabel(
                                                                    item.employee_label,
                                                                ).code
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                item.sub_company_label
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatCurrency(
                                                        item.base_salary,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {item.thr_months_of_service !=
                                                    null
                                                        ? `${item.thr_months_of_service} bulan`
                                                        : '-'}
                                                </td>
                                                <td className="px-3 py-3 font-semibold">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Sparkles className="size-4 text-emerald-600" />
                                                        {formatCurrency(
                                                            item.thr_amount ??
                                                                null,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <span className="text-xs text-muted-foreground">
                                                        -
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full min-w-[1420px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="sticky left-0 z-20 bg-background px-3 py-2">
                                                Karyawan
                                            </th>
                                            <th className="px-3 py-2">
                                                Gaji Pokok
                                            </th>
                                            <th className="px-3 py-2">
                                                Tunjangan
                                            </th>
                                            <th className="px-3 py-2">
                                                Lembur
                                            </th>
                                            <th className="px-3 py-2">PPh21</th>
                                            <th className="px-3 py-2">
                                                Kasbon
                                            </th>
                                            <th className="px-3 py-2">Denda</th>
                                            <th className="px-3 py-2">Cuti Tanpa Gaji</th>
                                            <th className="px-3 py-2">
                                                Total Potongan
                                            </th>
                                            <th className="px-3 py-2">
                                                Take Home Pay
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={10}
                                                    className="px-3 py-8 text-center text-muted-foreground"
                                                >
                                                    Belum ada data payroll di
                                                    periode ini.
                                                </td>
                                            </tr>
                                        )}
                                        {items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b align-top"
                                            >
                                                <td className="sticky left-0 z-10 bg-background px-3 py-3 font-medium">
                                                    <div className="leading-tight">
                                                        <p className="text-sm font-medium">
                                                            {
                                                                parseEmployeeLabel(
                                                                    item.employee_label,
                                                                ).name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                parseEmployeeLabel(
                                                                    item.employee_label,
                                                                ).code
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                item.sub_company_label
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <p>
                                                        {formatCurrency(
                                                            item.base_salary,
                                                        )}
                                                    </p>
                                                    {item.is_prorated && (
                                                        <Badge
                                                            variant="outline"
                                                            className="mt-1"
                                                        >
                                                            Prorata{' '}
                                                            {
                                                                item.proration_payable_days
                                                            }
                                                            /
                                                            {
                                                                item.proration_working_days
                                                            }{' '}
                                                            hari
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <p className="font-medium">
                                                        {formatCurrency(
                                                            item.allowances_total,
                                                        )}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {Object.keys(
                                                            item.allowance_breakdown ??
                                                                {},
                                                        ).length === 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Tanpa tunjangan
                                                            </span>
                                                        )}
                                                        {Object.entries(
                                                            item.allowance_breakdown ??
                                                                {},
                                                        ).map(
                                                            ([
                                                                name,
                                                                amount,
                                                            ]) => (
                                                                <Badge
                                                                    key={`${item.id}-${name}`}
                                                                    variant="secondary"
                                                                    className="text-[11px]"
                                                                >
                                                                    <Coins className="size-3" />
                                                                    {name}:{' '}
                                                                    {formatCurrency(
                                                                        amount,
                                                                    )}
                                                                </Badge>
                                                            ),
                                                        )}
                                                        {Object.entries(
                                                            item.variable_allowance_breakdown ??
                                                                {},
                                                        ).map(
                                                            ([
                                                                name,
                                                                amount,
                                                            ]) => (
                                                                <Badge
                                                                    key={`${item.id}-variable-${name}`}
                                                                    variant="secondary"
                                                                    className="font-normal"
                                                                >
                                                                    Tidak tetap:{' '}
                                                                    {name}{' '}
                                                                    {formatCurrency(
                                                                        amount,
                                                                    )}
                                                                </Badge>
                                                            ),
                                                        )}
                                                        {Object.entries(
                                                            item.bonus_breakdown ??
                                                                {},
                                                        ).map(
                                                            ([
                                                                name,
                                                                amount,
                                                            ]) => (
                                                                <Badge
                                                                    key={`${item.id}-bonus-${name}`}
                                                                    variant="outline"
                                                                    className="font-normal"
                                                                >
                                                                    Bonus:{' '}
                                                                    {name}{' '}
                                                                    {formatCurrency(
                                                                        amount,
                                                                    )}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {Number(
                                                        item.overtime_pay ?? 0,
                                                    ) > 0 ? (
                                                        formatCurrency(
                                                            item.overtime_pay,
                                                        )
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="space-y-1">
                                                        <p className="font-medium">
                                                            {pph21Label(
                                                                item.pph21_method,
                                                            )}{' '}
                                                            · Nominal{' '}
                                                            {formatCurrency(
                                                                item.pph21_rate ??
                                                                    0,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Potongan:{' '}
                                                            {formatCurrency(
                                                                item.pph21_deduction,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Tunjangan:{' '}
                                                            {formatCurrency(
                                                                item.pph21_allowance,
                                                            )}
                                                        </p>
                                                        {Number(
                                                            item.pph21_company_borne ??
                                                                0,
                                                        ) > 0 ? (
                                                            <p className="text-xs text-muted-foreground">
                                                                Ditanggung
                                                                perusahaan:{' '}
                                                                {formatCurrency(
                                                                    item.pph21_company_borne,
                                                                )}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatCurrency(
                                                        item.kasbon_deduction,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatCurrency(
                                                        item.denda_deduction,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatCurrency(item.unpaid_leave_deduction)}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatCurrency(
                                                        item.deductions_total,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 font-semibold">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Sparkles className="size-4 text-emerald-600" />
                                                        {formatCurrency(
                                                            item.net_salary,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                startEditItem(
                                                                    item,
                                                                )
                                                            }
                                                            disabled={
                                                                run?.is_saved
                                                            }
                                                            className="whitespace-nowrap"
                                                        >
                                                            <Pencil className="size-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleSendPayslip(
                                                                    item,
                                                                )
                                                            }
                                                            disabled={
                                                                !run?.is_saved ||
                                                                !item.can_send_payslip ||
                                                                sendingPayslipItemIds.includes(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="whitespace-nowrap"
                                                        >
                                                            <Send className="size-4" />
                                                            {sendingPayslipItemIds.includes(
                                                                item.id,
                                                            )
                                                                ? 'Queue...'
                                                                : 'Kirim WA'}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={generateDialogOpen}
                onOpenChange={setGenerateDialogOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {type === 'thr'
                                ? 'Generate THR'
                                : 'Generate Payroll'}
                        </DialogTitle>
                        <DialogDescription>
                            {type === 'thr'
                                ? 'Generate Tunjangan Hari Raya berdasarkan tanggal referensi masa kerja.'
                                : 'Pilih periode payroll, lalu sistem akan auto-generate dari gaji pokok, tunjangan aktif, potongan kasbon, dan denda.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="period">Periode</Label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="period"
                                    type="month"
                                    value={periodState}
                                    onChange={(event) =>
                                        setPeriodState(event.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Sub-company</Label>
                            <Select
                                value={subCompanyState}
                                onValueChange={setSubCompanyState}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all">
                                        Semua karyawan
                                    </SelectItem>
                                    {subCompanies.map((company) => (
                                        <SelectItem
                                            key={company.id}
                                            value={String(company.id)}
                                        >
                                            {company.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {type === 'thr' ? (
                            <div className="grid gap-2">
                                <Label htmlFor="reference_date">
                                    Tanggal Referensi THR
                                </Label>
                                <Input
                                    id="reference_date"
                                    type="date"
                                    value={thrForm.data.reference_date}
                                    onChange={(event) =>
                                        thrForm.setData(
                                            'reference_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tanggal ini digunakan menghitung masa kerja
                                    karyawan.
                                </p>
                            </div>
                        ) : null}

                        {type === 'regular' ? (
                            <div className="grid gap-2">
                                <Label>Cakupan Generate</Label>
                                <Select
                                    value={generateForm.data.employee_scope}
                                    onValueChange={(value) =>
                                        generateForm.setData(
                                            'employee_scope',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua karyawan
                                        </SelectItem>
                                        <SelectItem value="parent_only">
                                            Perusahaan parent saja
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Pilihan parent saja hanya membuat payroll
                                    untuk karyawan internal, tanpa karyawan yang
                                    berada di sub-company.
                                </p>
                            </div>
                        ) : null}

                        {type === 'regular' ? (
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Karyawan Dikecualikan</Label>
                                    {generateForm.data.excluded_employee_ids
                                        .length > 0 ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                generateForm.setData(
                                                    'excluded_employee_ids',
                                                    [],
                                                )
                                            }
                                        >
                                            Reset
                                        </Button>
                                    ) : null}
                                </div>
                                <div className="max-h-56 overflow-y-auto rounded-md border">
                                    {employeeOptions.length === 0 ? (
                                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                            Belum ada karyawan aktif.
                                        </p>
                                    ) : (
                                        employeeOptions.map((employee) => {
                                            const checked =
                                                generateForm.data.excluded_employee_ids.includes(
                                                    employee.id,
                                                );

                                            return (
                                                <label
                                                    key={employee.id}
                                                    className="flex cursor-pointer items-start gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/50"
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={(
                                                            value,
                                                        ) =>
                                                            toggleExcludedEmployee(
                                                                employee.id,
                                                                value === true,
                                                            )
                                                        }
                                                    />
                                                    <span>
                                                        <span className="block font-medium">
                                                            {employee.label}
                                                        </span>
                                                        <span className="block text-xs text-muted-foreground">
                                                            {
                                                                employee.sub_company_label
                                                            }
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Centang karyawan yang tidak ingin diikutkan
                                    pada payroll periode ini.
                                </p>
                            </div>
                        ) : null}

                        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={applyPeriodFilter}
                            >
                                <Filter className="size-4" />
                                Lihat Preview
                            </Button>
                            <Button
                                type="button"
                                onClick={
                                    type === 'thr'
                                        ? handleGenerateTHR
                                        : handleGenerate
                                }
                                disabled={
                                    type === 'thr'
                                        ? thrForm.processing ||
                                          !thrForm.data.reference_date
                                        : generateForm.processing ||
                                          periodState === ''
                                }
                            >
                                <Calculator className="size-4" />
                                {type === 'thr'
                                    ? thrForm.processing
                                        ? 'Memproses...'
                                        : 'Generate THR'
                                    : generateForm.processing
                                      ? 'Memproses...'
                                      : 'Generate Payroll'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editingItem !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEditItem();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Item Payroll</DialogTitle>
                        <DialogDescription>
                            Ubah nominal payroll karyawan sebelum payroll
                            disimpan. Total potongan dan take home pay dihitung
                            ulang otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    {editingItem ? (
                        <div className="grid gap-4">
                            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                                <p className="font-medium">
                                    {editingItem.employee_label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {editingItem.sub_company_label}
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <PayrollEditField
                                    id="edit_base_salary"
                                    label="Gaji Pokok"
                                    value={editItemForm.data.base_salary}
                                    error={editItemForm.errors.base_salary}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'base_salary',
                                            value,
                                        )
                                    }
                                />
                                <div className="grid gap-1">
                                    <Label>Tunjangan Tetap</Label>
                                    <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">
                                        {formatCurrency(
                                            Object.values(
                                                editingItem.allowance_breakdown ??
                                                    {},
                                            ).reduce(
                                                (sum, amount) => sum + amount,
                                                0,
                                            ),
                                        )}
                                    </div>
                                </div>
                                <PayrollEditField
                                    id="edit_overtime_hours"
                                    label="Jam Lembur"
                                    currency={false}
                                    value={editItemForm.data.overtime_hours}
                                    error={editItemForm.errors.overtime_hours}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'overtime_hours',
                                            value,
                                        )
                                    }
                                />
                                <PayrollEditField
                                    id="edit_overtime_pay"
                                    label="Upah Lembur"
                                    value={editItemForm.data.overtime_pay}
                                    error={editItemForm.errors.overtime_pay}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'overtime_pay',
                                            value,
                                        )
                                    }
                                />
                                <PayrollEditField
                                    id="edit_pph21_rate"
                                    label="Nominal PPh21"
                                    value={editItemForm.data.pph21_rate}
                                    error={editItemForm.errors.pph21_rate}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'pph21_rate',
                                            value,
                                        )
                                    }
                                />
                                <PayrollEditField
                                    id="edit_pph21_allowance"
                                    label="Tunjangan PPh21"
                                    value={editItemForm.data.pph21_allowance}
                                    error={editItemForm.errors.pph21_allowance}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'pph21_allowance',
                                            value,
                                        )
                                    }
                                />
                                <PayrollEditField
                                    id="edit_pph21_deduction"
                                    label="Potongan PPh21"
                                    value={editItemForm.data.pph21_deduction}
                                    error={editItemForm.errors.pph21_deduction}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'pph21_deduction',
                                            value,
                                        )
                                    }
                                />
                                <PayrollEditField
                                    id="edit_pph21_company_borne"
                                    label="PPh21 Ditanggung Perusahaan"
                                    value={
                                        editItemForm.data.pph21_company_borne
                                    }
                                    error={
                                        editItemForm.errors.pph21_company_borne
                                    }
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'pph21_company_borne',
                                            value,
                                        )
                                    }
                                />
                                <PayrollEditField
                                    id="edit_kasbon_deduction"
                                    label="Kasbon"
                                    value={editItemForm.data.kasbon_deduction}
                                    error={editItemForm.errors.kasbon_deduction}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'kasbon_deduction',
                                            value,
                                        )
                                    }
                                />
                                <PayrollEditField
                                    id="edit_denda_deduction"
                                    label="Denda"
                                    value={editItemForm.data.denda_deduction}
                                    error={editItemForm.errors.denda_deduction}
                                    onChange={(value) =>
                                        editItemForm.setData(
                                            'denda_deduction',
                                            value,
                                        )
                                    }
                                />
                            </div>

                            <CompensationRowsEditor
                                title="Tunjangan Tidak Tetap"
                                addLabel="Tambah Tunjangan Tidak Tetap"
                                rows={editItemForm.data.variable_allowances}
                                onChange={(rows) =>
                                    editItemForm.setData(
                                        'variable_allowances',
                                        rows,
                                    )
                                }
                            />

                            <CompensationRowsEditor
                                title="Bonus"
                                addLabel="Tambah Bonus"
                                rows={editItemForm.data.bonuses}
                                onChange={(rows) =>
                                    editItemForm.setData('bonuses', rows)
                                }
                            />

                            <div className="flex justify-end gap-2 border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEditItem}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={submitEditItem}
                                    disabled={editItemForm.processing}
                                >
                                    {editItemForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function CompensationRowsEditor({
    title,
    addLabel,
    rows,
    onChange,
}: {
    title: string;
    addLabel: string;
    rows: CompensationRow[];
    onChange: (rows: CompensationRow[]) => void;
}) {
    return (
        <div className="space-y-2 border-t pt-4">
            <Label>{title}</Label>
            {rows.map((row, index) => (
                <div
                    key={index}
                    className="grid gap-2 sm:grid-cols-[1fr_180px_36px]"
                >
                    <Input
                        aria-label={`${title} ${index + 1}`}
                        value={row.name}
                        placeholder="Nama komponen"
                        onChange={(event) => {
                            const next = [...rows];
                            next[index] = {
                                ...next[index],
                                name: event.target.value,
                            };
                            onChange(next);
                        }}
                    />
                    <Input
                        aria-label={`Nominal ${title} ${index + 1}`}
                        inputMode="numeric"
                        value={formatThousandDigits(row.amount)}
                        placeholder="500.000"
                        onChange={(event) => {
                            const next = [...rows];
                            next[index] = {
                                ...next[index],
                                amount: normalizeDigitInput(event.target.value),
                            };
                            onChange(next);
                        }}
                    />
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title={`Hapus ${title.toLowerCase()}`}
                        onClick={() =>
                            onChange(
                                rows.filter(
                                    (_, rowIndex) => rowIndex !== index,
                                ),
                            )
                        }
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onChange([...rows, { name: '', amount: '' }])}
            >
                <Plus className="size-4" />
                {addLabel}
            </Button>
        </div>
    );
}

function PayrollEditField({
    id,
    label,
    value,
    error,
    onChange,
    currency = true,
}: {
    id: string;
    label: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    currency?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                inputMode={currency ? 'numeric' : 'decimal'}
                value={currency ? formatThousandDigits(value) : value}
                onChange={(event) =>
                    onChange(
                        currency
                            ? normalizeDigitInput(event.target.value)
                            : event.target.value,
                    )
                }
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
    );
}
