import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Users,
    UserCheck,
    UserX,
    Search,
    SlidersHorizontal,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Layers,
    UserMinus,
} from 'lucide-react';
import { useMemo, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Employee = {
    id: number;
    employee_code: string;
    full_name: string;
    employment_status: string;
    is_active: boolean;
    face_photo_url?: string | null;
};

type OrgNode = {
    id: number;
    position_code: string;
    employee_code: string;
    full_name: string;
    employees: Employee[];
    employees_count: number;
    is_vacant: boolean;
    is_position_active: boolean;
    exclude_from_org_chart: boolean;
    division_id: number | null;
    division_name: string | null;
    position_name: string | null;
    position_level: number;
    position_level_label: string;
    employment_status: string;
    is_active: boolean;
    cycle_detected: boolean;
    children: OrgNode[];
};

type ManagePosition = {
    id: number;
    code: string;
    name: string;
    division_name: string | null;
    level: number;
    level_label: string;
    is_active: boolean;
    is_vacant: boolean;
    exclude_from_org_chart: boolean;
    employees_count: number;
    parent_position_id: number | null;
};

type Division = {
    id: number;
    name: string;
};

type PageProps = {
    chart: OrgNode[];
    all_positions?: ManagePosition[];
    divisions?: Division[];
    stats?: {
        total_positions?: number;
        total_nodes?: number;
        root_count?: number;
        max_depth?: number;
        filled_positions?: number;
        vacant_positions?: number;
        inactive_positions?: number;
        excluded_positions?: number;
        total_employees?: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Struktur Organisasi',
        href: '/hris/organization-chart',
    },
];

const initials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

function OrgPersonCard({
    node,
    isHighlighted = false,
    collapsed = false,
    onToggleCollapse,
    hasChildren = false,
    childrenCount = 0,
}: {
    node: OrgNode;
    isHighlighted?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    hasChildren?: boolean;
    childrenCount?: number;
}) {
    const isExecutive = node.position_level <= 1;
    const isManager = node.position_level === 2;
    const employees = node.employees ?? [];
    const employeeCount = employees.length;
    const isVacant = node.is_vacant || employeeCount === 0;
    const isInactive = !node.is_position_active;
    const [showAllEmployees, setShowAllEmployees] = useState(false);

    // Accent themes based on hierarchy level
    const headerBg = isInactive
        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        : isVacant
          ? 'bg-amber-100/90 text-amber-900 border-b border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50'
          : node.position_level === 0
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white'
            : node.position_level === 1
              ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white'
              : isManager
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white'
                : node.position_level === 3
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
                  : 'bg-slate-100 text-slate-800 border-b border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';

    const cardBorder = isHighlighted
        ? 'ring-4 ring-indigo-500/80 ring-offset-2 border-indigo-600 shadow-xl'
        : isInactive
          ? 'border-dashed border-slate-300 bg-slate-50/80 opacity-75 dark:border-slate-700 dark:bg-slate-900/60'
          : isVacant
            ? 'border-dashed border-amber-400/80 bg-amber-50/30 shadow-sm hover:border-amber-500 dark:border-amber-700/60 dark:bg-amber-950/20'
            : 'border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900';

    const mainEmployee = employees[0];

    return (
        <div
            className={`group relative flex w-[230px] flex-col overflow-hidden rounded-xl border transition-all duration-200 ${cardBorder}`}
        >
            {/* Card Header: Position Title & Badges */}
            <div className={`px-3 py-2 ${headerBg}`}>
                <div className="flex items-center justify-between gap-1.5 text-[10px]">
                    <span className="font-mono font-bold tracking-wider uppercase opacity-90">
                        {node.position_code}
                    </span>
                    <div className="flex items-center gap-1">
                        {isInactive ? (
                            <Badge
                                variant="outline"
                                className="border-red-400 bg-red-100 text-[9px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
                            >
                                Nonaktif
                            </Badge>
                        ) : isVacant ? (
                            <Badge
                                variant="outline"
                                className="border-amber-400 bg-amber-100 text-[9px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                            >
                                Lowong
                            </Badge>
                        ) : (
                            <Badge
                                variant="secondary"
                                className="bg-white/20 text-[9px] font-semibold text-inherit backdrop-blur-xs"
                            >
                                Lvl {node.position_level}
                            </Badge>
                        )}
                    </div>
                </div>

                <h4 className="mt-1 line-clamp-2 text-xs font-bold leading-tight tracking-wide">
                    {node.position_name ?? node.position_level_label}
                </h4>

                {node.division_name && (
                    <p className="mt-0.5 truncate text-[10px] font-medium opacity-85">
                        {node.division_name}
                    </p>
                )}
            </div>

            {/* Card Body: Employee Details or Vacancy State */}
            <div className="flex-1 p-2.5">
                {isVacant ? (
                    <div className="flex items-center gap-2.5 py-1 text-amber-800/80 dark:text-amber-300/80">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-amber-400 bg-amber-100/60 dark:bg-amber-900/40">
                            <UserMinus className="size-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                                Posisi Lowong
                            </p>
                            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                                Belum ada karyawan
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {/* Primary Employee */}
                        <div className="flex items-center gap-2.5">
                            <Avatar className="size-9 shrink-0 border border-slate-200 dark:border-slate-700">
                                {mainEmployee.face_photo_url ? (
                                    <AvatarImage
                                        src={mainEmployee.face_photo_url}
                                        alt={mainEmployee.full_name}
                                        className="object-cover"
                                    />
                                ) : null}
                                <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {initials(mainEmployee.full_name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                                    {mainEmployee.full_name}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                        {mainEmployee.employee_code}
                                    </span>
                                    {mainEmployee.employment_status && (
                                        <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-medium uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                            {mainEmployee.employment_status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Multiple Employees Indicator */}
                        {employeeCount > 1 && (
                            <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAllEmployees(!showAllEmployees)
                                    }
                                    className="flex w-full items-center justify-between text-[10px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    <span>
                                        +{employeeCount - 1} karyawan lainnya
                                    </span>
                                    {showAllEmployees ? (
                                        <ChevronUp className="size-3" />
                                    ) : (
                                        <ChevronDown className="size-3" />
                                    )}
                                </button>

                                {showAllEmployees && (
                                    <div className="mt-1.5 max-h-32 space-y-1.5 overflow-y-auto pr-1">
                                        {employees.slice(1).map((emp) => (
                                            <div
                                                key={emp.id}
                                                className="flex items-center gap-2 rounded bg-slate-50 p-1 dark:bg-slate-800/60"
                                            >
                                                <Avatar className="size-6 border">
                                                    {emp.face_photo_url && (
                                                        <AvatarImage
                                                            src={
                                                                emp.face_photo_url
                                                            }
                                                            alt={emp.full_name}
                                                        />
                                                    )}
                                                    <AvatarFallback className="text-[9px]">
                                                        {initials(
                                                            emp.full_name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[10px] font-medium">
                                                        {emp.full_name}
                                                    </p>
                                                    <p className="font-mono text-[8px] text-slate-400">
                                                        {emp.employee_code}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Collapse/Expand Toggle Button at bottom of card */}
            {hasChildren && (
                <div className="flex justify-center border-t border-slate-100 bg-slate-50/70 p-1 dark:border-slate-800 dark:bg-slate-800/40">
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-700"
                        title={
                            collapsed
                                ? 'Buka bawahan'
                                : 'Sembunyikan bawahan'
                        }
                    >
                        {collapsed ? (
                            <>
                                <ChevronDown className="size-3 text-indigo-600" />
                                <span>{childrenCount} bawahan ditutup</span>
                            </>
                        ) : (
                            <>
                                <ChevronUp className="size-3" />
                                <span>{childrenCount} bawahan</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

function OrgTreeNode({
    node,
    isRoot = false,
    collapsedIds,
    toggleCollapse,
    searchQuery,
    showVacant,
    showInactive,
}: {
    node: OrgNode;
    isRoot?: boolean;
    collapsedIds: Set<number>;
    toggleCollapse: (id: number) => void;
    searchQuery: string;
    showVacant: boolean;
    showInactive: boolean;
}) {
    const isCollapsed = collapsedIds.has(node.id);

    // Filter children based on visibility toggles
    const visibleChildren = useMemo(() => {
        return (node.children ?? []).filter((child) => {
            if (!showVacant && child.is_vacant) {
                return false;
            }
            if (!showInactive && !child.is_position_active) {
                return false;
            }
            return true;
        });
    }, [node.children, showVacant, showInactive]);

    const hasChildren = visibleChildren.length > 0;

    // Check if this node matches the search query
    const isHighlighted = useMemo(() => {
        if (!searchQuery.trim()) return false;
        const q = searchQuery.toLowerCase();
        const codeMatch = node.position_code.toLowerCase().includes(q);
        const nameMatch = (node.position_name ?? '').toLowerCase().includes(q);
        const empMatch = (node.employees ?? []).some(
            (e) =>
                e.full_name.toLowerCase().includes(q) ||
                e.employee_code.toLowerCase().includes(q),
        );
        return codeMatch || nameMatch || empMatch;
    }, [node, searchQuery]);

    return (
        <li className="relative flex flex-col items-center px-4">
            {/* Top vertical connector from parent */}
            {!isRoot && (
                <div
                    aria-hidden
                    className="h-6 w-px bg-slate-300 dark:bg-slate-700"
                />
            )}

            {/* The Node Card */}
            <OrgPersonCard
                node={node}
                isHighlighted={isHighlighted}
                collapsed={isCollapsed}
                onToggleCollapse={() => toggleCollapse(node.id)}
                hasChildren={hasChildren}
                childrenCount={visibleChildren.length}
            />

            {/* Subordinates & Connector Lines */}
            {hasChildren && !isCollapsed && (
                <div className="relative flex flex-col items-center">
                    {/* Vertical stem line going down from current card */}
                    <div
                        aria-hidden
                        className="h-6 w-px bg-slate-300 dark:bg-slate-700"
                    />

                    {/* Children row with top connecting crossbar */}
                    <ul className="relative flex items-start justify-center">
                        {visibleChildren.map((child, index) => {
                            const isFirst = index === 0;
                            const isLast = index === visibleChildren.length - 1;
                            const isOnly = visibleChildren.length === 1;

                            return (
                                <div key={child.id} className="relative flex flex-col items-center">
                                    {/* Horizontal connector line */}
                                    {!isOnly && (
                                        <div
                                            aria-hidden
                                            className={`absolute top-0 h-px bg-slate-300 dark:bg-slate-700 ${
                                                isFirst
                                                    ? 'left-1/2 right-0'
                                                    : isLast
                                                      ? 'left-0 right-1/2'
                                                      : 'left-0 right-0'
                                            }`}
                                        />
                                    )}

                                    <OrgTreeNode
                                        node={child}
                                        collapsedIds={collapsedIds}
                                        toggleCollapse={toggleCollapse}
                                        searchQuery={searchQuery}
                                        showVacant={showVacant}
                                        showInactive={showInactive}
                                    />
                                </div>
                            );
                        })}
                    </ul>
                </div>
            )}
        </li>
    );
}

export default function OrganizationChartPage({
    chart,
    all_positions = [],
    divisions = [],
    stats = {},
}: PageProps) {
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showVacant, setShowVacant] = useState(true);
    const [showInactive, setShowInactive] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

    // Exclusion Management Modal State
    const [exclusionModalOpen, setExclusionModalOpen] = useState(false);
    const [modalSearch, setModalSearch] = useState('');
    const [modalDivisionFilter, setModalDivisionFilter] = useState('all');
    const [modalStatusFilter, setModalStatusFilter] = useState('all');
    const [isSavingExclusions, setIsSavingExclusions] = useState(false);

    // Working state of excluded position IDs for the modal
    const [excludedIds, setExcludedIds] = useState<Set<number>>(() => {
        const ids = new Set<number>();
        all_positions.forEach((pos) => {
            if (pos.exclude_from_org_chart) {
                ids.add(pos.id);
            }
        });
        return ids;
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const toggleCollapse = (id: number) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        setCollapsedIds(new Set());
    };

    const collapseAll = () => {
        const allIds = new Set<number>();
        const walk = (nodes: OrgNode[]) => {
            for (const n of nodes) {
                if (n.children && n.children.length > 0) {
                    allIds.add(n.id);
                    walk(n.children);
                }
            }
        };
        walk(chart);
        setCollapsedIds(allIds);
    };

    // Filter chart by division tab & search if requested
    const filteredChart = useMemo(() => {
        let roots = chart;

        // If specific division selected, filter nodes
        if (activeTab !== 'all') {
            const filterDivision = (nodes: OrgNode[]): OrgNode[] => {
                return nodes
                    .map((node) => {
                        const matchingChildren = filterDivision(node.children);
                        const isMatch = node.division_name === activeTab;
                        if (!isMatch && matchingChildren.length === 0) {
                            return null;
                        }
                        return {
                            ...node,
                            children: matchingChildren,
                        };
                    })
                    .filter((n): n is OrgNode => n !== null);
            };
            roots = filterDivision(roots);
        }

        // Apply Vacant & Inactive filters on root level
        return roots.filter((node) => {
            if (!showVacant && node.is_vacant) return false;
            if (!showInactive && !node.is_position_active) return false;
            return true;
        });
    }, [chart, activeTab, showVacant, showInactive]);

    // Modal positions filtered list
    const filteredModalPositions = useMemo(() => {
        return all_positions.filter((pos) => {
            if (modalDivisionFilter !== 'all') {
                if (pos.division_name !== modalDivisionFilter) return false;
            }
            if (modalStatusFilter === 'vacant' && !pos.is_vacant) return false;
            if (modalStatusFilter === 'inactive' && pos.is_active) return false;
            if (modalStatusFilter === 'excluded' && !excludedIds.has(pos.id))
                return false;

            if (modalSearch.trim()) {
                const q = modalSearch.toLowerCase();
                const codeMatch = pos.code.toLowerCase().includes(q);
                const nameMatch = pos.name.toLowerCase().includes(q);
                const divMatch = (pos.division_name ?? '')
                    .toLowerCase()
                    .includes(q);
                if (!codeMatch && !nameMatch && !divMatch) return false;
            }

            return true;
        });
    }, [
        all_positions,
        modalSearch,
        modalDivisionFilter,
        modalStatusFilter,
        excludedIds,
    ]);

    const handleSaveExclusions = () => {
        setIsSavingExclusions(true);
        router.post(
            '/hris/organization-chart/exclusions',
            {
                excluded_position_ids: Array.from(excludedIds),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setExclusionModalOpen(false);
                },
                onFinish: () => {
                    setIsSavingExclusions(false);
                },
            },
        );
    };

    const toggleExcludePosition = (id: number) => {
        setExcludedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const excludeAllVacant = () => {
        setExcludedIds((prev) => {
            const next = new Set(prev);
            all_positions.forEach((pos) => {
                if (pos.is_vacant) {
                    next.add(pos.id);
                }
            });
            return next;
        });
    };

    const includeAllPositions = () => {
        setExcludedIds(new Set());
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Struktur Organisasi" />

            <div className="space-y-4 p-4">
                {/* Header & Quick Stats */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Building2 className="size-5 text-indigo-600" />
                            Struktur Organisasi
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Bagan hierarki jabatan, status keterisian karyawan,
                            dan sinkronisasi posisi organisasi.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // sync current excludedIds from props
                                const ids = new Set<number>();
                                all_positions.forEach((p) => {
                                    if (p.exclude_from_org_chart) ids.add(p.id);
                                });
                                setExcludedIds(ids);
                                setExclusionModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            <span>Kelola Jabatan di Bagan</span>
                            {(stats.excluded_positions ?? 0) > 0 && (
                                <Badge className="ml-1 bg-amber-500 text-white px-1.5 py-0 text-[10px]">
                                    {stats.excluded_positions} Excluded
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <Card className="p-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Total Jabatan
                            </span>
                            <Layers className="size-4 text-slate-500" />
                        </div>
                        <p className="mt-1 text-xl font-bold">
                            {stats.total_positions ?? all_positions.length}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {stats.total_nodes ?? filteredChart.length} aktif di
                            struktur
                        </p>
                    </Card>

                    <Card className="p-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Jabatan Terisi
                            </span>
                            <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                            {stats.filled_positions ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {stats.total_employees ?? 0} total karyawan aktif
                        </p>
                    </Card>

                    <Card className="p-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                Jabatan Lowong
                            </span>
                            <UserMinus className="size-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">
                            {stats.vacant_positions ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Belum ada karyawan aktif
                        </p>
                    </Card>

                    <Card className="p-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Jabatan Nonaktif
                            </span>
                            <UserX className="size-4 text-slate-400" />
                        </div>
                        <p className="mt-1 text-xl font-bold text-slate-700 dark:text-slate-300">
                            {stats.inactive_positions ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Status jabatan tidak aktif
                        </p>
                    </Card>

                    <Card className="p-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                Excluded dari Bagan
                            </span>
                            <EyeOff className="size-4 text-indigo-500" />
                        </div>
                        <p className="mt-1 text-xl font-bold text-indigo-700 dark:text-indigo-300">
                            {stats.excluded_positions ?? 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Dilewati & hierarki terhubung
                        </p>
                    </Card>
                </div>

                {/* Main Interactive Org Chart Canvas Card */}
                <Card
                    ref={containerRef}
                    className="overflow-hidden border-slate-200 bg-slate-50/50 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                    {/* Control Toolbar */}
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                        {/* Division filter pills */}
                        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    activeTab === 'all' ? 'default' : 'outline'
                                }
                                onClick={() => setActiveTab('all')}
                                className="h-7 text-xs"
                            >
                                Semua Divisi
                            </Button>
                            {divisions.map((div) => (
                                <Button
                                    key={div.id}
                                    type="button"
                                    size="sm"
                                    variant={
                                        activeTab === div.name
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => setActiveTab(div.name)}
                                    className="h-7 text-xs"
                                >
                                    {div.name}
                                </Button>
                            ))}
                        </div>

                        {/* Search & Action Toggles */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search box */}
                            <div className="relative min-w-[160px] sm:w-48">
                                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Cari jabatan/karyawan..."
                                    className="h-7 pl-8 pr-2 text-xs"
                                />
                            </div>

                            {/* Show Vacant Toggle */}
                            <Button
                                type="button"
                                size="sm"
                                variant={showVacant ? 'secondary' : 'outline'}
                                onClick={() => setShowVacant(!showVacant)}
                                className={`h-7 text-xs ${
                                    showVacant
                                        ? 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                                        : 'text-muted-foreground'
                                }`}
                                title="Tampilkan/Sembunyikan Jabatan Lowong"
                            >
                                <span className="size-2 rounded-full bg-amber-500 mr-1" />
                                Lowong
                            </Button>

                            {/* Show Inactive Toggle */}
                            <Button
                                type="button"
                                size="sm"
                                variant={showInactive ? 'secondary' : 'outline'}
                                onClick={() => setShowInactive(!showInactive)}
                                className={`h-7 text-xs ${
                                    showInactive
                                        ? 'border-slate-300 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                        : 'text-muted-foreground'
                                }`}
                                title="Tampilkan/Sembunyikan Jabatan Nonaktif"
                            >
                                <span className="size-2 rounded-full bg-slate-400 mr-1" />
                                Nonaktif
                            </Button>

                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                            {/* Expand / Collapse All */}
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={
                                    collapsedIds.size > 0
                                        ? expandAll
                                        : collapseAll
                                }
                                className="h-7 px-2 text-xs"
                                title={
                                    collapsedIds.size > 0
                                        ? 'Buka Semua Cabang'
                                        : 'Tutup Semua Cabang'
                                }
                            >
                                {collapsedIds.size > 0
                                    ? 'Buka Semua'
                                    : 'Tutup Semua'}
                            </Button>

                            {/* Zoom controls */}
                            <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setZoom((z) => Math.max(0.4, z - 0.1))
                                    }
                                    className="size-7"
                                    title="Perkecil (-)"
                                >
                                    <ZoomOut className="size-3.5" />
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setZoom(1)}
                                    className="px-1.5 text-[11px] font-mono font-medium hover:text-indigo-600"
                                    title="Reset ke 100%"
                                >
                                    {Math.round(zoom * 100)}%
                                </button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setZoom((z) => Math.min(1.8, z + 0.1))
                                    }
                                    className="size-7"
                                    title="Perbesar (+)"
                                >
                                    <ZoomIn className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setZoom(1)}
                                    className="size-7 border-l border-slate-200 dark:border-slate-800"
                                    title="Reset Zoom"
                                >
                                    <RotateCcw className="size-3" />
                                </Button>
                            </div>

                            {/* Fullscreen Toggle */}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={toggleFullscreen}
                                className="size-7"
                                title={
                                    isFullscreen
                                        ? 'Keluar Layar Penuh'
                                        : 'Layar Penuh'
                                }
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="size-3.5" />
                                ) : (
                                    <Maximize2 className="size-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Chart Tree Rendering Container */}
                    <CardContent className="overflow-auto p-8 min-h-[500px]">
                        {filteredChart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                                <Building2 className="size-12 text-slate-300 stroke-1 dark:text-slate-700" />
                                <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Tidak ada jabatan yang ditampilkan
                                </h3>
                                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                    Periksa filter divisi atau filter lowong &
                                    nonaktif di atas, atau atur pengecualian
                                    jabatan di modal pengaturan.
                                </p>
                            </div>
                        ) : (
                            <div
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'top center',
                                    transition:
                                        'transform 0.15s ease-out',
                                }}
                                className="inline-block min-w-full pb-12 pt-4"
                            >
                                <ul className="flex items-start justify-center gap-8">
                                    {filteredChart.map((node) => (
                                        <OrgTreeNode
                                            key={node.id}
                                            node={node}
                                            isRoot
                                            collapsedIds={collapsedIds}
                                            toggleCollapse={toggleCollapse}
                                            searchQuery={searchQuery}
                                            showVacant={showVacant}
                                            showInactive={showInactive}
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal: Kelola Jabatan di Struktur Organisasi (Exclusions) */}
            <Dialog
                open={exclusionModalOpen}
                onOpenChange={setExclusionModalOpen}
            >
                <DialogContent className="max-w-3xl sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <SlidersHorizontal className="size-4 text-indigo-600" />
                            Kelola Jabatan di Struktur Organisasi
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Centang untuk mengecualikan (exclude) jabatan dari
                            struktur visual. Sub-jabatan dari jabatan yang
                            di-exclude akan otomatis terhubung ke jabatan atasan
                            berikutnya.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Notice Callout */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-semibold">
                                    Hierarki Otomatis Tersambung
                                </p>
                                <p className="text-[11px] leading-relaxed opacity-90">
                                    Jika jabatan manajerial atau perantara
                                    di-exclude, staf atau sub-jabatan di
                                    bawahnya tidak akan hilang, melainkan
                                    langsung terhubung ke jabatan atasan di
                                    atasnya.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Actions Bar inside Modal */}
                    <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={modalSearch}
                                onChange={(e) => setModalSearch(e.target.value)}
                                placeholder="Cari nama atau kode jabatan..."
                                className="h-8 pl-8 text-xs"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={includeAllPositions}
                                className="h-8 text-xs"
                            >
                                Tampilkan Semua (0 Exclude)
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={excludeAllVacant}
                                className="h-8 text-xs text-amber-700 hover:text-amber-800"
                            >
                                Exclude Semua Lowong
                            </Button>
                        </div>
                    </div>

                    {/* Positions List Table */}
                    <div className="max-h-[360px] overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                <tr>
                                    <th className="w-12 px-3 py-2 text-center">
                                        Exclude
                                    </th>
                                    <th className="px-3 py-2">Kode</th>
                                    <th className="px-3 py-2">Nama Jabatan</th>
                                    <th className="px-3 py-2">Divisi</th>
                                    <th className="px-3 py-2">Level</th>
                                    <th className="px-3 py-2">Karyawan</th>
                                    <th className="px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredModalPositions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            Tidak ada jabatan yang cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredModalPositions.map((pos) => {
                                        const isExcluded = excludedIds.has(
                                            pos.id,
                                        );

                                        return (
                                            <tr
                                                key={pos.id}
                                                className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
                                                    isExcluded
                                                        ? 'bg-amber-50/40 dark:bg-amber-950/20'
                                                        : ''
                                                }`}
                                            >
                                                <td className="px-3 py-2 text-center">
                                                    <Checkbox
                                                        checked={isExcluded}
                                                        onCheckedChange={() =>
                                                            toggleExcludePosition(
                                                                pos.id,
                                                            )
                                                        }
                                                        aria-label={`Exclude ${pos.name}`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 font-mono font-medium">
                                                    {pos.code}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {pos.name}
                                                    </div>
                                                    {isExcluded && (
                                                        <span className="text-[10px] text-amber-700 dark:text-amber-400">
                                                            Dikecualikan dari
                                                            bagan
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-muted-foreground">
                                                    {pos.division_name ?? '-'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        Lvl {pos.level}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-2">
                                                    {pos.is_vacant ? (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                                            Lowong
                                                        </span>
                                                    ) : (
                                                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                                            {pos.employees_count}{' '}
                                                            orang
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {!pos.is_active ? (
                                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                            Nonaktif
                                                        </span>
                                                    ) : (
                                                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-amber-600">
                                {excludedIds.size}
                            </span>{' '}
                            jabatan dipilih untuk di-exclude.
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setExclusionModalOpen(false)}
                                disabled={isSavingExclusions}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveExclusions}
                                disabled={isSavingExclusions}
                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                {isSavingExclusions
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
