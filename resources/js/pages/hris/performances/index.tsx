import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardCheck,
    FilePenLine,
    Filter,
    LineChart,
    ListChecks,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Trash2,
    TrendingDown,
    Trophy,
    UsersRound,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    score: string;
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

type CheckInForm = {
    check_in_date: string;
    summary: string;
    action_items: string;
    status: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Performance', href: '/hris/performances' },
];

const tabs = ['Dashboard', 'Reviews', 'KPI Templates', 'Periods'] as const;

const periodDefaults = (): PeriodForm => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        name: first.toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
        }),
        starts_at: first.toISOString().slice(0, 10),
        ends_at: last.toISOString().slice(0, 10),
        status: 'draft',
    };
};

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
    unit: '',
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
    score: '0',
    status: 'not_started',
};

const checkInDefaults: CheckInForm = {
    check_in_date: new Date().toISOString().slice(0, 10),
    summary: '',
    action_items: '',
    status: 'open',
};

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
        checkInStatusOptions,
        attendanceMetricOptions,
        stats,
        permissions,
    } = usePage<PageProps>().props;

    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Dashboard');
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(
        reviews.data[0]?.id ?? null,
    );
    const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<PerformancePeriod | null>(null);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<KpiTemplate | null>(null);
    const [metricDialogOpen, setMetricDialogOpen] = useState(false);
    const [metricTemplate, setMetricTemplate] = useState<KpiTemplate | null>(null);
    const [editingMetric, setEditingMetric] = useState<KpiMetric | null>(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [objectiveDialogOpen, setObjectiveDialogOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
    const [keyResultDialogOpen, setKeyResultDialogOpen] = useState(false);
    const [keyResultObjective, setKeyResultObjective] = useState<Objective | null>(null);
    const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | null>(null);
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
    const checkInForm = useForm<CheckInForm>(checkInDefaults);

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
                label: `${period.name} (${period.status})`,
            })),
        [periods],
    );

    const locked = selectedReview?.status === 'locked' || selectedReview?.locked_at !== null;

    const submitFilters = () => {
        router.get('/hris/performances', filterState, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
            periodForm.put(`/hris/performances/periods/${editingPeriod.id}`, options);
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
            division_id: template.division_id ? String(template.division_id) : '',
            position_id: template.position_id ? String(template.position_id) : '',
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
            templateForm.put(`/hris/performances/templates/${editingTemplate.id}`, options);
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
            metricForm.put(`/hris/performances/metrics/${editingMetric.id}`, options);
            return;
        }

        if (metricTemplate) {
            metricForm.post(`/hris/performances/templates/${metricTemplate.id}/metrics`, options);
        }
    };

    const openCreateReview = () => {
        reviewForm.setData({
            ...reviewDefaults,
            performance_period_id:
                periods.find((period) => period.status === 'active')?.id.toString() ??
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
            objectiveForm.put(`/hris/performances/objectives/${editingObjective.id}`, options);
            return;
        }

        objectiveForm.post(`/hris/performances/reviews/${selectedReview.id}/objectives`, options);
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
            score: String(keyResult.score),
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
            keyResultForm.put(`/hris/performances/key-results/${editingKeyResult.id}`, options);
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

    const loadManagerReview = () => {
        if (!selectedReview) {
            return;
        }

        managerReviewForm.setData({
            manager_id: selectedReview.manager ? String(selectedReview.manager.id) : '',
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
    };

    const submitManagerReview = (event: FormEvent) => {
        event.preventDefault();

        if (!selectedReview) {
            return;
        }

        managerReviewForm.put(`/hris/performances/reviews/${selectedReview.id}`, {
            preserveScroll: true,
        });
    };

    const submitCheckIn = (event: FormEvent) => {
        event.preventDefault();

        if (!selectedReview) {
            return;
        }

        checkInForm.post(`/hris/performances/reviews/${selectedReview.id}/check-ins`, {
            preserveScroll: true,
            onSuccess: () => checkInForm.setData(checkInDefaults),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Performance" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">HRIS</p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Employee Performance
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {permissions.can_manage_all ? (
                            <>
                                <Button type="button" variant="outline" onClick={openCreatePeriod}>
                                    <CalendarDays className="size-4" />
                                    Periode
                                </Button>
                                <Button type="button" variant="outline" onClick={openCreateTemplate}>
                                    <ListChecks className="size-4" />
                                    Template KPI
                                </Button>
                                <Button type="button" onClick={openCreateReview}>
                                    <Plus className="size-4" />
                                    Review
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 rounded-lg border bg-card p-1">
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            type="button"
                            variant={activeTab === tab ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

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

                {activeTab === 'Reviews' ? (
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UsersRound className="size-4" />
                                    Review Karyawan
                                </CardTitle>
                                <CardDescription>
                                    {reviews.from ?? 0}-{reviews.to ?? 0} dari {reviews.total} review.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                                    <FieldSelect
                                        label="Periode"
                                        value={filterState.period_id}
                                        options={[{ value: '', label: 'Semua' }, ...periodOptions]}
                                        onChange={(value) =>
                                            setFilterState({ ...filterState, period_id: value })
                                        }
                                    />
                                    <FieldSelect
                                        label="Status"
                                        value={filterState.status}
                                        options={[
                                            { value: '', label: 'Semua' },
                                            ...statusOptions.map((status) => ({
                                                value: status,
                                                label: statusLabel(status),
                                            })),
                                        ]}
                                        onChange={(value) =>
                                            setFilterState({ ...filterState, status: value })
                                        }
                                    />
                                    <SearchField
                                        label="Cari"
                                        value={filterState.search}
                                        onChange={(value) =>
                                            setFilterState({ ...filterState, search: value })
                                        }
                                    />
                                    <FieldSelect
                                        label="Divisi"
                                        value={filterState.division_id}
                                        options={[{ value: '', label: 'Semua' }, ...divisionOptions]}
                                        onChange={(value) =>
                                            setFilterState({ ...filterState, division_id: value })
                                        }
                                    />
                                    <FieldSelect
                                        label="Posisi"
                                        value={filterState.position_id}
                                        options={[{ value: '', label: 'Semua' }, ...positionOptions]}
                                        onChange={(value) =>
                                            setFilterState({ ...filterState, position_id: value })
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="md:self-end"
                                        onClick={submitFilters}
                                    >
                                        <Filter className="size-4" />
                                        Filter
                                    </Button>
                                </div>

                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                                            <tr>
                                                <th className="px-3 py-2">Karyawan</th>
                                                <th className="px-3 py-2">Periode</th>
                                                <th className="px-3 py-2">Status</th>
                                                <th className="px-3 py-2 text-right">OKR</th>
                                                <th className="px-3 py-2 text-right">KPI</th>
                                                <th className="px-3 py-2 text-right">Final</th>
                                                <th className="px-3 py-2 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviews.data.length ? (
                                                reviews.data.map((review) => (
                                                    <tr
                                                        key={review.id}
                                                        className="border-t"
                                                    >
                                                        <td className="px-3 py-3">
                                                            <p className="font-medium">
                                                                {review.employee?.full_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {review.employee?.division?.name ?? '-'} /{' '}
                                                                {review.employee?.position?.name ?? '-'}
                                                            </p>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {review.period?.name ?? '-'}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <StatusBadge status={review.status} />
                                                        </td>
                                                        <td className="px-3 py-3 text-right tabular-nums">
                                                            {formatScore(review.okr_score)}
                                                        </td>
                                                        <td className="px-3 py-3 text-right tabular-nums">
                                                            {formatScore(review.kpi_score)}
                                                        </td>
                                                        <td className="px-3 py-3 text-right tabular-nums">
                                                            <span className="font-semibold">
                                                                {formatScore(review.final_score)}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-right">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={
                                                                    selectedReview?.id === review.id
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                onClick={() =>
                                                                    setSelectedReviewId(review.id)
                                                                }
                                                            >
                                                                Kelola
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-3 py-8 text-center text-muted-foreground"
                                                    >
                                                        Belum ada review performance.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination links={reviews.links} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FilePenLine className="size-4" />
                                    Detail Review
                                </CardTitle>
                                <CardDescription>
                                    {selectedReview?.employee?.label ?? 'Pilih review'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedReview ? (
                                    <ReviewDetail
                                        review={selectedReview}
                                        locked={locked}
                                        permissions={permissions}
                                        managerOptions={managerSelectOptions}
                                        statusOptions={statusOptions}
                                        checkInStatusOptions={checkInStatusOptions}
                                        managerReviewForm={managerReviewForm}
                                        checkInForm={checkInForm}
                                        onLoadManagerReview={loadManagerReview}
                                        onSubmitManagerReview={submitManagerReview}
                                        onSubmitCheckIn={submitCheckIn}
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
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada review pada filter saat ini.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : null}

                {activeTab === 'KPI Templates' ? (
                    <TemplatePanel
                        templates={templates}
                        canManage={permissions.can_manage_all}
                        onCreate={openCreateTemplate}
                        onEdit={openEditTemplate}
                        onDelete={(template) =>
                            router.delete(`/hris/performances/templates/${template.id}`, {
                                preserveScroll: true,
                            })
                        }
                        onCreateMetric={openCreateMetric}
                        onEditMetric={openEditMetric}
                        onDeleteMetric={(metric) =>
                            router.delete(`/hris/performances/metrics/${metric.id}`, {
                                preserveScroll: true,
                            })
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

                {activeTab === 'Periods' ? (
                    <PeriodPanel
                        periods={periods}
                        canManage={permissions.can_manage_all}
                        onCreate={openCreatePeriod}
                        onEdit={openEditPeriod}
                    />
                ) : null}
            </div>

            <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPeriod ? 'Edit Periode' : 'Buat Periode'}
                        </DialogTitle>
                        <DialogDescription>
                            Periode bulanan untuk siklus performance review.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitPeriod} className="flex flex-col gap-4">
                        <TextField
                            label="Nama"
                            value={periodForm.data.name}
                            onChange={(value) => periodForm.setData('name', value)}
                            error={periodForm.errors.name}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Mulai"
                                type="date"
                                value={periodForm.data.starts_at}
                                onChange={(value) => periodForm.setData('starts_at', value)}
                                error={periodForm.errors.starts_at}
                            />
                            <TextField
                                label="Selesai"
                                type="date"
                                value={periodForm.data.ends_at}
                                onChange={(value) => periodForm.setData('ends_at', value)}
                                error={periodForm.errors.ends_at}
                            />
                        </div>
                        <FieldSelect
                            label="Status"
                            value={periodForm.data.status}
                            options={periodStatusOptions.map((status) => ({
                                value: status,
                                label: statusLabel(status),
                            }))}
                            onChange={(value) => periodForm.setData('status', value)}
                            error={periodForm.errors.status}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPeriodDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={periodForm.processing}>
                                <Save className="size-4" />
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? 'Edit Template KPI' : 'Buat Template KPI'}
                        </DialogTitle>
                        <DialogDescription>
                            Template dapat dikaitkan ke divisi atau posisi tertentu.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitTemplate} className="flex flex-col gap-4">
                        <TextField
                            label="Nama"
                            value={templateForm.data.name}
                            onChange={(value) => templateForm.setData('name', value)}
                            error={templateForm.errors.name}
                        />
                        <TextAreaField
                            label="Deskripsi"
                            value={templateForm.data.description}
                            onChange={(value) => templateForm.setData('description', value)}
                            error={templateForm.errors.description}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <SearchSelectField
                                label="Divisi"
                                value={templateForm.data.division_id}
                                options={divisionOptions}
                                onChange={(value) => templateForm.setData('division_id', value)}
                                error={templateForm.errors.division_id}
                            />
                            <SearchSelectField
                                label="Posisi"
                                value={templateForm.data.position_id}
                                options={positionOptions}
                                onChange={(value) => templateForm.setData('position_id', value)}
                                error={templateForm.errors.position_id}
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={templateForm.data.is_active}
                                onChange={(event) =>
                                    templateForm.setData('is_active', event.target.checked)
                                }
                            />
                            Aktif
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTemplateDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={templateForm.processing}>
                                <Save className="size-4" />
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMetric ? 'Edit Metric KPI' : 'Tambah Metric KPI'}
                        </DialogTitle>
                        <DialogDescription>
                            {metricTemplate?.name ?? 'Template KPI'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitMetric} className="flex flex-col gap-4">
                        <TextField
                            label="Nama"
                            value={metricForm.data.name}
                            onChange={(value) => metricForm.setData('name', value)}
                            error={metricForm.errors.name}
                        />
                        <div className="grid gap-3 md:grid-cols-3">
                            <TextField
                                label="Target"
                                type="number"
                                value={metricForm.data.target_value}
                                onChange={(value) => metricForm.setData('target_value', value)}
                                error={metricForm.errors.target_value}
                            />
                            <TextField
                                label="Unit"
                                value={metricForm.data.unit}
                                onChange={(value) => metricForm.setData('unit', value)}
                                error={metricForm.errors.unit}
                            />
                            <TextField
                                label="Bobot"
                                type="number"
                                value={metricForm.data.weight}
                                onChange={(value) => metricForm.setData('weight', value)}
                                error={metricForm.errors.weight}
                            />
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            <FieldSelect
                                label="Input"
                                value={metricForm.data.input_type}
                                options={[
                                    { value: 'manual', label: 'Manual' },
                                    { value: 'attendance', label: 'Attendance' },
                                ]}
                                onChange={(value) =>
                                    metricForm.setData('input_type', value as 'manual' | 'attendance')
                                }
                                error={metricForm.errors.input_type}
                            />
                            <FieldSelect
                                label="Attendance Metric"
                                value={metricForm.data.attendance_metric}
                                options={[
                                    { value: '', label: '-' },
                                    ...attendanceMetricOptions.map((metric) => ({
                                        value: metric,
                                        label: attendanceMetricLabel(metric),
                                    })),
                                ]}
                                onChange={(value) =>
                                    metricForm.setData('attendance_metric', value)
                                }
                                disabled={metricForm.data.input_type === 'manual'}
                                error={metricForm.errors.attendance_metric}
                            />
                            <FieldSelect
                                label="Arah Skor"
                                value={metricForm.data.direction}
                                options={[
                                    {
                                        value: 'higher_is_better',
                                        label: 'Lebih tinggi lebih baik',
                                    },
                                    {
                                        value: 'lower_is_better',
                                        label: 'Lebih rendah lebih baik',
                                    },
                                ]}
                                onChange={(value) =>
                                    metricForm.setData(
                                        'direction',
                                        value as 'higher_is_better' | 'lower_is_better',
                                    )
                                }
                                error={metricForm.errors.direction}
                            />
                        </div>
                        <TextAreaField
                            label="Deskripsi"
                            value={metricForm.data.description}
                            onChange={(value) => metricForm.setData('description', value)}
                            error={metricForm.errors.description}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMetricDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={metricForm.processing}>
                                <Save className="size-4" />
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Buat Review</DialogTitle>
                        <DialogDescription>
                            KPI akan otomatis diisi dari template divisi/posisi karyawan.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitReview} className="flex flex-col gap-4">
                        <SearchSelectField
                            label="Periode"
                            value={reviewForm.data.performance_period_id}
                            options={periodOptions}
                            onChange={(value) =>
                                reviewForm.setData('performance_period_id', value)
                            }
                            error={reviewForm.errors.performance_period_id}
                        />
                        <SearchSelectField
                            label="Karyawan"
                            value={reviewForm.data.employee_id}
                            options={employeeOptions}
                            onChange={(value) => reviewForm.setData('employee_id', value)}
                            error={reviewForm.errors.employee_id}
                        />
                        <SearchSelectField
                            label="Manager"
                            value={reviewForm.data.manager_id}
                            options={managerSelectOptions}
                            onChange={(value) => reviewForm.setData('manager_id', value)}
                            error={reviewForm.errors.manager_id}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReviewDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={reviewForm.processing}>
                                <Plus className="size-4" />
                                Buat
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={objectiveDialogOpen} onOpenChange={setObjectiveDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingObjective ? 'Edit Objective' : 'Tambah Objective'}
                        </DialogTitle>
                        <DialogDescription>Objective OKR untuk review terpilih.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitObjective} className="flex flex-col gap-4">
                        <TextField
                            label="Objective"
                            value={objectiveForm.data.title}
                            onChange={(value) => objectiveForm.setData('title', value)}
                            error={objectiveForm.errors.title}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Bobot"
                                type="number"
                                value={objectiveForm.data.weight}
                                onChange={(value) => objectiveForm.setData('weight', value)}
                                error={objectiveForm.errors.weight}
                            />
                            <FieldSelect
                                label="Status"
                                value={objectiveForm.data.status}
                                options={objectiveStatusOptions.map((status) => ({
                                    value: status,
                                    label: statusLabel(status),
                                }))}
                                onChange={(value) => objectiveForm.setData('status', value)}
                                error={objectiveForm.errors.status}
                            />
                        </div>
                        <TextAreaField
                            label="Deskripsi"
                            value={objectiveForm.data.description}
                            onChange={(value) => objectiveForm.setData('description', value)}
                            error={objectiveForm.errors.description}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setObjectiveDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={objectiveForm.processing}>
                                <Save className="size-4" />
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={keyResultDialogOpen} onOpenChange={setKeyResultDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingKeyResult ? 'Edit Key Result' : 'Tambah Key Result'}
                        </DialogTitle>
                        <DialogDescription>
                            {keyResultObjective?.title ?? 'Objective'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitKeyResult} className="flex flex-col gap-4">
                        <TextField
                            label="Key Result"
                            value={keyResultForm.data.title}
                            onChange={(value) => keyResultForm.setData('title', value)}
                            error={keyResultForm.errors.title}
                        />
                        <div className="grid gap-3 md:grid-cols-3">
                            <TextField
                                label="Target"
                                type="number"
                                value={keyResultForm.data.target_value}
                                onChange={(value) => keyResultForm.setData('target_value', value)}
                                error={keyResultForm.errors.target_value}
                            />
                            <TextField
                                label="Actual"
                                type="number"
                                value={keyResultForm.data.actual_value}
                                onChange={(value) => keyResultForm.setData('actual_value', value)}
                                error={keyResultForm.errors.actual_value}
                            />
                            <TextField
                                label="Unit"
                                value={keyResultForm.data.unit}
                                onChange={(value) => keyResultForm.setData('unit', value)}
                                error={keyResultForm.errors.unit}
                            />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Score 0-120"
                                type="number"
                                value={keyResultForm.data.score}
                                onChange={(value) => keyResultForm.setData('score', value)}
                                error={keyResultForm.errors.score}
                            />
                            <FieldSelect
                                label="Status"
                                value={keyResultForm.data.status}
                                options={objectiveStatusOptions.map((status) => ({
                                    value: status,
                                    label: statusLabel(status),
                                }))}
                                onChange={(value) => keyResultForm.setData('status', value)}
                                error={keyResultForm.errors.status}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setKeyResultDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={keyResultForm.processing}>
                                <Save className="size-4" />
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={editingKpi !== null} onOpenChange={(open) => !open && setEditingKpi(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update KPI</DialogTitle>
                        <DialogDescription>{editingKpi?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitKpi} className="flex flex-col gap-4">
                        <TextField
                            label="Actual"
                            type="number"
                            value={kpiForm.data.actual_value}
                            onChange={(value) => kpiForm.setData('actual_value', value)}
                            error={kpiForm.errors.actual_value}
                        />
                        <TextAreaField
                            label="Catatan"
                            value={kpiForm.data.notes}
                            onChange={(value) => kpiForm.setData('notes', value)}
                            error={kpiForm.errors.notes}
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditingKpi(null)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={kpiForm.processing}>
                                <Save className="size-4" />
                                Simpan
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

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
            review.final_score < 60 ||
            review.okr_score < 60 ||
            review.kpi_score < 60 ||
            review.status === 'not_started',
    );
    const topPerformers = [...reviews]
        .sort((first, second) => second.final_score - first.final_score)
        .slice(0, 5);

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Average Score"
                    value={formatScore(stats.average_final_score)}
                    icon={LineChart}
                />
                <StatCard title="At Risk" value={stats.at_risk} icon={TrendingDown} />
                <StatCard
                    title="Pending Review"
                    value={stats.pending_reviews}
                    icon={ClipboardCheck}
                />
                <StatCard
                    title="Completed"
                    value={stats.completed_reviews}
                    icon={Trophy}
                />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Needs Action</CardTitle>
                        <CardDescription>Review yang perlu ditangani manager.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {atRisk.length ? (
                            atRisk.slice(0, 6).map((review) => (
                                <ActionRow
                                    key={review.id}
                                    review={review}
                                    onClick={() => onSelectReview(review)}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Tidak ada review berisiko pada filter saat ini.
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                        <CardDescription>Final score tertinggi pada filter saat ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {topPerformers.length ? (
                            topPerformers.map((review) => (
                                <ActionRow
                                    key={review.id}
                                    review={review}
                                    onClick={() => onSelectReview(review)}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Belum ada data score.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ReviewDetail({
    review,
    locked,
    permissions,
    managerOptions,
    statusOptions,
    checkInStatusOptions,
    managerReviewForm,
    checkInForm,
    onLoadManagerReview,
    onSubmitManagerReview,
    onSubmitCheckIn,
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
    checkInStatusOptions: string[];
    managerReviewForm: ReturnType<typeof useForm<ManagerReviewForm>>;
    checkInForm: ReturnType<typeof useForm<CheckInForm>>;
    onLoadManagerReview: () => void;
    onSubmitManagerReview: (event: FormEvent) => void;
    onSubmitCheckIn: (event: FormEvent) => void;
    onCreateObjective: () => void;
    onEditObjective: (objective: Objective) => void;
    onDeleteObjective: (objective: Objective) => void;
    onCreateKeyResult: (objective: Objective) => void;
    onEditKeyResult: (objective: Objective, keyResult: KeyResult) => void;
    onDeleteKeyResult: (keyResult: KeyResult) => void;
    onEditKpi: (kpi: KpiResult) => void;
    onSyncAttendance: () => void;
}) {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
                <ScoreBox label="OKR 50%" value={review.okr_score} />
                <ScoreBox label="KPI 40%" value={review.kpi_score} />
                <ScoreBox label="Review 10%" value={review.manager_score ?? 0} />
                <ScoreBox label="Final" value={review.final_score} strong />
            </div>

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">OKR</h3>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onCreateObjective}
                        disabled={locked}
                    >
                        <Plus className="size-4" />
                        Objective
                    </Button>
                </div>
                {review.objectives.length ? (
                    review.objectives.map((objective) => (
                        <div key={objective.id} className="rounded-lg border p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium">{objective.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Bobot {objective.weight} / Score {formatScore(objective.score)}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => onCreateKeyResult(objective)}
                                        disabled={locked}
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => onEditObjective(objective)}
                                        disabled={locked}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => onDeleteObjective(objective)}
                                        disabled={locked}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-col gap-2">
                                {objective.key_results.map((keyResult) => (
                                    <div
                                        key={keyResult.id}
                                        className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
                                    >
                                        <div>
                                            <p>{keyResult.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {keyResult.actual_value}/{keyResult.target_value}{' '}
                                                {keyResult.unit ?? ''} / Score{' '}
                                                {formatScore(keyResult.score)}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() =>
                                                    onEditKeyResult(objective, keyResult)
                                                }
                                                disabled={locked}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => onDeleteKeyResult(keyResult)}
                                                disabled={locked}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada objective.</p>
                )}
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">KPI</h3>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onSyncAttendance}
                        disabled={locked}
                    >
                        <RefreshCw className="size-4" />
                        Sync Attendance
                    </Button>
                </div>
                {review.kpi_results.length ? (
                    review.kpi_results.map((kpi) => (
                        <div key={kpi.id} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium">{kpi.name}</p>
                                        <Badge variant={kpi.input_type === 'attendance' ? 'secondary' : 'outline'}>
                                            {kpi.input_type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Actual {kpi.actual_value} / Target {kpi.target_value}{' '}
                                        {kpi.unit ?? ''} / Bobot {kpi.weight}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold tabular-nums">
                                        {formatScore(kpi.score)}
                                    </span>
                                    {kpi.input_type === 'manual' ? (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onEditKpi(kpi)}
                                            disabled={locked}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                            <Progress value={Math.min(kpi.score, 100)} className="mt-3" />
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada KPI result.</p>
                )}
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Manager Review</h3>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onLoadManagerReview}
                        disabled={locked}
                    >
                        <FilePenLine className="size-4" />
                        Muat Data
                    </Button>
                </div>
                <form onSubmit={onSubmitManagerReview} className="flex flex-col gap-3">
                    {permissions.can_manage_all ? (
                        <SearchSelectField
                            label="Manager"
                            value={managerReviewForm.data.manager_id}
                            options={managerOptions}
                            onChange={(value) => managerReviewForm.setData('manager_id', value)}
                            error={managerReviewForm.errors.manager_id}
                            disabled={locked}
                        />
                    ) : null}
                    <div className="grid gap-3 md:grid-cols-2">
                        <FieldSelect
                            label="Status"
                            value={managerReviewForm.data.status}
                            options={statusOptions.map((status) => ({
                                value: status,
                                label: statusLabel(status),
                            }))}
                            onChange={(value) => managerReviewForm.setData('status', value)}
                            error={managerReviewForm.errors.status}
                            disabled={locked}
                        />
                        <TextField
                            label="Manager Score"
                            type="number"
                            value={managerReviewForm.data.manager_score}
                            onChange={(value) =>
                                managerReviewForm.setData('manager_score', value)
                            }
                            error={managerReviewForm.errors.manager_score}
                            disabled={locked}
                        />
                    </div>
                    <TextAreaField
                        label="Catatan"
                        value={managerReviewForm.data.manager_notes}
                        onChange={(value) =>
                            managerReviewForm.setData('manager_notes', value)
                        }
                        error={managerReviewForm.errors.manager_notes}
                        disabled={locked}
                    />
                    <TextAreaField
                        label="Strengths"
                        value={managerReviewForm.data.strengths}
                        onChange={(value) => managerReviewForm.setData('strengths', value)}
                        error={managerReviewForm.errors.strengths}
                        disabled={locked}
                    />
                    <TextAreaField
                        label="Improvement Areas"
                        value={managerReviewForm.data.improvement_areas}
                        onChange={(value) =>
                            managerReviewForm.setData('improvement_areas', value)
                        }
                        error={managerReviewForm.errors.improvement_areas}
                        disabled={locked}
                    />
                    <TextAreaField
                        label="Next Action"
                        value={managerReviewForm.data.next_action}
                        onChange={(value) => managerReviewForm.setData('next_action', value)}
                        error={managerReviewForm.errors.next_action}
                        disabled={locked}
                    />
                    <Button
                        type="submit"
                        disabled={locked || managerReviewForm.processing}
                        className="self-end"
                    >
                        <Save className="size-4" />
                        Simpan Review
                    </Button>
                </form>
            </section>

            <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Check-ins</h3>
                <form onSubmit={onSubmitCheckIn} className="flex flex-col gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                        <TextField
                            label="Tanggal"
                            type="date"
                            value={checkInForm.data.check_in_date}
                            onChange={(value) => checkInForm.setData('check_in_date', value)}
                            error={checkInForm.errors.check_in_date}
                            disabled={locked}
                        />
                        <FieldSelect
                            label="Status"
                            value={checkInForm.data.status}
                            options={checkInStatusOptions.map((status) => ({
                                value: status,
                                label: statusLabel(status),
                            }))}
                            onChange={(value) => checkInForm.setData('status', value)}
                            error={checkInForm.errors.status}
                            disabled={locked}
                        />
                    </div>
                    <TextAreaField
                        label="Summary"
                        value={checkInForm.data.summary}
                        onChange={(value) => checkInForm.setData('summary', value)}
                        error={checkInForm.errors.summary}
                        disabled={locked}
                    />
                    <TextAreaField
                        label="Action Items"
                        value={checkInForm.data.action_items}
                        onChange={(value) => checkInForm.setData('action_items', value)}
                        error={checkInForm.errors.action_items}
                        disabled={locked}
                    />
                    <Button
                        type="submit"
                        disabled={locked || checkInForm.processing}
                        className="self-end"
                    >
                        <Plus className="size-4" />
                        Tambah Check-in
                    </Button>
                </form>
                {review.check_ins.map((checkIn) => (
                    <div key={checkIn.id} className="rounded-lg border px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{checkIn.check_in_date}</p>
                            <StatusBadge status={checkIn.status} />
                        </div>
                        <p className="mt-1 text-muted-foreground">{checkIn.summary}</p>
                        {checkIn.action_items ? (
                            <p className="mt-1 text-muted-foreground">{checkIn.action_items}</p>
                        ) : null}
                    </div>
                ))}
            </section>
        </div>
    );
}

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
        <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle>KPI Templates</CardTitle>
                    <CardDescription>Template KPI per divisi atau posisi.</CardDescription>
                </div>
                {canManage ? (
                    <Button type="button" onClick={onCreate}>
                        <Plus className="size-4" />
                        Template
                    </Button>
                ) : null}
            </CardHeader>
            <CardContent className="grid gap-4">
                {templates.length ? (
                    templates.map((template) => (
                        <div key={template.id} className="rounded-lg border p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold">{template.name}</h3>
                                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                            {template.is_active ? 'active' : 'inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {template.division?.name ?? 'Semua divisi'} /{' '}
                                        {template.position?.name ?? 'Semua posisi'}
                                    </p>
                                </div>
                                {canManage ? (
                                    <div className="flex flex-wrap gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onAddAttendanceDefaults(template)}
                                        >
                                            <RefreshCw className="size-4" />
                                            KPI Attendance
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onCreateMetric(template)}
                                        >
                                            <Plus className="size-4" />
                                            Metric
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onEdit(template)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onDelete(template)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                            <div className="mt-4 overflow-hidden rounded-lg border">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-3 py-2">Metric</th>
                                            <th className="px-3 py-2">Input</th>
                                            <th className="px-3 py-2 text-right">Target</th>
                                            <th className="px-3 py-2 text-right">Bobot</th>
                                            {canManage ? (
                                                <th className="px-3 py-2 text-right">Aksi</th>
                                            ) : null}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {template.metrics.map((metric) => (
                                            <tr key={metric.id} className="border-t">
                                                <td className="px-3 py-3">
                                                    <p className="font-medium">{metric.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {metric.attendance_metric
                                                            ? attendanceMetricLabel(metric.attendance_metric)
                                                            : metric.direction === 'lower_is_better'
                                                              ? 'Lebih rendah lebih baik'
                                                              : 'Lebih tinggi lebih baik'}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-3">{metric.input_type}</td>
                                                <td className="px-3 py-3 text-right tabular-nums">
                                                    {metric.target_value} {metric.unit ?? ''}
                                                </td>
                                                <td className="px-3 py-3 text-right tabular-nums">
                                                    {metric.weight}
                                                </td>
                                                {canManage ? (
                                                    <td className="px-3 py-3 text-right">
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => onEditMetric(template, metric)}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => onDeleteMetric(metric)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </td>
                                                ) : null}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada template KPI.</p>
                )}
            </CardContent>
        </Card>
    );
}

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
        <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle>Periods</CardTitle>
                    <CardDescription>Siklus bulanan performance review.</CardDescription>
                </div>
                {canManage ? (
                    <Button type="button" onClick={onCreate}>
                        <Plus className="size-4" />
                        Periode
                    </Button>
                ) : null}
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="px-3 py-2">Periode</th>
                                <th className="px-3 py-2">Tanggal</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Review</th>
                                {canManage ? <th className="px-3 py-2 text-right">Aksi</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map((period) => (
                                <tr key={period.id} className="border-t">
                                    <td className="px-3 py-3 font-medium">{period.name}</td>
                                    <td className="px-3 py-3 text-muted-foreground">
                                        {period.starts_at} - {period.ends_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        <StatusBadge status={period.status} />
                                    </td>
                                    <td className="px-3 py-3 text-right tabular-nums">
                                        {period.reviews_count ?? 0}
                                    </td>
                                    {canManage ? (
                                        <td className="px-3 py-3 text-right">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => onEdit(period)}
                                            >
                                                <Pencil className="size-4" />
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

function StatCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    icon: typeof LineChart;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

function ActionRow({ review, onClick }: { review: Review; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left hover:bg-muted/50"
        >
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                    {review.employee?.full_name ?? '-'}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                    {review.period?.name ?? '-'} / {statusLabel(review.status)}
                </span>
            </span>
            <span className="text-sm font-semibold tabular-nums">
                {formatScore(review.final_score)}
            </span>
        </button>
    );
}

function ScoreBox({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div className="rounded-lg border px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={strong ? 'text-xl font-semibold' : 'text-lg font-semibold'}>
                {formatScore(value)}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variant =
        status === 'completed' || status === 'active'
            ? 'default'
            : status === 'locked' || status === 'closed'
              ? 'secondary'
              : 'outline';

    return <Badge variant={variant}>{statusLabel(status)}</Badge>;
}

function TextField({
    label,
    value,
    onChange,
    error,
    type = 'text',
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}

function SearchField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <Input value={value} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
    error,
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <textarea
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
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
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <select
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
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

function Pagination({
    links,
}: {
    links: Array<{ url: string | null; label: string; active: boolean }>;
}) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link, index) =>
                link.url ? (
                    <Button
                        key={`${link.label}-${index}`}
                        asChild
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                    >
                        <Link
                            href={link.url}
                            preserveState
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    </Button>
                ) : (
                    <Button
                        key={`${link.label}-${index}`}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

function formatScore(value: number) {
    return Number(value || 0).toFixed(1);
}

function statusLabel(status: string) {
    return status.replaceAll('_', ' ');
}

function attendanceMetricLabel(metric: string) {
    return metric
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
