import {
    Building2,
    CheckCircle2,
    Receipt,
    UserCheck,
    UserMinus,
    Users,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

export type GenderByDivisionData = {
    divisions: Array<{
        id: number;
        name: string;
        male: number;
        female: number;
        other: number;
        total: number;
    }>;
    overall: {
        male: number;
        female: number;
        other: number;
        total: number;
    };
};

export type PayrollByDivisionData = {
    total: number;
    divisions: Array<{
        id: number;
        name: string;
        amount: number;
        percentage: number;
        employees_count: number;
    }>;
};

export type ReimburseByDivisionData = {
    total: number;
    divisions: Array<{
        id: number;
        name: string;
        amount: number;
        percentage: number;
        count: number;
    }>;
};

export type ResignReasonsData = {
    total: number;
    reasons: Array<{
        key: string;
        label: string;
        count: number;
        percentage: number;
    }>;
};

export type PieChartsData = {
    gender_by_division: GenderByDivisionData;
    payroll_by_division: PayrollByDivisionData;
    reimburse_by_division: ReimburseByDivisionData;
    resign_reasons: ResignReasonsData;
};

type DonutSlice = {
    label: string;
    value: number;
    percentage: number;
    color: string;
    formattedValue?: string;
};

const PALETTE = [
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#3b82f6', // Blue
    '#f97316', // Orange
    '#14b8a6', // Teal
    '#e11d48', // Rose
];

function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleInDegrees: number
) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians),
    };
}

function describeArc(
    cx: number,
    cy: number,
    rIn: number,
    rOut: number,
    startAngle: number,
    endAngle: number
) {
    const p1 = polarToCartesian(cx, cy, rOut, startAngle);
    const p2 = polarToCartesian(cx, cy, rOut, endAngle);
    const p3 = polarToCartesian(cx, cy, rIn, endAngle);
    const p4 = polarToCartesian(cx, cy, rIn, startAngle);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`;
}

function DonutSvg({
    slices,
    centerValue,
    centerLabel,
    hoveredIndex,
    onHover,
}: {
    slices: DonutSlice[];
    centerValue: string;
    centerLabel: string;
    hoveredIndex: number | null;
    onHover: (index: number | null) => void;
}) {
    const size = 130;
    const center = size / 2;
    const innerRadius = 34;
    const outerRadius = 52;

    const validSlices = slices.filter((s) => s.value > 0);
    const total = validSlices.reduce((acc, s) => acc + s.value, 0);

    const hasMultipleSlices = validSlices.length > 1;
    const gapAngle = hasMultipleSlices ? 2.5 : 0;

    let currentAngle = 0;
    const arcPaths = validSlices.map((slice, index) => {
        const sliceAngle = total > 0 ? (slice.value / total) * 360 : 0;
        const start = currentAngle + gapAngle / 2;
        const end = currentAngle + sliceAngle - gapAngle / 2;
        currentAngle += sliceAngle;

        const midAngle = (start + end) / 2;
        const rad = ((midAngle - 90) * Math.PI) / 180.0;
        const dx = Math.cos(rad) * 2.5;
        const dy = Math.sin(rad) * 2.5;

        return {
            slice,
            index,
            d: describeArc(center, center, innerRadius, outerRadius, start, end),
            dx,
            dy,
        };
    });

    return (
        <div className="relative flex shrink-0 items-center justify-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible"
            >
                {/* Background Track Donut */}
                <circle
                    cx={center}
                    cy={center}
                    r={(innerRadius + outerRadius) / 2}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={outerRadius - innerRadius}
                    className="text-muted/15"
                />

                {/* If exactly 1 slice with 100% */}
                {validSlices.length === 1 && (
                    <circle
                        cx={center}
                        cy={center}
                        r={(innerRadius + outerRadius) / 2}
                        fill="none"
                        stroke={validSlices[0].color}
                        strokeWidth={outerRadius - innerRadius}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => onHover(0)}
                        onMouseLeave={() => onHover(null)}
                    />
                )}

                {/* Slices using true SVG Arc Paths without overlaps or stepped notches */}
                {hasMultipleSlices &&
                    arcPaths.map((item) => {
                        const isHovered = hoveredIndex === item.index;
                        const isDimmed =
                            hoveredIndex !== null && hoveredIndex !== item.index;

                        return (
                            <path
                                key={item.index}
                                d={item.d}
                                fill={item.slice.color}
                                className="cursor-pointer transition-all duration-200"
                                style={{
                                    transform: isHovered
                                        ? `translate(${item.dx.toFixed(2)}px, ${item.dy.toFixed(2)}px)`
                                        : 'translate(0px, 0px)',
                                    opacity: isDimmed ? 0.35 : 1,
                                    filter: isHovered
                                        ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))'
                                        : 'none',
                                }}
                                onMouseEnter={() => onHover(item.index)}
                                onMouseLeave={() => onHover(null)}
                            />
                        );
                    })}
            </svg>

            {/* Inner Center Label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="truncate max-w-[85px] text-[13px] font-bold leading-tight tracking-tight text-foreground">
                    {centerValue}
                </span>
                <span className="truncate max-w-[80px] text-[10px] text-muted-foreground leading-none mt-0.5">
                    {centerLabel}
                </span>
            </div>
        </div>
    );
}

/**
 * 1. Gender per Divisi
 */
export function GenderByDivisionCard({
    data,
}: {
    data: GenderByDivisionData;
}) {
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const activeDivision =
        selectedDivisionId === 'all'
            ? null
            : data.divisions.find(
                  (d) => String(d.id) === selectedDivisionId
              );

    const counts = activeDivision
        ? {
              male: activeDivision.male,
              female: activeDivision.female,
              other: activeDivision.other,
              total: activeDivision.total,
          }
        : data.overall;

    const total = counts.total;
    const slices: DonutSlice[] = [
        {
            label: 'Laki-laki',
            value: counts.male,
            percentage:
                total > 0 ? Math.round((counts.male / total) * 100) : 0,
            color: '#3b82f6',
            formattedValue: `${counts.male} orang`,
        },
        {
            label: 'Perempuan',
            value: counts.female,
            percentage:
                total > 0 ? Math.round((counts.female / total) * 100) : 0,
            color: '#ec4899',
            formattedValue: `${counts.female} orang`,
        },
    ];

    if (counts.other > 0) {
        slices.push({
            label: 'Lainnya',
            value: counts.other,
            percentage:
                total > 0 ? Math.round((counts.other / total) * 100) : 0,
            color: '#94a3b8',
            formattedValue: `${counts.other} orang`,
        });
    }

    const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
        <Card className="flex flex-col justify-between border-sky-100/80 bg-card py-3 shadow-xs dark:border-sky-950/40">
            <CardHeader className="px-3 pb-1">
                <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                            <Users className="size-3.5" />
                        </span>
                        <CardTitle className="truncate text-xs font-semibold">
                            Gender per Divisi
                        </CardTitle>
                    </div>

                    <Select
                        value={selectedDivisionId}
                        onValueChange={setSelectedDivisionId}
                    >
                        <SelectTrigger className="h-6 w-[110px] text-[10px] px-1.5">
                            <SelectValue placeholder="Pilih divisi" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="all" className="text-xs">
                                Semua Divisi
                            </SelectItem>
                            {data.divisions.map((d) => (
                                <SelectItem
                                    key={d.id}
                                    value={String(d.id)}
                                    className="text-xs"
                                >
                                    {d.name} ({d.total})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="px-3 pt-2">
                <div className="flex items-center gap-3">
                    <DonutSvg
                        slices={slices}
                        centerValue={
                            activeSlice
                                ? `${activeSlice.percentage}%`
                                : `${total}`
                        }
                        centerLabel={
                            activeSlice ? activeSlice.label : 'Karyawan'
                        }
                        hoveredIndex={hoveredIndex}
                        onHover={setHoveredIndex}
                    />

                    {/* Compact Legend */}
                    <div className="flex flex-1 flex-col gap-1.5 text-xs">
                        {slices.map((slice, i) => (
                            <div
                                key={slice.label}
                                className={`flex items-center justify-between gap-1 rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer ${
                                    hoveredIndex === i
                                        ? 'bg-muted font-medium'
                                        : 'hover:bg-muted/50'
                                }`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                        className="size-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: slice.color }}
                                    />
                                    <span className="truncate text-[11px] text-muted-foreground">
                                        {slice.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 text-[11px]">
                                    <span className="font-semibold text-foreground">
                                        {slice.value}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        ({slice.percentage}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * 2. Total Payroll per Divisi
 */
export function PayrollByDivisionCard({
    data,
}: {
    data: PayrollByDivisionData;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const nonZeroDivisions = (data.divisions || []).filter(
        (d) => d.amount > 0
    );

    const slices: DonutSlice[] = nonZeroDivisions.map((d, index) => ({
        label: d.name,
        value: d.amount,
        percentage: d.percentage,
        color: PALETTE[index % PALETTE.length],
        formattedValue: formatRupiahCompact(d.amount),
    }));

    const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
        <Card className="flex flex-col justify-between border-indigo-100/80 bg-card py-3 shadow-xs dark:border-indigo-950/40">
            <CardHeader className="px-3 pb-1">
                <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            <WalletCards className="size-3.5" />
                        </span>
                        <CardTitle className="truncate text-xs font-semibold">
                            Total Payroll per Divisi
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {formatRupiahCompact(data.total)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="px-3 pt-2">
                {slices.length === 0 ? (
                    <div className="flex h-[130px] flex-col items-center justify-center text-center text-xs text-muted-foreground">
                        <WalletCards className="size-6 text-muted mb-1" />
                        <span>Belum ada data payroll</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <DonutSvg
                            slices={slices}
                            centerValue={
                                activeSlice
                                    ? activeSlice.formattedValue ||
                                      `${activeSlice.percentage}%`
                                    : formatRupiahCompact(data.total)
                            }
                            centerLabel={
                                activeSlice ? activeSlice.label : 'Total Gaji'
                            }
                            hoveredIndex={hoveredIndex}
                            onHover={setHoveredIndex}
                        />

                        {/* Top 4 Divisions Legend */}
                        <div className="flex flex-1 flex-col gap-1 text-xs max-h-[130px] overflow-y-auto pr-0.5">
                            {slices.slice(0, 5).map((slice, i) => (
                                <div
                                    key={slice.label}
                                    className={`flex items-center justify-between gap-1 rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer ${
                                        hoveredIndex === i
                                            ? 'bg-muted font-medium'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                            className="size-2 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: slice.color,
                                            }}
                                        />
                                        <span className="truncate text-[10px] text-muted-foreground">
                                            {slice.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 text-[10px]">
                                        <span className="font-semibold text-foreground">
                                            {slice.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {slices.length > 5 && (
                                <span className="text-[9px] text-muted-foreground px-1.5">
                                    +{slices.length - 5} divisi lainnya
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * 3. Total Reimburse per Divisi
 */
export function ReimburseByDivisionCard({
    data,
}: {
    data: ReimburseByDivisionData;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const nonZeroDivisions = (data.divisions || []).filter(
        (d) => d.amount > 0
    );

    const slices: DonutSlice[] = nonZeroDivisions.map((d, index) => ({
        label: d.name,
        value: d.amount,
        percentage: d.percentage,
        color: PALETTE[(index + 3) % PALETTE.length],
        formattedValue: formatRupiahCompact(d.amount),
    }));

    const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
        <Card className="flex flex-col justify-between border-amber-100/80 bg-card py-3 shadow-xs dark:border-amber-950/40">
            <CardHeader className="px-3 pb-1">
                <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <Receipt className="size-3.5" />
                        </span>
                        <CardTitle className="truncate text-xs font-semibold">
                            Total Reimburse per Divisi
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {formatRupiahCompact(data.total)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="px-3 pt-2">
                {slices.length === 0 ? (
                    <div className="flex h-[130px] flex-col items-center justify-center text-center text-xs text-muted-foreground">
                        <Receipt className="size-6 text-muted mb-1" />
                        <span>Belum ada klaim reimburse</span>
                        <span className="text-[10px] text-muted-foreground">
                            Disetujui / dibayar
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <DonutSvg
                            slices={slices}
                            centerValue={
                                activeSlice
                                    ? activeSlice.formattedValue ||
                                      `${activeSlice.percentage}%`
                                    : formatRupiahCompact(data.total)
                            }
                            centerLabel={
                                activeSlice ? activeSlice.label : 'Reimburse'
                            }
                            hoveredIndex={hoveredIndex}
                            onHover={setHoveredIndex}
                        />

                        {/* Divisions Legend */}
                        <div className="flex flex-1 flex-col gap-1 text-xs max-h-[130px] overflow-y-auto pr-0.5">
                            {slices.slice(0, 5).map((slice, i) => (
                                <div
                                    key={slice.label}
                                    className={`flex items-center justify-between gap-1 rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer ${
                                        hoveredIndex === i
                                            ? 'bg-muted font-medium'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                            className="size-2 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: slice.color,
                                            }}
                                        />
                                        <span className="truncate text-[10px] text-muted-foreground">
                                            {slice.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 text-[10px]">
                                        <span className="font-semibold text-foreground">
                                            {slice.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {slices.length > 5 && (
                                <span className="text-[9px] text-muted-foreground px-1.5">
                                    +{slices.length - 5} divisi lainnya
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * 4. Resign Reason
 */
export function ResignReasonsCard({
    data,
}: {
    data: ResignReasonsData;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const nonZeroReasons = (data.reasons || []).filter((r) => r.count > 0);

    const reasonColors: Record<string, string> = {
        resigned: '#f59e0b', // Amber
        contract_ended: '#3b82f6', // Blue
        terminated: '#ef4444', // Red
        retired: '#10b981', // Emerald
        other: '#8b5cf6', // Purple
    };

    const slices: DonutSlice[] = nonZeroReasons.map((r, index) => ({
        label: r.label,
        value: r.count,
        percentage: r.percentage,
        color:
            reasonColors[r.key] || PALETTE[(index + 5) % PALETTE.length],
        formattedValue: `${r.count} orang`,
    }));

    const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
        <Card className="flex h-full flex-col justify-between border-rose-100/80 bg-card py-3 shadow-xs dark:border-rose-950/40">
            <CardHeader className="px-3 pb-1">
                <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            <UserMinus className="size-3.5" />
                        </span>
                        <CardTitle className="truncate text-xs font-semibold">
                            Offboarding Reason
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {data.total} Offboarding
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="px-3 pt-2">
                {slices.length === 0 ? (
                    <div className="flex h-[130px] flex-col items-center justify-center text-center text-xs text-muted-foreground">
                        <CheckCircle2 className="size-6 text-emerald-500 mb-1" />
                        <span>Belum ada karyawan offboarding</span>
                        <span className="text-[10px] text-muted-foreground">
                            Tingkat retensi 100%
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <DonutSvg
                            slices={slices}
                            centerValue={
                                activeSlice
                                    ? `${activeSlice.value}`
                                    : `${data.total}`
                            }
                            centerLabel={
                                activeSlice ? activeSlice.label : 'Offboarding'
                            }
                            hoveredIndex={hoveredIndex}
                            onHover={setHoveredIndex}
                        />

                        {/* Reasons Legend */}
                        <div className="flex flex-1 flex-col gap-1 text-xs max-h-[130px] overflow-y-auto pr-0.5">
                            {slices.map((slice, i) => (
                                <div
                                    key={slice.label}
                                    className={`flex items-center justify-between gap-1 rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer ${
                                        hoveredIndex === i
                                            ? 'bg-muted font-medium'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                            className="size-2 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: slice.color,
                                            }}
                                        />
                                        <span className="truncate text-[10px] text-muted-foreground">
                                            {slice.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 text-[10px]">
                                        <span className="font-semibold text-foreground">
                                            {slice.value}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">
                                            ({slice.percentage}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Section container rendering the 4 Pie Charts in 1 Row on desktop (lg:grid-cols-4)
 */
export function DashboardPieChartsSection({
    data,
}: {
    data?: PieChartsData;
}) {
    if (!data) return null;

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GenderByDivisionCard data={data.gender_by_division} />
            <PayrollByDivisionCard data={data.payroll_by_division} />
            <ReimburseByDivisionCard data={data.reimburse_by_division} />
            <ResignReasonsCard data={data.resign_reasons} />
        </div>
    );
}
