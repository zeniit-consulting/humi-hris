import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeftRight,
    ArrowRight,
    Building2,
    Calendar,
    Check,
    CheckCheck,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileCheck,
    FileDown,
    FileText,
    Filter,
    Plus,
    RotateCcw,
    Search,
    ShieldAlert,
    Trash2,
    TrendingDown,
    TrendingUp,
    UploadCloud,
    User,
    UserCheck,
    X,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import ActionIconButton from '@/components/action-icon-button';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
import { SimplePagination } from '@/components/ui/simple-pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type LinkItem = { url: string | null; label: string; active: boolean };
type Paginator<T> = { data: T[]; links: LinkItem[]; total: number; from: number | null; to: number | null };

interface EmployeeOption {
    id: number;
    name: string;
    employee_code: string;
    division_id: number | null;
    division_name?: string | null;
    position_id: number | null;
    position_name?: string | null;
    sub_company_id: number | null;
    sub_company_name?: string | null;
    employment_status: string | null;
    employment_type: string | null;
    base_salary: number;
    daily_wage: number;
}

interface CareerTransitionItem {
    id: number;
    user_id: number;
    employee_id: number;
    transition_number: string;
    letter_number: string | null;
    transition_type: string;
    effective_date: string;
    old_division_name: string | null;
    new_division_name: string | null;
    old_position_name: string | null;
    new_position_name: string | null;
    old_sub_company_name: string | null;
    new_sub_company_name: string | null;
    old_employment_status: string | null;
    new_employment_status: string | null;
    old_employment_type: string | null;
    new_employment_type: string | null;
    old_base_salary: string | number | null;
    new_base_salary: string | number | null;
    old_daily_wage: string | number | null;
    new_daily_wage: string | number | null;
    reason: string;
    notes: string | null;
    attachment_path: string | null;
    attachment_name: string | null;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'applied';
    approval_levels: number;
    approval_stage: number;
    first_approved_at: string | null;
    first_approval_notes: string | null;
    second_approved_at: string | null;
    second_approval_notes: string | null;
    rejected_at: string | null;
    rejection_reason: string | null;
    sk_generated_at: string | null;
    sk_title: string | null;
    sk_signer_name: string | null;
    sk_signer_position: string | null;
    applied_at: string | null;
    created_at: string;
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
        employee_code: string;
        division_id: number | null;
        position_id: number | null;
        sub_company_id: number | null;
        base_salary: number;
        employment_status: string | null;
    };
    first_approver?: { id: number; name: string } | null;
    second_approver?: { id: number; name: string } | null;
    rejected_by?: { id: number; name: string } | null;
    created_by?: { id: number; name: string } | null;
}

interface Props {
    transitions: Paginator<CareerTransitionItem>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        applied: number;
    };
    filters: {
        status?: string;
        transition_type?: string;
        search?: string;
    };
    employees: EmployeeOption[];
    divisions: Array<{ id: number; name: string }>;
    positions: Array<{ id: number; name: string; level?: number }>;
    subCompanies: Array<{ id: number; name: string }>;
    transitionTypes: Record<string, string>;
    statuses: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Karyawan', href: '/hris/employees' },
    { title: 'Mutasi Jabatan', href: '/hris/career-transitions' },
];

function formatRupiah(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num);
}

function formatDateIndo(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

export default function CareerTransitionsIndex({
    transitions,
    stats,
    filters,
    employees,
    divisions,
    positions,
    subCompanies,
    transitionTypes,
    statuses,
}: Props) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedTransition, setSelectedTransition] = useState<CareerTransitionItem | null>(null);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedType, setSelectedType] = useState(filters.transition_type || 'all');

    // Create form
    const createForm = useForm({
        employee_id: '',
        transition_type: 'promotion',
        effective_date: new Date().toISOString().slice(0, 10),
        new_division_id: '',
        new_position_id: '',
        new_sub_company_id: '',
        new_employment_status: '',
        new_employment_type: '',
        new_base_salary: '',
        new_daily_wage: '',
        reason: '',
        notes: '',
        approval_levels: '2',
        letter_number: '',
        sk_signer_name: '',
        sk_signer_position: '',
        attachment: null as File | null,
    });

    const selectedEmployeeObj = useMemo(() => {
        if (!createForm.data.employee_id) return null;
        return employees.find((e) => String(e.id) === String(createForm.data.employee_id)) || null;
    }, [createForm.data.employee_id, employees]);

    const handleSelectEmployee = (val: string) => {
        createForm.setData('employee_id', val);
        const emp = employees.find((e) => String(e.id) === val);
        if (emp) {
            // Preset target to current values as defaults for convenient editing
            createForm.setData((prev) => ({
                ...prev,
                employee_id: val,
                new_division_id: emp.division_id ? String(emp.division_id) : '',
                new_position_id: emp.position_id ? String(emp.position_id) : '',
                new_sub_company_id: emp.sub_company_id ? String(emp.sub_company_id) : '',
                new_employment_status: emp.employment_status || '',
                new_employment_type: emp.employment_type || '',
                new_base_salary: emp.base_salary ? String(emp.base_salary) : '',
                new_daily_wage: emp.daily_wage ? String(emp.daily_wage) : '',
            }));
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilters({
            search: searchQuery,
            status: selectedStatus === 'all' ? undefined : selectedStatus,
            transition_type: selectedType === 'all' ? undefined : selectedType,
        });
    };

    const handleFilterStatus = (status: string) => {
        setSelectedStatus(status);
        applyFilters({
            search: searchQuery,
            status: status === 'all' ? undefined : status,
            transition_type: selectedType === 'all' ? undefined : selectedType,
        });
    };

    const handleFilterType = (type: string) => {
        setSelectedType(type);
        applyFilters({
            search: searchQuery,
            status: selectedStatus === 'all' ? undefined : selectedStatus,
            transition_type: type === 'all' ? undefined : type,
        });
    };

    const applyFilters = (params: Record<string, string | undefined>) => {
        const query: Record<string, string> = {};
        if (params.search) query.search = params.search;
        if (params.status) query.status = params.status;
        if (params.transition_type) query.transition_type = params.transition_type;

        router.get('/hris/career-transitions', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedStatus('all');
        setSelectedType('all');
        router.get('/hris/career-transitions', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleCreateProposal = (e: FormEvent) => {
        e.preventDefault();
        createForm.post('/hris/career-transitions', {
            preserveScroll: true,
            onSuccess: () => {
                setCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const handleApprove = (transition: CareerTransitionItem) => {
        setIsProcessing(true);
        router.post(
            `/hris/career-transitions/${transition.id}/approve`,
            { notes: approvalNotes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDetailDialogOpen(false);
                    setApprovalNotes('');
                },
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    const handleOpenReject = (transition: CareerTransitionItem) => {
        setSelectedTransition(transition);
        setRejectionReason('');
        setRejectDialogOpen(true);
    };

    const handleConfirmReject = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedTransition || !rejectionReason.trim()) return;

        setIsProcessing(true);
        router.post(
            `/hris/career-transitions/${selectedTransition.id}/reject`,
            { reason: rejectionReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectDialogOpen(false);
                    setDetailDialogOpen(false);
                    setRejectionReason('');
                },
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    const handleApply = (transition: CareerTransitionItem) => {
        if (!confirm(`Terapkan perubahan jabatan untuk ${transition.employee?.first_name || 'karyawan'} sekarang? Master data karyawan dan riwayat karir akan otomatis diperbarui.`)) {
            return;
        }

        setIsProcessing(true);
        router.post(
            `/hris/career-transitions/${transition.id}/apply`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    const handleDelete = (transition: CareerTransitionItem) => {
        if (!confirm(`Hapus pengajuan nomor ${transition.transition_number}? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        router.delete(`/hris/career-transitions/${transition.id}`, {
            preserveScroll: true,
        });
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'promotion':
                return (
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <TrendingUp className="mr-1 size-3" />
                        Promosi Jabatan
                    </Badge>
                );
            case 'demotion':
                return (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <TrendingDown className="mr-1 size-3" />
                        Demosi Jabatan
                    </Badge>
                );
            case 'mutation':
                return (
                    <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                        <ArrowLeftRight className="mr-1 size-3" />
                        Mutasi Divisi
                    </Badge>
                );
            case 'salary_adjustment':
                return (
                    <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                        <FileCheck className="mr-1 size-3" />
                        Penyesuaian Gaji
                    </Badge>
                );
            case 'rotation':
                return (
                    <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                        <RotateCcw className="mr-1 size-3" />
                        Rotasi Tugas
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        {transitionTypes[type] || type}
                    </Badge>
                );
        }
    };

    const getStatusBadge = (transition: CareerTransitionItem) => {
        if (transition.status === 'applied') {
            return (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                    <CheckCheck className="mr-1 size-3" />
                    Telah Diterapkan
                </Badge>
            );
        }
        if (transition.status === 'approved') {
            return (
                <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                    <FileCheck className="mr-1 size-3" />
                    Disetujui (SK Terbit)
                </Badge>
            );
        }
        if (transition.status === 'rejected') {
            return (
                <Badge variant="destructive">
                    <XCircle className="mr-1 size-3" />
                    Ditolak
                </Badge>
            );
        }
        if (transition.status === 'pending') {
            if (transition.approval_stage === 0) {
                return (
                    <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        <Clock className="mr-1 size-3" />
                        Menunggu Review Tk. 1
                    </Badge>
                );
            }
            return (
                <Badge variant="outline" className="border-blue-400 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                    <Clock className="mr-1 size-3" />
                    Menunggu Persetujuan Direksi
                </Badge>
            );
        }
        return <Badge variant="secondary">Draft</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mutasi & Perubahan Jabatan" />

            <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
                {/* Header Title & CTA */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Mutasi & Perubahan Jabatan
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Kelola form pengajuan promosi, demosi, mutasi divisi/gaji berjenjang dengan arsip Surat Keputusan (SK) resmi yang diterbitkan sistem.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                createForm.reset();
                                setCreateDialogOpen(true);
                            }}
                            className="h-9 gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
                        >
                            <Plus className="size-4" />
                            Ajukan Perubahan Jabatan
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics Cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Total Pengajuan
                            </CardTitle>
                            <ArrowLeftRight className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Seluruh mutasi & promosi tercatat
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-amber-200/80 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-amber-800 dark:text-amber-300">
                                Menunggu Review
                            </CardTitle>
                            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                                {stats.pending}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Dalam proses review berjenjang
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-blue-200/80 bg-blue-50/20 dark:border-blue-900/40 dark:bg-blue-950/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-blue-800 dark:text-blue-300">
                                Disetujui (SK Terbit)
                            </CardTitle>
                            <FileCheck className="size-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                                {stats.approved}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                SK siap & menunggu penerapan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                Telah Diterapkan
                            </CardTitle>
                            <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                                {stats.applied}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Aktif pada data master karyawan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card className="shadow-xs">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama karyawan, NIP, no. pengajuan, atau nomor SK..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 pl-9 text-xs sm:text-sm"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={selectedType} onValueChange={handleFilterType}>
                                    <SelectTrigger className="h-9 w-[160px] text-xs">
                                        <SelectValue placeholder="Tipe Mutasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        {Object.entries(transitionTypes).map(([k, label]) => (
                                            <SelectItem key={k} value={k}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedStatus} onValueChange={handleFilterStatus}>
                                    <SelectTrigger className="h-9 w-[150px] text-xs">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending">Menunggu Review</SelectItem>
                                        <SelectItem value="approved">Disetujui (SK Terbit)</SelectItem>
                                        <SelectItem value="applied">Telah Diterapkan</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
                                    Filter
                                </Button>

                                {(searchQuery || selectedStatus !== 'all' || selectedType !== 'all') && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleResetFilter}
                                        className="h-9 text-xs"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table Data */}
                <Card className="shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b bg-muted/60 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">No. Pengajuan & SK</th>
                                    <th className="px-4 py-3 font-medium">Karyawan</th>
                                    <th className="px-4 py-3 font-medium">Tipe Transisi</th>
                                    <th className="px-4 py-3 font-medium">Perubahan Jabatan & Divisi</th>
                                    <th className="px-4 py-3 font-medium">Tgl Efektif</th>
                                    <th className="px-4 py-3 font-medium">Status Workflow</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transitions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                                            Belum ada data pengajuan mutasi/promosi jabatan. Klik tombol <strong>"Ajukan Perubahan Jabatan"</strong> di atas untuk membuat pengajuan baru.
                                        </td>
                                    </tr>
                                ) : (
                                    transitions.data.map((item) => {
                                        const isPending = item.status === 'pending';
                                        const isApproved = item.status === 'approved';
                                        const isApplied = item.status === 'applied';

                                        return (
                                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                                    <div className="font-semibold text-foreground">
                                                        {item.transition_number}
                                                    </div>
                                                    {item.letter_number && (
                                                        <div className="text-[11px] font-mono text-primary mt-0.5">
                                                            {item.letter_number}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 align-top">
                                                    <div className="font-medium text-foreground">
                                                        {item.employee?.first_name} {item.employee?.last_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground font-mono">
                                                        {item.employee?.employee_code || '-'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                                    {getTypeBadge(item.transition_type)}
                                                </td>

                                                <td className="px-4 py-3 align-top">
                                                    <div className="flex flex-col gap-1 max-w-xs">
                                                        {/* Position change */}
                                                        <div className="flex items-center gap-1.5 text-[11px]">
                                                            <span className="text-muted-foreground line-through">
                                                                {item.old_position_name || '-'}
                                                            </span>
                                                            <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                                                            <span className="font-semibold text-foreground">
                                                                {item.new_position_name || item.old_position_name}
                                                            </span>
                                                        </div>

                                                        {/* Division change */}
                                                        {(item.old_division_name !== item.new_division_name || item.new_division_name) && (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                                <span>{item.old_division_name || '-'}</span>
                                                                <ArrowRight className="size-2.5 shrink-0" />
                                                                <span className="text-foreground">{item.new_division_name || item.old_division_name}</span>
                                                            </div>
                                                        )}

                                                        {/* Salary change indicator */}
                                                        {item.new_base_salary && (
                                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                                                Gaji Baru: {formatRupiah(item.new_base_salary)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">
                                                    {formatDateIndo(item.effective_date)}
                                                </td>

                                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                                    {getStatusBadge(item)}
                                                </td>

                                                <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Detail / Workflow Stepper */}
                                                        <ActionIconButton
                                                            label="Lihat Detail & Review Berjenjang"
                                                            icon={Eye}
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedTransition(item);
                                                                setApprovalNotes('');
                                                                setDetailDialogOpen(true);
                                                            }}
                                                        />

                                                        {/* Download SK PDF button (when approved or applied) */}
                                                        {(isApproved || isApplied) && (
                                                            <ActionIconButton
                                                                label="Cetak Surat Keputusan (SK) Resmi"
                                                                icon={FileDown}
                                                                variant="outline"
                                                                className="text-primary hover:text-primary"
                                                                onClick={() => {
                                                                    window.open(`/hris/career-transitions/${item.id}/sk-document`, '_blank');
                                                                }}
                                                            />
                                                        )}

                                                        {/* Apply to Employee (when approved, before applied) */}
                                                        {isApproved && (
                                                            <ActionIconButton
                                                                label="Terapkan ke Data Karyawan Sekarang"
                                                                icon={CheckCheck}
                                                                variant="default"
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                onClick={() => handleApply(item)}
                                                            />
                                                        )}

                                                        {/* Delete (if not applied) */}
                                                        {!isApplied && (
                                                            <ActionIconButton
                                                                label="Hapus Pengajuan"
                                                                icon={Trash2}
                                                                variant="ghost"
                                                                className="text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDelete(item)}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transitions.links && transitions.links.length > 3 && (
                        <div className="border-t p-3">
                            <SimplePagination links={transitions.links} />
                        </div>
                    )}
                </Card>
            </div>

            {/* DIALOG 1: FORM PENGAJUAN PERUBAHAN JABATAN */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="flex flex-col max-h-[90vh] sm:max-w-3xl p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-5 sm:p-6 pb-4 border-b shrink-0 pr-12 bg-background">
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <ArrowLeftRight className="size-5 text-primary" />
                            Form Pengajuan Perubahan Jabatan & Mutasi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Lengkapi data perubahan jabatan/divisi/gaji untuk diproses melalui alur persetujuan berjenjang dan penerbitan SK resmi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateProposal} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                        {/* Step 1: Pilih Karyawan */}
                        <div className="space-y-2">
                            <Label htmlFor="employee-select" className="text-xs font-semibold">
                                Pilih Karyawan <span className="text-destructive">*</span>
                            </Label>
                            <SearchableSelect
                                id="employee-select"
                                value={createForm.data.employee_id}
                                onValueChange={handleSelectEmployee}
                                placeholder="Pilih atau cari nama karyawan..."
                                options={employees.map((emp) => ({
                                    value: String(emp.id),
                                    label: `${emp.employee_code} - ${emp.name} (${emp.position_name || 'Tanpa Posisi'} / ${emp.division_name || 'Tanpa Divisi'})`,
                                    keywords: `${emp.employee_code} ${emp.name} ${emp.position_name ?? ''} ${emp.division_name ?? ''}`,
                                }))}
                            />
                            <InputError message={createForm.errors.employee_id} />
                        </div>

                        {/* Snapshot Current Employee Info */}
                        {selectedEmployeeObj && (
                            <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2 text-xs">
                                <div className="font-semibold text-foreground flex items-center justify-between">
                                    <span>Data Karyawan Saat Ini (Snapshot)</span>
                                    <Badge variant="outline" className="text-[10px]">
                                        {selectedEmployeeObj.employment_status || 'Aktif'}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                                    <div>
                                        <span className="block text-[10px]">Jabatan Saat Ini:</span>
                                        <span className="font-medium text-foreground">{selectedEmployeeObj.position_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px]">Divisi Saat Ini:</span>
                                        <span className="font-medium text-foreground">{selectedEmployeeObj.division_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px]">Cabang / Entitas:</span>
                                        <span className="font-medium text-foreground">{selectedEmployeeObj.sub_company_name || 'Pusat'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px]">Gaji Pokok Saat Ini:</span>
                                        <span className="font-medium text-foreground">{formatRupiah(selectedEmployeeObj.base_salary)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Jenis Transisi & Tanggal Efektif */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="transition_type" className="text-xs">
                                    Jenis Perubahan Karir <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={createForm.data.transition_type}
                                    onValueChange={(val) => createForm.setData('transition_type', val)}
                                >
                                    <SelectTrigger id="transition_type" className="text-xs">
                                        <SelectValue placeholder="Pilih jenis transisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(transitionTypes).map(([k, label]) => (
                                            <SelectItem key={k} value={k}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.transition_type} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="effective_date" className="text-xs">
                                    Tanggal Efektif Berlaku <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="effective_date"
                                    type="date"
                                    value={createForm.data.effective_date}
                                    onChange={(e) => createForm.setData('effective_date', e.target.value)}
                                    className="text-xs"
                                    required
                                />
                                <InputError message={createForm.errors.effective_date} />
                            </div>
                        </div>

                        {/* Step 3: Rincian Jabatan Baru */}
                        <div className="space-y-3 rounded-lg border p-4 bg-muted/10">
                            <div className="text-xs font-semibold text-foreground">
                                Rincian Jabatan / Divisi / Gaji Baru
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="new_position_id" className="text-xs">
                                        Jabatan Baru
                                    </Label>
                                    <Select
                                        value={createForm.data.new_position_id}
                                        onValueChange={(val) => createForm.setData('new_position_id', val)}
                                    >
                                        <SelectTrigger id="new_position_id" className="text-xs">
                                            <SelectValue placeholder="Pilih jabatan baru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions.map((pos) => (
                                                <SelectItem key={pos.id} value={String(pos.id)}>
                                                    {pos.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={createForm.errors.new_position_id} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="new_division_id" className="text-xs">
                                        Divisi Baru
                                    </Label>
                                    <Select
                                        value={createForm.data.new_division_id}
                                        onValueChange={(val) => createForm.setData('new_division_id', val)}
                                    >
                                        <SelectTrigger id="new_division_id" className="text-xs">
                                            <SelectValue placeholder="Pilih divisi baru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {divisions.map((div) => (
                                                <SelectItem key={div.id} value={String(div.id)}>
                                                    {div.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={createForm.errors.new_division_id} />
                                </div>

                                {subCompanies.length > 0 && (
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="new_sub_company_id" className="text-xs">
                                            Entitas / Cabang Penempatan Baru
                                        </Label>
                                        <Select
                                            value={createForm.data.new_sub_company_id}
                                            onValueChange={(val) => createForm.setData('new_sub_company_id', val)}
                                        >
                                            <SelectTrigger id="new_sub_company_id" className="text-xs">
                                                <SelectValue placeholder="Pilih entitas / cabang baru" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subCompanies.map((sc) => (
                                                    <SelectItem key={sc.id} value={String(sc.id)}>
                                                        {sc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="new_base_salary" className="text-xs">
                                        Gaji Pokok Baru (Rp)
                                    </Label>
                                    <Input
                                        id="new_base_salary"
                                        type="number"
                                        placeholder="cth: 8500000"
                                        value={createForm.data.new_base_salary}
                                        onChange={(e) => createForm.setData('new_base_salary', e.target.value)}
                                        className="text-xs"
                                    />
                                    <InputError message={createForm.errors.new_base_salary} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="new_employment_status" className="text-xs">
                                        Status Kepegawaian Baru
                                    </Label>
                                    <Select
                                        value={createForm.data.new_employment_status}
                                        onValueChange={(val) => createForm.setData('new_employment_status', val)}
                                    >
                                        <SelectTrigger id="new_employment_status" className="text-xs">
                                            <SelectValue placeholder="Pilih status kerja" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanent">Karyawan Tetap (PKWTT)</SelectItem>
                                            <SelectItem value="contract">Karyawan Kontrak (PKWT)</SelectItem>
                                            <SelectItem value="probation">Masa Percobaan (Probation)</SelectItem>
                                            <SelectItem value="internship">Magang / Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Alasan & Berkas Pendukung */}
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="reason" className="text-xs font-semibold">
                                    Alasan & Justifikasi Pengajuan <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Jelaskan alasan pengajuan mutasi/promosi (misal: pencapaian KPI luar biasa, kebutuhan rotasi kepemimpinan cabang, dll)..."
                                    rows={2}
                                    value={createForm.data.reason}
                                    onChange={(e) => createForm.setData('reason', e.target.value)}
                                    className="text-xs"
                                    required
                                />
                                <InputError message={createForm.errors.reason} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="notes" className="text-xs">
                                    Catatan Tambahan untuk Reviewer
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Catatan penunjang, target masa transisi, atau serah terima pekerjaan..."
                                    rows={2}
                                    value={createForm.data.notes}
                                    onChange={(e) => createForm.setData('notes', e.target.value)}
                                    className="text-xs"
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="approval_levels" className="text-xs">
                                        Alur Persetujuan (Workflow)
                                    </Label>
                                    <Select
                                        value={createForm.data.approval_levels}
                                        onValueChange={(val) => createForm.setData('approval_levels', val)}
                                    >
                                        <SelectTrigger id="approval_levels" className="text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 Tingkat (Reviewer HR/Atasan + Direksi Final)</SelectItem>
                                            <SelectItem value="1">1 Tingkat (Persetujuan Langsung Direksi)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="attachment" className="text-xs">
                                        Lampiran Rekomendasi (Opsional)
                                    </Label>
                                    <Input
                                        id="attachment"
                                        type="file"
                                        onChange={(e) => createForm.setData('attachment', e.target.files?.[0] || null)}
                                        className="text-xs file:text-xs"
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        PDF, DOC, atau Gambar (Maks. 5MB)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing || !createForm.data.employee_id || !createForm.data.reason}
                                className="text-xs font-medium cursor-pointer"
                            >
                                <Plus className="mr-1.5 size-4" />
                                Ajukan ke Alur Persetujuan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DIALOG 2: DETAIL WORKFLOW BERJENJANG & ACTION REVIEW */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="flex flex-col max-h-[90vh] sm:max-w-3xl p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-5 sm:p-6 pb-4 border-b shrink-0 pr-12 bg-background">
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-base font-semibold">
                                Detail Mutasi & Alur Persetujuan Berjenjang
                            </DialogTitle>
                            {selectedTransition && getTypeBadge(selectedTransition.transition_type)}
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Nomor Pengajuan: {selectedTransition?.transition_number}
                            {selectedTransition?.letter_number && ` | SK No: ${selectedTransition.letter_number}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransition && (
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                            {/* Summary Box */}
                            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-sm text-foreground">
                                            {selectedTransition.employee?.first_name} {selectedTransition.employee?.last_name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            NIP: {selectedTransition.employee?.employee_code || '-'}
                                        </p>
                                    </div>
                                    <div>{getStatusBadge(selectedTransition)}</div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t text-xs">
                                    <div className="rounded border bg-background p-3 space-y-1.5">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                            Kondisi Sebelumnya
                                        </span>
                                        <div><span className="text-muted-foreground">Jabatan:</span> <strong className="text-foreground">{selectedTransition.old_position_name || '-'}</strong></div>
                                        <div><span className="text-muted-foreground">Divisi:</span> <span className="text-foreground">{selectedTransition.old_division_name || '-'}</span></div>
                                        <div><span className="text-muted-foreground">Cabang:</span> <span className="text-foreground">{selectedTransition.old_sub_company_name || 'Pusat'}</span></div>
                                        <div><span className="text-muted-foreground">Gaji:</span> <span className="text-foreground">{formatRupiah(selectedTransition.old_base_salary)}</span></div>
                                    </div>

                                    <div className="rounded border border-primary/30 bg-primary/5 p-3 space-y-1.5">
                                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                                            Perubahan Baru yang Diajukan
                                        </span>
                                        <div><span className="text-muted-foreground">Jabatan:</span> <strong className="text-foreground">{selectedTransition.new_position_name || selectedTransition.old_position_name}</strong></div>
                                        <div><span className="text-muted-foreground">Divisi:</span> <span className="text-foreground">{selectedTransition.new_division_name || selectedTransition.old_division_name}</span></div>
                                        <div><span className="text-muted-foreground">Cabang:</span> <span className="text-foreground">{selectedTransition.new_sub_company_name || selectedTransition.old_sub_company_name || 'Pusat'}</span></div>
                                        <div><span className="text-muted-foreground">Gaji Baru:</span> <span className="text-emerald-600 font-semibold">{formatRupiah(selectedTransition.new_base_salary) || 'Tetap'}</span></div>
                                    </div>
                                </div>

                                <div className="pt-2 text-xs text-muted-foreground">
                                    <strong>Alasan Pengajuan:</strong> {selectedTransition.reason}
                                    {selectedTransition.notes && (
                                        <p className="mt-1"><strong>Catatan:</strong> {selectedTransition.notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Multi-tier Approval Stepper Timeline */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <Clock className="size-4 text-primary" />
                                    Tahapan Alur Persetujuan Berjenjang & Penerbitan SK
                                </h4>

                                <div className="space-y-4 border-l-2 border-muted pl-4 ml-2 text-xs">
                                    {/* Stage 1: Pengajuan dibuat */}
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-0 size-3 rounded-full bg-emerald-500 border-2 border-background" />
                                        <div className="font-semibold text-foreground">1. Pengajuan Diajukan</div>
                                        <p className="text-muted-foreground text-[11px]">
                                            Dibuat oleh {selectedTransition.created_by?.name || 'HR Admin'} pada {formatDateIndo(selectedTransition.created_at)}
                                        </p>
                                    </div>

                                    {/* Stage 2: Review Tingkat 1 */}
                                    <div className="relative">
                                        <div className={cn(
                                            "absolute -left-[23px] top-0 size-3 rounded-full border-2 border-background",
                                            selectedTransition.first_approved_at ? "bg-emerald-500" : (selectedTransition.status === 'pending' && selectedTransition.approval_stage === 0 ? "bg-amber-500 animate-pulse" : "bg-muted")
                                        )} />
                                        <div className="font-semibold text-foreground">
                                            2. Review Tingkat 1 (Atasan / HR Supervisor)
                                        </div>
                                        {selectedTransition.first_approved_at ? (
                                            <p className="text-emerald-600 text-[11px]">
                                                Disetujui oleh {selectedTransition.first_approver?.name || 'Reviewer'} pada {formatDateIndo(selectedTransition.first_approved_at)}
                                                {selectedTransition.first_approval_notes && ` ("${selectedTransition.first_approval_notes}")`}
                                            </p>
                                        ) : selectedTransition.status === 'rejected' ? (
                                            <p className="text-destructive text-[11px]">Pengajuan dihentikan (ditolak)</p>
                                        ) : (
                                            <p className="text-muted-foreground text-[11px]">Menunggu peninjauan tingkat 1</p>
                                        )}
                                    </div>

                                    {/* Stage 3: Review Tingkat 2 (Final) jika approval_levels === 2 */}
                                    {selectedTransition.approval_levels === 2 && (
                                        <div className="relative">
                                            <div className={cn(
                                                "absolute -left-[23px] top-0 size-3 rounded-full border-2 border-background",
                                                selectedTransition.second_approved_at ? "bg-emerald-500" : (selectedTransition.status === 'pending' && selectedTransition.approval_stage === 1 ? "bg-amber-500 animate-pulse" : "bg-muted")
                                            )} />
                                            <div className="font-semibold text-foreground">
                                                3. Persetujuan Tingkat 2 (Direksi / HR Management)
                                            </div>
                                            {selectedTransition.second_approved_at ? (
                                                <p className="text-emerald-600 text-[11px]">
                                                    Disetujui oleh {selectedTransition.second_approver?.name || 'Direksi'} pada {formatDateIndo(selectedTransition.second_approved_at)}
                                                    {selectedTransition.second_approval_notes && ` ("${selectedTransition.second_approval_notes}")`}
                                                </p>
                                            ) : selectedTransition.status === 'rejected' ? (
                                                <p className="text-destructive text-[11px]">Pengajuan dihentikan (ditolak)</p>
                                            ) : selectedTransition.approval_stage === 1 ? (
                                                <p className="text-amber-600 font-medium text-[11px]">Menunggu persetujuan akhir Direksi</p>
                                            ) : (
                                                <p className="text-muted-foreground text-[11px]">Menunggu tahap 1 selesai</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Stage 4: Penerbitan SK */}
                                    <div className="relative">
                                        <div className={cn(
                                            "absolute -left-[23px] top-0 size-3 rounded-full border-2 border-background",
                                            selectedTransition.sk_generated_at ? "bg-blue-500" : "bg-muted"
                                        )} />
                                        <div className="font-semibold text-foreground">
                                            4. Penerbitan Surat Keputusan (SK) Resmi
                                        </div>
                                        {selectedTransition.sk_generated_at ? (
                                            <div className="mt-1 space-y-1">
                                                <p className="text-blue-600 text-[11px]">
                                                    SK Resmi Terbit: <strong>{selectedTransition.letter_number}</strong>
                                                </p>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs gap-1.5"
                                                    onClick={() => {
                                                        window.open(`/hris/career-transitions/${selectedTransition.id}/sk-document`, '_blank');
                                                    }}
                                                >
                                                    <Download className="size-3 text-primary" />
                                                    Unduh Dokumen SK Resmi (PDF)
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-[11px]">Diterbitkan otomatis saat pengajuan disetujui penuh</p>
                                        )}
                                    </div>

                                    {/* Stage 5: Penerapan Data Master */}
                                    <div className="relative">
                                        <div className={cn(
                                            "absolute -left-[23px] top-0 size-3 rounded-full border-2 border-background",
                                            selectedTransition.applied_at ? "bg-emerald-600" : "bg-muted"
                                        )} />
                                        <div className="font-semibold text-foreground">
                                            5. Penerapan ke Data Master Karyawan
                                        </div>
                                        {selectedTransition.applied_at ? (
                                            <p className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                                                Telah Aktif pada Master Karyawan sejak {formatDateIndo(selectedTransition.applied_at)}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground text-[11px]">Perubahan jabatan & gaji belum diterapkan ke profil karyawan</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Form if Pending */}
                            {selectedTransition.status === 'pending' && (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                                    <div className="text-xs font-semibold text-foreground">
                                        Tindakan Persetujuan (Reviewer Action)
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="review-notes" className="text-xs">
                                            Catatan Review / Persetujuan
                                        </Label>
                                        <Input
                                            id="review-notes"
                                            placeholder="Masukkan catatan persetujuan..."
                                            value={approvalNotes}
                                            onChange={(e) => setApprovalNotes(e.target.value)}
                                            className="text-xs bg-background"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() => handleOpenReject(selectedTransition)}
                                            className="text-xs"
                                        >
                                            <X className="mr-1 size-3.5" />
                                            Tolak Pengajuan
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() => handleApprove(selectedTransition)}
                                            className="text-xs font-medium cursor-pointer"
                                        >
                                            <Check className="mr-1 size-3.5" />
                                            {selectedTransition.approval_stage === 0 && selectedTransition.approval_levels === 2
                                                ? 'Setujui Tingkat 1'
                                                : 'Setujui & Terbitkan SK Resmi'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Apply Button if Approved */}
                            {selectedTransition.status === 'approved' && (
                                <div className="rounded-lg border border-emerald-300 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                                            Surat Keputusan (SK) Sudah Diterbitkan
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Klik tombol di samping untuk menerapkan perubahan jabatan ke master profil karyawan & mencatat riwayat karir.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => handleApply(selectedTransition)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer shrink-0"
                                    >
                                        <CheckCheck className="mr-1.5 size-4" />
                                        Terapkan ke Karyawan
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="p-4 border-t bg-muted/10">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailDialogOpen(false)}
                            className="text-xs"
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG 3: KONFIRMASI PENOLAKAN */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive text-base">
                            <ShieldAlert className="size-5" />
                            Tolak Pengajuan Mutasi / Promosi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Mohon sertakan alasan penolakan untuk catatan transparansi bagi pengaju dan karyawan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleConfirmReject} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="rejection-reason" className="text-xs font-semibold">
                                Alasan Penolakan <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Tuliskan alasan penolakan secara jelas..."
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="text-xs"
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRejectDialogOpen(false)}
                                className="text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                disabled={isProcessing || !rejectionReason.trim()}
                                className="text-xs font-medium cursor-pointer"
                            >
                                Konfirmasi Penolakan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
