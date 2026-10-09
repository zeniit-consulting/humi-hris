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

type Point = { x: number; y: number };

/**
 * Generates a smooth cubic Bezier curve (wavy line) passing naturally through all data points.
 * Uses Catmull-Rom spline formulation converted to cubic Bezier segments.
 */
export function getWavyPath(points: Point[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    if (points.length === 2) {
        const dx = (points[1].x - points[0].x) / 3;
        return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} C ${(points[0].x + dx).toFixed(1)} ${points[0].y.toFixed(1)}, ${(points[1].x - dx).toFixed(1)} ${points[1].y.toFixed(1)}, ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
    }

    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

        // Smooth tension factor (0.18 yields a natural smooth wave without overshooting)
        const cp1x = p1.x + (p2.x - p0.x) * 0.18;
        const cp1y = p1.y + (p2.y - p0.y) * 0.18;

        const cp2x = p2.x - (p3.x - p1.x) * 0.18;
        const cp2y = p2.y - (p3.y - p1.y) * 0.18;

        path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    return path;
}

/**
 * Generates a closed area underneath the smooth wavy curve down to baselineY.
 */
export function getWavyAreaPath(points: Point[], baselineY: number): string {
    if (points.length < 2) return '';
    const linePath = getWavyPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${linePath} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}

/**
 * 1. Wavy Line Chart: Payroll Burnrate Card
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
        100_000,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    const totalPoints = trend.length;
    const padX = 18;
    const width = 240;
    const topY = 10;
    const baselineY = 64;
    const chartHeight = baselineY - topY;

    const getX = (idx: number) => {
        if (totalPoints <= 1) return width / 2;
        return padX + (idx / (totalPoints - 1)) * (width - padX * 2);
    };

    const getY = (val: number) => {
        const clamped = Math.max(0, val);
        return baselineY - (clamped / maxVal) * chartHeight;
    };

    const netPoints = trend.map((p, i) => ({ x: getX(i), y: getY(p.net_salary) }));
    const grossPoints = trend.map((p, i) => ({
        x: getX(i),
        y: getY(p.base_salary + p.allowances),
    }));

    const activeIndex = hoveredIdx !== null ? hoveredIdx : trend.length - 1;
    const activeNet = netPoints[activeIndex];

    return (
        <Card className="flex h-full flex-col justify-between overflow-hidden p-0 shadow-xs">
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
                            Trend belanja gaji 6 bln
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

            {/* Wavy Line Chart Container */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 pt-1.5 pb-1 px-0">
                    <svg
                        viewBox={`0 0 ${width} 80`}
                        preserveAspectRatio="none"
                        className="h-[92px] w-full"
                        role="img"
                        aria-label="Payroll Burnrate Wavy Line Chart"
                    >
                        <defs>
                            <linearGradient id="payrollWaveGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Gridlines */}
                        {[16, 32, 48].map((y) => (
                            <line
                                key={y}
                                x1="0"
                                x2={width}
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}

                        {/* Wave Area Fill */}
                        {netPoints.length > 1 && (
                            <path
                                d={getWavyAreaPath(netPoints, baselineY)}
                                fill="url(#payrollWaveGrad)"
                            />
                        )}

                        {/* Gross / Base+Allowances Wavy Line (Dashed sky blue) */}
                        {grossPoints.length > 1 && (
                            <path
                                d={getWavyPath(grossPoints)}
                                fill="none"
                                stroke="#0ea5e9"
                                strokeWidth="1.6"
                                strokeDasharray="3 3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity="0.85"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Primary Net Salary Wavy Line (Solid emerald) */}
                        {netPoints.length > 1 && (
                            <path
                                d={getWavyPath(netPoints)}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Baseline */}
                        <line
                            x1="0"
                            x2={width}
                            y1={baselineY}
                            y2={baselineY}
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Hover vertical guideline */}
                        {activeNet && (
                            <line
                                x1={activeNet.x}
                                x2={activeNet.x}
                                y1="6"
                                y2={baselineY}
                                stroke="currentColor"
                                className="text-muted-foreground/35"
                                strokeDasharray="2 2"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Data Points on Wavy Curve */}
                        {netPoints.map((pt, i) => {
                            const isHovered = hoveredIdx === i;
                            return (
                                <g key={trend[i].period}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#ffffff"
                                        stroke="#10b981"
                                        strokeWidth={isHovered ? 2.5 : 1.8}
                                        className="transition-all"
                                    />
                                    {isHovered && (
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={7}
                                            fill="#10b981"
                                            opacity="0.2"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* Invisible full-height hover target zones */}
                        {trend.map((pt, i) => {
                            const colWidth = width / Math.max(totalPoints, 1);
                            return (
                                <rect
                                    key={`hit-${pt.period}`}
                                    x={i * colWidth}
                                    y="2"
                                    width={colWidth}
                                    height="64"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    {/* Month labels */}
                    <div className="flex justify-between px-2 pt-0.5 text-[10px] text-muted-foreground">
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
                        Net:{' '}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                            {formatRupiahCompact(activePoint?.net_salary ?? 0)}
                        </strong>
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
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Take Home
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full border border-sky-500 bg-sky-100" />
                        Total Gaji
                    </span>
                </div>
                <span>Avg: {formatRupiahCompact(data.avg_per_employee)}</span>
            </div>
        </Card>
    );
}

/**
 * 2. Wavy Line Chart: Insurance Burnrate Card
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
        10_000,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    const totalPoints = trend.length;
    const padX = 18;
    const width = 240;
    const topY = 10;
    const baselineY = 64;
    const chartHeight = baselineY - topY;

    const getX = (idx: number) => {
        if (totalPoints <= 1) return width / 2;
        return padX + (idx / (totalPoints - 1)) * (width - padX * 2);
    };

    const getY = (val: number) => {
        const clamped = Math.max(0, val);
        return baselineY - (clamped / maxVal) * chartHeight;
    };

    const totalPointsList = trend.map((p, i) => ({
        x: getX(i),
        y: getY(p.total_insurance),
    }));
    const tkPoints = trend.map((p, i) => ({
        x: getX(i),
        y: getY(p.bpjs_ketenagakerjaan),
    }));
    const kesPoints = trend.map((p, i) => ({
        x: getX(i),
        y: getY(p.bpjs_kesehatan),
    }));

    const activeIndex = hoveredIdx !== null ? hoveredIdx : trend.length - 1;
    const activeTotal = totalPointsList[activeIndex];

    return (
        <Card className="flex h-full flex-col justify-between overflow-hidden p-0 shadow-xs">
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

            {/* Wavy Line Chart Container */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 pt-1.5 pb-1 px-0">
                    <svg
                        viewBox={`0 0 ${width} 80`}
                        preserveAspectRatio="none"
                        className="h-[92px] w-full"
                        role="img"
                        aria-label="Insurance Burnrate Wavy Line Chart"
                    >
                        <defs>
                            <linearGradient id="insuranceWaveGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Gridlines */}
                        {[16, 32, 48].map((y) => (
                            <line
                                key={y}
                                x1="0"
                                x2={width}
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}

                        {/* Total Insurance Wave Area */}
                        {totalPointsList.length > 1 && (
                            <path
                                d={getWavyAreaPath(totalPointsList, baselineY)}
                                fill="url(#insuranceWaveGrad)"
                            />
                        )}

                        {/* BPJS TK Wave Line */}
                        {tkPoints.length > 1 && (
                            <path
                                d={getWavyPath(tkPoints)}
                                fill="none"
                                stroke="#818cf8"
                                strokeWidth="1.5"
                                strokeDasharray="3 2"
                                opacity="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* BPJS Kes Wave Line */}
                        {kesPoints.length > 1 && (
                            <path
                                d={getWavyPath(kesPoints)}
                                fill="none"
                                stroke="#0d9488"
                                strokeWidth="1.5"
                                opacity="0.85"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Main Total Insurance Wave Line */}
                        {totalPointsList.length > 1 && (
                            <path
                                d={getWavyPath(totalPointsList)}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Baseline */}
                        <line
                            x1="0"
                            x2={width}
                            y1={baselineY}
                            y2={baselineY}
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Active hover guideline */}
                        {activeTotal && (
                            <line
                                x1={activeTotal.x}
                                x2={activeTotal.x}
                                y1="6"
                                y2={baselineY}
                                stroke="currentColor"
                                className="text-muted-foreground/35"
                                strokeDasharray="2 2"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Data Points */}
                        {totalPointsList.map((pt, i) => {
                            const isHovered = hoveredIdx === i;
                            return (
                                <g key={trend[i].period}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#ffffff"
                                        stroke="#6366f1"
                                        strokeWidth={isHovered ? 2.5 : 1.8}
                                        className="transition-all"
                                    />
                                    {isHovered && (
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={7}
                                            fill="#6366f1"
                                            opacity="0.2"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* Hitboxes */}
                        {trend.map((pt, i) => {
                            const colWidth = width / Math.max(totalPoints, 1);
                            return (
                                <rect
                                    key={`hit-${pt.period}`}
                                    x={i * colWidth}
                                    y="2"
                                    width={colWidth}
                                    height="64"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    <div className="flex justify-between px-2 pt-0.5 text-[10px] text-muted-foreground">
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
                        <span className="size-2 rounded-full bg-indigo-500" />
                        Total
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-teal-600" />
                        Kes
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full border border-indigo-400 bg-indigo-100" />
                        TK
                    </span>
                </div>
                <span>Total: {formatRupiahCompact(data.current_insurance_burn)}</span>
            </div>
        </Card>
    );
}

/**
 * 3. Wavy Line Chart: Employee Mobility Card
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

    const totalPoints = trend.length;
    const padX = 22;
    const width = 360;
    const topY = 10;
    const baselineY = 64;
    const chartHeight = baselineY - topY;

    const getX = (idx: number) => {
        if (totalPoints <= 1) return width / 2;
        return padX + (idx / (totalPoints - 1)) * (width - padX * 2);
    };

    const getY = (val: number) => {
        const clamped = Math.max(0, val);
        return baselineY - (clamped / maxCount) * chartHeight;
    };

    const hirePoints = trend.map((p, i) => ({ x: getX(i), y: getY(p.hires) }));
    const exitPoints = trend.map((p, i) => ({ x: getX(i), y: getY(p.exits) }));
    const mutPoints = trend.map((p, i) => ({ x: getX(i), y: getY(p.mutations) }));

    const activeIndex = hoveredIdx !== null ? hoveredIdx : trend.length - 1;
    const activeHire = hirePoints[activeIndex];

    return (
        <Card className="flex h-full flex-col justify-between overflow-hidden p-0 shadow-xs">
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

            {/* Wavy Line Chart Container */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 pt-1.5 pb-1 px-0">
                    <svg
                        viewBox={`0 0 ${width} 80`}
                        preserveAspectRatio="none"
                        className="h-[92px] w-full"
                        role="img"
                        aria-label="Employee Mobility Wavy Line Chart"
                    >
                        <defs>
                            <linearGradient id="mobilityHiresWaveGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="mobilityExitsWaveGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Gridlines */}
                        {[16, 32, 48].map((y) => (
                            <line
                                key={y}
                                x1="0"
                                x2={width}
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}

                        {/* Hires Wave Area Fill */}
                        {hirePoints.length > 1 && (
                            <path
                                d={getWavyAreaPath(hirePoints, baselineY)}
                                fill="url(#mobilityHiresWaveGrad)"
                            />
                        )}

                        {/* Exits Wave Area Fill */}
                        {exitPoints.length > 1 && (
                            <path
                                d={getWavyAreaPath(exitPoints, baselineY)}
                                fill="url(#mobilityExitsWaveGrad)"
                            />
                        )}

                        {/* Mutations Wave Line (Purple dashed) */}
                        {mutPoints.length > 1 && (
                            <path
                                d={getWavyPath(mutPoints)}
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="1.5"
                                strokeDasharray="3 2"
                                opacity="0.85"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Exits Wave Line (Rose) */}
                        {exitPoints.length > 1 && (
                            <path
                                d={getWavyPath(exitPoints)}
                                fill="none"
                                stroke="#f43f5e"
                                strokeWidth="2.0"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Hires Wave Line (Emerald) */}
                        {hirePoints.length > 1 && (
                            <path
                                d={getWavyPath(hirePoints)}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Baseline */}
                        <line
                            x1="0"
                            x2={width}
                            y1={baselineY}
                            y2={baselineY}
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Active hover guideline */}
                        {activeHire && (
                            <line
                                x1={activeHire.x}
                                x2={activeHire.x}
                                y1="6"
                                y2={baselineY}
                                stroke="currentColor"
                                className="text-muted-foreground/35"
                                strokeDasharray="2 2"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Data Points on Hires & Exits */}
                        {hirePoints.map((pt, i) => {
                            const isHovered = hoveredIdx === i;
                            return (
                                <g key={trend[i].period}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 4 : 2.2}
                                        fill="#ffffff"
                                        stroke="#10b981"
                                        strokeWidth={isHovered ? 2 : 1.5}
                                    />
                                    <circle
                                        cx={exitPoints[i].x}
                                        cy={exitPoints[i].y}
                                        r={isHovered ? 4 : 2.2}
                                        fill="#ffffff"
                                        stroke="#f43f5e"
                                        strokeWidth={isHovered ? 2 : 1.5}
                                    />
                                </g>
                            );
                        })}

                        {/* Hitboxes */}
                        {trend.map((pt, i) => {
                            const colWidth = width / Math.max(totalPoints, 1);
                            return (
                                <rect
                                    key={`hit-${pt.period}`}
                                    x={i * colWidth}
                                    y="2"
                                    width={colWidth}
                                    height="64"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    <div className="flex justify-between px-2 pt-0.5 text-[10px] text-muted-foreground">
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
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Masuk
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-rose-500" />
                        Keluar
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-violet-500" />
                        Mutasi
                    </span>
                </div>
                <span>
                    6 bln: +{data.total_hires}/-{data.total_exits}
                </span>
            </div>
        </Card>
    );
}

/**
 * 4. Wavy Line Chart: Reimburse Rate Card
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

    const totalPoints = trend.length;
    const padX = 18;
    const width = 240;
    const topY = 10;
    const baselineY = 64;
    const chartHeight = baselineY - topY;

    const getX = (idx: number) => {
        if (totalPoints <= 1) return width / 2;
        return padX + (idx / (totalPoints - 1)) * (width - padX * 2);
    };

    const getYAmount = (val: number) => {
        const clamped = Math.max(0, val);
        return baselineY - (clamped / maxAmount) * chartHeight;
    };

    const getYRate = (rate: number) => {
        const clamped = Math.min(100, Math.max(0, rate));
        return baselineY - (clamped / 100) * chartHeight;
    };

    const approvedPoints = trend.map((p, i) => ({
        x: getX(i),
        y: getYAmount(p.approved_amount),
    }));
    const submittedPoints = trend.map((p, i) => ({
        x: getX(i),
        y: getYAmount(p.submitted_amount),
    }));
    const ratePoints = trend.map((p, i) => ({
        x: getX(i),
        y: getYRate(p.approval_rate),
    }));

    const activeIndex = hoveredIdx !== null ? hoveredIdx : trend.length - 1;
    const activeApproved = approvedPoints[activeIndex];

    return (
        <Card className="flex h-full flex-col justify-between overflow-hidden p-0 shadow-xs">
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

            {/* Wavy Line Chart Container */}
            <div className="px-3 pt-1">
                <div className="relative overflow-hidden rounded border bg-muted/10 pt-1.5 pb-1 px-0">
                    <svg
                        viewBox={`0 0 ${width} 80`}
                        preserveAspectRatio="none"
                        className="h-[92px] w-full"
                        role="img"
                        aria-label="Reimburse Rate Wavy Line Chart"
                    >
                        <defs>
                            <linearGradient id="reimburseWaveGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0f766e" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Gridlines */}
                        {[16, 32, 48].map((y) => (
                            <line
                                key={y}
                                x1="0"
                                x2={width}
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-border"
                                strokeDasharray="2 2"
                                strokeWidth="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}

                        {/* Approved Amount Wave Area */}
                        {approvedPoints.length > 1 && (
                            <path
                                d={getWavyAreaPath(approvedPoints, baselineY)}
                                fill="url(#reimburseWaveGrad)"
                            />
                        )}

                        {/* Submitted Amount Wave Line (Sky blue dashed) */}
                        {submittedPoints.length > 1 && (
                            <path
                                d={getWavyPath(submittedPoints)}
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth="1.5"
                                strokeDasharray="3 2"
                                opacity="0.8"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Approval Rate % Wave Line (Amber) */}
                        {ratePoints.length > 1 && (
                            <path
                                d={getWavyPath(ratePoints)}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="1.8"
                                strokeDasharray="3 3"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Main Approved Amount Wave Line (Teal) */}
                        {approvedPoints.length > 1 && (
                            <path
                                d={getWavyPath(approvedPoints)}
                                fill="none"
                                stroke="#0f766e"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Baseline */}
                        <line
                            x1="0"
                            x2={width}
                            y1={baselineY}
                            y2={baselineY}
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Active hover guideline */}
                        {activeApproved && (
                            <line
                                x1={activeApproved.x}
                                x2={activeApproved.x}
                                y1="6"
                                y2={baselineY}
                                stroke="currentColor"
                                className="text-muted-foreground/35"
                                strokeDasharray="2 2"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Data Points */}
                        {approvedPoints.map((pt, i) => {
                            const isHovered = hoveredIdx === i;
                            return (
                                <g key={trend[i].period}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#ffffff"
                                        stroke="#0f766e"
                                        strokeWidth={isHovered ? 2.5 : 1.8}
                                        className="transition-all"
                                    />
                                    {/* Rate point dot */}
                                    <circle
                                        cx={ratePoints[i].x}
                                        cy={ratePoints[i].y}
                                        r={isHovered ? 3.5 : 2.0}
                                        fill="#f59e0b"
                                    />
                                </g>
                            );
                        })}

                        {/* Hitboxes */}
                        {trend.map((pt, i) => {
                            const colWidth = width / Math.max(totalPoints, 1);
                            return (
                                <rect
                                    key={`hit-${pt.period}`}
                                    x={i * colWidth}
                                    y="2"
                                    width={colWidth}
                                    height="64"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    <div className="flex justify-between px-2 pt-0.5 text-[10px] text-muted-foreground">
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
                        <span className="size-2 rounded-full bg-teal-700" />
                        Disetujui
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-amber-500" />
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
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PayrollBurnrateCard data={payrollBurnrate} />
            <InsuranceBurnrateCard data={insuranceBurnrate} />
            <EmployeeMobilityCard data={employeeMobility} />
            <ReimburseRateCard data={reimburseRate} />
        </div>
    );
}
