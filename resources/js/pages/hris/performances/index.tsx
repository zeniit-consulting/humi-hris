import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Award,
    Calendar,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    Clock,
    FilePenLine,
    Filter,
    HelpCircle,
    Info,
    Layers,
    LayoutDashboard,
    LineChart,
    ListChecks,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Sparkles,
    Target,
    Trash2,
    TrendingDown,
    TrendingUp,
    Trophy,
    User,
    Users,
    UsersRound,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimplePagination } from '@/components/ui/simple-pagination';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import SearchableSelect from '@/components/ui/searchable-select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Paginator<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

type Option = {
    id: number;
    label?: string;
    name?: string;
};

type EmployeeOption = {
    id: number;
    label: string;
    employee_code: string;
    full_name: string;
    division_id: number | null;
    position_id: number | null;
    manager_id: number | null;
    division: { id: number; name: string } | null;
    position: { id: number; name: string } | null;
};

type PerformancePeriod = {
    id: number;
    name: string;
    starts_at: string;
    ends_at: string;
    status: string;
    reviews_count: number | null;
};

type KpiMetric = {
    id: number;
    name: string;
    description: string | null;
    unit: string | null;
    target_value: number;
    weight: number;
    input_type: 'manual' | 'attendance';
    attendance_metric: string | null;
    direction: 'higher_is_better' | 'lower_is_better';
};

type KpiTemplate = {
    id: number;
    name: string;
    description: string | null;
    division_id: number | null;
    position_id: number | null;
    division: { id: number; name: string } | null;
    position: { id: number; name: string } | null;
    is_active: boolean;
    metrics_count: number;
    metrics: KpiMetric[];
};

type KeyResult = {
    id: number;
    title: string;
    target_value: number;
    actual_value: number;
    unit: string | null;
    score: number;
    status: string;
};

type Objective = {
    id: number;
    title: string;
    description: string | null;
    weight: number;
    score: number;
    status: string;
    key_results: KeyResult[];
};

type KpiResult = {
    id: number;
    name: string;
    unit: string | null;
    target_value: number;
    actual_value: number;
    weight: number;
    input_type: 'manual' | 'attendance';
    attendance_metric: string | null;
    direction: 'higher_is_better' | 'lower_is_better';
    score: number;
    notes: string | null;
};

type CheckIn = {
    id: number;
    check_in_date: string;
    performance_kpi_result_id: number | null;
    kpi_result: {
        id: number;
        name: string;
        unit: string | null;
        target_value: number;
        actual_value: number;
        score: number;
    } | null;
    summary: string;
    action_items: string | null;
    status: string;
};

type Review = {
    id: number;
    status: string;
    okr_score: number;
    kpi_score: number;
    manager_score: number | null;
    final_score: number;
    manager_notes: string | null;
    strengths: string | null;
    improvement_areas: string | null;
    next_action: string | null;
    locked_at: string | null;
    period: PerformancePeriod | null;
    employee: EmployeeOption | null;
    manager: { id: number; label: string } | null;
    objectives: Objective[];
    kpi_results: KpiResult[];
    check_ins: CheckIn[];
};

type PageProps = {
    reviews: Paginator<Review>;
    periods: PerformancePeriod[];
    templates: KpiTemplate[];
    employees: EmployeeOption[];
    managerOptions: Array<{ id: number; label: string }>;
    divisions: Option[];
    positions: Array<{ id: number; name: string; division_id: number | null }>;
    filters: {
        period_id: string;
        status: string;
        division_id: string;
        position_id: string;
        manager_id: string;
        search: string;
    };
    statusOptions: string[];
    periodStatusOptions: string[];
    objectiveStatusOptions: string[];
    checkInStatusOptions: string[];
    attendanceMetricOptions: string[];
    stats: {
        average_final_score: number;
        at_risk: number;
        pending_reviews: number;
        completed_reviews: number;
    };
    permissions: {
        can_manage_all: boolean;
        manager_employee_id: number | null;
    };
};

type PeriodForm = {
    name: string;
    starts_at: string;
    ends_at: string;
    status: string;
};

type TemplateForm = {
    name: string;
    description: string;
    division_id: string;
    position_id: string;
    is_active: boolean;
};

type MetricForm = {
    name: string;
    description: string;
    unit: string;
    target_value: string;
    weight: string;
    input_type: 'manual' | 'attendance';
    attendance_metric: string;
    direction: 'higher_is_better' | 'lower_is_better';
};

type ReviewForm = {
    performance_period_id: string;
    employee_id: string;
    manager_id: string;
};

type ObjectiveForm = {
    title: string;
    description: string;
    weight: string;
    status: string;
};

type KeyResultForm = {
    title: string;
    target_value: string;
    actual_value: string;
    unit: string;
    status: string;
};

type ManagerReviewForm = {
    manager_id: string;
    status: string;
    manager_score: string;
    manager_notes: string;
    strengths: string;
    improvement_areas: string;
    next_action: string;
};

const navigationTabs = [
    { id: 'Dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'Reviews', label: 'Evaluasi Karyawan', icon: Users },
    { id: 'KPI Templates', label: 'Template KPI', icon: Layers },
    { id: 'Periods', label: 'Periode Penilaian', icon: CalendarDays },
] as const;

type NavTabId = (typeof navigationTabs)[number]['id'];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'HRIS', href: '/hris/attendances' },
    { title: 'Kinerja & KPI', href: '/hris/performances' },
];

function periodDefaults(): PeriodForm {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

    return {
        name: `${now.toLocaleString('id-ID', { month: 'long' })} ${year}`,
        starts_at: `${year}-${month}-01`,
        ends_at: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
        status: 'draft',
    };
}

const templateDefaults: TemplateForm = {
    name: '',
    description: '',
    division_id: '',
    position_id: '',
    is_active: true,
};

const metricDefaults: MetricForm = {
    name: '',
    description: '',
    unit: '%',
    target_value: '100',
    weight: '1',
    input_type: 'manual',
    attendance_metric: '',
    direction: 'higher_is_better',
};

const reviewDefaults: ReviewForm = {
    performance_period_id: '',
    employee_id: '',
    manager_id: '',
};

const objectiveDefaults: ObjectiveForm = {
    title: '',
    description: '',
    weight: '1',
    status: 'not_started',
};

const keyResultDefaults: KeyResultForm = {
    title: '',
    target_value: '100',
    actual_value: '0',
    unit: '',
    status: 'not_started',
};

export function getScoreGrade(score: number): {
    grade: 'A' | 'B' | 'C' | 'D';
    label: string;
    badgeClass: string;
    textClass: string;
    bgClass: string;
} {
    const val = Number(score) || 0;
    if (val >= 85) {
        return {
            grade: 'A',
            label: 'Sangat Baik',
            badgeClass:
                'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            textClass: 'text-emerald-600 dark:text-emerald-400',
            bgClass: 'bg-emerald-500',
        };
    }
    if (val >= 70) {
        return {
            grade: 'B',
            label: 'Baik',
            badgeClass:
                'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            textClass: 'text-blue-600 dark:text-blue-400',
            bgClass: 'bg-blue-500',
        };
    }
    if (val >= 60) {
        return {
            grade: 'C',
            label: 'Cukup',
            badgeClass:
                'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            textClass: 'text-amber-600 dark:text-amber-400',
            bgClass: 'bg-amber-500',
        };
    }
    return {
        grade: 'D',
        label: 'Perlu Perhatian',
        badgeClass:
            'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        textClass: 'text-rose-600 dark:text-rose-400',
        bgClass: 'bg-rose-500',
    };
}

export function statusLabel(status: string) {
    switch (status) {
        case 'not_started':
            return 'Belum Dimulai';
        case 'in_progress':
            return 'Sedang Berjalan';
        case 'submitted':
            return 'Menunggu Review';
        case 'completed':
            return 'Selesai';
        case 'locked':
            return 'Terkunci';
        case 'draft':
            return 'Draf';
        case 'active':
            return 'Aktif';
        case 'closed':
            return 'Ditutup';
        case 'open':
            return 'Terbuka';
        case 'reviewed':
            return 'Ditinjau';
        default:
            return status.replaceAll('_', ' ');
    }
}

export function attendanceMetricLabel(metric: string) {
    switch (metric) {
        case 'attendance_rate':
            return 'Tingkat Kehadiran (%)';
        case 'on_time_rate':
            return 'Ketepatan Waktu (%)';
        case 'late_count':
            return 'Keterlambatan (kali)';
        case 'absent_count':
            return 'Mangkir (kali)';
        default:
            return metric
                .split('_')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
    }
}

export function formatScore(value: number) {
    return Number(value || 0).toFixed(1);
}

export default function PerformanceIndex() {
    const {
        reviews,
        periods,
        templates,
        employees,
        managerOptions,
        divisions,
        positions,
        filters,
        statusOptions,
        periodStatusOptions,
        objectiveStatusOptions,
        attendanceMetricOptions,
        stats,
        permissions,
    } = usePage<PageProps>().props;

    const [activeTab, setActiveTab] = useState<NavTabId>('Dashboard');
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(
        reviews.data[0]?.id ?? null,
    );
    const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] =
        useState<PerformancePeriod | null>(null);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<KpiTemplate | null>(
        null,
    );
    const [metricDialogOpen, setMetricDialogOpen] = useState(false);
    const [metricTemplate, setMetricTemplate] = useState<KpiTemplate | null>(
        null,
    );
    const [editingMetric, setEditingMetric] = useState<KpiMetric | null>(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [objectiveDialogOpen, setObjectiveDialogOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Objective | null>(
        null,
    );
    const [keyResultDialogOpen, setKeyResultDialogOpen] = useState(false);
    const [keyResultObjective, setKeyResultObjective] =
        useState<Objective | null>(null);
    const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | null>(
        null,
    );
    const [editingKpi, setEditingKpi] = useState<KpiResult | null>(null);
    const [filterState, setFilterState] = useState(filters);

    const selectedReview = useMemo(
        () =>
            reviews.data.find((review) => review.id === selectedReviewId) ??
            reviews.data[0] ??
            null,
        [reviews.data, selectedReviewId],
    );

    const periodForm = useForm<PeriodForm>(periodDefaults());
    const templateForm = useForm<TemplateForm>(templateDefaults);
    const metricForm = useForm<MetricForm>(metricDefaults);
    const reviewForm = useForm<ReviewForm>(reviewDefaults);
    const objectiveForm = useForm<ObjectiveForm>(objectiveDefaults);
    const keyResultForm = useForm<KeyResultForm>(keyResultDefaults);
    const kpiForm = useForm({ actual_value: '', notes: '' });
    const managerReviewForm = useForm<ManagerReviewForm>({
        manager_id: '',
        status: 'not_started',
        manager_score: '',
        manager_notes: '',
        strengths: '',
        improvement_areas: '',
        next_action: '',
    });

    // Auto-populate manager review form whenever selected review changes
    useEffect(() => {
        if (!selectedReview) {
            return;
        }
        managerReviewForm.setData({
            manager_id: selectedReview.manager
                ? String(selectedReview.manager.id)
                : '',
            status: selectedReview.status,
            manager_score:
                selectedReview.manager_score !== null
                    ? String(selectedReview.manager_score)
                    : '',
            manager_notes: selectedReview.manager_notes ?? '',
            strengths: selectedReview.strengths ?? '',
            improvement_areas: selectedReview.improvement_areas ?? '',
            next_action: selectedReview.next_action ?? '',
        });
        managerReviewForm.clearErrors();
    }, [selectedReview?.id]);

    const employeeOptions = useMemo(
        () =>
            employees.map((employee) => ({
                value: String(employee.id),
                label: employee.label,
            })),
        [employees],
    );

    const managerSelectOptions = useMemo(
        () =>
            managerOptions.map((manager) => ({
                value: String(manager.id),
                label: manager.label,
            })),
        [managerOptions],
    );

    const divisionOptions = useMemo(
        () =>
            divisions.map((division) => ({
                value: String(division.id),
                label: division.name ?? '',
            })),
        [divisions],
    );

    const positionOptions = useMemo(
        () =>
            positions.map((position) => ({
                value: String(position.id),
                label: position.name,
            })),
        [positions],
    );

    const periodOptions = useMemo(
        () =>
            periods.map((period) => ({
                value: String(period.id),
                label: `${period.name} (${statusLabel(period.status)})`,
            })),
        [periods],
    );

    const locked =
        selectedReview?.status === 'locked' ||
        selectedReview?.locked_at !== null;

    const submitFilters = () => {
        router.get('/hris/performances', filterState, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        const cleared = {
            period_id: '',
            status: '',
            division_id: '',
            position_id: '',
            manager_id: '',
            search: '',
        };
        setFilterState(cleared);
        router.get('/hris/performances', cleared, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        filterState.period_id ||
            filterState.status ||
            filterState.division_id ||
            filterState.position_id ||
            filterState.search,
    );

    const openCreatePeriod = () => {
        setEditingPeriod(null);
        periodForm.setData(periodDefaults());
        periodForm.clearErrors();
        setPeriodDialogOpen(true);
    };

    const openEditPeriod = (period: PerformancePeriod) => {
        setEditingPeriod(period);
        periodForm.setData({
            name: period.name,
            starts_at: period.starts_at,
            ends_at: period.ends_at,
            status: period.status,
        });
        periodForm.clearErrors();
        setPeriodDialogOpen(true);
    };

    const submitPeriod = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => setPeriodDialogOpen(false),
        };

        if (editingPeriod) {
            periodForm.put(
                `/hris/performances/periods/${editingPeriod.id}`,
                options,
            );
            return;
        }

        periodForm.post('/hris/performances/periods', options);
    };

    const openCreateTemplate = () => {
        setEditingTemplate(null);
        templateForm.setData(templateDefaults);
        templateForm.clearErrors();
        setTemplateDialogOpen(true);
    };

    const openEditTemplate = (template: KpiTemplate) => {
        setEditingTemplate(template);
        templateForm.setData({
            name: template.name,
            description: template.description ?? '',
            division_id: template.division_id
                ? String(template.division_id)
                : '',
            position_id: template.position_id
                ? String(template.position_id)
                : '',
            is_active: template.is_active,
        });
        templateForm.clearErrors();
        setTemplateDialogOpen(true);
    };

    const submitTemplate = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => setTemplateDialogOpen(false),
        };

        if (editingTemplate) {
            templateForm.put(
                `/hris/performances/templates/${editingTemplate.id}`,
                options,
            );
            return;
        }

        templateForm.post('/hris/performances/templates', options);
    };

    const openCreateMetric = (template: KpiTemplate) => {
        setMetricTemplate(template);
        setEditingMetric(null);
        metricForm.setData(metricDefaults);
        metricForm.clearErrors();
        setMetricDialogOpen(true);
    };

    const openEditMetric = (template: KpiTemplate, metric: KpiMetric) => {
        setMetricTemplate(template);
        setEditingMetric(metric);
        metricForm.setData({
            name: metric.name,
            description: metric.description ?? '',
            unit: metric.unit ?? '',
            target_value: String(metric.target_value),
            weight: String(metric.weight),
            input_type: metric.input_type,
            attendance_metric: metric.attendance_metric ?? '',
            direction: metric.direction,
        });
        metricForm.clearErrors();
        setMetricDialogOpen(true);
    };

    const submitMetric = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => setMetricDialogOpen(false),
        };

        if (editingMetric) {
            metricForm.put(
                `/hris/performances/metrics/${editingMetric.id}`,
                options,
            );
            return;
        }

        if (metricTemplate) {
            metricForm.post(
                `/hris/performances/templates/${metricTemplate.id}/metrics`,
                options,
            );
        }
    };

    const openCreateReview = () => {
        reviewForm.setData({
            ...reviewDefaults,
            performance_period_id:
                periods
                    .find((period) => period.status === 'active')
                    ?.id.toString() ??
                periods[0]?.id.toString() ??
                '',
        });
        reviewForm.clearErrors();
        setReviewDialogOpen(true);
    };

    const submitReview = (event: FormEvent) => {
        event.preventDefault();
        reviewForm.post('/hris/performances/reviews', {
            preserveScroll: true,
            onSuccess: () => setReviewDialogOpen(false),
        });
    };

    const openCreateObjective = () => {
        setEditingObjective(null);
        objectiveForm.setData(objectiveDefaults);
        objectiveForm.clearErrors();
        setObjectiveDialogOpen(true);
    };

    const openEditObjective = (objective: Objective) => {
        setEditingObjective(objective);
        objectiveForm.setData({
            title: objective.title,
            description: objective.description ?? '',
            weight: String(objective.weight),
            status: objective.status,
        });
        objectiveForm.clearErrors();
        setObjectiveDialogOpen(true);
    };

    const submitObjective = (event: FormEvent) => {
        event.preventDefault();

        if (!selectedReview) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => setObjectiveDialogOpen(false),
        };

        if (editingObjective) {
            objectiveForm.put(
                `/hris/performances/objectives/${editingObjective.id}`,
                options,
            );
            return;
        }

        objectiveForm.post(
            `/hris/performances/reviews/${selectedReview.id}/objectives`,
            options,
        );
    };

    const openCreateKeyResult = (objective: Objective) => {
        setKeyResultObjective(objective);
        setEditingKeyResult(null);
        keyResultForm.setData(keyResultDefaults);
        keyResultForm.clearErrors();
        setKeyResultDialogOpen(true);
    };

    const openEditKeyResult = (objective: Objective, keyResult: KeyResult) => {
        setKeyResultObjective(objective);
        setEditingKeyResult(keyResult);
        keyResultForm.setData({
            title: keyResult.title,
            target_value: String(keyResult.target_value),
            actual_value: String(keyResult.actual_value),
            unit: keyResult.unit ?? '',
            status: keyResult.status,
        });
        keyResultForm.clearErrors();
        setKeyResultDialogOpen(true);
    };

    const submitKeyResult = (event: FormEvent) => {
        event.preventDefault();

        if (!keyResultObjective) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => setKeyResultDialogOpen(false),
        };

        if (editingKeyResult) {
            keyResultForm.put(
                `/hris/performances/key-results/${editingKeyResult.id}`,
                options,
            );
            return;
        }

        keyResultForm.post(
            `/hris/performances/objectives/${keyResultObjective.id}/key-results`,
            options,
        );
    };

    const openEditKpi = (kpi: KpiResult) => {
        setEditingKpi(kpi);
        kpiForm.setData({
            actual_value: String(kpi.actual_value),
            notes: kpi.notes ?? '',
        });
        kpiForm.clearErrors();
    };

    const submitKpi = (event: FormEvent) => {
        event.preventDefault();

        if (!editingKpi) {
            return;
        }

        kpiForm.put(`/hris/performances/kpi-results/${editingKpi.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditingKpi(null),
        });
    };

    const syncAttendance = () => {
        if (!selectedReview) {
            return;
        }

        router.post(
            `/hris/performances/reviews/${selectedReview.id}/sync-attendance`,
            {},
            { preserveScroll: true },
        );
    };

    const submitManagerReview = (event: FormEvent) => {
        event.preventDefault();

        if (!selectedReview) {
            return;
        }

        managerReviewForm.put(
            `/hris/performances/reviews/${selectedReview.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kinerja & KPI Karyawan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Trophy className="size-4" />
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                                Kinerja & KPI Karyawan
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                            Kelola sasaran kerja, indikator KPI operasional, dan
                            evaluasi performa karyawan secara terukur.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {permissions.can_manage_all ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={openCreatePeriod}
                                    className="gap-1.5"
                                >
                                    <CalendarDays className="size-3.5 text-muted-foreground" />
                                    Periode
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={openCreateTemplate}
                                    className="gap-1.5"
                                >
                                    <Layers className="size-3.5 text-muted-foreground" />
                                    Template KPI
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={openCreateReview}
                                    className="gap-1.5"
                                >
                                    <Plus className="size-3.5" />
                                    Buat Evaluasi
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Modern Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-muted/30 p-1.5">
                    {navigationTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                                }`}
                            >
                                <Icon className="size-4" />
                                <span>{tab.label}</span>
                                {tab.id === 'Reviews' && reviews.total > 0 ? (
                                    <span
                                        className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {reviews.total}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                {/* Tab: Ringkasan / Dashboard */}
                {activeTab === 'Dashboard' ? (
                    <DashboardPanel
                        stats={stats}
                        reviews={reviews.data}
                        onSelectReview={(review) => {
                            setSelectedReviewId(review.id);
                            setActiveTab('Reviews');
                        }}
                    />
                ) : null}

                {/* Tab: Evaluasi Karyawan / Reviews */}
                {activeTab === 'Reviews' ? (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
                        {/* Left: Daftar Evaluasi & Filter */}
                        <div className="flex flex-col gap-4">
                            <Card className="shadow-xs border-muted/80">
                                <CardHeader className="p-4 sm:p-5 pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <UsersRound className="size-4 text-primary" />
                                                Daftar Penilaian Karyawan
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Menampilkan {reviews.data.length}{' '}
                                                dari {reviews.total} data
                                                penilaian.
                                            </CardDescription>
                                        </div>
                                        <SimplePagination data={reviews} />
                                    </div>

                                    {/* Compact, Clean Filter Bar */}
                                    <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2 md:grid-cols-4 pt-3 border-t">
                                        <div className="relative">
                                            <Input
                                                placeholder="Cari nama / NIK..."
                                                value={filterState.search}
                                                onChange={(e) =>
                                                    setFilterState({
                                                        ...filterState,
                                                        search: e.target.value,
                                                    })
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        submitFilters();
                                                    }
                                                }}
                                                className="h-8 text-xs pr-7"
                                            />
                                            {filterState.search ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFilterState({
                                                            ...filterState,
                                                            search: '',
                                                        })
                                                    }
                                                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            ) : null}
                                        </div>

                                        <select
                                            value={filterState.period_id}
                                            onChange={(e) =>
                                                setFilterState({
                                                    ...filterState,
                                                    period_id: e.target.value,
                                                })
                                            }
                                            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs outline-none"
                                        >
                                            <option value="">Semua Periode</option>
                                            {periodOptions.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={filterState.status}
                                            onChange={(e) =>
                                                setFilterState({
                                                    ...filterState,
                                                    status: e.target.value,
                                                })
                                            }
                                            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs outline-none"
                                        >
                                            <option value="">Semua Status</option>
                                            {statusOptions.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {statusLabel(status)}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 flex-1 text-xs gap-1.5"
                                                onClick={submitFilters}
                                            >
                                                <Filter className="size-3.5" />
                                                Terapkan
                                            </Button>
                                            {hasActiveFilters ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
                                                    onClick={resetFilters}
                                                    title="Reset Filter"
                                                >
                                                    <X className="size-3.5" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-muted/40 text-[11px] font-medium text-muted-foreground uppercase border-y">
                                                <tr>
                                                    <th className="px-4 py-2.5">
                                                        Karyawan
                                                    </th>
                                                    <th className="px-3 py-2.5">
                                                        Periode
                                                    </th>
                                                    <th className="px-3 py-2.5">
                                                        Status
                                                    </th>
                                                    <th className="px-3 py-2.5 text-center">
                                                        Skor Akhir
                                                    </th>
                                                    <th className="px-4 py-2.5 text-right">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-muted/60">
                                                {reviews.data.length ? (
                                                    reviews.data.map((review) => {
                                                        const isSelected =
                                                            selectedReview?.id ===
                                                            review.id;
                                                        const grade = getScoreGrade(
                                                            review.final_score,
                                                        );
                                                        const employeeName =
                                                            review.employee
                                                                ?.full_name ??
                                                            'Tanpa Nama';
                                                        const initials =
                                                            employeeName
                                                                .split(' ')
                                                                .slice(0, 2)
                                                                .map((n) => n[0])
                                                                .join('')
                                                                .toUpperCase();

                                                        return (
                                                            <tr
                                                                key={review.id}
                                                                className={`transition-colors cursor-pointer hover:bg-muted/30 ${
                                                                    isSelected
                                                                        ? 'bg-primary/5 font-medium border-l-2 border-l-primary'
                                                                        : ''
                                                                }`}
                                                                onClick={() =>
                                                                    setSelectedReviewId(
                                                                        review.id,
                                                                    )
                                                                }
                                                            >
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                                            {initials}
                                                                        </span>
                                                                        <div className="min-w-0">
                                                                            <p className="truncate font-semibold text-foreground text-xs">
                                                                                {employeeName}
                                                                            </p>
                                                                            <p className="truncate text-[11px] text-muted-foreground">
                                                                                {review.employee
                                                                                    ?.employee_code ??
                                                                                    '-'}{' '}
                                                                                •{' '}
                                                                                {review.employee
                                                                                    ?.position
                                                                                    ?.name ??
                                                                                    review.employee
                                                                                        ?.division
                                                                                        ?.name ??
                                                                                    '-'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                                                                    {review.period
                                                                        ?.name ??
                                                                        '-'}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap">
                                                                    <StatusBadge
                                                                        status={
                                                                            review.status
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                                    <div className="inline-flex items-center gap-1.5">
                                                                        <span className="font-bold tabular-nums text-sm">
                                                                            {formatScore(
                                                                                review.final_score,
                                                                            )}
                                                                        </span>
                                                                        <span
                                                                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${grade.badgeClass}`}
                                                                        >
                                                                            {grade.grade}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant={
                                                                            isSelected
                                                                                ? 'default'
                                                                                : 'ghost'
                                                                        }
                                                                        className="h-7 text-xs px-2.5"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setSelectedReviewId(
                                                                                review.id,
                                                                            );
                                                                        }}
                                                                    >
                                                                        {isSelected
                                                                            ? 'Dipilih'
                                                                            : 'Kelola'}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={5}
                                                            className="px-4 py-12 text-center text-muted-foreground"
                                                        >
                                                            <div className="flex flex-col items-center justify-center gap-2">
                                                                <UsersRound className="size-8 text-muted-foreground/40" />
                                                                <p className="text-sm font-medium">
                                                                    Tidak ada data
                                                                    penilaian
                                                                </p>
                                                                <p className="text-xs text-muted-foreground max-w-sm">
                                                                    {hasActiveFilters
                                                                        ? 'Coba sesuaikan filter pencarian atau periode Anda.'
                                                                        : 'Klik tombol "Buat Evaluasi" di atas untuk memulai penilaian karyawan.'}
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Detail Evaluasi Karyawan Terpilih */}
                        <div>
                            {selectedReview ? (
                                <ReviewDetailPanel
                                    review={selectedReview}
                                    locked={locked}
                                    permissions={permissions}
                                    managerOptions={managerSelectOptions}
                                    statusOptions={statusOptions}
                                    managerReviewForm={managerReviewForm}
                                    onSubmitManagerReview={
                                        submitManagerReview
                                    }
                                    onCreateObjective={openCreateObjective}
                                    onEditObjective={openEditObjective}
                                    onDeleteObjective={(objective) =>
                                        router.delete(
                                            `/hris/performances/objectives/${objective.id}`,
                                            { preserveScroll: true },
                                        )
                                    }
                                    onCreateKeyResult={openCreateKeyResult}
                                    onEditKeyResult={openEditKeyResult}
                                    onDeleteKeyResult={(keyResult) =>
                                        router.delete(
                                            `/hris/performances/key-results/${keyResult.id}`,
                                            { preserveScroll: true },
                                        )
                                    }
                                    onEditKpi={openEditKpi}
                                    onSyncAttendance={syncAttendance}
                                />
                            ) : (
                                <Card className="p-8 text-center text-muted-foreground border-dashed">
                                    <p className="text-sm">
                                        Pilih salah satu karyawan di sebelah kiri
                                        untuk melihat dan mengelola rincian
                                        penilaian KPI.
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Tab: Template KPI */}
                {activeTab === 'KPI Templates' ? (
                    <TemplatePanel
                        templates={templates}
                        canManage={permissions.can_manage_all}
                        onCreate={openCreateTemplate}
                        onEdit={openEditTemplate}
                        onDelete={(template) =>
                            router.delete(
                                `/hris/performances/templates/${template.id}`,
                                {
                                    preserveScroll: true,
                                },
                            )
                        }
                        onCreateMetric={openCreateMetric}
                        onEditMetric={openEditMetric}
                        onDeleteMetric={(metric) =>
                            router.delete(
                                `/hris/performances/metrics/${metric.id}`,
                                {
                                    preserveScroll: true,
                                },
                            )
                        }
                        onAddAttendanceDefaults={(template) =>
                            router.post(
                                `/hris/performances/templates/${template.id}/attendance-defaults`,
                                {},
                                { preserveScroll: true },
                            )
                        }
                    />
                ) : null}

                {/* Tab: Periode Penilaian */}
                {activeTab === 'Periods' ? (
                    <PeriodPanel
                        periods={periods}
                        canManage={permissions.can_manage_all}
                        onCreate={openCreatePeriod}
                        onEdit={openEditPeriod}
                    />
                ) : null}
            </div>

            {/* Modal Periode */}
            <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPeriod
                                ? 'Edit Periode Penilaian'
                                : 'Buat Periode Penilaian'}
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan rentang tanggal siklus penilaian kinerja
                            karyawan.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitPeriod}
                        className="flex flex-col gap-4"
                    >
                        <TextField
                            label="Nama Periode"
                            value={periodForm.data.name}
                            onChange={(value) =>
                                periodForm.setData('name', value)
                            }
                            error={periodForm.errors.name}
                            placeholder="Contoh: Juni 2026 atau Q2 2026"
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Tanggal Mulai"
                                type="date"
                                value={periodForm.data.starts_at}
                                onChange={(value) =>
                                    periodForm.setData('starts_at', value)
                                }
                                error={periodForm.errors.starts_at}
                            />
                            <TextField
                                label="Tanggal Selesai"
                                type="date"
                                value={periodForm.data.ends_at}
                                onChange={(value) =>
                                    periodForm.setData('ends_at', value)
                                }
                                error={periodForm.errors.ends_at}
                            />
                        </div>
                        <FieldSelect
                            label="Status Periode"
                            value={periodForm.data.status}
                            options={periodStatusOptions.map((status) => ({
                                value: status,
                                label: statusLabel(status),
                            }))}
                            onChange={(value) =>
                                periodForm.setData('status', value)
                            }
                            error={periodForm.errors.status}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPeriodDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={periodForm.processing}
                            >
                                <Save className="size-4 mr-1.5" />
                                Simpan Periode
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Template KPI */}
            <Dialog
                open={templateDialogOpen}
                onOpenChange={setTemplateDialogOpen}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate
                                ? 'Edit Template KPI'
                                : 'Buat Template KPI Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Template KPI akan otomatis disematkan saat membuat
                            penilaian untuk karyawan di divisi atau posisi
                            terkait.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitTemplate}
                        className="flex flex-col gap-4"
                    >
                        <TextField
                            label="Nama Template"
                            value={templateForm.data.name}
                            onChange={(value) =>
                                templateForm.setData('name', value)
                            }
                            error={templateForm.errors.name}
                            placeholder="Contoh: KPI Staff Marketing atau KPI Umum"
                        />
                        <TextAreaField
                            label="Deskripsi / Keterangan"
                            value={templateForm.data.description}
                            onChange={(value) =>
                                templateForm.setData('description', value)
                            }
                            error={templateForm.errors.description}
                            placeholder="Jelaskan standar indikator kerja yang digunakan pada template ini..."
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <SearchSelectField
                                label="Kaitkan ke Divisi (Opsional)"
                                value={templateForm.data.division_id}
                                options={divisionOptions}
                                onChange={(value) =>
                                    templateForm.setData('division_id', value)
                                }
                                error={templateForm.errors.division_id}
                            />
                            <SearchSelectField
                                label="Kaitkan ke Posisi (Opsional)"
                                value={templateForm.data.position_id}
                                options={positionOptions}
                                onChange={(value) =>
                                    templateForm.setData('position_id', value)
                                }
                                error={templateForm.errors.position_id}
                            />
                        </div>
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                            <input
                                type="checkbox"
                                checked={templateForm.data.is_active}
                                onChange={(event) =>
                                    templateForm.setData(
                                        'is_active',
                                        event.target.checked,
                                    )
                                }
                                className="rounded border-input text-primary focus:ring-primary size-4"
                            />
                            <span>Aktifkan template ini untuk penilaian baru</span>
                        </label>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTemplateDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={templateForm.processing}
                            >
                                <Save className="size-4 mr-1.5" />
                                Simpan Template
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Metrik KPI */}
            <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMetric
                                ? 'Edit Indikator KPI'
                                : 'Tambah Indikator KPI'}
                        </DialogTitle>
                        <DialogDescription>
                            {metricTemplate?.name ?? 'Template KPI'}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitMetric}
                        className="flex flex-col gap-4"
                    >
                        <TextField
                            label="Nama Indikator / Metrik"
                            value={metricForm.data.name}
                            onChange={(value) =>
                                metricForm.setData('name', value)
                            }
                            error={metricForm.errors.name}
                            placeholder="Contoh: Tingkat Kehadiran Karyawan atau Target Penjualan"
                        />
                        <div className="grid gap-3 md:grid-cols-3">
                            <TextField
                                label="Target Nilai"
                                type="number"
                                value={metricForm.data.target_value}
                                onChange={(value) =>
                                    metricForm.setData('target_value', value)
                                }
                                error={metricForm.errors.target_value}
                            />
                            <TextField
                                label="Satuan (Unit)"
                                value={metricForm.data.unit}
                                onChange={(value) =>
                                    metricForm.setData('unit', value)
                                }
                                error={metricForm.errors.unit}
                                placeholder="Contoh: %, transaksi, dokumen"
                            />
                            <TextField
                                label="Bobot (Weight)"
                                type="number"
                                value={metricForm.data.weight}
                                onChange={(value) =>
                                    metricForm.setData('weight', value)
                                }
                                error={metricForm.errors.weight}
                            />
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            <FieldSelect
                                label="Sumber Data"
                                value={metricForm.data.input_type}
                                options={[
                                    {
                                        value: 'manual',
                                        label: 'Input Manual',
                                    },
                                    {
                                        value: 'attendance',
                                        label: 'Otomatis dari Absensi',
                                    },
                                ]}
                                onChange={(value) =>
                                    metricForm.setData(
                                        'input_type',
                                        value as 'manual' | 'attendance',
                                    )
                                }
                                error={metricForm.errors.input_type}
                            />
                            <FieldSelect
                                label="Metrik Absensi"
                                value={metricForm.data.attendance_metric}
                                options={[
                                    { value: '', label: '- Pilih Sumber -' },
                                    ...attendanceMetricOptions.map(
                                        (metric) => ({
                                            value: metric,
                                            label: attendanceMetricLabel(
                                                metric,
                                            ),
                                        }),
                                    ),
                                ]}
                                onChange={(value) =>
                                    metricForm.setData(
                                        'attendance_metric',
                                        value,
                                    )
                                }
                                disabled={
                                    metricForm.data.input_type === 'manual'
                                }
                                error={metricForm.errors.attendance_metric}
                            />
                            <FieldSelect
                                label="Arah Pencapaian"
                                value={metricForm.data.direction}
                                options={[
                                    {
                                        value: 'higher_is_better',
                                        label: 'Makin tinggi makin baik (Max)',
                                    },
                                    {
                                        value: 'lower_is_better',
                                        label: 'Makin rendah makin baik (Min)',
                                    },
                                ]}
                                onChange={(value) =>
                                    metricForm.setData(
                                        'direction',
                                        value as
                                            | 'higher_is_better'
                                            | 'lower_is_better',
                                    )
                                }
                                error={metricForm.errors.direction}
                            />
                        </div>
                        <TextAreaField
                            label="Deskripsi / Catatan Indikator"
                            value={metricForm.data.description}
                            onChange={(value) =>
                                metricForm.setData('description', value)
                            }
                            error={metricForm.errors.description}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMetricDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={metricForm.processing}
                            >
                                <Save className="size-4 mr-1.5" />
                                Simpan Indikator
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Buat Evaluasi */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Buat Penilaian Kinerja Karyawan</DialogTitle>
                        <DialogDescription>
                            Indikator KPI akan otomatis ditarik dari template
                            divisi atau jabatan karyawan yang dipilih.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitReview}
                        className="flex flex-col gap-4"
                    >
                        <SearchSelectField
                            label="Periode Penilaian"
                            value={reviewForm.data.performance_period_id}
                            options={periodOptions}
                            onChange={(value) =>
                                reviewForm.setData(
                                    'performance_period_id',
                                    value,
                                )
                            }
                            error={reviewForm.errors.performance_period_id}
                        />
                        <SearchSelectField
                            label="Karyawan yang Dinilai"
                            value={reviewForm.data.employee_id}
                            options={employeeOptions}
                            onChange={(value) =>
                                reviewForm.setData('employee_id', value)
                            }
                            error={reviewForm.errors.employee_id}
                        />
                        <SearchSelectField
                            label="Atasan / Manager Penilai"
                            value={reviewForm.data.manager_id}
                            options={managerSelectOptions}
                            onChange={(value) =>
                                reviewForm.setData('manager_id', value)
                            }
                            error={reviewForm.errors.manager_id}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReviewDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={reviewForm.processing}
                            >
                                <Plus className="size-4 mr-1.5" />
                                Buat Penilaian
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Objective */}
            <Dialog
                open={objectiveDialogOpen}
                onOpenChange={setObjectiveDialogOpen}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingObjective
                                ? 'Edit Sasaran (Objective)'
                                : 'Tambah Sasaran (Objective)'}
                        </DialogTitle>
                        <DialogDescription>
                            Sasaran strategis utama yang ingin dicapai karyawan
                            pada periode ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitObjective}
                        className="flex flex-col gap-4"
                    >
                        <TextField
                            label="Judul Sasaran (Objective)"
                            value={objectiveForm.data.title}
                            onChange={(value) =>
                                objectiveForm.setData('title', value)
                            }
                            error={objectiveForm.errors.title}
                            placeholder="Contoh: Meningkatkan retensi pelanggan kuartal ini"
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Bobot Sasaran"
                                type="number"
                                value={objectiveForm.data.weight}
                                onChange={(value) =>
                                    objectiveForm.setData('weight', value)
                                }
                                error={objectiveForm.errors.weight}
                            />
                            <FieldSelect
                                label="Status"
                                value={objectiveForm.data.status}
                                options={objectiveStatusOptions.map(
                                    (status) => ({
                                        value: status,
                                        label: statusLabel(status),
                                    }),
                                )}
                                onChange={(value) =>
                                    objectiveForm.setData('status', value)
                                }
                                error={objectiveForm.errors.status}
                            />
                        </div>
                        <TextAreaField
                            label="Deskripsi / Catatan"
                            value={objectiveForm.data.description}
                            onChange={(value) =>
                                objectiveForm.setData('description', value)
                            }
                            error={objectiveForm.errors.description}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setObjectiveDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={objectiveForm.processing}
                            >
                                <Save className="size-4 mr-1.5" />
                                Simpan Sasaran
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Key Result */}
            <Dialog
                open={keyResultDialogOpen}
                onOpenChange={setKeyResultDialogOpen}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingKeyResult
                                ? 'Edit Key Result'
                                : 'Tambah Key Result'}
                        </DialogTitle>
                        <DialogDescription>
                            Target terukur untuk sasaran:{' '}
                            <span className="font-semibold text-foreground">
                                {keyResultObjective?.title}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitKeyResult}
                        className="flex flex-col gap-4"
                    >
                        <TextField
                            label="Target Capaian (Key Result)"
                            value={keyResultForm.data.title}
                            onChange={(value) =>
                                keyResultForm.setData('title', value)
                            }
                            error={keyResultForm.errors.title}
                            placeholder="Contoh: Merilis 3 fitur baru"
                        />
                        <div className="grid gap-3 md:grid-cols-3">
                            <TextField
                                label="Target"
                                type="number"
                                value={keyResultForm.data.target_value}
                                onChange={(value) =>
                                    keyResultForm.setData('target_value', value)
                                }
                                error={keyResultForm.errors.target_value}
                            />
                            <TextField
                                label="Aktual / Capaian"
                                type="number"
                                value={keyResultForm.data.actual_value}
                                onChange={(value) =>
                                    keyResultForm.setData('actual_value', value)
                                }
                                error={keyResultForm.errors.actual_value}
                            />
                            <TextField
                                label="Satuan"
                                value={keyResultForm.data.unit}
                                onChange={(value) =>
                                    keyResultForm.setData('unit', value)
                                }
                                error={keyResultForm.errors.unit}
                                placeholder="fitur / % / kali"
                            />
                        </div>
                        <FieldSelect
                            label="Status"
                            value={keyResultForm.data.status}
                            options={objectiveStatusOptions.map((status) => ({
                                value: status,
                                label: statusLabel(status),
                            }))}
                            onChange={(value) =>
                                keyResultForm.setData('status', value)
                            }
                            error={keyResultForm.errors.status}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setKeyResultDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={keyResultForm.processing}
                            >
                                <Save className="size-4 mr-1.5" />
                                Simpan Key Result
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Update KPI Manual */}
            <Dialog
                open={editingKpi !== null}
                onOpenChange={(open) => !open && setEditingKpi(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Capaian KPI</DialogTitle>
                        <DialogDescription className="font-semibold text-foreground">
                            {editingKpi?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitKpi} className="flex flex-col gap-4">
                        <div className="rounded-lg bg-muted/40 p-3 text-xs flex justify-between">
                            <div>
                                <span className="text-muted-foreground">Target: </span>
                                <span className="font-bold">
                                    {editingKpi?.target_value}{' '}
                                    {editingKpi?.unit ?? ''}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Bobot: </span>
                                <span className="font-bold">
                                    {editingKpi?.weight}
                                </span>
                            </div>
                        </div>
                        <TextField
                            label="Nilai Capaian Aktual"
                            type="number"
                            value={kpiForm.data.actual_value}
                            onChange={(value) =>
                                kpiForm.setData('actual_value', value)
                            }
                            error={kpiForm.errors.actual_value}
                        />
                        <TextAreaField
                            label="Catatan Capaian (Opsional)"
                            value={kpiForm.data.notes}
                            onChange={(value) =>
                                kpiForm.setData('notes', value)
                            }
                            error={kpiForm.errors.notes}
                            placeholder="Tuliskan kendala, bukti pencapaian, atau keterangan pendukung..."
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingKpi(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={kpiForm.processing}>
                                <Save className="size-4 mr-1.5" />
                                Simpan Capaian
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

// ==========================================
// Subcomponent: Ringkasan / Dashboard Panel
// ==========================================
function DashboardPanel({
    stats,
    reviews,
    onSelectReview,
}: {
    stats: PageProps['stats'];
    reviews: Review[];
    onSelectReview: (review: Review) => void;
}) {
    const atRisk = reviews.filter(
        (review) =>
            review.status !== 'not_started' &&
            (review.final_score < 60 ||
                review.okr_score < 60 ||
                review.kpi_score < 60),
    );
    const topPerformers = [...reviews]
        .sort((first, second) => second.final_score - first.final_score)
        .slice(0, 5);

    const avgGrade = getScoreGrade(stats.average_final_score);

    return (
        <div className="flex flex-col gap-6">
            {/* Minimalist Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-xs border-muted/80">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Rata-rata Skor Kinerja
                            </p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-bold tracking-tight">
                                    {formatScore(stats.average_final_score)}
                                </span>
                                <span
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${avgGrade.badgeClass}`}
                                >
                                    Grade {avgGrade.grade}
                                </span>
                            </div>
                        </div>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LineChart className="size-5" />
                        </span>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-muted/80">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Perlu Perhatian (At Risk)
                            </p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                                    {stats.at_risk}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    skor &lt; 60
                                </span>
                            </div>
                        </div>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <TrendingDown className="size-5" />
                        </span>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-muted/80">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Menunggu Evaluasi
                            </p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                                    {stats.pending_reviews}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    karyawan
                                </span>
                            </div>
                        </div>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Clock className="size-5" />
                        </span>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-muted/80">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Penilaian Selesai
                            </p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    {stats.completed_reviews}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    selesai / terkunci
                                </span>
                            </div>
                        </div>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-5" />
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Panduan Penilaian KPI (Minimalist & Easy to Understand) */}
            <Card className="bg-primary/[0.03] border-primary/20 shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <Sparkles className="size-4 text-primary" />
                        Cara Kerja & Komposisi Penilaian KPI
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Sistem penilaian kinerja Humi menggabungkan 3 pilar
                        evaluasi untuk menghasilkan nilai akhir yang objektif dan
                        adil:
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0">
                    <div className="grid gap-3 sm:grid-cols-3 pt-2">
                        <div className="rounded-lg border bg-background/80 p-3 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                                    <Target className="size-3.5" />
                                    1. Sasaran OKR
                                </span>
                                <Badge variant="secondary" className="text-[10px]">
                                    Bobot 50%
                                </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Pencapaian target strategis dan proyek kerja
                                yang disepakati bersama pada awal periode.
                            </p>
                        </div>

                        <div className="rounded-lg border bg-background/80 p-3 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                                    <LineChart className="size-3.5" />
                                    2. Indikator KPI
                                </span>
                                <Badge variant="secondary" className="text-[10px]">
                                    Bobot 40%
                                </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Metrik operasional harian. Dapat tersinkron
                                otomatis dari data absensi (kehadiran & ketepatan
                                waktu).
                            </p>
                        </div>

                        <div className="rounded-lg border bg-background/80 p-3 shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                                    <FilePenLine className="size-3.5" />
                                    3. Evaluasi Atasan
                                </span>
                                <Badge variant="secondary" className="text-[10px]">
                                    Bobot 10%
                                </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Penilaian kualitatif langsung dari manager,
                                apresiasi kelebihan, dan arahan pengembangan
                                masa depan.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom: Needs Action & Top Performers */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="shadow-xs border-muted/80">
                    <CardHeader className="p-4 sm:p-5 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingDown className="size-4 text-rose-500" />
                            Perlu Tindakan (Skor di Bawah 60)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Karyawan dengan capaian rendah yang memerlukan sesi
                            coaching atau bantuan dari atasan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0 flex flex-col gap-2">
                        {atRisk.length ? (
                            atRisk.slice(0, 5).map((review) => (
                                <ActionRow
                                    key={review.id}
                                    review={review}
                                    onClick={() => onSelectReview(review)}
                                />
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                                <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                                Luar biasa! Tidak ada karyawan dengan capaian di
                                bawah 60 pada filter ini.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-muted/80">
                    <CardHeader className="p-4 sm:p-5 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Trophy className="size-4 text-amber-500" />
                            Kinerja Tertinggi (Top Performers)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Karyawan dengan akumulasi skor akhir terbaik pada
                            periode saat ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0 flex flex-col gap-2">
                        {topPerformers.length ? (
                            topPerformers.map((review) => (
                                <ActionRow
                                    key={review.id}
                                    review={review}
                                    onClick={() => onSelectReview(review)}
                                />
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                                Belum ada data skor yang tersedia.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ==========================================
// Subcomponent: Detail Review Panel
// ==========================================
function ReviewDetailPanel({
    review,
    locked,
    permissions,
    managerOptions,
    statusOptions,
    managerReviewForm,
    onSubmitManagerReview,
    onCreateObjective,
    onEditObjective,
    onDeleteObjective,
    onCreateKeyResult,
    onEditKeyResult,
    onDeleteKeyResult,
    onEditKpi,
    onSyncAttendance,
}: {
    review: Review;
    locked: boolean;
    permissions: PageProps['permissions'];
    managerOptions: Array<{ value: string; label: string }>;
    statusOptions: string[];
    managerReviewForm: ReturnType<typeof useForm<ManagerReviewForm>>;
    onSubmitManagerReview: (event: FormEvent) => void;
    onCreateObjective: () => void;
    onEditObjective: (objective: Objective) => void;
    onDeleteObjective: (objective: Objective) => void;
    onCreateKeyResult: (objective: Objective) => void;
    onEditKeyResult: (objective: Objective, keyResult: KeyResult) => void;
    onDeleteKeyResult: (keyResult: KeyResult) => void;
    onEditKpi: (kpi: KpiResult) => void;
    onSyncAttendance: () => void;
}) {
    const [subTab, setSubTab] = useState<'kpi' | 'okr' | 'manager' | 'checkins'>(
        'kpi',
    );

    const grade = getScoreGrade(review.final_score);
    const employeeName = review.employee?.full_name ?? 'Tanpa Nama';
    const initials = employeeName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <div className="flex flex-col gap-4">
            {/* Top Employee & Score Summary Card */}
            <Card className="shadow-xs border-muted/80 overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                    {/* Employee Profile Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold">
                                {initials}
                            </span>
                            <div>
                                <h3 className="font-bold text-foreground text-sm sm:text-base leading-tight">
                                    {employeeName}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {review.employee?.employee_code ?? '-'} •{' '}
                                    {review.employee?.position?.name ??
                                        review.employee?.division?.name ??
                                        '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={review.status} />
                            <span className="text-[10px] text-muted-foreground">
                                Periode: {review.period?.name ?? '-'}
                            </span>
                        </div>
                    </div>

                    {/* Minimalist Final Score Hero */}
                    <div className="mt-4 rounded-xl border bg-muted/20 p-3.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Skor Akhir Kinerja
                                </p>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-2xl font-black tabular-nums tracking-tight">
                                        {formatScore(review.final_score)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${grade.badgeClass}`}
                                    >
                                        Grade {grade.grade} ({grade.label})
                                    </span>
                                </div>
                            </div>

                            <div className="text-right text-xs text-muted-foreground">
                                <p>
                                    Atasan:{' '}
                                    <span className="font-medium text-foreground">
                                        {review.manager?.label?.split(' - ')[1] ??
                                            review.manager?.label ??
                                            '-'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* 3-Pillar Progress Contribution Bar */}
                        <div className="mt-3">
                            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                                <span>
                                    OKR 50%:{' '}
                                    <strong className="text-foreground">
                                        {formatScore(review.okr_score)}
                                    </strong>
                                </span>
                                <span>
                                    KPI 40%:{' '}
                                    <strong className="text-foreground">
                                        {formatScore(review.kpi_score)}
                                    </strong>
                                </span>
                                <span>
                                    Atasan 10%:{' '}
                                    <strong className="text-foreground">
                                        {formatScore(review.manager_score ?? 0)}
                                    </strong>
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                                <div
                                    className="bg-primary h-full transition-all"
                                    style={{
                                        width: `${Math.min((review.okr_score * 0.5), 50)}%`,
                                    }}
                                    title={`Kontribusi OKR: ${(review.okr_score * 0.5).toFixed(1)} poin`}
                                />
                                <div
                                    className="bg-blue-500 h-full transition-all"
                                    style={{
                                        width: `${Math.min((review.kpi_score * 0.4), 40)}%`,
                                    }}
                                    title={`Kontribusi KPI: ${(review.kpi_score * 0.4).toFixed(1)} poin`}
                                />
                                <div
                                    className="bg-amber-500 h-full transition-all"
                                    style={{
                                        width: `${Math.min(((review.manager_score ?? 0) * 0.1), 10)}%`,
                                    }}
                                    title={`Kontribusi Atasan: ${((review.manager_score ?? 0) * 0.1).toFixed(1)} poin`}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sub-Tabs for Review Detail */}
            <div className="flex rounded-lg border bg-muted/40 p-1 text-xs font-medium">
                <button
                    type="button"
                    onClick={() => setSubTab('kpi')}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        subTab === 'kpi'
                            ? 'bg-background text-foreground shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Indikator KPI ({review.kpi_results.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('okr')}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        subTab === 'okr'
                            ? 'bg-background text-foreground shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Sasaran OKR ({review.objectives.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('manager')}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        subTab === 'manager'
                            ? 'bg-background text-foreground shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Evaluasi Atasan
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('checkins')}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        subTab === 'checkins'
                            ? 'bg-background text-foreground shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Aktivitas ({review.check_ins.length})
                </button>
            </div>

            {/* Sub-Tab 1: Indikator KPI */}
            {subTab === 'kpi' ? (
                <Card className="shadow-xs border-muted/80">
                    <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <LineChart className="size-4 text-primary" />
                                Indikator KPI (Bobot 40%)
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Skor KPI saat ini:{' '}
                                <strong className="text-foreground">
                                    {formatScore(review.kpi_score)}
                                </strong>
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5"
                            onClick={onSyncAttendance}
                            disabled={locked}
                            title="Tarik otomatis data kehadiran dan ketepatan waktu dari mesin/aplikasi absensi"
                        >
                            <RefreshCw className="size-3.5" />
                            Sync Absensi
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0 flex flex-col gap-3">
                        {review.kpi_results.length ? (
                            review.kpi_results.map((kpi) => {
                                const kpiGrade = getScoreGrade(kpi.score);
                                return (
                                    <div
                                        key={kpi.id}
                                        className="rounded-lg border p-3 bg-card hover:bg-muted/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-xs text-foreground truncate">
                                                        {kpi.name}
                                                    </p>
                                                    <span
                                                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                                            kpi.input_type ===
                                                            'attendance'
                                                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {kpi.input_type ===
                                                        'attendance'
                                                            ? '⚡ Absensi'
                                                            : 'Manual'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-1">
                                                    Target: {kpi.target_value}{' '}
                                                    {kpi.unit ?? ''} • Aktual:{' '}
                                                    <strong className="text-foreground">
                                                        {kpi.actual_value}{' '}
                                                        {kpi.unit ?? ''}
                                                    </strong>{' '}
                                                    • Bobot: {kpi.weight}
                                                </p>
                                                {kpi.notes ? (
                                                    <p className="text-[11px] text-muted-foreground/80 mt-1 italic">
                                                        Catatan: {kpi.notes}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="text-right">
                                                    <span className="text-xs font-bold tabular-nums">
                                                        {formatScore(kpi.score)}
                                                    </span>
                                                    <span
                                                        className={`block text-[9px] font-bold ${kpiGrade.textClass}`}
                                                    >
                                                        {kpiGrade.label}
                                                    </span>
                                                </div>

                                                {kpi.input_type === 'manual' ? (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7"
                                                        onClick={() =>
                                                            onEditKpi(kpi)
                                                        }
                                                        disabled={locked}
                                                        title="Update Capaian"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-2.5">
                                            <Progress
                                                value={Math.min(kpi.score, 100)}
                                                className="h-1.5"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                                <LineChart className="size-6 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="font-medium text-foreground">
                                    Belum ada indikator KPI
                                </p>
                                <p className="mt-1 max-w-xs mx-auto">
                                    Klik tombol "Sync Absensi" untuk menarik
                                    data kehadiran atau atur template KPI
                                    divisi.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {/* Sub-Tab 2: Sasaran OKR */}
            {subTab === 'okr' ? (
                <Card className="shadow-xs border-muted/80">
                    <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <Target className="size-4 text-primary" />
                                Sasaran Strategis (Bobot 50%)
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Skor OKR saat ini:{' '}
                                <strong className="text-foreground">
                                    {formatScore(review.okr_score)}
                                </strong>
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5"
                            onClick={onCreateObjective}
                            disabled={locked}
                        >
                            <Plus className="size-3.5" />
                            Tambah Sasaran
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0 flex flex-col gap-3">
                        {review.objectives.length ? (
                            review.objectives.map((objective) => (
                                <div
                                    key={objective.id}
                                    className="rounded-lg border p-3 bg-card"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-xs text-foreground">
                                                {objective.title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                Bobot: {objective.weight} • Skor:{' '}
                                                <strong className="text-foreground">
                                                    {formatScore(
                                                        objective.score,
                                                    )}
                                                </strong>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="size-7"
                                                onClick={() =>
                                                    onCreateKeyResult(objective)
                                                }
                                                disabled={locked}
                                                title="Tambah Target Key Result"
                                            >
                                                <Plus className="size-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="size-7"
                                                onClick={() =>
                                                    onEditObjective(objective)
                                                }
                                                disabled={locked}
                                                title="Edit Sasaran"
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="size-7 text-rose-500 hover:text-rose-600"
                                                onClick={() =>
                                                    onDeleteObjective(objective)
                                                }
                                                disabled={locked}
                                                title="Hapus Sasaran"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Key Results list */}
                                    <div className="mt-2.5 flex flex-col gap-1.5 pl-2 border-l-2 border-primary/20">
                                        {objective.key_results.length ? (
                                            objective.key_results.map(
                                                (keyResult) => (
                                                    <div
                                                        key={keyResult.id}
                                                        className="flex items-center justify-between gap-2 rounded bg-muted/40 px-2.5 py-1.5 text-xs"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate text-[11px] font-medium">
                                                                {keyResult.title}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                Capaian:{' '}
                                                                {
                                                                    keyResult.actual_value
                                                                }
                                                                /
                                                                {
                                                                    keyResult.target_value
                                                                }{' '}
                                                                {keyResult.unit ??
                                                                    ''}{' '}
                                                                • Skor:{' '}
                                                                {formatScore(
                                                                    keyResult.score,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-6"
                                                                onClick={() =>
                                                                    onEditKeyResult(
                                                                        objective,
                                                                        keyResult,
                                                                    )
                                                                }
                                                                disabled={locked}
                                                            >
                                                                <Pencil className="size-3" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-6 text-rose-500 hover:text-rose-600"
                                                                onClick={() =>
                                                                    onDeleteKeyResult(
                                                                        keyResult,
                                                                    )
                                                                }
                                                                disabled={locked}
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <p className="text-[11px] text-muted-foreground italic py-1">
                                                Belum ada target Key Result.
                                                Klik tombol '+' di atas untuk
                                                menambahkan.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                                <Target className="size-6 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="font-medium text-foreground">
                                    Belum ada Sasaran OKR
                                </p>
                                <p className="mt-1">
                                    Tambahkan sasaran kerja strategis untuk
                                    karyawan pada periode ini.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {/* Sub-Tab 3: Evaluasi Atasan */}
            {subTab === 'manager' ? (
                <Card className="shadow-xs border-muted/80">
                    <CardHeader className="p-4 sm:p-5 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                            <FilePenLine className="size-4 text-primary" />
                            Evaluasi & Catatan Atasan (Bobot 10%)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Masukkan skor evaluasi atasan (skala 0 - 100) dan
                            umpan balik pengembangan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                        <form
                            onSubmit={onSubmitManagerReview}
                            className="flex flex-col gap-3.5"
                        >
                            {permissions.can_manage_all ? (
                                <SearchSelectField
                                    label="Atasan / Manager Penilai"
                                    value={managerReviewForm.data.manager_id}
                                    options={managerOptions}
                                    onChange={(value) =>
                                        managerReviewForm.setData(
                                            'manager_id',
                                            value,
                                        )
                                    }
                                    error={managerReviewForm.errors.manager_id}
                                    disabled={locked}
                                />
                            ) : null}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <FieldSelect
                                    label="Status Evaluasi"
                                    value={managerReviewForm.data.status}
                                    options={statusOptions.map((status) => ({
                                        value: status,
                                        label: statusLabel(status),
                                    }))}
                                    onChange={(value) =>
                                        managerReviewForm.setData(
                                            'status',
                                            value,
                                        )
                                    }
                                    error={managerReviewForm.errors.status}
                                    disabled={locked}
                                />
                                <TextField
                                    label="Nilai dari Atasan (0 - 100)"
                                    type="number"
                                    value={managerReviewForm.data.manager_score}
                                    onChange={(value) =>
                                        managerReviewForm.setData(
                                            'manager_score',
                                            value,
                                        )
                                    }
                                    error={
                                        managerReviewForm.errors.manager_score
                                    }
                                    disabled={locked}
                                    placeholder="Contoh: 85"
                                />
                            </div>

                            <TextAreaField
                                label="Catatan Evaluasi Umum"
                                value={managerReviewForm.data.manager_notes}
                                onChange={(value) =>
                                    managerReviewForm.setData(
                                        'manager_notes',
                                        value,
                                    )
                                }
                                error={managerReviewForm.errors.manager_notes}
                                disabled={locked}
                                placeholder="Ulasan umum mengenai kinerja karyawan pada periode ini..."
                            />

                            <div className="grid gap-3 sm:grid-cols-2">
                                <TextAreaField
                                    label="Kelebihan / Kekuatan Karyawan"
                                    value={managerReviewForm.data.strengths}
                                    onChange={(value) =>
                                        managerReviewForm.setData(
                                            'strengths',
                                            value,
                                        )
                                    }
                                    error={managerReviewForm.errors.strengths}
                                    disabled={locked}
                                    placeholder="Hal-hal positif yang patut dipertahankan..."
                                />
                                <TextAreaField
                                    label="Area Peningkatan / Perbaikan"
                                    value={
                                        managerReviewForm.data.improvement_areas
                                    }
                                    onChange={(value) =>
                                        managerReviewForm.setData(
                                            'improvement_areas',
                                            value,
                                        )
                                    }
                                    error={
                                        managerReviewForm.errors
                                            .improvement_areas
                                    }
                                    disabled={locked}
                                    placeholder="Hal-hal yang perlu ditingkatkan..."
                                />
                            </div>

                            <TextAreaField
                                label="Rencana Tindak Lanjut (Next Action)"
                                value={managerReviewForm.data.next_action}
                                onChange={(value) =>
                                    managerReviewForm.setData(
                                        'next_action',
                                        value,
                                    )
                                }
                                error={managerReviewForm.errors.next_action}
                                disabled={locked}
                                placeholder="Target atau pelatihan yang disepakati untuk periode berikutnya..."
                            />

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={
                                        locked || managerReviewForm.processing
                                    }
                                    className="gap-1.5"
                                >
                                    <Save className="size-4" />
                                    Simpan Evaluasi
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : null}

            {/* Sub-Tab 4: Aktivitas Progres (Check-ins) */}
            {subTab === 'checkins' ? (
                <Card className="shadow-xs border-muted/80">
                    <CardHeader className="p-4 sm:p-5 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                            <Clock className="size-4 text-primary" />
                            Aktivitas Kerja dari Portal Karyawan
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Riwayat progres mandiri yang dilaporkan oleh karyawan
                            melalui portal self-service.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0 flex flex-col gap-2.5">
                        {review.check_ins.length ? (
                            review.check_ins.map((checkIn) => (
                                <div
                                    key={checkIn.id}
                                    className="rounded-lg border p-3 text-xs bg-muted/20"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                                            <Calendar className="size-3 text-muted-foreground" />
                                            {checkIn.check_in_date}
                                        </span>
                                        <StatusBadge status={checkIn.status} />
                                    </div>
                                    {checkIn.kpi_result ? (
                                        <p className="text-[11px] font-medium text-primary mb-1">
                                            Acuan KPI: {checkIn.kpi_result.name}
                                        </p>
                                    ) : null}
                                    <p className="text-foreground leading-relaxed">
                                        {checkIn.summary}
                                    </p>
                                    {checkIn.action_items ? (
                                        <p className="text-muted-foreground mt-1 text-[11px] bg-background/80 p-2 rounded border">
                                            Rencana Aksi: {checkIn.action_items}
                                        </p>
                                    ) : null}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                                Belum ada catatan aktivitas yang dilaporkan
                                karyawan melalui portal.
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}

// ==========================================
// Subcomponent: Template Panel
// ==========================================
function TemplatePanel({
    templates,
    canManage,
    onCreate,
    onEdit,
    onDelete,
    onCreateMetric,
    onEditMetric,
    onDeleteMetric,
    onAddAttendanceDefaults,
}: {
    templates: KpiTemplate[];
    canManage: boolean;
    onCreate: () => void;
    onEdit: (template: KpiTemplate) => void;
    onDelete: (template: KpiTemplate) => void;
    onCreateMetric: (template: KpiTemplate) => void;
    onEditMetric: (template: KpiTemplate, metric: KpiMetric) => void;
    onDeleteMetric: (metric: KpiMetric) => void;
    onAddAttendanceDefaults: (template: KpiTemplate) => void;
}) {
    return (
        <Card className="shadow-xs border-muted/80">
            <CardHeader className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Layers className="size-4 text-primary" />
                        Template Indikator KPI
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Standar indikator kinerja yang otomatis disematkan
                        berdasarkan divisi atau jabatan karyawan.
                    </CardDescription>
                </div>
                {canManage ? (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onCreate}
                        className="gap-1.5"
                    >
                        <Plus className="size-3.5" />
                        Buat Template
                    </Button>
                ) : null}
            </CardHeader>
            <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
                {templates.length ? (
                    templates.map((template) => (
                        <div
                            key={template.id}
                            className="rounded-xl border bg-card p-4 shadow-2xs hover:border-primary/30 transition-colors"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b pb-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-sm text-foreground">
                                            {template.name}
                                        </h3>
                                        <Badge
                                            variant={
                                                template.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="text-[10px]"
                                        >
                                            {template.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Divisi:{' '}
                                        <span className="font-medium text-foreground">
                                            {template.division?.name ??
                                                'Semua Divisi'}
                                        </span>{' '}
                                        • Jabatan:{' '}
                                        <span className="font-medium text-foreground">
                                            {template.position?.name ??
                                                'Semua Jabatan'}
                                        </span>
                                    </p>
                                    {template.description ? (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {template.description}
                                        </p>
                                    ) : null}
                                </div>

                                {canManage ? (
                                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs gap-1.5"
                                            onClick={() =>
                                                onAddAttendanceDefaults(template)
                                            }
                                            title="Tambahkan otomatis indikator Kehadiran & Ketepatan Waktu dari mesin absensi"
                                        >
                                            <RefreshCw className="size-3 text-muted-foreground" />
                                            + Indikator Absensi
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs gap-1.5"
                                            onClick={() =>
                                                onCreateMetric(template)
                                            }
                                        >
                                            <Plus className="size-3" />
                                            Metrik
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="size-7"
                                            onClick={() => onEdit(template)}
                                            title="Edit Template"
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="size-7 text-rose-500 hover:text-rose-600"
                                            onClick={() => onDelete(template)}
                                            title="Hapus Template"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ) : null}
                            </div>

                            {/* Metrics Table */}
                            <div className="mt-3 overflow-hidden rounded-lg border">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-muted/40 text-[11px] font-medium text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-3 py-2">
                                                Indikator KPI
                                            </th>
                                            <th className="px-3 py-2">Sumber</th>
                                            <th className="px-3 py-2 text-right">
                                                Target
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Bobot
                                            </th>
                                            {canManage ? (
                                                <th className="px-3 py-2 text-right">
                                                    Aksi
                                                </th>
                                            ) : null}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/60">
                                        {template.metrics.length ? (
                                            template.metrics.map((metric) => (
                                                <tr
                                                    key={metric.id}
                                                    className="hover:bg-muted/20"
                                                >
                                                    <td className="px-3 py-2.5">
                                                        <p className="font-semibold text-foreground text-xs">
                                                            {metric.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {metric.attendance_metric
                                                                ? attendanceMetricLabel(
                                                                      metric.attendance_metric,
                                                                  )
                                                                : metric.direction ===
                                                                    'lower_is_better'
                                                                  ? 'Makin rendah makin baik'
                                                                  : 'Makin tinggi makin baik'}
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <span
                                                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                                                metric.input_type ===
                                                                'attendance'
                                                                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {metric.input_type ===
                                                            'attendance'
                                                                ? '⚡ Otomatis Absensi'
                                                                : 'Manual'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                                                        {metric.target_value}{' '}
                                                        {metric.unit ?? ''}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right tabular-nums">
                                                        {metric.weight}
                                                    </td>
                                                    {canManage ? (
                                                        <td className="px-3 py-2.5 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="size-6"
                                                                    onClick={() =>
                                                                        onEditMetric(
                                                                            template,
                                                                            metric,
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="size-3" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="size-6 text-rose-500 hover:text-rose-600"
                                                                    onClick={() =>
                                                                        onDeleteMetric(
                                                                            metric,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="size-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    ) : null}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={canManage ? 5 : 4}
                                                    className="px-3 py-4 text-center text-xs text-muted-foreground"
                                                >
                                                    Belum ada indikator KPI pada
                                                    template ini. Klik '+ Indikator
                                                    Absensi' atau '+ Metrik'.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                        <Layers className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="font-medium text-foreground text-sm">
                            Belum ada Template KPI
                        </p>
                        <p className="mt-1 max-w-sm mx-auto">
                            Buat template untuk menetapkan standar indikator KPI
                            yang berlaku otomatis bagi divisi atau jabatan
                            tertentu.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ==========================================
// Subcomponent: Period Panel
// ==========================================
function PeriodPanel({
    periods,
    canManage,
    onCreate,
    onEdit,
}: {
    periods: PerformancePeriod[];
    canManage: boolean;
    onCreate: () => void;
    onEdit: (period: PerformancePeriod) => void;
}) {
    return (
        <Card className="shadow-xs border-muted/80">
            <CardHeader className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CalendarDays className="size-4 text-primary" />
                        Periode Penilaian Kinerja
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Siklus bulanan atau kuartalan untuk evaluasi kinerja
                        karyawan.
                    </CardDescription>
                </div>
                {canManage ? (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onCreate}
                        className="gap-1.5"
                    >
                        <Plus className="size-3.5" />
                        Buat Periode
                    </Button>
                ) : null}
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/40 text-[11px] font-medium text-muted-foreground uppercase border-b">
                            <tr>
                                <th className="px-4 py-3">Nama Periode</th>
                                <th className="px-3 py-3">Rentang Tanggal</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 text-center">
                                    Jumlah Review
                                </th>
                                {canManage ? (
                                    <th className="px-4 py-3 text-right">
                                        Aksi
                                    </th>
                                ) : null}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/60">
                            {periods.map((period) => (
                                <tr key={period.id} className="hover:bg-muted/20">
                                    <td className="px-4 py-3 font-semibold text-foreground">
                                        {period.name}
                                    </td>
                                    <td className="px-3 py-3 text-muted-foreground">
                                        {period.starts_at} s/d {period.ends_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        <StatusBadge status={period.status} />
                                    </td>
                                    <td className="px-3 py-3 text-center tabular-nums font-medium">
                                        {period.reviews_count ?? 0}
                                    </td>
                                    {canManage ? (
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-xs gap-1"
                                                onClick={() => onEdit(period)}
                                            >
                                                <Pencil className="size-3.5" />
                                                Edit
                                            </Button>
                                        </td>
                                    ) : null}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// ==========================================
// Helper UI Components & Inputs
// ==========================================
function ActionRow({
    review,
    onClick,
}: {
    review: Review;
    onClick: () => void;
}) {
    const grade = getScoreGrade(review.final_score);
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-between gap-3 rounded-lg border p-2.5 text-left hover:bg-muted/40 transition-colors w-full bg-card"
        >
            <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-foreground">
                    {review.employee?.full_name ?? '-'}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                    {review.period?.name ?? '-'} • {statusLabel(review.status)}
                </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold tabular-nums">
                    {formatScore(review.final_score)}
                </span>
                <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${grade.badgeClass}`}
                >
                    {grade.grade}
                </span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
            </div>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    let variantClass =
        'bg-muted text-muted-foreground border-transparent';

    if (status === 'completed' || status === 'active') {
        variantClass =
            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    } else if (status === 'in_progress') {
        variantClass =
            'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    } else if (status === 'submitted') {
        variantClass =
            'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    } else if (status === 'locked' || status === 'closed') {
        variantClass =
            'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${variantClass}`}
        >
            {statusLabel(status)}
        </span>
    );
}

function TextField({
    label,
    value,
    onChange,
    error,
    type = 'text',
    disabled = false,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{label}</Label>
            <Input
                type={type}
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="h-9 text-xs"
            />
            <InputError message={error} />
        </div>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
    error,
    disabled = false,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{label}</Label>
            <textarea
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <InputError message={error} />
        </div>
    );
}

function SearchSelectField({
    label,
    value,
    options,
    onChange,
    error,
    disabled = false,
}: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{label}</Label>
            <SearchableSelect
                value={value}
                options={options}
                onValueChange={onChange}
                disabled={disabled}
            />
            <InputError message={error} />
        </div>
    );
}

function FieldSelect({
    label,
    value,
    options,
    onChange,
    error,
    disabled = false,
}: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{label}</Label>
            <select
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}
