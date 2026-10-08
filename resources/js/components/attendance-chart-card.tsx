import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

export type AttendancePoint = {
    date: string;
    label: string;
    present: number;
    late: number;
    on_leave: number;
    absent: number;
    attendance_rate: number;
};

export function AttendanceChartCard({
    attendanceChart,
    activeRange = 'this_week',
    onRangeChange,
    routeUrl,
    queryParams = {},
    open,
    onOpenChange,
}: {
    attendanceChart: AttendancePoint[];
    activeRange?: string;
    onRangeChange?: (range: string) => void;
    routeUrl?: string;
    queryParams?: Record<string, unknown>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(true);
    const isOpen = open !== undefined ? open : internalOpen;

    const handleOpenChange = (next: boolean) => {
        if (onOpenChange) {
            onOpenChange(next);
        } else {
            setInternalOpen(next);
        }
    };

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const rangeOptions = [
        { value: 'today', label: 'Hari Ini' },
        { value: 'this_week', label: 'Minggu Ini' },
        { value: 'this_month', label: 'Bulan Ini' },
    ];

    const maxAttendanceValue = Math.max(
        ...attendanceChart.flatMap((day) => [
            day.present,
            day.late,
            day.on_leave,
            day.absent,
        ]),
        1,
    );

    const handleRangeClick = (value: string) => {
        if (onRangeChange) {
            onRangeChange(value);
            return;
        }

        if (routeUrl) {
            router.get(
                routeUrl,
                { ...queryParams, range: value },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const seriesList = [
        { key: 'present', color: '#10b981', label: 'Hadir' },
        { key: 'late', color: '#f59e0b', label: 'Terlambat' },
        { key: 'on_leave', color: '#3b82f6', label: 'Cuti' },
        { key: 'absent', color: '#94a3b8', label: 'Absen' },
    ];

    const totalPoints = attendanceChart.length;
    const padX = 24;
    const width = 1000;
    const topY = 20;
    const baseY = 190;
    const chartHeight = baseY - topY; // 170

    // Coordinates helper
    const getX = (index: number) => {
        if (totalPoints <= 1) return width / 2;
        return padX + (index / (totalPoints - 1)) * (width - padX * 2);
    };

    const getY = (val: number) => {
        return baseY - (val / maxAttendanceValue) * chartHeight;
    };

    const activeItem =
        hoveredIndex !== null && attendanceChart[hoveredIndex]
            ? attendanceChart[hoveredIndex]
            : null;

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="rounded-lg border bg-card text-card-foreground shadow-xs"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold">
                        Chart Riwayat Kehadiran
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Komposisi hadir, terlambat, cuti, dan absen per hari.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    {isOpen &&
                        rangeOptions.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={
                                    activeRange === option.value
                                        ? 'default'
                                        : 'outline'
                                }
                                className="h-7 px-2.5 text-xs"
                                onClick={() => handleRangeClick(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                        >
                            <ChevronDown
                                className={`size-3.5 transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                }`}
                            />
                            <span>{isOpen ? 'Sembunyikan' : 'Tampilkan'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
            </div>

            <CollapsibleContent>
                <div className="border-t px-4 pt-3 pb-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5 text-xs">
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px]">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                Hadir
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px]">
                                <span className="size-2 rounded-full bg-amber-500" />
                                Terlambat
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px]">
                                <span className="size-2 rounded-full bg-blue-500" />
                                Cuti
                            </div>
                            <div className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px]">
                                <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                Absen
                            </div>
                        </div>

                        {activeItem && (
                            <div className="text-xs text-muted-foreground animate-in fade-in">
                                <span className="mr-1.5 font-semibold text-foreground">
                                    {activeItem.label}:
                                </span>
                                <span className="mr-2 font-medium text-emerald-600">
                                    {activeItem.present} Hadir
                                </span>
                                <span className="mr-2 font-medium text-amber-600">
                                    {activeItem.late} Telat
                                </span>
                                <span className="mr-2 font-medium text-blue-600">
                                    {activeItem.on_leave} Cuti
                                </span>
                                <span className="font-medium text-slate-500">
                                    {activeItem.absent} Absen
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="w-full overflow-hidden">
                        <svg
                            viewBox={`0 0 ${width} 220`}
                            preserveAspectRatio="none"
                            className="h-56 w-full cursor-crosshair"
                            role="img"
                            aria-label="Line chart riwayat kehadiran"
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Horizontal Gridlines (Sumbu X) - Full Width dari x1=0 ke x2=1000 */}
                            {[0, 1, 2, 3].map((step) => {
                                const y = topY + step * (chartHeight / 4);
                                return (
                                    <line
                                        key={step}
                                        x1="0"
                                        x2={width}
                                        y1={y}
                                        y2={y}
                                        stroke="currentColor"
                                        className="text-border/60"
                                        strokeDasharray="4 4"
                                        strokeWidth="1"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })}

                            {/* Solid Horizontal Baseline (Garis X Utama) - Full Width */}
                            <line
                                x1="0"
                                x2={width}
                                y1={baseY}
                                y2={baseY}
                                stroke="currentColor"
                                className="text-border"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />

                            {/* Active vertical hover guideline */}
                            {hoveredIndex !== null && (
                                <line
                                    x1={getX(hoveredIndex)}
                                    x2={getX(hoveredIndex)}
                                    y1={topY}
                                    y2={baseY}
                                    stroke="currentColor"
                                    className="text-muted-foreground/40"
                                    strokeDasharray="3 3"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                />
                            )}

                            {/* Series Polylines */}
                            {seriesList.map((series) => {
                                const polylinePoints = attendanceChart
                                    .map((day, idx) => {
                                        const val = Number(
                                            day[
                                                series.key as keyof AttendancePoint
                                            ] ?? 0,
                                        );
                                        return `${getX(idx)},${getY(val)}`;
                                    })
                                    .join(' ');

                                return (
                                    <g key={series.key}>
                                        {totalPoints > 1 && (
                                            <polyline
                                                points={polylinePoints}
                                                fill="none"
                                                stroke={series.color}
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                vectorEffect="non-scaling-stroke"
                                            />
                                        )}

                                        {/* Data point dots */}
                                        {attendanceChart.map((day, idx) => {
                                            const val = Number(
                                                day[
                                                    series.key as keyof AttendancePoint
                                                ] ?? 0,
                                            );
                                            const cx = getX(idx);
                                            const cy = getY(val);
                                            const isHovered =
                                                hoveredIndex === idx;

                                            return (
                                                <circle
                                                    key={`${series.key}-${idx}`}
                                                    cx={cx}
                                                    cy={cy}
                                                    r={
                                                        isHovered
                                                            ? 5
                                                            : totalPoints <= 12
                                                              ? 3.5
                                                              : 2.5
                                                    }
                                                    fill={series.color}
                                                    stroke="white"
                                                    strokeWidth={
                                                        isHovered ? 2 : 1
                                                    }
                                                    vectorEffect="non-scaling-stroke"
                                                    className="transition-all"
                                                />
                                            );
                                        })}
                                    </g>
                                );
                            })}

                            {/* Transparent hover capture bands across full height */}
                            {attendanceChart.map((day, idx) => {
                                const xCenter = getX(idx);
                                const bandWidth =
                                    totalPoints > 1
                                        ? (width - padX * 2) / (totalPoints - 1)
                                        : width;
                                const bandLeft = xCenter - bandWidth / 2;

                                return (
                                    <rect
                                        key={`hover-${day.date}`}
                                        x={Math.max(bandLeft, 0)}
                                        y={0}
                                        width={bandWidth}
                                        height={220}
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() =>
                                            setHoveredIndex(idx)
                                        }
                                    />
                                );
                            })}
                        </svg>

                        {/* Date labels below chart - aligned across full width */}
                        <div
                            className="mt-2 flex justify-between gap-1 text-[11px] text-muted-foreground"
                            style={{
                                paddingLeft: `${(padX / width) * 100}%`,
                                paddingRight: `${(padX / width) * 100}%`,
                            }}
                        >
                            {attendanceChart.map((day, idx) => {
                                const step =
                                    totalPoints > 20
                                        ? 4
                                        : totalPoints > 12
                                          ? 2
                                          : 1;
                                const isVisible =
                                    idx === 0 ||
                                    idx === totalPoints - 1 ||
                                    idx % step === 0;

                                return (
                                    <span
                                        key={day.date}
                                        className={`truncate text-center ${
                                            isVisible
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        } ${hoveredIndex === idx ? 'font-semibold text-foreground' : ''}`}
                                    >
                                        {day.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
