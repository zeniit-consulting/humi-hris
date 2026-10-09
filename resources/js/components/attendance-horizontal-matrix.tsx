import { Link } from '@inertiajs/react';
import { useState } from 'react';

export type HorizontalMatrixDate = {
    date: string;
    day_name: string;
    day_num: string;
    month_short: string;
    is_today: boolean;
    is_weekend: boolean;
    is_past: boolean;
};

export type HorizontalMatrixCell = {
    shift_code: string;
    status: 'present' | 'late' | 'on_leave' | 'absent' | 'missing' | 'off' | 'scheduled' | 'wfa';
    status_label: string;
    check_in?: string | null;
    check_out?: string | null;
    late_minutes?: number | null;
};

export type HorizontalMatrixRow = {
    employee_id: number;
    employee_code: string;
    employee_name: string;
    days: Record<string, HorizontalMatrixCell>;
    summary: {
        present: number;
        late: number;
        on_leave: number;
        absent: number;
        missing: number;
        wfa?: number;
    };
};

export type HorizontalViewData = {
    dates: HorizontalMatrixDate[];
    rows: HorizontalMatrixRow[];
    range: string;
    start_date: string;
    end_date: string;
};

const getStatusBadgeStyle = (status: HorizontalMatrixCell['status']) => {
    switch (status) {
        case 'present':
            return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-200';
        case 'late':
            return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-200';
        case 'on_leave':
            return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200';
        case 'wfa':
            return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-200';
        case 'absent':
            return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-200';
        case 'missing':
            return 'bg-slate-100 text-slate-700 border-dashed border-slate-300 dark:bg-slate-800/70 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200';
        case 'off':
            return 'bg-muted/30 text-muted-foreground/60 border-transparent hover:bg-muted/50';
        case 'scheduled':
        default:
            return 'bg-background text-muted-foreground border-border hover:bg-muted/30';
    }
};

export function AttendanceHorizontalMatrix({
    data,
}: {
    data: HorizontalViewData;
}) {
    const [hoveredCell, setHoveredCell] = useState<{
        employeeName: string;
        date: string;
        cell: HorizontalMatrixCell;
    } | null>(null);

    const { dates, rows } = data;

    if (!dates || dates.length === 0 || !rows || rows.length === 0) {
        return (
            <div className="flex h-44 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Tidak ada data karyawan atau jadwal pada rentang ini.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Legend & Detail Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground font-medium">Status:</span>
                    <div className="inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Hadir
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        <span className="size-2 rounded-full bg-amber-500" />
                        Keterlambatan
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                        <span className="size-2 rounded-full bg-blue-500" />
                        Cuti
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded border border-indigo-300 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                        <span className="size-2 rounded-full bg-indigo-500" />
                        WFA
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                        <span className="size-2 rounded-full bg-rose-500" />
                        Absen
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded border border-dashed border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                        <span className="size-2 rounded-full bg-slate-400" />
                        Tidak Absen
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded border border-transparent bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                        <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        Libur (OFF)
                    </div>
                </div>

                {hoveredCell && (
                    <div className="rounded-md border bg-muted/40 px-2.5 py-1 text-xs animate-in fade-in">
                        <span className="font-semibold text-foreground mr-1.5">
                            {hoveredCell.employeeName} ({hoveredCell.date}):
                        </span>
                        <span className="font-medium mr-1.5">{hoveredCell.cell.status_label}</span>
                        <span className="text-muted-foreground mr-1.5">· Kode: {hoveredCell.cell.shift_code}</span>
                        {hoveredCell.cell.check_in && (
                            <span className="text-foreground">
                                · Jam: {hoveredCell.cell.check_in}
                                {hoveredCell.cell.check_out ? ` - ${hoveredCell.cell.check_out}` : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-lg border bg-card shadow-2xs">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30 text-xs">
                            {/* Sticky Left Column: Employee */}
                            <th className="sticky left-0 z-20 min-w-[200px] border-r bg-muted/80 p-2.5 font-semibold text-foreground backdrop-blur-xs shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                Karyawan
                            </th>

                            {/* Date Columns */}
                            {dates.map((d) => (
                                <th
                                    key={d.date}
                                    className={`min-w-[46px] p-1.5 text-center transition-colors ${
                                        d.is_today
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : d.is_weekend
                                              ? 'bg-muted/60 text-muted-foreground font-medium'
                                              : 'text-foreground'
                                    }`}
                                >
                                    <div className="text-[10px] uppercase leading-tight tracking-wider opacity-80">
                                        {d.day_name}
                                    </div>
                                    <div className="text-xs font-bold leading-tight">
                                        {d.day_num}
                                    </div>
                                </th>
                            ))}

                            {/* Summary Column */}
                            <th className="min-w-[130px] border-l bg-muted/50 p-2 text-center text-xs font-semibold">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                        {rows.map((row) => (
                            <tr
                                key={row.employee_id}
                                className="transition-colors hover:bg-muted/20"
                            >
                                {/* Sticky Employee Name Cell */}
                                <td className="sticky left-0 z-10 border-r bg-card p-2.5 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                    <Link
                                        href={`/hris/attendances/employees/${row.employee_id}/monthly?period=${data.start_date.slice(0, 7)}`}
                                        className="group block"
                                        title={`Buka riwayat bulanan ${row.employee_name}`}
                                    >
                                        <p className="truncate font-medium text-foreground group-hover:text-primary group-hover:underline">
                                            {row.employee_name}
                                        </p>
                                        <p className="font-mono text-[11px] text-muted-foreground">
                                            {row.employee_code}
                                        </p>
                                    </Link>
                                </td>

                                {/* Date Cells */}
                                {dates.map((d) => {
                                    const cell = row.days[d.date] ?? {
                                        shift_code: '-',
                                        status: 'scheduled',
                                        status_label: 'Terjadwal',
                                    };

                                    return (
                                        <td
                                            key={`${row.employee_id}-${d.date}`}
                                            className={`p-1 text-center align-middle ${
                                                d.is_today
                                                    ? 'bg-primary/5'
                                                    : d.is_weekend
                                                      ? 'bg-muted/15'
                                                      : ''
                                            }`}
                                        >
                                            <div
                                                className="flex items-center justify-center"
                                                onMouseEnter={() =>
                                                    setHoveredCell({
                                                        employeeName: row.employee_name,
                                                        date: `${d.day_name}, ${d.day_num} ${d.month_short}`,
                                                        cell,
                                                    })
                                                }
                                                onMouseLeave={() => setHoveredCell(null)}
                                            >
                                                <div
                                                    title={`${row.employee_name} (${d.day_name}, ${d.day_num} ${d.month_short}): ${cell.status_label} | Jadwal: ${cell.shift_code}${cell.check_in ? ` | Masuk: ${cell.check_in}` : ''}${cell.check_out ? ` | Pulang: ${cell.check_out}` : ''}`}
                                                    className={`flex size-7.5 items-center justify-center rounded border font-mono text-[11px] font-bold transition-all cursor-pointer select-none ${getStatusBadgeStyle(
                                                        cell.status,
                                                    )}`}
                                                >
                                                    {cell.shift_code}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}

                                {/* Summary Counts */}
                                <td className="border-l bg-muted/10 p-2 align-middle text-center">
                                    <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                                        <span
                                            title="Hadir"
                                            className="font-semibold text-emerald-600 dark:text-emerald-400"
                                        >
                                            {row.summary.present}H
                                        </span>
                                        <span className="text-muted-foreground/40">·</span>
                                        <span
                                            title="Terlambat"
                                            className="font-semibold text-amber-600 dark:text-amber-400"
                                        >
                                            {row.summary.late}T
                                        </span>
                                        <span className="text-muted-foreground/40">·</span>
                                        <span
                                            title="Cuti"
                                            className="font-semibold text-blue-600 dark:text-blue-400"
                                        >
                                            {row.summary.on_leave}C
                                        </span>
                                        <span className="text-muted-foreground/40">·</span>
                                        <span
                                            title="Absen"
                                            className="font-semibold text-rose-600 dark:text-rose-400"
                                        >
                                            {row.summary.absent}A
                                        </span>
                                        {(row.summary.wfa ?? 0) > 0 && (
                                            <>
                                                <span className="text-muted-foreground/40">·</span>
                                                <span
                                                    title="WFA (Bebas Absensi)"
                                                    className="font-semibold text-indigo-600 dark:text-indigo-400"
                                                >
                                                    {row.summary.wfa}WFA
                                                </span>
                                            </>
                                        )}
                                        {row.summary.missing > 0 && (
                                            <>
                                                <span className="text-muted-foreground/40">·</span>
                                                <span
                                                    title="Tidak Melakukan Absensi"
                                                    className="font-semibold text-slate-500"
                                                >
                                                    {row.summary.missing}TA
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
