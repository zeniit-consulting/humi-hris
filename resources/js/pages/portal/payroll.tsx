import { Download, ReceiptText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    formatCurrency,
    formatDate,
    localMonthString,
    notifyPortal,
    requestApi,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type PortalSummary = {
    links: PortalLinkMap;
    features?: { kasbon?: boolean };
};

type PayrollPayload = {
    period: string;
    run: {
        id: number;
        period_start: string | null;
        period_end: string | null;
        is_saved: boolean;
        generated_at: string | null;
    } | null;
    items: Array<{
        id: number;
        employee_label: string;
        base_salary: string | number;
        allowances_total: string | number;
        pph21_method: string | null;
        pph21_rate: string | number;
        pph21_allowance: string | number;
        pph21_deduction: string | number;
        pph21_company_borne: string | number;
        kasbon_deduction: string | number;
        denda_deduction: string | number;
        unpaid_leave_deduction: string | number;
        deductions_total: string | number;
        net_salary: string | number;
        allowance_breakdown: Record<string, number>;
        variable_allowance_breakdown: Record<string, number>;
        bonus_breakdown: Record<string, number>;
    }>;
};

export default function PortalPayrollPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [payroll, setPayroll] = useState<PayrollPayload | null>(null);
    const [period, setPeriod] = useState(localMonthString());
    const [currentPassword, setCurrentPassword] = useState('');
    const [isLoadingSlip, setIsLoadingSlip] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [hasAttemptedPreview, setHasAttemptedPreview] = useState(false);

    useEffect(() => {
        const loadPortal = async () => {
            try {
                const portalResponse = await requestApi<PortalSummary>(
                    '/portal/api/summary',
                );
                setPortal(portalResponse.data);
            } catch (loadError) {
                notifyPortal(
                    'error',
                    loadError instanceof Error
                        ? translatePortalError(
                              loadError.message,
                              'Halaman payroll tidak bisa dimuat.',
                          )
                        : 'Halaman payroll tidak bisa dimuat.',
                );
            }
        };

        void loadPortal();
    }, []);

    const loadSlip = useCallback(async () => {
        try {
            setIsLoadingSlip(true);
            setHasAttemptedPreview(true);

            const payrollResponse = await requestApi<PayrollPayload>(
                '/portal/api/payrolls/preview-secure',
                'POST',
                {
                    period,
                    current_password: currentPassword,
                },
            );

            setPayroll(payrollResponse.data);
        } catch (loadError) {
            setPayroll(null);
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Slip gaji tidak bisa dimuat.',
                      )
                    : 'Slip gaji tidak bisa dimuat.',
            );
        } finally {
            setIsLoadingSlip(false);
        }
    }, [currentPassword, period]);

    const handleExport = useCallback(async () => {
        try {
            setIsExporting(true);

            const xsrfCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            const response = await fetch('/portal/payroll/export', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/pdf, application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    ...(xsrfCookie
                        ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfCookie) }
                        : {}),
                },
                body: JSON.stringify({
                    period,
                    current_password: currentPassword,
                }),
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type') ?? '';

                if (contentType.includes('application/json')) {
                    const payload = (await response.json()) as {
                        message?: string;
                        errors?: Record<string, string[]>;
                    };

                    throw new Error(
                        payload.errors?.current_password?.[0] ??
                            payload.message ??
                            'Slip gaji tidak bisa diunduh.',
                    );
                }

                throw new Error('Slip gaji tidak bisa diunduh.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const filename =
                response.headers
                    .get('content-disposition')
                    ?.match(/filename="?([^";]+)"?/)?.[1] ??
                `Payslip_${period.replace('-', '')}.pdf`;

            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            notifyPortal('success', 'Slip gaji berhasil diunduh.');
        } catch (exportLoadError) {
            notifyPortal(
                'error',
                exportLoadError instanceof Error
                    ? translatePortalError(
                          exportLoadError.message,
                          'Slip gaji tidak bisa diunduh.',
                      )
                    : 'Slip gaji tidak bisa diunduh.',
            );
        } finally {
            setIsExporting(false);
        }
    }, [currentPassword, period]);

    const slip = payroll?.items[0] ?? null;

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Slip gaji"
            description="Pilih periode dan verifikasi password untuk membuka slip gaji."
            active="payroll"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <ReceiptText className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Akses payroll
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Buka slip gaji
                        </h2>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <input
                        type="month"
                        value={period}
                        onChange={(event) => {
                            setPeriod(event.target.value);
                            setPayroll(null);
                            setHasAttemptedPreview(false);
                        }}
                        className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                    />
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                            setCurrentPassword(event.target.value)
                        }
                        placeholder="Masukkan password akun"
                        className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => void loadSlip()}
                        disabled={
                            isLoadingSlip || currentPassword.trim() === ''
                        }
                        className="portal-primary-bg inline-flex h-12 w-full items-center justify-center rounded-[9px] px-5 text-sm font-semibold disabled:opacity-60"
                    >
                        {isLoadingSlip ? 'Memverifikasi...' : 'Lihat slip gaji'}
                    </button>
                </div>
            </section>

            {slip ? (
                <>
                    <section className="mt-5 rounded-[16px] border border-slate-200 bg-white px-5 py-5 text-slate-900">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                    Gaji bersih
                                </p>
                                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em]">
                                    {formatCurrency(slip.net_salary)}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    {payroll?.run?.period_start
                                        ? `${formatDate(payroll.run.period_start)} - ${formatDate(payroll.run.period_end)}`
                                        : payroll?.period}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => void handleExport()}
                                disabled={isExporting}
                                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 disabled:opacity-60"
                            >
                                <Download className="size-4" />
                                {isExporting ? 'Mengunduh...' : 'Unduh'}
                            </button>
                        </div>
                    </section>

                    <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Pratinjau slip gaji
                        </p>
                        <div className="mt-4 overflow-hidden rounded-[14px] border border-stone-200">
                            <div className="portal-primary-bg px-5 py-5 text-white">
                                <p className="text-xs tracking-[0.22em] text-white/70 uppercase">
                                    Slip gaji resmi
                                </p>
                                <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em]">
                                    {payroll?.period}
                                </h3>
                                <p className="mt-2 text-sm text-white/80">
                                    Draft slip gaji untuk periode terpilih
                                </p>
                            </div>

                            <div className="space-y-5 bg-white px-5 py-5">
                                <div className="grid gap-3 rounded-[12px] bg-stone-50 p-4 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-slate-500">
                                            Karyawan
                                        </span>
                                        <span className="text-right font-semibold text-slate-900">
                                            {slip.employee_label}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-slate-500">
                                            Periode
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {payroll?.run?.period_start
                                                ? `${formatDate(payroll.run.period_start)} - ${formatDate(payroll.run.period_end)}`
                                                : payroll?.period}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-slate-500">
                                            Status
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {payroll?.run?.is_saved
                                                ? 'Final'
                                                : 'Draf'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                        Pendapatan
                                    </p>
                                    <div className="mt-3 space-y-3 text-sm">
                                        <div className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3">
                                            <span>Gaji pokok</span>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    slip.base_salary,
                                                )}
                                            </span>
                                        </div>
                                        {Object.entries(
                                            slip.allowance_breakdown ?? {},
                                        ).map(([name, amount]) => (
                                            <div
                                                key={name}
                                                className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3"
                                            >
                                                <span>{name}</span>
                                                <span className="font-semibold">
                                                    {formatCurrency(amount)}
                                                </span>
                                            </div>
                                        ))}
                                        {Object.entries(
                                            slip.variable_allowance_breakdown ??
                                                {},
                                        ).map(([name, amount]) => (
                                            <div
                                                key={`variable-${name}`}
                                                className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3"
                                            >
                                                <span>
                                                    {name} (Tidak Tetap)
                                                </span>
                                                <span className="font-semibold">
                                                    {formatCurrency(amount)}
                                                </span>
                                            </div>
                                        ))}
                                        {Object.entries(
                                            slip.bonus_breakdown ?? {},
                                        ).map(([name, amount]) => (
                                            <div
                                                key={`bonus-${name}`}
                                                className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3"
                                            >
                                                <span>{name} (Bonus)</span>
                                                <span className="font-semibold">
                                                    {formatCurrency(amount)}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between rounded-[10px] bg-emerald-50 px-4 py-3">
                                            <span>Total tunjangan</span>
                                            <span className="portal-primary-text font-semibold">
                                                {formatCurrency(
                                                    slip.allowances_total,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                                        Potongan
                                    </p>
                                    <div className="mt-3 space-y-3 text-sm">
                                        <div className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3">
                                            <span>PPh21</span>
                                            <span className="font-semibold">
                                                {Number(slip.pph21_rate ?? 0)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3">
                                            <span>Potongan PPh21</span>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    slip.pph21_deduction,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3">
                                            <span>Tunjangan PPh21</span>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    slip.pph21_allowance,
                                                )}
                                            </span>
                                        </div>
                                        {portal?.features?.kasbon !== false && (
                                            <div className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3">
                                                <span>Kasbon</span>
                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        slip.kasbon_deduction,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3">
                                            <span>Denda</span>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    slip.denda_deduction,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-[10px] bg-stone-50 px-4 py-3">
                                            <span>Cuti tanpa gaji</span>
                                            <span className="font-semibold">
                                                {formatCurrency(slip.unpaid_leave_deduction)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-[10px] bg-rose-50 px-4 py-3">
                                            <span>Total potongan</span>
                                            <span className="font-semibold text-rose-900">
                                                {formatCurrency(
                                                    slip.deductions_total,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="portal-primary-bg rounded-[12px] px-4 py-4 text-white">
                                    <p className="text-xs tracking-[0.22em] text-white/70 uppercase">
                                        Gaji diterima
                                    </p>
                                    <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">
                                        {formatCurrency(slip.net_salary)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            ) : hasAttemptedPreview ? (
                <section className="mt-5 rounded-[16px] bg-white px-5 py-8 text-sm text-slate-500 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                    Slip gaji untuk periode ini belum tersedia.
                </section>
            ) : (
                <section className="mt-5 rounded-[16px] bg-white px-5 py-8 text-sm text-slate-500 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                    Pilih periode dan masukkan password terlebih dahulu untuk
                    membuka slip gaji.
                </section>
            )}
        </PortalShell>
    );
}
