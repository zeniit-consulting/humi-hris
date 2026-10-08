import {
    ArrowDownRight,
    ArrowUpRight,
    Receipt,
    ShieldCheck,
    Users,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export type PayrollBurnratePoint = {
    period: string;
    label: string;
    net_salary: number;
    base_salary: number;
    allowances: number;
    deductions: number;
    employees_count: number;
    is_projected?: boolean;
};

export type PayrollBurnrateSummary = {
    current_burnrate: number;
    previous_burnrate: number;
    growth_rate: number;
    avg_per_employee: number;
    trend: PayrollBurnratePoint[];
};

export type InsuranceBurnratePoint = {
    period: string;
    label: string;
    bpjs_kesehatan: number;
    bpjs_ketenagakerjaan: number;
    private_insurance: number;
    total_insurance: number;
    insurance_ratio: number;
    employees_count: number;
    is_projected?: boolean;
};

export type InsuranceBurnrateSummary = {
    current_insurance_burn: number;
    bpjs_kesehatan_current: number;
    bpjs_tk_current: number;
    ratio_to_payroll: number;
    trend: InsuranceBurnratePoint[];
};

export type EmployeeMobilityPoint = {
    period: string;
    label: string;
    hires: number;
    exits: number;
    mutations: number;
    net_growth: number;
    headcount: number;
    turnover_rate: number;
};

export type EmployeeMobilitySummary = {
    total_hires: number;
    total_exits: number;
    total_mutations: number;
    net_growth: number;
    avg_turnover_rate: number;
    trend: EmployeeMobilityPoint[];
};

export type ReimburseRatePoint = {
    period: string;
    label: string;
    approved_amount: number;
    submitted_amount: number;
    paid_amount: number;
    total_count: number;
    approved_count: number;
    rejected_count: number;
    pending_count: number;
    approval_rate: number;
    categories: {
        travels: number;
        meals: number;
        supplies: number;
        others: number;
    };
};

export type ReimburseRateSummary = {
    current_approved_amount: number;
    current_total_count: number;
    current_approval_rate: number;
    avg_claim_amount: number;
    trend: ReimburseRatePoint[];
};

export const formatRupiahCompact = (value: number | string) => {
    const amount = Number(value ?? 0);

    if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toLocaleString('id-ID', {
            maximumFractionDigits: 1,
        })} M`;
    }

    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', {
            maximumFractionDigits: 1,
        })} jt`;
    }

    if (amount >= 1_000) {
        return `Rp ${(amount / 1_000).toLocaleString('id-ID', {
            maximumFractionDigits: 0,
        })} rb`;
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatRupiahFull = (value: number | string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
};

/**
 * 1. Compact Payroll Burnrate Card
 */
export function PayrollBurnrateCard({
    data,
}: {
    data: PayrollBurnrateSummary;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxVal = Math.max(
        ...trend.map((p) => Math.max(p.net_salary, p.base_salary + p.allowances)),
        1,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    return (
        <Card className="flex flex-col justify-between overflow-hidden p-0 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 p-3 pb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <WalletCards className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                            Payroll Burnrate
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Belanja gaji 6 bln
                        </div>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">
                        {formatRupiahCompact(data.current_burnrate)}
                    </div>
                    <div className="flex items-center justify-end gap-0.5 text-[10px]">
                        {data.growth_rate >= 0 ? (
                            <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                                <ArrowUpRight className="size-3" />
                                +{data.growth_rate}%
                            </span>
                        ) : (
                            <span className="flex items-center font-medium text-rose-600 dark:text-rose-400">
                                <ArrowDownRight className="size-3" />
                                {data.growth_rate}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Compact SVG Chart */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 p-1.5">
                    <svg
                        viewBox="0 0 240 68"
                        className="h-20 w-full"
                        role="img"
                        aria-label="Payroll Burnrate Chart"
                    >
                        {/* Gridlines */}
                        {[12, 32, 52].map((y) => (
                            <line
                                key={y}
                                x1="10"
                                x2="230"
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                            />
                        ))}

                        {/* Bars per month */}
                        {trend.map((pt, i) => {
                            const totalBars = trend.length;
                            const barWidth = 14;
                            const groupX =
                                20 + i * ((220 - 20) / Math.max(totalBars - 1, 1)) - barWidth / 2;

                            const baseH = (pt.base_salary / maxVal) * 44;
                            const allowH = (pt.allowances / maxVal) * 44;
                            const baseY = 52 - baseH;
                            const allowY = baseY - allowH;

                            const isHovered = hoveredIdx === i;

                            return (
                                <g
                                    key={pt.period}
                                    className="cursor-pointer transition-opacity"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                >
                                    {/* Hover background */}
                                    <rect
                                        x={groupX - 3}
                                        y="4"
                                        width={barWidth + 6}
                                        height="50"
                                        fill="currentColor"
                                        className={isHovered ? 'text-muted/40' : 'text-transparent'}
                                        rx="2"
                                    />

                                    {/* Allowances segment */}
                                    {allowH > 0 && (
                                        <rect
                                            x={groupX}
                                            y={allowY}
                                            width={barWidth}
                                            height={allowH}
                                            fill={pt.is_projected ? '#38bdf8' : '#0ea5e9'}
                                            opacity={pt.is_projected ? 0.75 : 0.9}
                                            rx="1.5"
                                        />
                                    )}

                                    {/* Base salary segment */}
                                    <rect
                                        x={groupX}
                                        y={baseY}
                                        width={barWidth}
                                        height={Math.max(baseH, 2)}
                                        fill={pt.is_projected ? '#34d399' : '#10b981'}
                                        opacity={pt.is_projected ? 0.75 : 0.95}
                                        rx="1.5"
                                    />

                                    {/* Net dot */}
                                    {pt.net_salary > 0 && (
                                        <circle
                                            cx={groupX + barWidth / 2}
                                            cy={52 - (pt.net_salary / maxVal) * 44}
                                            r={isHovered ? '3' : '2'}
                                            fill="#047857"
                                            stroke="#ffffff"
                                            strokeWidth="1"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* Baseline */}
                        <line
                            x1="10"
                            x2="230"
                            y1="52"
                            y2="52"
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                        />
                    </svg>

                    {/* Month labels */}
                    <div className="flex justify-between px-1 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors ${
                                    hoveredIdx === i ? 'font-bold text-foreground' : ''
                                }`}
                            >
                                {pt.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Compact inspector */}
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground truncate">
                        {activePoint?.label}
                    </span>
                    <span className="truncate">
                        Net: <strong className="text-emerald-700 dark:text-emerald-400">{formatRupiahCompact(activePoint?.net_salary ?? 0)}</strong>
                    </span>
                    <span className="truncate">
                        Pokok: {formatRupiahCompact(activePoint?.base_salary ?? 0)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Pokok
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-sky-500" />
                        Tunjangan
                    </span>
                </div>
                <span>Avg: {formatRupiahCompact(data.avg_per_employee)}</span>
            </div>
        </Card>
    );
}

/**
 * 2. Compact Insurance Burnrate Card
 */
export function InsuranceBurnrateCard({
    data,
}: {
    data: InsuranceBurnrateSummary;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxVal = Math.max(
        ...trend.map((p) => p.total_insurance),
        1,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    return (
        <Card className="flex flex-col justify-between overflow-hidden p-0 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 p-3 pb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <ShieldCheck className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                            Insurance Burnrate
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            BPJS & asuransi perusahaan
                        </div>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">
                        {formatRupiahCompact(data.current_insurance_burn)}
                    </div>
                    <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                        {data.ratio_to_payroll}% dari payroll
                    </div>
                </div>
            </div>

            {/* Compact SVG Chart */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 p-1.5">
                    <svg
                        viewBox="0 0 240 68"
                        className="h-20 w-full"
                        role="img"
                        aria-label="Insurance Burnrate Chart"
                    >
                        {[12, 32, 52].map((y) => (
                            <line
                                key={y}
                                x1="10"
                                x2="230"
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                            />
                        ))}

                        {trend.map((pt, i) => {
                            const totalBars = trend.length;
                            const barWidth = 14;
                            const groupX =
                                20 + i * ((220 - 20) / Math.max(totalBars - 1, 1)) - barWidth / 2;

                            const tkH = (pt.bpjs_ketenagakerjaan / maxVal) * 44;
                            const kesH = (pt.bpjs_kesehatan / maxVal) * 44;
                            const privH = (pt.private_insurance / maxVal) * 44;

                            const tkY = 52 - tkH;
                            const kesY = tkY - kesH;
                            const privY = kesY - privH;

                            const isHovered = hoveredIdx === i;

                            return (
                                <g
                                    key={pt.period}
                                    className="cursor-pointer transition-opacity"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                >
                                    <rect
                                        x={groupX - 3}
                                        y="4"
                                        width={barWidth + 6}
                                        height="50"
                                        fill="currentColor"
                                        className={isHovered ? 'text-muted/40' : 'text-transparent'}
                                        rx="2"
                                    />

                                    {/* Private */}
                                    {privH > 0 && (
                                        <rect
                                            x={groupX}
                                            y={privY}
                                            width={barWidth}
                                            height={privH}
                                            fill="#f59e0b"
                                            rx="1.5"
                                        />
                                    )}

                                    {/* BPJS Kes */}
                                    {kesH > 0 && (
                                        <rect
                                            x={groupX}
                                            y={kesY}
                                            width={barWidth}
                                            height={kesH}
                                            fill="#0d9488"
                                            rx="1.5"
                                        />
                                    )}

                                    {/* BPJS TK */}
                                    {tkH > 0 && (
                                        <rect
                                            x={groupX}
                                            y={tkY}
                                            width={barWidth}
                                            height={tkH}
                                            fill="#6366f1"
                                            rx="1.5"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        <line
                            x1="10"
                            x2="230"
                            y1="52"
                            y2="52"
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                        />
                    </svg>

                    <div className="flex justify-between px-1 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors ${
                                    hoveredIdx === i ? 'font-bold text-foreground' : ''
                                }`}
                            >
                                {pt.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground truncate">
                        {activePoint?.label}
                    </span>
                    <span className="truncate">
                        Kes: {formatRupiahCompact(activePoint?.bpjs_kesehatan ?? 0)}
                    </span>
                    <span className="truncate">
                        TK: {formatRupiahCompact(activePoint?.bpjs_ketenagakerjaan ?? 0)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-indigo-500" />
                        TK
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-teal-600" />
                        Kes
                    </span>
                </div>
                <span>Total: {formatRupiahCompact(data.current_insurance_burn)}</span>
            </div>
        </Card>
    );
}

/**
 * 3. Compact Employee Mobility Card
 */
export function EmployeeMobilityCard({
    data,
}: {
    data: EmployeeMobilitySummary;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxCount = Math.max(
        ...trend.flatMap((p) => [p.hires, p.exits, p.mutations]),
        2,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    return (
        <Card className="flex flex-col justify-between overflow-hidden p-0 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 p-3 pb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                        <Users className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                            Mobilitas Karyawan
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Masuk, keluar & mutasi
                        </div>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">
                        {data.net_growth >= 0 ? `+${data.net_growth}` : data.net_growth} Net
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground">
                        Turnover: {data.avg_turnover_rate}%
                    </div>
                </div>
            </div>

            {/* Compact SVG Chart */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 p-1.5">
                    <svg
                        viewBox="0 0 240 68"
                        className="h-20 w-full"
                        role="img"
                        aria-label="Employee Mobility Chart"
                    >
                        {[12, 32, 52].map((y) => (
                            <line
                                key={y}
                                x1="10"
                                x2="230"
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                            />
                        ))}

                        {trend.map((pt, i) => {
                            const totalBars = trend.length;
                            const barWidth = 4.5;
                            const spacing = 1.5;
                            const totalGroupWidth = barWidth * 3 + spacing * 2;
                            const groupX =
                                20 +
                                i * ((220 - 20) / Math.max(totalBars - 1, 1)) -
                                totalGroupWidth / 2;

                            const hireH = (pt.hires / maxCount) * 44;
                            const exitH = (pt.exits / maxCount) * 44;
                            const mutH = (pt.mutations / maxCount) * 44;

                            const isHovered = hoveredIdx === i;

                            return (
                                <g
                                    key={pt.period}
                                    className="cursor-pointer transition-opacity"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                >
                                    <rect
                                        x={groupX - 3}
                                        y="4"
                                        width={totalGroupWidth + 6}
                                        height="50"
                                        fill="currentColor"
                                        className={isHovered ? 'text-muted/40' : 'text-transparent'}
                                        rx="2"
                                    />

                                    {/* Hire */}
                                    <rect
                                        x={groupX}
                                        y={52 - hireH}
                                        width={barWidth}
                                        height={Math.max(hireH, 1)}
                                        fill="#10b981"
                                        rx="1"
                                    />

                                    {/* Exit */}
                                    <rect
                                        x={groupX + barWidth + spacing}
                                        y={52 - exitH}
                                        width={barWidth}
                                        height={Math.max(exitH, 1)}
                                        fill="#f43f5e"
                                        rx="1"
                                    />

                                    {/* Mutation */}
                                    <rect
                                        x={groupX + (barWidth + spacing) * 2}
                                        y={52 - mutH}
                                        width={barWidth}
                                        height={Math.max(mutH, 1)}
                                        fill="#8b5cf6"
                                        rx="1"
                                    />
                                </g>
                            );
                        })}

                        <line
                            x1="10"
                            x2="230"
                            y1="52"
                            y2="52"
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                        />
                    </svg>

                    <div className="flex justify-between px-1 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors ${
                                    hoveredIdx === i ? 'font-bold text-foreground' : ''
                                }`}
                            >
                                {pt.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground truncate">
                        {activePoint?.label}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                        +{activePoint?.hires ?? 0} masuk
                    </span>
                    <span className="text-rose-700 dark:text-rose-400">
                        -{activePoint?.exits ?? 0} keluar
                    </span>
                    <span className="text-violet-700 dark:text-violet-400">
                        {activePoint?.mutations ?? 0} mutasi
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Masuk
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        Keluar
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-violet-500" />
                        Mutasi
                    </span>
                </div>
                <span>Total 6 bln: +{data.total_hires}/-{data.total_exits}</span>
            </div>
        </Card>
    );
}

/**
 * 4. Compact Reimburse Rate Card
 */
export function ReimburseRateCard({
    data,
}: {
    data: ReimburseRateSummary;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxAmount = Math.max(
        ...trend.map((p) => Math.max(p.approved_amount, p.submitted_amount)),
        100_000,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    return (
        <Card className="flex flex-col justify-between overflow-hidden p-0 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 p-3 pb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                        <Receipt className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                            Reimburse Rate
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Klaim & tingkat persetujuan
                        </div>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">
                        {formatRupiahCompact(data.current_approved_amount)}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        {data.current_approval_rate}% ACC
                    </div>
                </div>
            </div>

            {/* Compact SVG Chart */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 p-1.5">
                    <svg
                        viewBox="0 0 240 68"
                        className="h-20 w-full"
                        role="img"
                        aria-label="Reimburse Rate Chart"
                    >
                        {[12, 32, 52].map((y) => (
                            <line
                                key={y}
                                x1="10"
                                x2="230"
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                            />
                        ))}

                        {/* Approval rate polyline */}
                        {trend.length > 1 && (
                            <polyline
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                                strokeDasharray="2 2"
                                points={trend
                                    .map((pt, i) => {
                                        const x =
                                            20 +
                                            i *
                                                ((220 - 20) /
                                                    Math.max(trend.length - 1, 1));
                                        const y = 52 - (pt.approval_rate / 100) * 44;
                                        return `${x},${y}`;
                                    })
                                    .join(' ')}
                            />
                        )}

                        {trend.map((pt, i) => {
                            const totalBars = trend.length;
                            const barWidth = 14;
                            const groupX =
                                20 + i * ((220 - 20) / Math.max(totalBars - 1, 1)) - barWidth / 2;

                            const subH = (pt.submitted_amount / maxAmount) * 44;
                            const appH = (pt.approved_amount / maxAmount) * 44;
                            const appY = 52 - appH;

                            const isHovered = hoveredIdx === i;
                            const rateY = 52 - (pt.approval_rate / 100) * 44;

                            return (
                                <g
                                    key={pt.period}
                                    className="cursor-pointer transition-opacity"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                >
                                    <rect
                                        x={groupX - 3}
                                        y="4"
                                        width={barWidth + 6}
                                        height="50"
                                        fill="currentColor"
                                        className={isHovered ? 'text-muted/40' : 'text-transparent'}
                                        rx="2"
                                    />

                                    {/* Approved bar */}
                                    <rect
                                        x={groupX}
                                        y={appY}
                                        width={barWidth}
                                        height={Math.max(appH, 2)}
                                        fill="#0f766e"
                                        rx="1.5"
                                    />

                                    {/* Rate dot */}
                                    <circle
                                        cx={groupX + barWidth / 2}
                                        cy={rateY}
                                        r={isHovered ? '3' : '2'}
                                        fill="#f59e0b"
                                        stroke="#ffffff"
                                        strokeWidth="1"
                                    />
                                </g>
                            );
                        })}

                        <line
                            x1="10"
                            x2="230"
                            y1="52"
                            y2="52"
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                        />
                    </svg>

                    <div className="flex justify-between px-1 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors ${
                                    hoveredIdx === i ? 'font-bold text-foreground' : ''
                                }`}
                            >
                                {pt.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground truncate">
                        {activePoint?.label}
                    </span>
                    <span className="text-teal-700 dark:text-teal-400 truncate">
                        ACC: {formatRupiahCompact(activePoint?.approved_amount ?? 0)}
                    </span>
                    <span className="truncate">
                        Rate: {activePoint?.approval_rate ?? 0}%
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-teal-700" />
                        Disetujui
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        Rate %
                    </span>
                </div>
                <span>Total: {data.current_total_count} klaim</span>
            </div>
        </Card>
    );
}

/**
 * Combined Section for the 4 Analytics Charts: Displayed in 1 Row on desktop!
 */
export function DashboardAnalyticsSection({
    payrollBurnrate,
    insuranceBurnrate,
    employeeMobility,
    reimburseRate,
}: {
    payrollBurnrate: PayrollBurnrateSummary;
    insuranceBurnrate: InsuranceBurnrateSummary;
    employeeMobility: EmployeeMobilitySummary;
    reimburseRate: ReimburseRateSummary;
}) {
    // Displayed in 1 Row on desktop / large screens (lg:grid-cols-4)
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PayrollBurnrateCard data={payrollBurnrate} />
            <InsuranceBurnrateCard data={insuranceBurnrate} />
            <EmployeeMobilityCard data={employeeMobility} />
            <ReimburseRateCard data={reimburseRate} />
        </div>
    );
}
