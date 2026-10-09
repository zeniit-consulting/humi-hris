import {
    ArrowDownRight,
    ArrowUpRight,
    Receipt,
    ShieldCheck,
    Users,
    WalletCards,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

export function useChartWidth(defaultWidth = 360) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number>(defaultWidth);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateWidth = () => {
            const clientWidth = el.clientWidth;
            if (clientWidth > 0) {
                setWidth(clientWidth);
            }
        };

        updateWidth();

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = Math.round(entry.contentRect.width);
                if (w > 0) {
                    setWidth(w);
                }
            }
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return { containerRef, width };
}

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
    const { containerRef, width } = useChartWidth(360);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxVal = Math.max(
        ...trend.map((p) => p.net_salary),
        100_000,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    const totalPoints = trend.length;
    const padX = 20;
    const topY = 14;
    const baselineY = 88;
    const chartHeight = baselineY - topY;
    const svgHeight = 104;

    const getX = (idx: number) => {
        if (totalPoints <= 1) return width / 2;
        return padX + (idx / (totalPoints - 1)) * (width - padX * 2);
    };

    const getY = (val: number) => {
        const clamped = Math.max(0, val);
        return baselineY - (clamped / maxVal) * chartHeight;
    };

    const netPoints = trend.map((p, i) => ({ x: getX(i), y: getY(p.net_salary) }));

    const activeIndex = hoveredIdx !== null ? hoveredIdx : trend.length - 1;
    const activeNet = netPoints[activeIndex];

    return (
        <Card className="flex h-full flex-col justify-between overflow-hidden p-0 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 p-3 pb-1">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <WalletCards className="size-4 shrink-0 aspect-square" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                            Payroll Burnrate
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Trend THP 6 bln
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
                                <ArrowUpRight className="size-3.5 shrink-0 aspect-square" />
                                +{data.growth_rate}%
                            </span>
                        ) : (
                            <span className="flex items-center font-medium text-rose-600 dark:text-rose-400">
                                <ArrowDownRight className="size-3.5 shrink-0 aspect-square" />
                                {data.growth_rate}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Wavy Line Chart Container */}
            <div className="px-3 pt-1">
                <div ref={containerRef} className="relative overflow-hidden rounded-md border bg-muted/10 pt-1.5 pb-1 px-0">
                    <svg
                        viewBox={`0 0 ${width} ${svgHeight}`}
                        className="h-[104px] w-full"
                        role="img"
                        aria-label="Payroll Burnrate Wavy Line Chart"
                    >
                        <defs>
                            <linearGradient id="payrollWaveGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Gridlines */}
                        {[26, 50, 74].map((y) => (
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

                        {/* Primary Net Salary Wavy Line (Solid emerald) */}
                        {netPoints.length > 1 && (
                            <path
                                d={getWavyPath(netPoints)}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.5"
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
                                y1="8"
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
                                    y="0"
                                    width={colWidth}
                                    height={baselineY}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    {/* Month labels */}
                    <div className="flex justify-between px-2.5 pt-0.5 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors ${
                                    hoveredIdx === i ? 'font-bold text-foreground' : ''
                                }}`}
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
                        THP:{' '}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                            {formatRupiahCompact(activePoint?.net_salary ?? 0)}
                        </strong>
                    </span>
                    <span className="truncate">
                        {activePoint?.employees_count ?? 0} karyawan
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="size-2 shrink-0 aspect-square rounded-full bg-emerald-500" />
                        Total THP
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
    const { containerRef, width } = useChartWidth(360);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxVal = Math.max(
        ...trend.flatMap((p) => [p.bpjs_kesehatan, p.bpjs_ketenagakerjaan]),
        10_000,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    const totalPoints = trend.length;
    const padX = 20;
    const topY = 14;
    const baselineY = 88;
    const chartHeight = baselineY - topY;
    const svgHeight = 104;

    const getX = (idx: number) => {
        if (totalPoints <= 1) return width / 2;
        return padX + (idx / (totalPoints - 1)) * (width - padX * 2);
    };

    const getY = (val: number) => {
        const clamped = Math.max(0, val);
        return baselineY - (clamped / maxVal) * chartHeight;
    };

    const tkPoints = trend.map((p, i) => ({
        x: getX(i),
        y: getY(p.bpjs_ketenagakerjaan),
    }));
    const kesPoints = trend.map((p, i) => ({
        x: getX(i),
        y: getY(p.bpjs_kesehatan),
    }));

    const activeIndex = hoveredIdx !== null ? hoveredIdx : trend.length - 1;
    const activeGuideX = kesPoints[activeIndex]?.x ?? 0;

    return (
        <Card className="flex h-full flex-col justify-between overflow-hidden p-0 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 p-3 pb-1">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <ShieldCheck className="size-4 shrink-0 aspect-square" />
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
                <div ref={containerRef} className="relative overflow-hidden rounded-md border bg-muted/10 pt-1.5 pb-1 px-0">
                    <svg
                        viewBox={`0 0 ${width} ${svgHeight}`}
                        className="h-[104px] w-full"
                        role="img"
                        aria-label="Insurance Burnrate Wavy Line Chart"
                    >
                        {/* Gridlines */}
                        {[26, 50, 74].map((y) => (
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

                        {/* BPJS Kesehatan: Solid Green Line */}
                        {kesPoints.length > 1 && (
                            <path
                                d={getWavyPath(kesPoints)}
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* BPJS Tenaga Kerja: Solid Blue Line */}
                        {tkPoints.length > 1 && (
                            <path
                                d={getWavyPath(tkPoints)}
                                fill="none"
                                stroke="#2563eb"
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
                        {activeGuideX > 0 && (
                            <line
                                x1={activeGuideX}
                                x2={activeGuideX}
                                y1="8"
                                y2={baselineY}
                                stroke="currentColor"
                                className="text-muted-foreground/35"
                                strokeDasharray="2 2"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* BPJS Kesehatan Data Points (Green) */}
                        {kesPoints.map((pt, i) => {
                            const isHovered = hoveredIdx === i;
                            return (
                                <g key={`kes-${trend[i].period}`}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#ffffff"
                                        stroke="#16a34a"
                                        strokeWidth={isHovered ? 2.5 : 1.8}
                                        className="transition-all"
                                    />
                                    {isHovered && (
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={7}
                                            fill="#16a34a"
                                            opacity="0.2"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* BPJS Tenaga Kerja Data Points (Blue) */}
                        {tkPoints.map((pt, i) => {
                            const isHovered = hoveredIdx === i;
                            return (
                                <g key={`tk-${trend[i].period}`}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#ffffff"
                                        stroke="#2563eb"
                                        strokeWidth={isHovered ? 2.5 : 1.8}
                                        className="transition-all"
                                    />
                                    {isHovered && (
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={7}
                                            fill="#2563eb"
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
                                    y="0"
                                    width={colWidth}
                                    height={baselineY}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    <div className="flex justify-between px-2.5 pt-0.5 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors ${
                                    hoveredIdx === i ? 'font-bold text-foreground' : ''
                                }}`}
                            >
                                {pt.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-foreground truncate">
                        {activePoint?.label}
                    </span>
                    <span className="truncate font-medium text-emerald-600 dark:text-emerald-400">
                        Kes: {formatRupiahCompact(activePoint?.bpjs_kesehatan ?? 0)}
                    </span>
                    <span className="truncate font-medium text-blue-600 dark:text-blue-400">
                        TK: {formatRupiahCompact(activePoint?.bpjs_ketenagakerjaan ?? 0)}
                    </span>
                </div>
            </div>

            {/* Footer with Green (Kes) and Blue (TK) legends */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="size-2 shrink-0 aspect-square rounded-full bg-emerald-600" />
                        BPJS Kesehatan
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-blue-700 dark:text-blue-400">
                        <span className="size-2 shrink-0 aspect-square rounded-full bg-blue-600" />
                        BPJS Tenaga Kerja
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
    const { containerRef, width } = useChartWidth(700);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxCount = Math.max(
        ...trend.flatMap((p) => [p.hires, p.exits, p.mutations]),
        2,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    const totalPoints = trend.length;
    const padX = 24;
    const topY = 14;
    const baselineY = 88;
    const chartHeight = baselineY - topY;
    const svgHeight = 104;

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
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                        <Users className="size-4 shrink-0 aspect-square" />
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
                <div ref={containerRef} className="relative overflow-hidden rounded-md border bg-muted/10 pt-1.5 pb-1 px-0">
                    <svg
                        viewBox={`0 0 ${width} ${svgHeight}`}
                        className="h-[104px] w-full"
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
                        {[26, 50, 74].map((y) => (
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
                                strokeWidth="1.6"
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
                                strokeWidth="2.2"
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
                        {activeHire && (
                            <line
                                x1={activeHire.x}
                                x2={activeHire.x}
                                y1="8"
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
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#ffffff"
                                        stroke="#10b981"
                                        strokeWidth={isHovered ? 2.5 : 1.8}
                                        className="transition-all"
                                    />
                                    <circle
                                        cx={exitPoints[i].x}
                                        cy={exitPoints[i].y}
                                        r={isHovered ? 4.5 : 2.5}
                                        fill="#ffffff"
                                        stroke="#f43f5e"
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

                        {/* Hitboxes */}
                        {trend.map((pt, i) => {
                            const colWidth = width / Math.max(totalPoints, 1);
                            return (
                                <rect
                                    key={`hit-${pt.period}`}
                                    x={i * colWidth}
                                    y="0"
                                    width={colWidth}
                                    height={baselineY}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    <div className="flex justify-between px-2.5 pt-0.5 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors ${
                                    hoveredIdx === i ? 'font-bold text-foreground' : ''
                                }}`}
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
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        +{activePoint?.hires ?? 0} masuk
                    </span>
                    <span className="text-rose-700 dark:text-rose-400 font-medium">
                        -{activePoint?.exits ?? 0} keluar
                    </span>
                    <span className="text-violet-700 dark:text-violet-400 font-medium">
                        {activePoint?.mutations ?? 0} mutasi
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="size-2 shrink-0 aspect-square rounded-full bg-emerald-500" />
                        Masuk
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-rose-700 dark:text-rose-400">
                        <span className="size-2 shrink-0 aspect-square rounded-full bg-rose-500" />
                        Keluar
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-purple-700 dark:text-purple-400">
                        <span className="size-2 shrink-0 aspect-square rounded-full bg-purple-500" />
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

const REIMBURSE_BAR_CATEGORIES = [
    { key: 'meals', label: 'Meals', color: '#f59e0b' },
    { key: 'travels', label: 'Travels', color: '#3b82f6' },
    { key: 'supplies', label: 'Supplies', color: '#10b981' },
    { key: 'others', label: 'Others', color: '#8b5cf6' },
] as const;

/**
 * 4. Bar Chart: Reimburse by Kategori Card (Meals, Travels, Supplies, Others)
 */
export function ReimburseRateCard({
    data,
}: {
    data: ReimburseRateSummary;
}) {
    const { containerRef, width } = useChartWidth(360);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const trend = data?.trend ?? [];

    const maxCategoryAmount = Math.max(
        ...trend.flatMap((p) => [
            p.categories?.meals ?? 0,
            p.categories?.travels ?? 0,
            p.categories?.supplies ?? 0,
            p.categories?.others ?? 0,
        ]),
        50_000,
    );

    const activePoint =
        hoveredIdx !== null ? trend[hoveredIdx] : trend[trend.length - 1];

    const totalPoints = trend.length;
    const padX = 12;
    const topY = 12;
    const baselineY = 88;
    const chartHeight = baselineY - topY;
    const svgHeight = 104;

    const slotWidth = (width - padX * 2) / Math.max(totalPoints, 1);
    const barGap = 2;
    const maxClusterWidth = 44;
    const clusterWidth = Math.min(
        Math.max(16, slotWidth - 8),
        maxClusterWidth
    );
    const barWidth = Math.max(2.5, (clusterWidth - barGap * 3) / 4);
    const actualClusterWidth = barWidth * 4 + barGap * 3;

    return (
        <Card className="flex h-full flex-col justify-between overflow-hidden p-0 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 p-3 pb-1">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                        <Receipt className="size-4 shrink-0 aspect-square" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                            Reimbursement
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                            Breakdown 4 kategori klaim
                        </div>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">
                        {formatRupiahCompact(data.current_approved_amount)}
                    </div>
                    <div className="text-[10px] font-medium text-teal-600 dark:text-teal-400">
                        {data.current_total_count} klaim
                    </div>
                </div>
            </div>

            {/* 4-Bar Chart Container */}
            <div className="px-3 pt-1">
                <div
                    ref={containerRef}
                    className="relative overflow-hidden rounded-md border bg-muted/10 pt-1.5 pb-1 px-0"
                >
                    <svg
                        viewBox={`0 0 ${width} ${svgHeight}`}
                        className="h-[104px] w-full"
                        role="img"
                        aria-label="Reimburse 4 Category Bar Chart"
                    >
                        {/* Gridlines */}
                        {[26, 50, 74].map((y) => (
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

                        {/* Clusters for each period */}
                        {trend.map((pt, i) => {
                            const slotCenterX =
                                padX + i * slotWidth + slotWidth / 2;
                            const clusterStartX =
                                slotCenterX - actualClusterWidth / 2;
                            const isHovered = hoveredIdx === i;

                            return (
                                <g key={pt.period}>
                                    {/* Subtle pill highlight when cluster is hovered */}
                                    {isHovered && (
                                        <rect
                                            x={padX + i * slotWidth + 2}
                                            y={topY - 4}
                                            width={slotWidth - 4}
                                            height={chartHeight + 6}
                                            rx={4}
                                            fill="currentColor"
                                            className="text-muted/15"
                                        />
                                    )}

                                    {/* 4 Distinct Bars representing the 4 categories */}
                                    {REIMBURSE_BAR_CATEGORIES.map((cat, catIdx) => {
                                        const amount =
                                            pt.categories?.[cat.key] ?? 0;
                                        const barHeight =
                                            maxCategoryAmount > 0 && amount > 0
                                                ? Math.max(
                                                      3,
                                                      (amount / maxCategoryAmount) *
                                                          chartHeight
                                                  )
                                                : 0;
                                        const barX =
                                            clusterStartX +
                                            catIdx * (barWidth + barGap);
                                        const barY = baselineY - barHeight;

                                        if (barHeight <= 0) return null;

                                        return (
                                            <rect
                                                key={cat.key}
                                                x={barX}
                                                y={barY}
                                                width={barWidth}
                                                height={barHeight}
                                                rx={Math.min(2, barWidth / 2)}
                                                fill={cat.color}
                                                opacity={
                                                    hoveredIdx === null || isHovered
                                                        ? 1
                                                        : 0.45
                                                }
                                                className="transition-all duration-200"
                                            >
                                                <title>
                                                    {`${pt.label} - ${cat.label}: ${formatRupiahCompact(amount)}`}
                                                </title>
                                            </rect>
                                        );
                                    })}
                                </g>
                            );
                        })}

                        {/* Interactive Hitboxes */}
                        {trend.map((pt, i) => {
                            return (
                                <rect
                                    key={`hit-${pt.period}`}
                                    x={padX + i * slotWidth}
                                    y="0"
                                    width={slotWidth}
                                    height={baselineY}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            );
                        })}
                    </svg>

                    {/* Month Labels */}
                    <div className="flex justify-between px-2.5 pt-0.5 text-[10px] text-muted-foreground">
                        {trend.map((pt, i) => (
                            <span
                                key={pt.period}
                                className={`transition-colors cursor-pointer ${
                                    hoveredIdx === i
                                        ? 'font-bold text-foreground'
                                        : ''
                                }`}
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                {pt.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Active Month Breakdown per Category */}
                <div className="mt-1.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-semibold text-foreground truncate">
                            {activePoint?.label}
                        </span>
                        <span className="truncate">
                            Total:{' '}
                            <strong className="text-foreground">
                                {formatRupiahCompact(
                                    activePoint?.approved_amount ?? 0
                                )}
                            </strong>
                        </span>
                        <span className="truncate text-muted-foreground">
                            {activePoint?.approved_count ?? 0} disetujui
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[9px]">
                        {REIMBURSE_BAR_CATEGORIES.map((cat) => (
                            <div
                                key={cat.key}
                                className="flex items-center gap-1 min-w-0"
                            >
                                <span
                                    className="size-1.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="truncate text-muted-foreground">
                                    {cat.label}:
                                </span>
                                <span className="font-semibold text-foreground truncate">
                                    {formatRupiahCompact(
                                        activePoint?.categories?.[cat.key] ?? 0
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer / Legend */}
            <div className="mt-2 flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2 flex-wrap">
                    {REIMBURSE_BAR_CATEGORIES.map((cat) => (
                        <span
                            key={cat.key}
                            className="inline-flex items-center gap-1 font-medium text-foreground"
                        >
                            <span
                                className="size-2 shrink-0 aspect-square rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            {cat.label}
                        </span>
                    ))}
                </div>
                <span className="shrink-0 text-muted-foreground">
                    Avg: {formatRupiahCompact(data.avg_claim_amount)}
                </span>
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
