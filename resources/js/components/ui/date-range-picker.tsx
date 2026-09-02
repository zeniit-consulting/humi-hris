import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type DateRange = {
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
};

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    placeholder?: string;
    className?: string;
    align?: 'left' | 'right';
    presets?: Array<{ label: string; range: () => DateRange }>;
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function formatDisplayDate(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}

function formatDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function DateRangePicker({
    value = {},
    onChange,
    placeholder = 'Pilih rentang tanggal...',
    className,
    align = 'left',
    presets,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Initial view month based on value.from or current month
    const [viewDate, setViewDate] = React.useState<Date>(() => {
        if (value.from) {
            const [y, m] = value.from.split('-').map(Number);
            return new Date(y, m - 1, 1);
        }
        return new Date();
    });

    const [tempRange, setTempRange] = React.useState<DateRange>(value);
    const [hoverDate, setHoverDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        setTempRange(value);
    }, [value]);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setTempRange(value);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, value]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (dateStr: string) => {
        if (!tempRange.from || (tempRange.from && tempRange.to)) {
            // First click: start new range
            setTempRange({ from: dateStr, to: undefined });
        } else if (tempRange.from && !tempRange.to) {
            // Second click: end range
            if (dateStr < tempRange.from) {
                const newRange = { from: dateStr, to: tempRange.from };
                setTempRange(newRange);
                onChange?.(newRange);
                setIsOpen(false);
            } else {
                const newRange = { from: tempRange.from, to: dateStr };
                setTempRange(newRange);
                onChange?.(newRange);
                setIsOpen(false);
            }
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        const emptyRange = { from: undefined, to: undefined };
        setTempRange(emptyRange);
        onChange?.(emptyRange);
    };

    const defaultPresets = React.useMemo(() => {
        const today = new Date();
        const todayStr = formatDateString(today);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateString(yesterday);

        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 6);
        const last7Str = formatDateString(last7);

        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 29);
        const last30Str = formatDateString(last30);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        return presets ?? [
            { label: 'Hari Ini', range: () => ({ from: todayStr, to: todayStr }) },
            { label: 'Kemarin', range: () => ({ from: yesterdayStr, to: yesterdayStr }) },
            { label: '7 Hari Terakhir', range: () => ({ from: last7Str, to: todayStr }) },
            { label: '30 Hari Terakhir', range: () => ({ from: last30Str, to: todayStr }) },
            {
                label: 'Bulan Ini',
                range: () => ({ from: formatDateString(startOfMonth), to: formatDateString(endOfMonth) }),
            },
            {
                label: 'Bulan Lalu',
                range: () => ({ from: formatDateString(startOfLastMonth), to: formatDateString(endOfLastMonth) }),
            },
        ];
    }, [presets]);

    // Calendar matrix generator
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

    const calendarDays = React.useMemo(() => {
        const days: Array<{ dateStr: string; dayNumber: number; isCurrentMonth: boolean }> = [];

        // Previous month padding
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const prevDate = new Date(year, month - 1, d);
            days.push({
                dateStr: formatDateString(prevDate),
                dayNumber: d,
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const curDate = new Date(year, month, d);
            days.push({
                dateStr: formatDateString(curDate),
                dayNumber: d,
                isCurrentMonth: true,
            });
        }

        // Next month padding to fill full grid of 35 or 42
        const totalCells = days.length <= 35 ? 35 : 42;
        const remaining = totalCells - days.length;
        for (let d = 1; d <= remaining; d++) {
            const nextDate = new Date(year, month + 1, d);
            days.push({
                dateStr: formatDateString(nextDate),
                dayNumber: d,
                isCurrentMonth: false,
            });
        }

        return days;
    }, [year, month, daysInMonth, firstDayIndex]);

    const isSelected = (dateStr: string) => {
        return tempRange.from === dateStr || tempRange.to === dateStr;
    };

    const isInRange = (dateStr: string) => {
        if (tempRange.from && tempRange.to) {
            return dateStr >= tempRange.from && dateStr <= tempRange.to;
        }
        if (tempRange.from && !tempRange.to && hoverDate) {
            const start = tempRange.from < hoverDate ? tempRange.from : hoverDate;
            const end = tempRange.from < hoverDate ? hoverDate : tempRange.from;
            return dateStr >= start && dateStr <= end;
        }
        return false;
    };

    const isRangeStart = (dateStr: string) => {
        if (tempRange.from && tempRange.to) {
            return dateStr === tempRange.from;
        }
        if (tempRange.from && hoverDate) {
            return dateStr === (tempRange.from < hoverDate ? tempRange.from : hoverDate);
        }
        return dateStr === tempRange.from;
    };

    const isRangeEnd = (dateStr: string) => {
        if (tempRange.from && tempRange.to) {
            return dateStr === tempRange.to;
        }
        if (tempRange.from && hoverDate) {
            return dateStr === (tempRange.from < hoverDate ? hoverDate : tempRange.from);
        }
        return false;
    };

    const displayText = React.useMemo(() => {
        if (value.from && value.to) {
            if (value.from === value.to) {
                return formatDisplayDate(value.from);
            }
            return `${formatDisplayDate(value.from)} - ${formatDisplayDate(value.to)}`;
        }
        if (value.from) {
            return `${formatDisplayDate(value.from)} - ...`;
        }
        return placeholder;
    }, [value, placeholder]);

    return (
        <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]',
                    !value.from && 'text-muted-foreground'
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    <CalendarIcon className="size-4 shrink-0 opacity-60" />
                    <span className="truncate">{displayText}</span>
                </div>
                {value.from ? (
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={handleClear}
                        className="rounded-full p-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <X className="size-3.5 opacity-50 hover:opacity-100" />
                    </span>
                ) : null}
            </button>

            {/* Dropdown Popup */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute top-full z-50 mt-1.5 flex flex-col md:flex-row gap-0 rounded-lg border bg-popover text-popover-foreground shadow-xl outline-none animate-in fade-in-0 zoom-in-95',
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    {/* Presets Sidebar */}
                    <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-border p-2 md:w-40 shrink-0">
                        <span className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Pilihan Cepat
                        </span>
                        {defaultPresets.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                    const r = preset.range();
                                    setTempRange(r);
                                    onChange?.(r);
                                    setIsOpen(false);
                                    if (r.from) {
                                        const [y, m] = r.from.split('-').map(Number);
                                        setViewDate(new Date(y, m - 1, 1));
                                    }
                                }}
                                className="rounded px-2 py-1.5 text-left text-xs font-medium hover:bg-accent hover:text-accent-foreground transition"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendar Body */}
                    <div className="p-3 w-72">
                        {/* Month & Nav */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-foreground">
                                {MONTH_NAMES[month]} {year}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="size-7 p-0"
                                    onClick={handlePrevMonth}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="size-7 p-0"
                                    onClick={handleNextMonth}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 text-center mb-1">
                            {DAY_NAMES.map((d) => (
                                <span key={d} className="text-[11px] font-semibold text-muted-foreground">
                                    {d}
                                </span>
                            ))}
                        </div>

                        {/* Date Grid */}
                        <div className="grid grid-cols-7 gap-y-1 text-center">
                            {calendarDays.map(({ dateStr, dayNumber, isCurrentMonth }) => {
                                const inRange = isInRange(dateStr);
                                const selected = isSelected(dateStr);
                                const start = isRangeStart(dateStr);
                                const end = isRangeEnd(dateStr);

                                return (
                                    <div
                                        key={dateStr}
                                        className={cn(
                                            'relative py-0.5',
                                            inRange && 'bg-primary/10',
                                            start && 'rounded-l-md',
                                            end && 'rounded-r-md'
                                        )}
                                    >
                                        <button
                                            type="button"
                                            disabled={!isCurrentMonth}
                                            onClick={() => handleDateClick(dateStr)}
                                            onMouseEnter={() => {
                                                if (tempRange.from && !tempRange.to) {
                                                    setHoverDate(dateStr);
                                                }
                                            }}
                                            className={cn(
                                                'size-7 mx-auto rounded-md text-xs font-medium transition flex items-center justify-center',
                                                !isCurrentMonth && 'opacity-25 pointer-events-none',
                                                selected
                                                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                    : inRange
                                                      ? 'text-foreground hover:bg-primary/20'
                                                      : 'hover:bg-accent text-foreground'
                                            )}
                                        >
                                            {dayNumber}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
