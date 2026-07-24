import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Download,
    Eye,
    Filter,
    Landmark,
    MoreHorizontal,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    Upload,
    UserRoundCheck,
    UserRoundX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import ActionIconButton from '@/components/action-icon-button';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { browserTimezone } from '@/lib/attendance-timezone';
import {
    formatThousandDigits,
    normalizeDigitInput,
    normalizeStoredCurrencyValue,
} from '@/lib/currency-input';
import employeeRoutes from '@/routes/hris/employees';
import allowanceRoutes from '@/routes/hris/employees/allowances';
import bankAccountRoutes from '@/routes/hris/employees/bank-accounts';
import type { BreadcrumbItem } from '@/types';

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginator<T> = {
    data: T[];
    links: PaginatorLink[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
};

type Division = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    employees_count: number;
    positions_count: number;
};

type Position = {
    id: number;
    division_id: number | null;
    parent_position_id: number | null;
    code: string;
    name: string;
    level: string | null;
    level_label: string | null;
    description: string | null;
    is_active: boolean;
    employees_count: number;
    division: {
        id: number;
        name: string;
    } | null;
    parent_position: {
        id: number;
        name: string;
    } | null;
};

type PositionOption = {
    id: number;
    division_id: number | null;
    code: string;
    name: string;
    level: string | null;
    division_name: string | null;
    employees_count: number;
};

type DivisionOption = {
    id: number;
    code: string;
    name: string;
    employees_count: number;
};

type SubCompanyOption = {
    id: number;
    code: string;
    name: string;
    employees_count: number;
};

type BankAccount = {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    branch: string | null;
    currency: string;
    fixed_allowance_amount: string;
    is_primary: boolean;
};

type EmployeeAllowance = {
    id: number;
    name: string;
    amount: string;
    is_active: boolean;
    effective_start_date: string | null;
    effective_end_date: string | null;
    notes: string | null;
};

type EmployeeDocument = {
    id: number;
    document_type: string;
    document_number: string | null;
    issued_at: string | null;
    expires_at: string | null;
    issuing_authority: string | null;
    file_original_name: string | null;
    file_mime_type: string | null;
    file_size: number | null;
    notes: string | null;
    verified_at: string | null;
    compliance_status: 'valid' | 'expiring' | 'expired' | 'missing';
    download_url: string | null;
};

type EmployeeEmploymentHistory = {
    id: number;
    event_type: string;
    effective_date: string;
    old_status: string | null;
    new_status: string | null;
    old_division_name: string | null;
    new_division_name: string | null;
    old_position_name: string | null;
    new_position_name: string | null;
    notes: string | null;
    created_by_name: string | null;
};

type Employee = {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    gender: string | null;
    birth_place: string | null;
    birth_date: string | null;
    last_education: string | null;
    marital_status: string | null;
    children_count: number | null;
    hire_date: string;
    offboarded_at: string | null;
    offboarding_reason: string | null;
    offboarding_notes: string | null;
    employment_status: string;
    employment_type: string;
    contract_duration_months: number | null;
    contract_end_date: string | null;
    probation_duration_months: number | null;
    probation_end_date: string | null;
    pkwtt_activated_at: string | null;
    pph21_method: string;
    pph21_rate: string;
    ptkp_category: string | null;
    division_id: number | null;
    sub_company_id: number | null;
    attendance_location_ids: string[];
    is_wfa: boolean;
    timezone: string | null;
    position_id: number | null;
    manager_id: number | null;
    base_salary: string | null;
    address: string | null;
    domicile_address: string | null;
    family_card_number: string | null;
    ktp_number: string | null;
    npwp_number: string | null;
    blood_type: string | null;
    religion: string | null;
    bpjs_kesehatan_number: string | null;
    bpjs_ketenagakerjaan_number: string | null;
    sim_a_number: string | null;
    sim_b_number: string | null;
    sim_c_number: string | null;
    biological_mother_name: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    notes: string | null;
    is_active: boolean;
    division: {
        id: number;
        name: string;
    } | null;
    sub_company: {
        id: number;
        code: string;
        name: string;
    } | null;
    position: {
        id: number;
        name: string;
    } | null;
    manager: {
        id: number;
        full_name: string;
        employee_code: string;
    } | null;
    bank_accounts: BankAccount[];
    allowances: EmployeeAllowance[];
    documents: EmployeeDocument[];
    employment_histories: EmployeeEmploymentHistory[];
    compliance_summary: {
        valid: number;
        expiring: number;
        expired: number;
        missing_files: number;
    };
    portal_user?: {
        id: number;
        email: string | null;
        phone: string | null;
        requires_password_change: boolean;
        suspended_at: string | null;
    } | null;
};

type ManagerOption = {
    id: number;
    label: string;
};

type EmployeeFormData = {
    employee_code: string;
    full_name: string;
    email: string;
    phone: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    last_education: string;
    marital_status: string;
    children_count: string;
    hire_date: string;
    employment_status: string;
    employment_type: string;
    contract_duration_months: string;
    contract_end_date: string;
    probation_duration_months: string;
    pph21_method: string;
    pph21_rate: string;
    ptkp_category: string;
    division_id: string;
    sub_company_id: string;
    attendance_location_ids: string[];
    is_wfa: boolean;
    timezone: string;
    position_id: string;
    manager_id: string;
    base_salary: string;
    fixed_allowances: Array<{ name: string; amount: string }>;
    address: string;
    domicile_address: string;
    family_card_number: string;
    ktp_number: string;
    npwp_number: string;
    blood_type: string;
    religion: string;
    bpjs_kesehatan_number: string;
    bpjs_ketenagakerjaan_number: string;
    sim_a_number: string;
    sim_b_number: string;
    sim_c_number: string;
    biological_mother_name: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    change_effective_date: string;
    change_notes: string;
    notes: string;
    is_active: boolean;
};

type BankAccountFormData = {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    branch: string;
    currency: string;
    fixed_allowance_amount: string;
    is_primary: boolean;
};

type AllowanceFormData = {
    name: string;
    amount: string;
    is_active: boolean;
    effective_start_date: string;
    effective_end_date: string;
    notes: string;
};

type EmployeeImportFormData = {
    import_file: File | null;
};

type OffboardingFormData = {
    offboarded_at: string;
    offboarding_reason: string;
    offboarding_notes: string;
};

type PkwttActivationFormData = {
    effective_date: string;
    notes: string;
};

type EmployeeDocumentFormData = {
    document_type: string;
    document_number: string;
    issued_at: string;
    expires_at: string;
    issuing_authority: string;
    document_file: File | null;
    remove_file: boolean;
    notes: string;
};

type EmployeeSortKey =
    | 'name'
    | 'code'
    | 'contact'
    | 'division'
    | 'sub_company'
    | 'position'
    | 'hire_date'
    | 'employment_type'
    | 'base_salary'
    | 'status';

type EmployeeExportCategory =
    | 'personal'
    | 'administration'
    | 'payroll'
    | 'employment'
    | 'all';

type EmployeeExportFormat = 'xls' | 'pdf';

type Filters = {
    search: string;
    division_id: string;
    sub_company_id: string;
    status: string;
    sort: EmployeeSortKey;
    direction: 'asc' | 'desc';
    division_search: string;
    position_search: string;
};

type PageProps = {
    employeeList: 'active' | 'resigned';
    employees: Paginator<Employee>;
    divisions: Paginator<Division>;
    positions: Paginator<Position>;
    divisionOptions: DivisionOption[];
    subCompanyOptions: SubCompanyOption[];
    positionOptions: PositionOption[];
    managerOptions: ManagerOption[];
    attendanceLocationOptions: Array<{
        id: string;
        name: string;
        address: string | null;
    }>;
    employeeAccess: {
        requires_sub_company: boolean;
        sub_company_scope_ids: number[];
    };
    filters: Filters;
    stats: {
        employees_total: number;
        employees_active: number;
        employees_by_type: Record<string, number>;
        divisions_total: number;
        positions_total: number;
    };
    options: {
        employment_statuses: string[];
        employment_types: string[];
        timezones: Array<{ value: string; label: string }>;
        pph21_methods: Array<{
            value: string;
            label: string;
            description: string;
        }>;
        genders: string[];
        marital_statuses: string[];
        last_education_levels: string[];
        document_types: Array<{
            value: string;
            label: string;
        }>;
    };
};

type SortableEmployeeHeaderProps = {
    label: string;
    sortKey: EmployeeSortKey;
    activeSort: EmployeeSortKey;
    direction: 'asc' | 'desc';
    onSort: (key: EmployeeSortKey) => void;
    className?: string;
};

function SortableEmployeeHeader({
    label,
    sortKey,
    activeSort,
    direction,
    onSort,
    className = '',
}: SortableEmployeeHeaderProps) {
    const isActive = activeSort === sortKey;
    const SortIcon = !isActive
        ? ArrowUpDown
        : direction === 'asc'
          ? ArrowUp
          : ArrowDown;

    return (
        <th
            className={className}
            aria-sort={
                isActive
                    ? direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                    : 'none'
            }
        >
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className="inline-flex min-h-8 w-full items-center justify-center gap-1 rounded-sm px-1 font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                title={`Urutkan berdasarkan ${label}`}
            >
                <span>{label}</span>
                <SortIcon
                    aria-hidden="true"
                    className={`size-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                />
            </button>
        </th>
    );
}

const todayDate = () => new Date().toISOString().slice(0, 10);

const defaultEmployeeTimezone = () => {
    const timezone = browserTimezone();

    return ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'].includes(timezone)
        ? timezone
        : 'Asia/Jakarta';
};

const buildEmployeeDefault = (): EmployeeFormData => ({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    birth_place: '',
    birth_date: '',
    last_education: '',
    marital_status: '',
    children_count: '0',
    hire_date: todayDate(),
    employment_status: 'active',
    employment_type: 'PKWTT',
    contract_duration_months: '',
    contract_end_date: '',
    probation_duration_months: '0',
    pph21_method: 'gross',
    pph21_rate: '0',
    ptkp_category: '',
    division_id: '',
    sub_company_id: '',
    attendance_location_ids: [],
    is_wfa: false,
    timezone: defaultEmployeeTimezone(),
    position_id: '',
    manager_id: '',
    base_salary: '',
    fixed_allowances: [],
    address: '',
    domicile_address: '',
    family_card_number: '',
    ktp_number: '',
    npwp_number: '',
    blood_type: '',
    religion: '',
    bpjs_kesehatan_number: '',
    bpjs_ketenagakerjaan_number: '',
    sim_a_number: '',
    sim_b_number: '',
    sim_c_number: '',
    biological_mother_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    change_effective_date: todayDate(),
    change_notes: '',
    notes: '',
    is_active: true,
});

const BANK_ACCOUNT_DEFAULT: BankAccountFormData = {
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    branch: '',
    currency: 'IDR',
    fixed_allowance_amount: '0',
    is_primary: false,
};

const ALLOWANCE_DEFAULT: AllowanceFormData = {
    name: '',
    amount: '0',
    is_active: true,
    effective_start_date: '',
    effective_end_date: '',
    notes: '',
};

const DOCUMENT_DEFAULT: EmployeeDocumentFormData = {
    document_type: 'ktp',
    document_number: '',
    issued_at: '',
    expires_at: '',
    issuing_authority: '',
    document_file: null,
    remove_file: false,
    notes: '',
};

const statusLabels: Record<string, string> = {
    active: 'Aktif',
    probation: 'Probation',
    on_leave: 'Cuti',
    resigned: 'Resign',
};

const employeeExportCategories: Array<{
    value: EmployeeExportCategory;
    label: string;
    description: string;
}> = [
    {
        value: 'personal',
        label: 'Data Pribadi',
        description: 'Identitas, kontak, alamat, dan kontak darurat.',
    },
    {
        value: 'administration',
        label: 'Data Administrasi',
        description: 'KTP, KK, NPWP, BPJS, SIM, dan data administrasi.',
    },
    {
        value: 'payroll',
        label: 'Data Payroll',
        description: 'Gaji, pajak, rekening bank, dan tunjangan.',
    },
    {
        value: 'employment',
        label: 'Data Pekerjaan',
        description: 'Organisasi, status kerja, kontrak, dan probation.',
    },
    {
        value: 'all',
        label: 'Seluruhnya',
        description: 'Semua data karyawan yang tersedia.',
    },
];

const offboardingReasonLabels: Record<string, string> = {
    resigned: 'Mengundurkan diri',
    terminated: 'Diberhentikan',
    contract_ended: 'Kontrak berakhir',
    retired: 'Pensiun',
    other: 'Lainnya',
};

const typeLabels: Record<string, string> = {
    FL: 'FL',
    PKWT: 'PKWT',
    PKWTT: 'PKWTT',
    OS: 'OS',
    permanent: 'PKWTT',
    contract: 'PKWT',
    internship: 'FL',
    freelance: 'FL',
};

const pph21MethodLabels: Record<string, string> = {
    ter_harian: 'TER Harian',
    gross: 'Gross',
    net: 'Net',
    gross_up: 'Gross Up',
};

const ptkpCategoryLabels: Record<string, string> = {
    'TK/0': 'TK/0 - Tidak Kawin',
    'TK/1': 'TK/1 - Tidak Kawin 1 Tanggungan',
    'TK/2': 'TK/2 - Tidak Kawin 2 Tanggungan',
    'TK/3': 'TK/3 - Tidak Kawin 3 Tanggungan',
    'K/0': 'K/0 - Kawin',
    'K/1': 'K/1 - Kawin 1 Tanggungan',
    'K/2': 'K/2 - Kawin 2 Tanggungan',
    'K/3': 'K/3 - Kawin 3 Tanggungan',
};

const documentTypeLabels: Record<string, string> = {
    ktp: 'KTP',
    kk: 'Kartu Keluarga',
    npwp: 'NPWP',
    bpjs_kesehatan: 'BPJS Kesehatan',
    bpjs_ketenagakerjaan: 'BPJS Ketenagakerjaan',
    ijazah: 'Ijazah',
    sertifikat: 'Sertifikat',
    passport: 'Paspor',
    sim: 'SIM',
    kontrak_kerja: 'Kontrak Kerja',
    lainnya: 'Lainnya',
};

const employeeFieldLabels: Record<string, string> = {
    form: 'Penyimpanan data',
    employee_code: 'Kode karyawan',
    full_name: 'Nama lengkap',
    email: 'Email',
    phone: 'Nomor HP',
    gender: 'Jenis kelamin',
    birth_place: 'Tempat lahir',
    birth_date: 'Tanggal lahir',
    last_education: 'Pendidikan terakhir',
    marital_status: 'Status pernikahan',
    children_count: 'Jumlah anak',
    biological_mother_name: 'Nama ibu kandung',
    address: 'Alamat KTP',
    domicile_address: 'Alamat domisili',
    ktp_number: 'No. KTP',
    ptkp_category: 'Kategori PTKP',
    hire_date: 'Tanggal masuk',
    employment_status: 'Status karyawan',
    employment_type: 'Tipe karyawan',
    contract_duration_months: 'Durasi kontrak',
    contract_end_date: 'Tanggal akhir kontrak',
    probation_duration_months: 'Durasi probation',
    pph21_method: 'Metode PPh21',
    pph21_rate: 'Nominal PPh21',
    division_id: 'Divisi',
    sub_company_id: 'Sub Company',
    position_id: 'Jabatan',
    manager_id: 'Atasan',
    base_salary: 'Gaji pokok',
    emergency_contact_name: 'Kontak darurat',
    emergency_contact_phone: 'Nomor kontak darurat',
    emergency_contact_relationship: 'Hubungan kontak darurat',
    npwp_number: 'NPWP',
    blood_type: 'Golongan darah',
    religion: 'Agama',
    change_effective_date: 'Tanggal efektif perubahan',
    change_notes: 'Catatan perubahan',
};

const genderLabels: Record<string, string> = {
    male: 'Laki-laki',
    female: 'Perempuan',
    other: 'Lainnya',
};

const maritalStatusLabels: Record<string, string> = {
    single: 'Belum Menikah',
    married: 'Menikah',
    divorced: 'Cerai',
    widowed: 'Janda/Duda',
};

const employmentHistoryLabels: Record<string, string> = {
    status_change: 'Perubahan Status',
    division_transfer: 'Mutasi Divisi',
    promotion: 'Promosi',
    demotion: 'Demosi',
    position_change: 'Perubahan Jabatan',
    pkwtt_activation: 'Aktivasi PKWTT',
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
};

const MAX_FIXED_ALLOWANCE_DIGITS = 8;

const normalizeFixedAllowanceInput = (value: string) =>
    normalizeDigitInput(value).slice(0, MAX_FIXED_ALLOWANCE_DIGITS);

const formatDateDisplay = (value: string | null) => {
    if (!value) {
        return '-';
    }

    const parsedDate = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate);
};

const formatCurrencyDisplay = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
};

const buildEmployeeCodePreview = ({
    divisionId,
    divisionOptions,
    hireDate,
    positionId,
    positionOptions,
}: {
    divisionId: string;
    divisionOptions: DivisionOption[];
    hireDate: string;
    positionId: string;
    positionOptions: PositionOption[];
}) => {
    if (divisionId === '' || positionId === '' || hireDate.trim() === '') {
        return '';
    }

    const division = divisionOptions.find(
        (item) => String(item.id) === divisionId,
    );
    const position = positionOptions.find(
        (item) => String(item.id) === positionId,
    );

    if (!division || !position) {
        return '';
    }

    const parsedDate = new Date(`${hireDate}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    return `${position.code}${String(division.employees_count + 1).padStart(
        3,
        '0',
    )}${String(parsedDate.getMonth() + 1).padStart(2, '0')}${String(
        parsedDate.getFullYear(),
    ).slice(-2)}`.toUpperCase();
};

export default function EmployeesIndex() {
    const {
        employeeList,
        employees,
        divisions,
        divisionOptions,
        subCompanyOptions,
        positionOptions,
        managerOptions,
        attendanceLocationOptions,
        employeeAccess,
        filters,
        stats,
        options,
    } = usePage<PageProps>().props;
    const isResignedList = employeeList === 'resigned';
    const employeeListUrl = isResignedList
        ? employeeRoutes.resigned.url()
        : employeeRoutes.index.url();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Karyawan',
            href: employeeRoutes.index(),
        },
        ...(isResignedList
            ? [
                  {
                      title: 'Karyawan Resign',
                      href: employeeRoutes.resigned(),
                  },
              ]
            : []),
    ];

    const [filterState, setFilterState] = useState<Filters>(filters);

    const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
    const [employeeExportDialogOpen, setEmployeeExportDialogOpen] =
        useState(false);
    const [employeeExportCategory, setEmployeeExportCategory] =
        useState<EmployeeExportCategory>('all');
    const [employeeExportFormat, setEmployeeExportFormat] =
        useState<EmployeeExportFormat>('xls');
    const [employeeImportDialogOpen, setEmployeeImportDialogOpen] =
        useState(false);
    const [employeeFormStep, setEmployeeFormStep] = useState(1);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(
        null,
    );
    const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
    const [offboardingEmployee, setOffboardingEmployee] =
        useState<Employee | null>(null);
    const [activatingPkwttEmployee, setActivatingPkwttEmployee] =
        useState<Employee | null>(null);
    const [contractEndMode, setContractEndMode] = useState<
        'duration' | 'manual'
    >('duration');

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
        null,
    );
    const [editingBankAccount, setEditingBankAccount] =
        useState<BankAccount | null>(null);
    const [editingAllowance, setEditingAllowance] =
        useState<EmployeeAllowance | null>(null);
    const [editingDocument, setEditingDocument] =
        useState<EmployeeDocument | null>(null);

    const employeeForm = useForm<EmployeeFormData>(buildEmployeeDefault());
    const bankAccountForm = useForm<BankAccountFormData>(BANK_ACCOUNT_DEFAULT);
    const allowanceForm = useForm<AllowanceFormData>(ALLOWANCE_DEFAULT);
    const documentForm = useForm<EmployeeDocumentFormData>(DOCUMENT_DEFAULT);
    const employeeImportForm = useForm<EmployeeImportFormData>({
        import_file: null,
    });
    const offboardingForm = useForm<OffboardingFormData>({
        offboarded_at: todayDate(),
        offboarding_reason: 'resigned',
        offboarding_notes: '',
    });
    const pkwttActivationForm = useForm<PkwttActivationFormData>({
        effective_date: todayDate(),
        notes: '',
    });

    const employeeStepFields = useMemo<
        Record<number, (keyof EmployeeFormData)[]>
    >(
        () => ({
            1: [
                'employee_code',
                'full_name',
                'email',
                'phone',
                'gender',
                'birth_place',
                'birth_date',
                'last_education',
                'marital_status',
                'children_count',
                'biological_mother_name',
                'address',
                'domicile_address',
                'blood_type',
                'religion',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relationship',
            ],
            2: [
                'hire_date',
                'employment_status',
                'employment_type',
                'contract_duration_months',
                'contract_end_date',
                'probation_duration_months',
                'pph21_method',
                'pph21_rate',
                'ptkp_category',
                'division_id',
                'sub_company_id',
                'position_id',
                'manager_id',
                'base_salary',
                'fixed_allowances',
                'is_active',
                'change_effective_date',
                'change_notes',
            ],
            3: [
                'family_card_number',
                'ktp_number',
                'npwp_number',
                'bpjs_kesehatan_number',
                'bpjs_ketenagakerjaan_number',
                'sim_a_number',
                'sim_b_number',
                'sim_c_number',
                'notes',
            ],
        }),
        [],
    );

    const selectedEmployee = useMemo(
        () =>
            selectedEmployeeId === null
                ? null
                : (employees.data.find(
                      (employee) => employee.id === selectedEmployeeId,
                  ) ?? null),
        [employees.data, selectedEmployeeId],
    );
    const defaultScopedSubCompanyId =
        employeeAccess.requires_sub_company && subCompanyOptions.length > 0
            ? String(subCompanyOptions[0].id)
            : '';

    const availablePositions = useMemo(() => {
        return positionOptions.filter((position) => {
            const sameDivision =
                employeeForm.data.division_id === '' ||
                position.division_id === Number(employeeForm.data.division_id);

            if (!sameDivision) {
                return false;
            }

            const isCurrentEmployeePosition =
                editingEmployee !== null &&
                editingEmployee.position_id === position.id;

            const allowsMultipleEmployees = ['3', '4', '5'].includes(
                position.level ?? '',
            );
            const canReuseScopedExecutivePosition =
                employeeForm.data.sub_company_id !== '';

            return (
                allowsMultipleEmployees ||
                canReuseScopedExecutivePosition ||
                position.employees_count === 0 ||
                isCurrentEmployeePosition
            );
        });
    }, [
        editingEmployee,
        employeeForm.data.division_id,
        employeeForm.data.sub_company_id,
        positionOptions,
    ]);

    const previewEmployeeCode = useMemo(() => {
        if (editingEmployee) {
            return employeeForm.data.employee_code;
        }

        return buildEmployeeCodePreview({
            divisionId: employeeForm.data.division_id,
            divisionOptions,
            hireDate: employeeForm.data.hire_date,
            positionId: employeeForm.data.position_id,
            positionOptions,
        });
    }, [
        divisionOptions,
        editingEmployee,
        employeeForm.data.division_id,
        employeeForm.data.employee_code,
        employeeForm.data.hire_date,
        employeeForm.data.position_id,
        positionOptions,
    ]);

    const employeeErrorSummary = useMemo(() => {
        return Object.entries(employeeForm.errors)
            .filter(([, message]) => Boolean(message))
            .map(([field, message]) => ({
                field,
                label: employeeFieldLabels[field] ?? field,
                message,
            }));
    }, [employeeForm.errors]);

    useEffect(() => {
        setFilterState(filters);
    }, [filters]);

    useEffect(() => {
        if (selectedEmployeeId !== null && selectedEmployee === null) {
            setSelectedEmployeeId(null);
        }
    }, [selectedEmployee, selectedEmployeeId]);

    useEffect(() => {
        const fieldNames = Object.keys(employeeForm.errors) as Array<
            keyof EmployeeFormData
        >;

        if (fieldNames.length === 0) {
            return;
        }

        for (const step of [1, 2, 3]) {
            const hasStepError = employeeStepFields[step].some((field) =>
                fieldNames.includes(field),
            );

            if (hasStepError) {
                setEmployeeFormStep(step);
                return;
            }
        }
    }, [employeeForm.errors, employeeStepFields]);

    const openCreateEmployeeDialog = () => {
        setEditingEmployee(null);
        setEmployeeFormStep(1);
        employeeForm.clearErrors();
        setContractEndMode('duration');
        employeeForm.setData({
            ...buildEmployeeDefault(),
            sub_company_id: defaultScopedSubCompanyId,
            employment_type: defaultScopedSubCompanyId !== '' ? 'OS' : 'PKWTT',
        });
        setEmployeeDialogOpen(true);
    };

    const openEditEmployeeDialog = (employee: Employee) => {
        setEditingEmployee(employee);
        setEmployeeFormStep(1);
        employeeForm.clearErrors();
        setContractEndMode(
            employee.contract_duration_months !== null ? 'duration' : 'manual',
        );
        employeeForm.setData({
            employee_code: employee.employee_code,
            full_name: employee.full_name,
            email: employee.email ?? '',
            phone: employee.phone ?? '',
            gender: employee.gender ?? '',
            birth_place: employee.birth_place ?? '',
            birth_date: employee.birth_date ?? '',
            last_education: employee.last_education ?? '',
            marital_status: employee.marital_status ?? '',
            children_count:
                employee.children_count !== null
                    ? String(employee.children_count)
                    : '0',
            hire_date: employee.hire_date,
            employment_status: employee.employment_status,
            employment_type: employee.employment_type,
            contract_duration_months:
                employee.contract_duration_months !== null
                    ? String(employee.contract_duration_months)
                    : '',
            contract_end_date: employee.contract_end_date ?? '',
            probation_duration_months:
                employee.probation_duration_months !== null
                    ? String(employee.probation_duration_months)
                    : '0',
            pph21_method: employee.pph21_method,
            pph21_rate: String(employee.pph21_rate ?? '0'),
            ptkp_category: employee.ptkp_category ?? '',
            division_id: employee.division_id
                ? String(employee.division_id)
                : '',
            sub_company_id: employee.sub_company_id
                ? String(employee.sub_company_id)
                : '',
            attendance_location_ids: employee.attendance_location_ids ?? [],
            is_wfa: employee.is_wfa ?? false,
            timezone: employee.timezone ?? defaultEmployeeTimezone(),
            position_id: employee.position_id
                ? String(employee.position_id)
                : '',
            manager_id: employee.manager_id ? String(employee.manager_id) : '',
            base_salary: normalizeStoredCurrencyValue(employee.base_salary),
            fixed_allowances: employee.allowances
                .filter((allowance) => allowance.is_active)
                .map((allowance) => ({
                    name: allowance.name,
                    amount: normalizeStoredCurrencyValue(allowance.amount),
                })),
            address: employee.address ?? '',
            domicile_address: employee.domicile_address ?? '',
            family_card_number: employee.family_card_number ?? '',
            ktp_number: employee.ktp_number ?? '',
            npwp_number: employee.npwp_number ?? '',
            blood_type: employee.blood_type ?? '',
            religion: employee.religion ?? '',
            bpjs_kesehatan_number: employee.bpjs_kesehatan_number ?? '',
            bpjs_ketenagakerjaan_number:
                employee.bpjs_ketenagakerjaan_number ?? '',
            sim_a_number: employee.sim_a_number ?? '',
            sim_b_number: employee.sim_b_number ?? '',
            sim_c_number: employee.sim_c_number ?? '',
            biological_mother_name: employee.biological_mother_name ?? '',
            emergency_contact_name: employee.emergency_contact_name ?? '',
            emergency_contact_phone: employee.emergency_contact_phone ?? '',
            emergency_contact_relationship:
                employee.emergency_contact_relationship ?? '',
            change_effective_date: todayDate(),
            change_notes: '',
            notes: employee.notes ?? '',
            is_active: employee.is_active,
        });
        setEmployeeDialogOpen(true);
    };

    const validateEmployeeStep = (step: number) => {
        let isValid = true;

        employeeForm.clearErrors(
            'full_name',
            'hire_date',
            'contract_duration_months',
            'contract_end_date',
            'probation_duration_months',
            'pph21_method',
            'pph21_rate',
            'division_id',
            'position_id',
        );

        if (step === 1) {
            if (employeeForm.data.full_name.trim() === '') {
                employeeForm.setError('full_name', 'Nama lengkap wajib diisi.');
                isValid = false;
            }

            if (
                employeeForm.data.email.trim() !== '' &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeForm.data.email)
            ) {
                employeeForm.setError('email', 'Format email tidak valid.');
                isValid = false;
            }

            if (
                employeeForm.data.phone.trim() !== '' &&
                !/^\+?[0-9\s-]{10,20}$/.test(employeeForm.data.phone)
            ) {
                employeeForm.setError(
                    'phone',
                    'Format nomor HP tidak valid (contoh: 081234567890).',
                );
                isValid = false;
            }

            if (
                employeeForm.data.birth_date.trim() !== '' &&
                employeeForm.data.birth_date >
                    new Date().toISOString().slice(0, 10)
            ) {
                employeeForm.setError(
                    'birth_date',
                    'Tanggal lahir tidak boleh lebih dari hari ini.',
                );
                isValid = false;
            }
        }

        if (step === 2) {
            if (employeeForm.data.hire_date.trim() === '') {
                employeeForm.setError(
                    'hire_date',
                    'Tanggal masuk wajib diisi.',
                );
                isValid = false;
            }

            if (employeeForm.data.division_id.trim() === '') {
                employeeForm.setError('division_id', 'Divisi wajib dipilih.');
                isValid = false;
            }

            if (employeeForm.data.pph21_method.trim() === '') {
                employeeForm.setError(
                    'pph21_method',
                    'Metode PPh21 wajib dipilih.',
                );
                isValid = false;
            }

            if (employeeForm.data.pph21_rate.trim() === '') {
                employeeForm.setError(
                    'pph21_rate',
                    'Nominal PPh21 wajib diisi.',
                );
                isValid = false;
            } else {
                const rateValue = Number(
                    employeeForm.data.pph21_rate.replace(/[^\d]/g, ''),
                );

                if (!Number.isInteger(rateValue) || rateValue < 0) {
                    employeeForm.setError(
                        'pph21_rate',
                        'Nominal PPh21 harus berupa angka bilangan bulat.',
                    );
                    isValid = false;
                }
            }

            if (employeeForm.data.position_id.trim() === '') {
                employeeForm.setError('position_id', 'Jabatan wajib dipilih.');
                isValid = false;
            }

            if (employeeForm.data.employment_type === 'PKWT') {
                if (
                    contractEndMode === 'duration' &&
                    (Number(employeeForm.data.contract_duration_months) < 1 ||
                        Number(employeeForm.data.contract_duration_months) >
                            120)
                ) {
                    employeeForm.setError(
                        'contract_duration_months',
                        'Durasi kontrak wajib 1 sampai 120 bulan.',
                    );
                    isValid = false;
                }

                if (
                    contractEndMode === 'manual' &&
                    employeeForm.data.contract_end_date.trim() === ''
                ) {
                    employeeForm.setError(
                        'contract_end_date',
                        'Tanggal akhir kontrak wajib diisi.',
                    );
                    isValid = false;
                }
            }

            if (
                employeeForm.data.employment_type === 'PKWTT' &&
                (Number(employeeForm.data.probation_duration_months) < 0 ||
                    Number(employeeForm.data.probation_duration_months) > 12)
            ) {
                employeeForm.setError(
                    'probation_duration_months',
                    'Durasi probation harus 0 sampai 12 bulan.',
                );
                isValid = false;
            }

            if (employeeForm.data.base_salary.trim() !== '') {
                const baseSalaryValue = Number(
                    employeeForm.data.base_salary.replace(/[^\d]/g, ''),
                );

                if (Number.isNaN(baseSalaryValue) || baseSalaryValue < 0) {
                    employeeForm.setError(
                        'base_salary',
                        'Gaji pokok harus berupa angka positif.',
                    );
                    isValid = false;
                }
            }

            employeeForm.data.fixed_allowances.forEach((allowance, index) => {
                if (allowance.name.trim() === '') {
                    employeeForm.setError(
                        `fixed_allowances.${index}.name`,
                        'Nama tunjangan wajib diisi.',
                    );
                    isValid = false;
                }

                if (Number(allowance.amount.replace(/[^\d]/g, '')) <= 0) {
                    employeeForm.setError(
                        `fixed_allowances.${index}.amount`,
                        'Nominal tunjangan harus lebih dari 0.',
                    );
                    isValid = false;
                }
            });
        }

        return isValid;
    };

    const goToNextEmployeeStep = () => {
        if (!validateEmployeeStep(employeeFormStep)) {
            return;
        }

        setEmployeeFormStep((current) => Math.min(3, current + 1));
    };

    const goToPreviousEmployeeStep = () => {
        setEmployeeFormStep((current) => Math.max(1, current - 1));
    };

    const openDetailEmployeeDialog = (employee: Employee) => {
        setDetailEmployee(employee);
    };

    const activatePortalUser = (employee: Employee) => {
        router.post(`/hris/employees/${employee.id}/invite-user`, undefined, {
            preserveScroll: true,
        });
    };

    const openPkwttActivationDialog = (employee: Employee) => {
        setActivatingPkwttEmployee(employee);
        pkwttActivationForm.clearErrors();
        pkwttActivationForm.setData({
            effective_date: todayDate(),
            notes: '',
        });
    };

    const submitPkwttActivationForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!activatingPkwttEmployee) {
            return;
        }

        pkwttActivationForm.post(
            `/hris/employees/${activatingPkwttEmployee.id}/activate-pkwtt`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActivatingPkwttEmployee(null);
                    pkwttActivationForm.reset();
                },
            },
        );
    };

    const openOffboardingDialog = (employee: Employee) => {
        setOffboardingEmployee(employee);
        offboardingForm.clearErrors();
        offboardingForm.setData({
            offboarded_at: employee.offboarded_at ?? todayDate(),
            offboarding_reason: employee.offboarding_reason ?? 'resigned',
            offboarding_notes: employee.offboarding_notes ?? '',
        });
    };

    const submitOffboardingForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!offboardingEmployee) {
            return;
        }

        offboardingForm.post(
            `/hris/employees/${offboardingEmployee.id}/offboard`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOffboardingEmployee(null);
                    offboardingForm.reset();
                },
            },
        );
    };

    const submitEmployeeForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingEmployee) {
            employeeForm.put(employeeRoutes.update.url(editingEmployee.id), {
                preserveScroll: true,
                onError: () => {
                    if (employeeFormStep < 3) {
                        validateEmployeeStep(employeeFormStep);
                    }
                },
                onSuccess: () => {
                    setEmployeeDialogOpen(false);
                    setEditingEmployee(null);
                    setEmployeeFormStep(1);
                    employeeForm.reset();
                },
            });

            return;
        }

        employeeForm.post(employeeRoutes.store.url(), {
            preserveScroll: true,
            onError: () => {
                if (employeeFormStep < 3) {
                    validateEmployeeStep(employeeFormStep);
                }
            },
            onSuccess: () => {
                setEmployeeDialogOpen(false);
                setEmployeeFormStep(1);
                employeeForm.reset();
            },
        });
    };

    const openBankAccountCreate = () => {
        bankAccountForm.clearErrors();
        bankAccountForm.setData(BANK_ACCOUNT_DEFAULT);
        setEditingBankAccount(null);
    };

    const openBankAccountEdit = (bankAccount: BankAccount) => {
        bankAccountForm.clearErrors();
        bankAccountForm.setData({
            bank_name: bankAccount.bank_name,
            account_number: bankAccount.account_number,
            account_holder_name: bankAccount.account_holder_name,
            branch: bankAccount.branch ?? '',
            currency: bankAccount.currency,
            fixed_allowance_amount:
                normalizeStoredCurrencyValue(
                    bankAccount.fixed_allowance_amount,
                ) || '0',
            is_primary: bankAccount.is_primary,
        });
        setEditingBankAccount(bankAccount);
    };

    const openAllowanceCreate = () => {
        allowanceForm.clearErrors();
        allowanceForm.setData(ALLOWANCE_DEFAULT);
        setEditingAllowance(null);
    };

    const openAllowanceEdit = (allowance: EmployeeAllowance) => {
        allowanceForm.clearErrors();
        allowanceForm.setData({
            name: allowance.name,
            amount: normalizeStoredCurrencyValue(allowance.amount),
            is_active: allowance.is_active,
            effective_start_date: allowance.effective_start_date ?? '',
            effective_end_date: allowance.effective_end_date ?? '',
            notes: allowance.notes ?? '',
        });
        setEditingAllowance(allowance);
    };

    const openDocumentCreate = () => {
        documentForm.clearErrors();
        documentForm.setData(DOCUMENT_DEFAULT);
        setEditingDocument(null);
    };

    const openDocumentEdit = (document: EmployeeDocument) => {
        documentForm.clearErrors();
        documentForm.setData({
            document_type: document.document_type,
            document_number: document.document_number ?? '',
            issued_at: document.issued_at ?? '',
            expires_at: document.expires_at ?? '',
            issuing_authority: document.issuing_authority ?? '',
            document_file: null,
            remove_file: false,
            notes: document.notes ?? '',
        });
        setEditingDocument(document);
    };

    const submitBankAccountForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedEmployee) {
            return;
        }

        if (editingBankAccount) {
            bankAccountForm.put(
                bankAccountRoutes.update.url([
                    selectedEmployee.id,
                    editingBankAccount.id,
                ]),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        bankAccountForm.reset();
                        setEditingBankAccount(null);
                    },
                },
            );

            return;
        }

        bankAccountForm.post(bankAccountRoutes.store.url(selectedEmployee.id), {
            preserveScroll: true,
            onSuccess: () => {
                bankAccountForm.reset();
                setEditingBankAccount(null);
            },
        });
    };

    const submitAllowanceForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedEmployee) {
            return;
        }

        if (editingAllowance) {
            allowanceForm.put(
                allowanceRoutes.update.url([
                    selectedEmployee.id,
                    editingAllowance.id,
                ]),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        allowanceForm.reset();
                        setEditingAllowance(null);
                    },
                },
            );

            return;
        }

        allowanceForm.post(allowanceRoutes.store.url(selectedEmployee.id), {
            preserveScroll: true,
            onSuccess: () => {
                allowanceForm.reset();
                setEditingAllowance(null);
            },
        });
    };

    const deleteAllowance = (allowance: EmployeeAllowance) => {
        if (!selectedEmployee) {
            return;
        }

        allowanceForm.delete(
            allowanceRoutes.destroy.url([selectedEmployee.id, allowance.id]),
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (editingAllowance?.id === allowance.id) {
                        allowanceForm.reset();
                        setEditingAllowance(null);
                    }
                },
            },
        );
    };

    const submitDocumentForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedEmployee) {
            return;
        }

        const baseUrl = `/hris/employees/${selectedEmployee.id}/documents`;

        if (editingDocument) {
            documentForm.post(`${baseUrl}/${editingDocument.id}?_method=PUT`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    documentForm.reset();
                    documentForm.clearErrors();
                    setEditingDocument(null);
                },
            });

            return;
        }

        documentForm.post(baseUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                documentForm.reset();
                documentForm.clearErrors();
                setEditingDocument(null);
            },
        });
    };

    const deleteDocument = (document: EmployeeDocument) => {
        if (!selectedEmployee) {
            return;
        }

        router.delete(
            `/hris/employees/${selectedEmployee.id}/documents/${document.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (editingDocument?.id === document.id) {
                        documentForm.reset();
                        documentForm.clearErrors();
                        setEditingDocument(null);
                    }
                },
            },
        );
    };

    const openEmployeeContract = (employeeId: number) => {
        window.open(employeeRoutes.contract.url(employeeId), '_blank');
    };

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(employeeListUrl, filterState, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (key: EmployeeSortKey) => {
        const direction =
            filters.sort === key && filters.direction === 'asc'
                ? 'desc'
                : 'asc';
        const nextFilters: Filters = {
            ...filterState,
            sort: key,
            direction,
        };

        setFilterState(nextFilters);
        router.get(employeeListUrl, nextFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const initialFilters = {
            search: '',
            division_id: '',
            sub_company_id: '',
            status: '',
            sort: 'name' as const,
            direction: 'asc' as const,
            division_search: '',
            position_search: '',
        };

        setFilterState(initialFilters);

        router.get(employeeListUrl, initialFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const activeFilterSummary = [
        filterState.search !== '' ? `Cari: "${filterState.search}"` : null,
        filterState.division_id !== ''
            ? `Divisi: ${
                  divisionOptions.find(
                      (division) =>
                          String(division.id) === filterState.division_id,
                  )?.name ?? filterState.division_id
              }`
            : null,
        filterState.sub_company_id !== ''
            ? `Perusahaan: ${
                  filterState.sub_company_id === '__internal'
                      ? 'Tanpa Sub Company'
                      : (subCompanyOptions.find(
                            (company) =>
                                String(company.id) ===
                                filterState.sub_company_id,
                        )?.name ?? filterState.sub_company_id)
              }`
            : null,
        filterState.status !== ''
            ? `Status: ${statusLabels[filterState.status] ?? filterState.status}`
            : null,
    ]
        .filter(Boolean)
        .join(' • ');

    const downloadEmployeeExport = () => {
        const employeeExportQuery = new URLSearchParams(
            Object.entries({
                search: filterState.search,
                division_id: filterState.division_id,
                sub_company_id: filterState.sub_company_id,
                status: isResignedList ? 'resigned' : filterState.status,
                category: employeeExportCategory,
                format: employeeExportFormat,
            }).filter(([, value]) => value !== ''),
        ).toString();

        window.location.assign(`/hris/employees/export?${employeeExportQuery}`);
        setEmployeeExportDialogOpen(false);
    };

    const employeeImportTemplateUrl = '/hris/employees/import-template';

    const submitEmployeeImportForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        employeeImportForm.post('/hris/employees/import', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEmployeeImportDialogOpen(false);
                employeeImportForm.reset();
                employeeImportForm.clearErrors();
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            headerActions={
                <div className="flex items-center gap-2">
                    {isResignedList ? (
                        <Button asChild size="sm" variant="outline">
                            <Link href={employeeRoutes.index.url()}>
                                <UserRoundCheck className="size-4" />
                                Kembali ke Data Karyawan
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild size="sm" variant="outline">
                                <Link href={employeeRoutes.resigned.url()}>
                                    <UserRoundX className="size-4" />
                                    Karyawan Resign
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setEmployeeImportDialogOpen(true)
                                }
                            >
                                <Upload className="size-4" />
                                Import Karyawan
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800"
                            >
                                <Link href="/hris/employees/master-data">
                                    Divisi & Jabatan
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                onClick={openCreateEmployeeDialog}
                            >
                                <Plus className="size-4" />
                                Tambah Karyawan
                            </Button>
                        </>
                    )}
                </div>
            }
        >
            <Head
                title={isResignedList ? 'Karyawan Resign' : 'HRIS Karyawan'}
            />

            <div className="space-y-6 p-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
                    <Card className="gap-2 border-sky-200 bg-sky-50/70 py-3 dark:border-sky-950 dark:bg-sky-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Total Karyawan
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.employees_total}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 border-emerald-200 bg-emerald-50/70 py-3 dark:border-emerald-950 dark:bg-emerald-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Karyawan Aktif
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.employees_active}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 border-violet-200 bg-violet-50/70 py-3 dark:border-violet-950 dark:bg-violet-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                FL
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.employees_by_type.FL ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 border-amber-200 bg-amber-50/70 py-3 dark:border-amber-950 dark:bg-amber-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                PKWT
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.employees_by_type.PKWT ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 border-indigo-200 bg-indigo-50/70 py-3 dark:border-indigo-950 dark:bg-indigo-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                PKWTT
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.employees_by_type.PKWTT ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 border-rose-200 bg-rose-50/70 py-3 dark:border-rose-950 dark:bg-rose-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                OS
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.employees_by_type.OS ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 border-cyan-200 bg-cyan-50/70 py-3 dark:border-cyan-950 dark:bg-cyan-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Total Divisi
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.divisions_total}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="gap-2 border-fuchsia-200 bg-fuchsia-50/70 py-3 dark:border-fuchsia-950 dark:bg-fuchsia-950/25">
                        <CardHeader className="px-4 pb-0">
                            <CardDescription className="truncate text-[11px] leading-none">
                                Total Jabatan
                            </CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.positions_total}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Karyawan</CardTitle>
                        <CardDescription>
                            Cari berdasarkan nama, kode, email, divisi, atau
                            status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submitFilters}
                            className={
                                isResignedList
                                    ? 'grid gap-3 md:grid-cols-[1fr_220px_220px_auto_auto]'
                                    : 'grid gap-3 md:grid-cols-[1fr_220px_220px_220px_auto_auto]'
                            }
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="search">Pencarian</Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        value={filterState.search}
                                        onChange={(event) =>
                                            setFilterState((current) => ({
                                                ...current,
                                                search: event.target.value,
                                            }))
                                        }
                                        className="pl-9"
                                        placeholder="Nama, email, atau kode karyawan"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="division-filter">Divisi</Label>
                                <SearchableSelect
                                    id="division-filter"
                                    value={
                                        filterState.division_id === ''
                                            ? '__all'
                                            : filterState.division_id
                                    }
                                    onValueChange={(value) =>
                                        setFilterState((current) => ({
                                            ...current,
                                            division_id:
                                                value === '__all' ? '' : value,
                                        }))
                                    }
                                    placeholder="Semua divisi"
                                    searchPlaceholder="Cari divisi..."
                                    options={[
                                        {
                                            value: '__all',
                                            label: 'Semua divisi',
                                        },
                                        ...divisions.data.map((division) => ({
                                            value: String(division.id),
                                            label: division.name,
                                        })),
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            {!isResignedList && (
                                <div className="grid gap-2">
                                    <Label htmlFor="status-filter">
                                        Status
                                    </Label>
                                    <Select
                                        value={
                                            filterState.status === ''
                                                ? '__all'
                                                : filterState.status
                                        }
                                        onValueChange={(value) =>
                                            setFilterState((current) => ({
                                                ...current,
                                                status:
                                                    value === '__all'
                                                        ? ''
                                                        : value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger
                                            id="status-filter"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Semua status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all">
                                                Semua status
                                            </SelectItem>
                                            {options.employment_statuses.map(
                                                (status) => (
                                                    <SelectItem
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {statusLabels[status] ??
                                                            status}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="sub-company-filter">
                                    Sub Company
                                </Label>
                                <SearchableSelect
                                    id="sub-company-filter"
                                    value={
                                        filterState.sub_company_id === ''
                                            ? '__all'
                                            : filterState.sub_company_id
                                    }
                                    onValueChange={(value) =>
                                        setFilterState((current) => ({
                                            ...current,
                                            sub_company_id:
                                                value === '__all' ? '' : value,
                                        }))
                                    }
                                    placeholder="Semua perusahaan"
                                    searchPlaceholder="Cari sub-company..."
                                    options={[
                                        {
                                            value: '__all',
                                            label: 'Semua perusahaan',
                                        },
                                        {
                                            value: '__internal',
                                            label: 'Tanpa Sub Company',
                                        },
                                        ...subCompanyOptions.map((company) => ({
                                            value: String(company.id),
                                            label: `${company.code} - ${company.name}`,
                                        })),
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button type="submit" className="w-full">
                                    <Filter className="size-4" />
                                    Terapkan
                                </Button>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={resetFilters}
                                >
                                    <RotateCcw className="size-4" />
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle>
                                {isResignedList
                                    ? 'Karyawan Resign'
                                    : 'Daftar Karyawan'}
                            </CardTitle>
                            <CardDescription>
                                {activeFilterSummary === ''
                                    ? isResignedList
                                        ? 'Daftar karyawan yang sudah melalui proses offboarding.'
                                        : 'Filter aktif: Semua karyawan'
                                    : `Filter aktif: ${activeFilterSummary}`}
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEmployeeExportDialogOpen(true)}
                        >
                            <Download className="size-4" />
                            Export Data
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1320px] text-xs">
                                <thead>
                                    <tr className="border-b text-center">
                                        <SortableEmployeeHeader
                                            label="Nama"
                                            sortKey="name"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="sticky left-0 z-20 min-w-[220px] bg-background px-2 py-1.5 text-center shadow-[6px_0_8px_-8px_rgba(15,23,42,0.25)]"
                                        />
                                        <SortableEmployeeHeader
                                            label="Kode"
                                            sortKey="code"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="min-w-[110px] px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Kontak"
                                            sortKey="contact"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="min-w-[190px] px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Divisi"
                                            sortKey="division"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Perusahaan"
                                            sortKey="sub_company"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="min-w-[160px] px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Jabatan"
                                            sortKey="position"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Tgl Masuk"
                                            sortKey="hire_date"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="min-w-[110px] px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Tipe"
                                            sortKey="employment_type"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="min-w-[110px] px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Gaji"
                                            sortKey="base_salary"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="min-w-[135px] px-2 py-1.5 text-center"
                                        />
                                        <SortableEmployeeHeader
                                            label="Status"
                                            sortKey="status"
                                            activeSort={filters.sort}
                                            direction={filters.direction}
                                            onSort={handleSort}
                                            className="px-2 py-1.5 text-center"
                                        />
                                        <th className="sticky right-0 z-20 min-w-[72px] bg-background px-2 py-1.5 text-center font-medium shadow-[-6px_0_8px_-8px_rgba(15,23,42,0.25)]">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={11}
                                                className="px-3 py-8 text-center text-muted-foreground"
                                            >
                                                {isResignedList
                                                    ? 'Belum ada karyawan resign.'
                                                    : 'Belum ada data karyawan.'}
                                            </td>
                                        </tr>
                                    )}
                                    {employees.data.map((employee) => {
                                        const isResigned =
                                            employee.employment_status ===
                                            'resigned';

                                        return (
                                            <tr
                                                key={employee.id}
                                                className="border-b align-top"
                                            >
                                                <td className="sticky left-0 z-10 bg-background px-2 py-2 shadow-[6px_0_8px_-8px_rgba(15,23,42,0.25)]">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="size-7">
                                                            <AvatarFallback>
                                                                {getInitials(
                                                                    employee.full_name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <p
                                                                    className={
                                                                        isResigned
                                                                            ? 'text-xs font-semibold text-red-900'
                                                                            : 'text-xs font-medium'
                                                                    }
                                                                >
                                                                    {
                                                                        employee.full_name
                                                                    }
                                                                </p>
                                                                {employee.is_wfa ? (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="h-4 px-1 text-[9px]"
                                                                    >
                                                                        WFA
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                            <p className="max-w-[150px] truncate text-[11px] text-muted-foreground">
                                                                {employee
                                                                    .position
                                                                    ?.name ??
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 font-mono text-[11px] uppercase">
                                                    {employee.employee_code}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <div className="space-y-0.5">
                                                        <p className="max-w-[170px] truncate">
                                                            {employee.email ??
                                                                '-'}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {employee.phone ??
                                                                '-'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2">
                                                    {employee.division?.name ??
                                                        '-'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {employee.sub_company ? (
                                                        <div>
                                                            <p className="max-w-[140px] truncate">
                                                                {
                                                                    employee
                                                                        .sub_company
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Sub Company
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="h-5 px-1.5 text-[10px]"
                                                        >
                                                            -
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {employee.position?.name ??
                                                        '-'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {formatDateDisplay(
                                                        employee.hire_date,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {typeLabels[
                                                        employee.employment_type
                                                    ] ??
                                                        employee.employment_type}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {formatCurrencyDisplay(
                                                        employee.base_salary,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Badge
                                                        className={
                                                            isResigned
                                                                ? 'h-5 border-red-900 bg-red-950 px-1.5 text-[10px] text-white hover:bg-red-950'
                                                                : 'h-5 px-1.5 text-[10px]'
                                                        }
                                                        variant={
                                                            isResigned
                                                                ? 'outline'
                                                                : employee.employment_status ===
                                                                    'active'
                                                                  ? 'default'
                                                                  : 'secondary'
                                                        }
                                                    >
                                                        {statusLabels[
                                                            employee
                                                                .employment_status
                                                        ] ??
                                                            employee.employment_status}
                                                    </Badge>
                                                </td>
                                                <td className="sticky right-0 z-10 bg-background px-2 py-2 shadow-[-6px_0_8px_-8px_rgba(15,23,42,0.25)]">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <ActionIconButton
                                                            label="Detail karyawan"
                                                            icon={Eye}
                                                            variant="outline"
                                                            onClick={() =>
                                                                openDetailEmployeeDialog(
                                                                    employee,
                                                                )
                                                            }
                                                        />
                                                        <ActionIconButton
                                                            label="Edit karyawan"
                                                            icon={Pencil}
                                                            variant="outline"
                                                            onClick={() =>
                                                                openEditEmployeeDialog(
                                                                    employee,
                                                                )
                                                            }
                                                        />
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="size-7"
                                                                    aria-label="Aksi lainnya"
                                                                >
                                                                    <MoreHorizontal className="size-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setSelectedEmployeeId(
                                                                            employee.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Landmark className="size-4" />
                                                                    Kelola
                                                                    rekening
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        openEmployeeContract(
                                                                            employee.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Download className="size-4" />
                                                                    Generate
                                                                    kontrak
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        activatePortalUser(
                                                                            employee,
                                                                        )
                                                                    }
                                                                >
                                                                    <UserRoundCheck className="size-4" />
                                                                    {employee.portal_user
                                                                        ? 'Kirim ulang undangan login'
                                                                        : 'Undang ke login portal'}
                                                                </DropdownMenuItem>
                                                                {employee.employment_type ===
                                                                    'PKWTT' &&
                                                                    employee.employment_status ===
                                                                        'probation' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                openPkwttActivationDialog(
                                                                                    employee,
                                                                                )
                                                                            }
                                                                        >
                                                                            <UserRoundCheck className="size-4" />
                                                                            Aktivasi
                                                                            PKWTT
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                <DropdownMenuItem
                                                                    disabled={
                                                                        employee.employment_status ===
                                                                            'resigned' &&
                                                                        employee.offboarded_at !==
                                                                            null
                                                                    }
                                                                    onClick={() =>
                                                                        openOffboardingDialog(
                                                                            employee,
                                                                        )
                                                                    }
                                                                >
                                                                    <UserRoundX className="size-4" />
                                                                    Offboarding
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {employees.links.map((link, index) => (
                                <Button
                                    key={`${link.label}-${index}`}
                                    asChild={link.url !== null}
                                    size="sm"
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    disabled={link.url === null}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Link>
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={employeeExportDialogOpen}
                onOpenChange={setEmployeeExportDialogOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pilih Data Export</DialogTitle>
                        <DialogDescription>
                            Kategori menentukan kolom pada file export.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label>Format File</Label>
                        <div className="grid grid-cols-2 rounded-md bg-muted p-1">
                            {(['xls', 'pdf'] as EmployeeExportFormat[]).map(
                                (format) => (
                                    <button
                                        key={format}
                                        type="button"
                                        aria-pressed={
                                            employeeExportFormat === format
                                        }
                                        onClick={() =>
                                            setEmployeeExportFormat(format)
                                        }
                                        className={`h-8 rounded-sm text-sm font-medium transition-colors ${
                                            employeeExportFormat === format
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {format === 'xls' ? 'XLS' : 'PDF'}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {employeeExportCategories.map((category) => (
                            <label
                                key={category.value}
                                htmlFor={`export-category-${category.value}`}
                                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50 ${
                                    employeeExportCategory === category.value
                                        ? 'border-primary bg-primary/5'
                                        : ''
                                }`}
                            >
                                <input
                                    id={`export-category-${category.value}`}
                                    type="radio"
                                    name="employee-export-category"
                                    value={category.value}
                                    checked={
                                        employeeExportCategory ===
                                        category.value
                                    }
                                    onChange={() =>
                                        setEmployeeExportCategory(
                                            category.value,
                                        )
                                    }
                                    className="mt-1 size-4 accent-primary"
                                />
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium">
                                        {category.label}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {category.description}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEmployeeExportDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="button" onClick={downloadEmployeeExport}>
                            <Download className="size-4" />
                            Export .{employeeExportFormat}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={employeeImportDialogOpen}
                onOpenChange={(open) => {
                    setEmployeeImportDialogOpen(open);

                    if (!open) {
                        employeeImportForm.reset();
                        employeeImportForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Import Data Karyawan</DialogTitle>
                        <DialogDescription>
                            Unduh template Excel, isi data sesuai kolom, lalu
                            upload file untuk menambahkan karyawan sekaligus.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={submitEmployeeImportForm}
                        className="space-y-4"
                    >
                        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">
                                Template import
                            </p>
                            <p className="mt-1">
                                Gunakan `division_code` dan `position_code` yang
                                sudah terdaftar. File yang didukung: XLSX, XLS,
                                CSV, atau TXT.
                            </p>
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3"
                            >
                                <a href={employeeImportTemplateUrl}>
                                    <Download className="size-4" />
                                    Download Template
                                </a>
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="employee_import_file">
                                File import
                            </Label>
                            <Input
                                id="employee_import_file"
                                type="file"
                                accept=".xlsx,.xls,.csv,.txt"
                                onChange={(event) => {
                                    employeeImportForm.setData(
                                        'import_file',
                                        event.target.files?.[0] ?? null,
                                    );
                                }}
                            />
                            <InputError
                                message={employeeImportForm.errors.import_file}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setEmployeeImportDialogOpen(false)
                                }
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={employeeImportForm.processing}
                            >
                                <Upload className="size-4" />
                                Import
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={detailEmployee !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailEmployee(null);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Karyawan</DialogTitle>
                        <DialogDescription>
                            Informasi ringkas data karyawan.
                        </DialogDescription>
                    </DialogHeader>
                    {detailEmployee && (
                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center gap-3 rounded-md border p-3">
                                <Avatar className="size-10">
                                    <AvatarFallback>
                                        {getInitials(detailEmployee.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {detailEmployee.full_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {detailEmployee.employee_code}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="ml-auto"
                                    onClick={() =>
                                        openEmployeeContract(detailEmployee.id)
                                    }
                                >
                                    <Download className="size-4" />
                                    Generate Kontrak
                                </Button>
                            </div>
                            <div className="grid gap-2 rounded-md border p-3">
                                <p>Email: {detailEmployee.email ?? '-'}</p>
                                <p>Telepon: {detailEmployee.phone ?? '-'}</p>
                                <p>
                                    Pendidikan Terakhir:{' '}
                                    {detailEmployee.last_education ?? '-'}
                                </p>
                                <p>
                                    Status Perkawinan:{' '}
                                    {detailEmployee.marital_status
                                        ? (maritalStatusLabels[
                                              detailEmployee.marital_status
                                          ] ?? detailEmployee.marital_status)
                                        : '-'}
                                </p>
                                <p>
                                    Jumlah Anak:{' '}
                                    {detailEmployee.children_count ?? '-'}
                                </p>
                                <p>
                                    No. KK:{' '}
                                    {detailEmployee.family_card_number ?? '-'}
                                </p>
                                <p>
                                    No. KTP: {detailEmployee.ktp_number ?? '-'}
                                </p>
                                <p>
                                    Nama Ibu Kandung:{' '}
                                    {detailEmployee.biological_mother_name ??
                                        '-'}
                                </p>
                                <p>
                                    Alamat KTP: {detailEmployee.address ?? '-'}
                                </p>
                                <p>
                                    Alamat Domisili:{' '}
                                    {detailEmployee.domicile_address ?? '-'}
                                </p>
                                <p>
                                    Golongan Darah:{' '}
                                    {detailEmployee.blood_type ?? '-'}
                                </p>
                                <p>Agama: {detailEmployee.religion ?? '-'}</p>
                                <p>NPWP: {detailEmployee.npwp_number ?? '-'}</p>
                                <p>
                                    Kontak Darurat:{' '}
                                    {detailEmployee.emergency_contact_name
                                        ? `${detailEmployee.emergency_contact_name} - ${detailEmployee.emergency_contact_phone ?? '-'} (${detailEmployee.emergency_contact_relationship ?? '-'})`
                                        : '-'}
                                </p>
                                <p>
                                    Divisi:{' '}
                                    {detailEmployee.division?.name ?? '-'}
                                </p>
                                <p>
                                    Perusahaan:{' '}
                                    {detailEmployee.sub_company?.name ?? '-'}
                                </p>
                                <p>
                                    Zona Waktu Utama:{' '}
                                    {detailEmployee.timezone ?? '-'}
                                </p>
                                <p>
                                    Tipe Karyawan:{' '}
                                    {typeLabels[
                                        detailEmployee.employment_type
                                    ] ?? detailEmployee.employment_type}
                                </p>
                                <p>
                                    Jabatan:{' '}
                                    {detailEmployee.position?.name ?? '-'}
                                </p>
                                <p>
                                    Status:{' '}
                                    {statusLabels[
                                        detailEmployee.employment_status
                                    ] ?? detailEmployee.employment_status}
                                </p>
                                {detailEmployee.employment_type === 'PKWT' && (
                                    <p>
                                        Kontrak berakhir:{' '}
                                        {formatDateDisplay(
                                            detailEmployee.contract_end_date,
                                        )}
                                        {detailEmployee.contract_duration_months
                                            ? ` (${detailEmployee.contract_duration_months} bulan)`
                                            : ''}
                                    </p>
                                )}
                                {detailEmployee.employment_type === 'PKWTT' && (
                                    <p>
                                        Probation:{' '}
                                        {detailEmployee.probation_duration_months ??
                                            0}{' '}
                                        bulan, sampai{' '}
                                        {formatDateDisplay(
                                            detailEmployee.probation_end_date,
                                        )}
                                    </p>
                                )}
                                <p>
                                    Tanggal Offboarding:{' '}
                                    {formatDateDisplay(
                                        detailEmployee.offboarded_at,
                                    )}
                                </p>
                                <p>
                                    Alasan Offboarding:{' '}
                                    {detailEmployee.offboarding_reason
                                        ? (offboardingReasonLabels[
                                              detailEmployee.offboarding_reason
                                          ] ??
                                          detailEmployee.offboarding_reason)
                                        : '-'}
                                </p>
                                <p>
                                    Catatan Offboarding:{' '}
                                    {detailEmployee.offboarding_notes ?? '-'}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 rounded-md border p-3">
                                <p className="font-medium">
                                    Histori Kepegawaian
                                </p>
                                {detailEmployee.employment_histories.length ===
                                0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada perubahan status, divisi, atau
                                        jabatan.
                                    </p>
                                ) : (
                                    detailEmployee.employment_histories.map(
                                        (history) => (
                                            <div
                                                key={history.id}
                                                className="flex flex-col gap-1 border-l-2 border-muted pl-3 text-sm"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {employmentHistoryLabels[
                                                            history.event_type
                                                        ] ?? history.event_type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDateDisplay(
                                                            history.effective_date,
                                                        )}
                                                    </span>
                                                </div>
                                                {history.old_status !==
                                                    history.new_status && (
                                                    <p>
                                                        Status:{' '}
                                                        {history.old_status
                                                            ? (statusLabels[
                                                                  history
                                                                      .old_status
                                                              ] ??
                                                              history.old_status)
                                                            : '-'}{' '}
                                                        →{' '}
                                                        {history.new_status
                                                            ? (statusLabels[
                                                                  history
                                                                      .new_status
                                                              ] ??
                                                              history.new_status)
                                                            : '-'}
                                                    </p>
                                                )}
                                                {history.old_position_name !==
                                                    history.new_position_name && (
                                                    <p>
                                                        Jabatan:{' '}
                                                        {history.old_position_name ??
                                                            '-'}{' '}
                                                        →{' '}
                                                        {history.new_position_name ??
                                                            '-'}
                                                    </p>
                                                )}
                                                {history.old_division_name !==
                                                    history.new_division_name && (
                                                    <p>
                                                        Divisi:{' '}
                                                        {history.old_division_name ??
                                                            '-'}{' '}
                                                        →{' '}
                                                        {history.new_division_name ??
                                                            '-'}
                                                    </p>
                                                )}
                                                {history.notes && (
                                                    <p className="text-muted-foreground">
                                                        {history.notes}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Oleh{' '}
                                                    {history.created_by_name ??
                                                        '-'}
                                                </p>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={activatingPkwttEmployee !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActivatingPkwttEmployee(null);
                        pkwttActivationForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Aktivasi Kontrak PKWTT</DialogTitle>
                        <DialogDescription>
                            Akhiri masa probation dan aktifkan status kontrak
                            permanen karyawan.
                        </DialogDescription>
                    </DialogHeader>
                    {activatingPkwttEmployee && (
                        <form
                            onSubmit={submitPkwttActivationForm}
                            className="flex flex-col gap-4"
                        >
                            <div className="rounded-md border p-3 text-sm">
                                <p className="font-medium">
                                    {activatingPkwttEmployee.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Probation sampai{' '}
                                    {formatDateDisplay(
                                        activatingPkwttEmployee.probation_end_date,
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="pkwtt_effective_date">
                                    Tanggal efektif
                                </Label>
                                <Input
                                    id="pkwtt_effective_date"
                                    type="date"
                                    min={activatingPkwttEmployee.hire_date}
                                    max={todayDate()}
                                    value={
                                        pkwttActivationForm.data.effective_date
                                    }
                                    onChange={(event) =>
                                        pkwttActivationForm.setData(
                                            'effective_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={
                                        pkwttActivationForm.errors
                                            .effective_date
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="pkwtt_activation_notes">
                                    Catatan
                                </Label>
                                <textarea
                                    id="pkwtt_activation_notes"
                                    rows={3}
                                    value={pkwttActivationForm.data.notes}
                                    onChange={(event) =>
                                        pkwttActivationForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                <InputError
                                    message={pkwttActivationForm.errors.notes}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setActivatingPkwttEmployee(null)
                                    }
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={pkwttActivationForm.processing}
                                >
                                    Aktivasi PKWTT
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={offboardingEmployee !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setOffboardingEmployee(null);
                        offboardingForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Offboarding Karyawan</DialogTitle>
                        <DialogDescription>
                            Proses ini akan mengubah status karyawan menjadi
                            resign, menonaktifkan data aktif, suspend akun
                            portal, dan melepas direct report dari karyawan ini.
                        </DialogDescription>
                    </DialogHeader>

                    {offboardingEmployee && (
                        <form
                            onSubmit={submitOffboardingForm}
                            className="space-y-4"
                        >
                            <div className="rounded-md border p-3 text-sm">
                                <p className="font-medium">
                                    {offboardingEmployee.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {offboardingEmployee.employee_code} -{' '}
                                    {offboardingEmployee.position?.name ?? '-'}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="offboarded_at">
                                    Tanggal offboarding
                                </Label>
                                <Input
                                    id="offboarded_at"
                                    type="date"
                                    min={offboardingEmployee.hire_date}
                                    value={offboardingForm.data.offboarded_at}
                                    onChange={(event) =>
                                        offboardingForm.setData(
                                            'offboarded_at',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={
                                        offboardingForm.errors.offboarded_at
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="offboarding_reason">
                                    Alasan
                                </Label>
                                <Select
                                    value={
                                        offboardingForm.data.offboarding_reason
                                    }
                                    onValueChange={(value) =>
                                        offboardingForm.setData(
                                            'offboarding_reason',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger id="offboarding_reason">
                                        <SelectValue placeholder="Pilih alasan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(
                                            offboardingReasonLabels,
                                        ).map(([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={
                                        offboardingForm.errors
                                            .offboarding_reason
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="offboarding_notes">
                                    Catatan
                                </Label>
                                <textarea
                                    id="offboarding_notes"
                                    value={
                                        offboardingForm.data.offboarding_notes
                                    }
                                    onChange={(event) =>
                                        offboardingForm.setData(
                                            'offboarding_notes',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                                    placeholder="Catatan serah terima, akses yang dicabut, atau informasi tambahan"
                                />
                                <InputError
                                    message={
                                        offboardingForm.errors.offboarding_notes
                                    }
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOffboardingEmployee(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={offboardingForm.processing}
                                >
                                    <UserRoundX className="size-4" />
                                    Proses Offboarding
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={employeeDialogOpen}
                onOpenChange={(open) => {
                    setEmployeeDialogOpen(open);
                    if (!open) {
                        setEditingEmployee(null);
                        setEmployeeFormStep(1);
                        employeeForm.reset();
                        employeeForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingEmployee
                                ? 'Edit Data Karyawan'
                                : 'Tambah Karyawan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Lengkapi data personal, organisasi, dan payroll.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitEmployeeForm} className="space-y-4">
                        <div className="grid gap-2 sm:grid-cols-3">
                            {[
                                {
                                    step: 1,
                                    title: 'Data Personal',
                                },
                                {
                                    step: 2,
                                    title: 'Data Pekerjaan',
                                },
                                {
                                    step: 3,
                                    title: 'Data Tambahan',
                                },
                            ].map((item) => (
                                <button
                                    key={item.step}
                                    type="button"
                                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                                        employeeFormStep === item.step
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border bg-muted/30'
                                    }`}
                                    onClick={() =>
                                        setEmployeeFormStep(item.step)
                                    }
                                >
                                    <p className="text-xs text-muted-foreground">
                                        Langkah {item.step}
                                    </p>
                                    <p className="font-medium">{item.title}</p>
                                </button>
                            ))}
                        </div>

                        {employeeErrorSummary.length > 0 ? (
                            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 size-4 text-rose-700" />
                                    <div className="space-y-1 text-sm text-rose-800">
                                        <p className="font-semibold">
                                            Data belum bisa disimpan. Periksa
                                            input berikut:
                                        </p>
                                        <ul className="list-disc space-y-1 pl-5">
                                            {employeeErrorSummary.map(
                                                (error) => (
                                                    <li
                                                        key={`${error.field}-${error.message}`}
                                                    >
                                                        <span className="font-medium">
                                                            {error.label}:
                                                        </span>{' '}
                                                        {error.message}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {employeeFormStep === 1 && (
                            <div className="space-y-3">
                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="employee_code">
                                        ID Karyawan
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="employee_code"
                                            value={
                                                employeeForm.data.employee_code
                                            }
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'employee_code',
                                                    event.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder={
                                                previewEmployeeCode ||
                                                'ID karyawan'
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Isi manual atau kosongkan agar
                                            dibuat otomatis dari kode jabatan +
                                            urutan divisi + bulan/tahun masuk
                                            kerja.
                                        </p>
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .employee_code
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="full_name">
                                        Nama Lengkap
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="full_name"
                                            value={employeeForm.data.full_name}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'full_name',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.full_name
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="email"
                                            type="email"
                                            value={employeeForm.data.email}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={employeeForm.errors.email}
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="phone">Nomor HP</Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="phone"
                                            value={employeeForm.data.phone}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={employeeForm.errors.phone}
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="gender">Gender</Label>
                                    <div className="space-y-1">
                                        <Select
                                            value={
                                                employeeForm.data.gender === ''
                                                    ? '__none'
                                                    : employeeForm.data.gender
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'gender',
                                                    value === '__none'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="gender"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Pilih gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none">
                                                    -
                                                </SelectItem>
                                                {options.genders.map(
                                                    (gender) => (
                                                        <SelectItem
                                                            key={gender}
                                                            value={gender}
                                                        >
                                                            {genderLabels[
                                                                gender
                                                            ] ?? gender}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={employeeForm.errors.gender}
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="birth_place">
                                        Tempat Lahir
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="birth_place"
                                            value={
                                                employeeForm.data.birth_place
                                            }
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'birth_place',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Makassar"
                                            maxLength={150}
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.birth_place
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="birth_date">
                                        Tanggal Lahir
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={employeeForm.data.birth_date}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'birth_date',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.birth_date
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="last_education">
                                        Pendidikan Terakhir
                                    </Label>
                                    <div className="space-y-1">
                                        <SearchableSelect
                                            id="last_education"
                                            value={
                                                employeeForm.data
                                                    .last_education === ''
                                                    ? '__none'
                                                    : employeeForm.data
                                                          .last_education
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'last_education',
                                                    value === '__none'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                            placeholder="Pilih pendidikan"
                                            searchPlaceholder="Cari pendidikan..."
                                            options={[
                                                {
                                                    value: '__none',
                                                    label: '-',
                                                },
                                                ...options.last_education_levels.map(
                                                    (level) => ({
                                                        value: level,
                                                        label: level,
                                                    }),
                                                ),
                                            ]}
                                            className="w-full"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .last_education
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="marital_status">
                                        Status Keluarga
                                    </Label>
                                    <div className="space-y-2">
                                        <div
                                            className={`grid gap-2 ${
                                                employeeForm.data
                                                    .marital_status !== '' &&
                                                employeeForm.data
                                                    .marital_status !== 'single'
                                                    ? 'md:grid-cols-2'
                                                    : 'md:grid-cols-1'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <Select
                                                    value={
                                                        employeeForm.data
                                                            .marital_status ===
                                                        ''
                                                            ? '__none'
                                                            : employeeForm.data
                                                                  .marital_status
                                                    }
                                                    onValueChange={(value) => {
                                                        const maritalStatus =
                                                            value === '__none'
                                                                ? ''
                                                                : value;

                                                        employeeForm.setData(
                                                            'marital_status',
                                                            maritalStatus,
                                                        );

                                                        if (
                                                            maritalStatus ===
                                                                '' ||
                                                            maritalStatus ===
                                                                'single'
                                                        ) {
                                                            employeeForm.setData(
                                                                'children_count',
                                                                '0',
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id="marital_status"
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Pilih status perkawinan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="__none">
                                                            -
                                                        </SelectItem>
                                                        {options.marital_statuses.map(
                                                            (status) => (
                                                                <SelectItem
                                                                    key={status}
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {maritalStatusLabels[
                                                                        status
                                                                    ] ?? status}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        employeeForm.errors
                                                            .marital_status
                                                    }
                                                />
                                            </div>

                                            {employeeForm.data
                                                .marital_status !== '' &&
                                                employeeForm.data
                                                    .marital_status !==
                                                    'single' && (
                                                    <div className="space-y-1">
                                                        <Input
                                                            id="children_count"
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                employeeForm
                                                                    .data
                                                                    .children_count
                                                            }
                                                            onChange={(event) =>
                                                                employeeForm.setData(
                                                                    'children_count',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Jumlah anak"
                                                        />
                                                        <InputError
                                                            message={
                                                                employeeForm
                                                                    .errors
                                                                    .children_count
                                                            }
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="biological_mother_name">
                                        Nama Ibu Kandung
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="biological_mother_name"
                                            value={
                                                employeeForm.data
                                                    .biological_mother_name
                                            }
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'biological_mother_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .biological_mother_name
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="address">Alamat KTP</Label>
                                    <div className="space-y-1">
                                        <textarea
                                            id="address"
                                            value={employeeForm.data.address}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'address',
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            maxLength={500}
                                            className="min-h-20 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.address
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="domicile_address">
                                        Alamat Domisili
                                    </Label>
                                    <div className="flex flex-col gap-1">
                                        <textarea
                                            id="domicile_address"
                                            value={
                                                employeeForm.data
                                                    .domicile_address
                                            }
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'domicile_address',
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            maxLength={500}
                                            className="min-h-20 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .domicile_address
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="blood_type">
                                        Golongan Darah
                                    </Label>
                                    <Select
                                        value={
                                            employeeForm.data.blood_type ||
                                            '__none'
                                        }
                                        onValueChange={(value) =>
                                            employeeForm.setData(
                                                'blood_type',
                                                value === '__none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="blood_type"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Pilih golongan darah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none">
                                                -
                                            </SelectItem>
                                            {['A', 'B', 'AB', 'O'].map(
                                                (bloodType) => (
                                                    <SelectItem
                                                        key={bloodType}
                                                        value={bloodType}
                                                    >
                                                        {bloodType}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="religion">Agama</Label>
                                    <Select
                                        value={
                                            employeeForm.data.religion ||
                                            '__none'
                                        }
                                        onValueChange={(value) =>
                                            employeeForm.setData(
                                                'religion',
                                                value === '__none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="religion"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Pilih agama" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none">
                                                -
                                            </SelectItem>
                                            {[
                                                'Islam',
                                                'Kristen',
                                                'Katolik',
                                                'Hindu',
                                                'Buddha',
                                                'Konghucu',
                                                'Lainnya',
                                            ].map((religion) => (
                                                <SelectItem
                                                    key={religion}
                                                    value={religion}
                                                >
                                                    {religion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="emergency_contact_name">
                                        Kontak Darurat
                                    </Label>
                                    <div className="grid gap-2 md:grid-cols-3">
                                        <Input
                                            id="emergency_contact_name"
                                            value={
                                                employeeForm.data
                                                    .emergency_contact_name
                                            }
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'emergency_contact_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Nama"
                                        />
                                        <Input
                                            id="emergency_contact_phone"
                                            value={
                                                employeeForm.data
                                                    .emergency_contact_phone
                                            }
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'emergency_contact_phone',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Nomor telepon"
                                        />
                                        <Input
                                            id="emergency_contact_relationship"
                                            value={
                                                employeeForm.data
                                                    .emergency_contact_relationship
                                            }
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'emergency_contact_relationship',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Hubungan"
                                        />
                                        <div className="md:col-span-3">
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .emergency_contact_name ??
                                                    employeeForm.errors
                                                        .emergency_contact_phone ??
                                                    employeeForm.errors
                                                        .emergency_contact_relationship
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {employeeFormStep === 2 && (
                            <div className="space-y-3">
                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="hire_date">
                                        Tanggal Masuk
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="hire_date"
                                            type="date"
                                            value={employeeForm.data.hire_date}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'hire_date',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.hire_date
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="employment_status">
                                        Status
                                    </Label>
                                    <div className="space-y-1">
                                        <Select
                                            value={
                                                employeeForm.data
                                                    .employment_status
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'employment_status',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="employment_status"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {options.employment_statuses.map(
                                                    (status) => (
                                                        <SelectItem
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {statusLabels[
                                                                status
                                                            ] ?? status}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .employment_status
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="employment_type">
                                        Tipe
                                    </Label>
                                    <div className="space-y-1">
                                        <Select
                                            value={
                                                employeeForm.data
                                                    .employment_type
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    (data) => ({
                                                        ...data,
                                                        employment_type: value,
                                                        contract_duration_months:
                                                            value === 'PKWT'
                                                                ? data.contract_duration_months
                                                                : '',
                                                        contract_end_date:
                                                            value === 'PKWT'
                                                                ? data.contract_end_date
                                                                : '',
                                                        probation_duration_months:
                                                            value === 'PKWTT'
                                                                ? data.probation_duration_months
                                                                : '0',
                                                    }),
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="employment_type"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Pilih tipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {options.employment_types.map(
                                                    (type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {typeLabels[type] ??
                                                                type}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .employment_type
                                            }
                                        />
                                    </div>
                                </div>

                                {employeeForm.data.employment_type ===
                                    'PKWT' && (
                                    <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="contract_end_mode">
                                            Masa Kontrak
                                        </Label>
                                        <div className="flex flex-col gap-2">
                                            <Select
                                                value={contractEndMode}
                                                onValueChange={(value) => {
                                                    const mode = value as
                                                        | 'duration'
                                                        | 'manual';
                                                    setContractEndMode(mode);
                                                    if (mode === 'duration') {
                                                        employeeForm.setData(
                                                            'contract_end_date',
                                                            '',
                                                        );
                                                    } else {
                                                        employeeForm.setData(
                                                            'contract_duration_months',
                                                            '',
                                                        );
                                                    }
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="contract_end_mode"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="duration">
                                                        Hitung dari durasi bulan
                                                    </SelectItem>
                                                    <SelectItem value="manual">
                                                        Tentukan tanggal akhir
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {contractEndMode === 'duration' ? (
                                                <>
                                                    <Input
                                                        id="contract_duration_months"
                                                        type="number"
                                                        min="1"
                                                        max="120"
                                                        value={
                                                            employeeForm.data
                                                                .contract_duration_months
                                                        }
                                                        onChange={(event) =>
                                                            employeeForm.setData(
                                                                'contract_duration_months',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Contoh: 12 bulan"
                                                    />
                                                    <InputError
                                                        message={
                                                            employeeForm.errors
                                                                .contract_duration_months
                                                        }
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Input
                                                        id="contract_end_date"
                                                        type="date"
                                                        min={
                                                            employeeForm.data
                                                                .hire_date
                                                        }
                                                        value={
                                                            employeeForm.data
                                                                .contract_end_date
                                                        }
                                                        onChange={(event) =>
                                                            employeeForm.setData(
                                                                'contract_end_date',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            employeeForm.errors
                                                                .contract_end_date
                                                        }
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {employeeForm.data.employment_type ===
                                    'PKWTT' && (
                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="probation_duration_months">
                                            Masa Probation
                                        </Label>
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                id="probation_duration_months"
                                                type="number"
                                                min="0"
                                                max="12"
                                                value={
                                                    employeeForm.data
                                                        .probation_duration_months
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'probation_duration_months',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Isi 0 jika tidak melalui
                                                probation.
                                            </p>
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .probation_duration_months
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="pph21_method">
                                        Metode PPh21
                                    </Label>
                                    <div className="space-y-1">
                                        <Select
                                            value={
                                                employeeForm.data.pph21_method
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'pph21_method',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="pph21_method"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Pilih metode PPh21" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {options.pph21_methods.map(
                                                    (method) => (
                                                        <SelectItem
                                                            key={method.value}
                                                            value={method.value}
                                                        >
                                                            {method.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            {
                                                options.pph21_methods.find(
                                                    (method) =>
                                                        method.value ===
                                                        employeeForm.data
                                                            .pph21_method,
                                                )?.description
                                            }
                                        </p>
                                        <InputError
                                            message={
                                                employeeForm.errors.pph21_method
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="pph21_rate">
                                        Nominal PPh21
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="pph21_rate"
                                            type="text"
                                            inputMode="numeric"
                                            value={formatThousandDigits(
                                                employeeForm.data.pph21_rate,
                                            )}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'pph21_rate',
                                                    normalizeDigitInput(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Contoh: 250.000"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.pph21_rate
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="ptkp_category">
                                        Kategori PTKP
                                    </Label>
                                    <div className="space-y-1">
                                        <Select
                                            value={
                                                employeeForm.data
                                                    .ptkp_category || ''
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'ptkp_category',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="ptkp_category"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Pilih kategori PTKP" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(
                                                    ptkpCategoryLabels,
                                                ).map(([code, label]) => (
                                                    <SelectItem
                                                        key={code}
                                                        value={code}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .ptkp_category
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="division_id">Divisi</Label>
                                    <div className="space-y-1">
                                        <SearchableSelect
                                            id="division_id"
                                            value={
                                                employeeForm.data
                                                    .division_id === ''
                                                    ? '__none'
                                                    : employeeForm.data
                                                          .division_id
                                            }
                                            onValueChange={(value) => {
                                                const divisionId =
                                                    value === '__none'
                                                        ? ''
                                                        : value;

                                                employeeForm.setData(
                                                    'division_id',
                                                    divisionId,
                                                );

                                                if (
                                                    divisionId !== '' &&
                                                    employeeForm.data
                                                        .position_id !== ''
                                                ) {
                                                    const selectedPosition =
                                                        positionOptions.find(
                                                            (position) =>
                                                                String(
                                                                    position.id,
                                                                ) ===
                                                                employeeForm
                                                                    .data
                                                                    .position_id,
                                                        );

                                                    if (
                                                        selectedPosition &&
                                                        selectedPosition.division_id !==
                                                            Number(divisionId)
                                                    ) {
                                                        employeeForm.setData(
                                                            'position_id',
                                                            '',
                                                        );
                                                    }
                                                }
                                            }}
                                            placeholder="Pilih divisi"
                                            searchPlaceholder="Cari divisi..."
                                            options={[
                                                {
                                                    value: '__none',
                                                    label: '-',
                                                },
                                                ...divisionOptions.map(
                                                    (division) => ({
                                                        value: String(
                                                            division.id,
                                                        ),
                                                        label: `${division.code} - ${division.name}`,
                                                    }),
                                                ),
                                            ]}
                                            className="w-full"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.division_id
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="sub_company_id">
                                        Sub Company
                                    </Label>
                                    <div className="space-y-1">
                                        <SearchableSelect
                                            id="sub_company_id"
                                            value={
                                                employeeForm.data
                                                    .sub_company_id === ''
                                                    ? '__internal'
                                                    : employeeForm.data
                                                          .sub_company_id
                                            }
                                            onValueChange={(value) => {
                                                const subCompanyId =
                                                    value === '__internal'
                                                        ? ''
                                                        : value;

                                                employeeForm.setData(
                                                    'sub_company_id',
                                                    subCompanyId,
                                                );

                                                if (
                                                    subCompanyId === '' &&
                                                    employeeForm.data
                                                        .employment_type ===
                                                        'OS'
                                                ) {
                                                    employeeForm.setData(
                                                        'employment_type',
                                                        'PKWTT',
                                                    );
                                                }
                                            }}
                                            placeholder="Pilih sub-company"
                                            searchPlaceholder="Cari sub-company..."
                                            options={[
                                                ...(employeeAccess.requires_sub_company
                                                    ? []
                                                    : [
                                                          {
                                                              value: '__internal',
                                                              label: 'Tanpa Sub Company',
                                                          },
                                                      ]),
                                                ...subCompanyOptions.map(
                                                    (company) => ({
                                                        value: String(
                                                            company.id,
                                                        ),
                                                        label: `${company.code} - ${company.name}`,
                                                    }),
                                                ),
                                            ]}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Pilih sub-company jika karyawan
                                            berada di bawah perusahaan klien.
                                        </p>
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .sub_company_id
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="timezone" className="pt-2">
                                        Zona Waktu Utama
                                    </Label>
                                    <div className="space-y-1">
                                        <Select
                                            value={employeeForm.data.timezone}
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'timezone',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="timezone"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Pilih zona waktu" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {options.timezones.map(
                                                    (timezone) => (
                                                        <SelectItem
                                                            key={timezone.value}
                                                            value={
                                                                timezone.value
                                                            }
                                                        >
                                                            {timezone.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Menjadi fallback. Zona perangkat
                                            saat presensi tetap diprioritaskan.
                                        </p>
                                        <InputError
                                            message={
                                                employeeForm.errors.timezone
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="is_wfa" className="pt-1">
                                        Mode Kerja
                                    </Label>
                                    <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                                        <Checkbox
                                            id="is_wfa"
                                            checked={employeeForm.data.is_wfa}
                                            onCheckedChange={(checked) =>
                                                employeeForm.setData(
                                                    'is_wfa',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span>
                                            <span className="block text-sm font-medium">
                                                Karyawan WFA
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                Dapat melakukan absensi dari
                                                lokasi mana pun. GPS tetap
                                                direkam.
                                            </span>
                                        </span>
                                    </label>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <Label className="pt-2">
                                        Lokasi Absensi
                                    </Label>
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            {employeeForm.data.is_wfa
                                                ? 'Assignment lokasi diabaikan selama mode WFA aktif.'
                                                : 'Kosongkan untuk menggunakan lokasi utama perusahaan.'}
                                        </p>
                                        {attendanceLocationOptions.length ===
                                        0 ? (
                                            <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                                                Belum ada lokasi pada
                                                Multi-location attendance.
                                            </p>
                                        ) : (
                                            <div
                                                className={`grid gap-2 sm:grid-cols-2 ${employeeForm.data.is_wfa ? 'opacity-50' : ''}`}
                                            >
                                                {attendanceLocationOptions.map(
                                                    (location) => {
                                                        const checked =
                                                            employeeForm.data.attendance_location_ids.includes(
                                                                location.id,
                                                            );

                                                        return (
                                                            <label
                                                                key={
                                                                    location.id
                                                                }
                                                                className="flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        checked
                                                                    }
                                                                    disabled={
                                                                        employeeForm
                                                                            .data
                                                                            .is_wfa
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) => {
                                                                        const next =
                                                                            event
                                                                                .target
                                                                                .checked
                                                                                ? [
                                                                                      ...employeeForm
                                                                                          .data
                                                                                          .attendance_location_ids,
                                                                                      location.id,
                                                                                  ]
                                                                                : employeeForm.data.attendance_location_ids.filter(
                                                                                      (
                                                                                          id,
                                                                                      ) =>
                                                                                          id !==
                                                                                          location.id,
                                                                                  );
                                                                        employeeForm.setData(
                                                                            'attendance_location_ids',
                                                                            next,
                                                                        );
                                                                    }}
                                                                    className="mt-0.5 size-4 rounded border-input accent-primary"
                                                                />
                                                                <span>
                                                                    <span className="block font-medium">
                                                                        {
                                                                            location.name
                                                                        }
                                                                    </span>
                                                                    {location.address ? (
                                                                        <span className="block text-xs text-muted-foreground">
                                                                            {
                                                                                location.address
                                                                            }
                                                                        </span>
                                                                    ) : null}
                                                                </span>
                                                            </label>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        )}
                                        <InputError
                                            message={
                                                employeeForm.errors
                                                    .attendance_location_ids
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="position_id">Jabatan</Label>
                                    <div className="space-y-1">
                                        <SearchableSelect
                                            id="position_id"
                                            value={
                                                employeeForm.data
                                                    .position_id === ''
                                                    ? '__none'
                                                    : employeeForm.data
                                                          .position_id
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'position_id',
                                                    value === '__none'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                            placeholder="Pilih jabatan"
                                            searchPlaceholder="Cari jabatan..."
                                            options={[
                                                {
                                                    value: '__none',
                                                    label: '-',
                                                },
                                                ...availablePositions.map(
                                                    (position) => ({
                                                        value: String(
                                                            position.id,
                                                        ),
                                                        label: `${position.code} - ${position.name}${
                                                            position.division_name
                                                                ? ` (${position.division_name})`
                                                                : ''
                                                        }`,
                                                    }),
                                                ),
                                            ]}
                                            className="w-full"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.position_id
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="manager_id">Atasan</Label>
                                    <div className="space-y-1">
                                        <SearchableSelect
                                            id="manager_id"
                                            value={
                                                employeeForm.data.manager_id ===
                                                ''
                                                    ? '__none'
                                                    : employeeForm.data
                                                          .manager_id
                                            }
                                            onValueChange={(value) =>
                                                employeeForm.setData(
                                                    'manager_id',
                                                    value === '__none'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                            placeholder="Pilih atasan"
                                            searchPlaceholder="Cari atasan..."
                                            options={[
                                                {
                                                    value: '__none',
                                                    label: '-',
                                                },
                                                ...managerOptions
                                                    .filter(
                                                        (option) =>
                                                            editingEmployee?.id !==
                                                            option.id,
                                                    )
                                                    .map((option) => ({
                                                        value: String(
                                                            option.id,
                                                        ),
                                                        label: option.label,
                                                    })),
                                            ]}
                                            className="w-full"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.manager_id
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="base_salary">
                                        Gaji Pokok
                                    </Label>
                                    <div className="space-y-1">
                                        <Input
                                            id="base_salary"
                                            type="text"
                                            inputMode="numeric"
                                            value={formatThousandDigits(
                                                employeeForm.data.base_salary,
                                            )}
                                            onChange={(event) =>
                                                employeeForm.setData(
                                                    'base_salary',
                                                    normalizeDigitInput(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="5.000.000"
                                        />
                                        <InputError
                                            message={
                                                employeeForm.errors.base_salary
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                    <div>
                                        <Label>Tunjangan Tetap</Label>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Komponen bulanan tanpa batas waktu.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {employeeForm.data.fixed_allowances.map(
                                            (allowance, index) => (
                                                <div
                                                    key={index}
                                                    className="grid gap-2 rounded-md border p-2 sm:grid-cols-[1fr_180px_36px]"
                                                >
                                                    <div>
                                                        <Input
                                                            aria-label={`Nama tunjangan tetap ${index + 1}`}
                                                            value={
                                                                allowance.name
                                                            }
                                                            placeholder="Contoh: Tunjangan Jabatan"
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                const rows = [
                                                                    ...employeeForm
                                                                        .data
                                                                        .fixed_allowances,
                                                                ];
                                                                rows[index] = {
                                                                    ...rows[
                                                                        index
                                                                    ],
                                                                    name: event
                                                                        .target
                                                                        .value,
                                                                };
                                                                employeeForm.setData(
                                                                    'fixed_allowances',
                                                                    rows,
                                                                );
                                                            }}
                                                        />
                                                        <InputError
                                                            message={
                                                                (
                                                                    employeeForm.errors as Record<
                                                                        string,
                                                                        string
                                                                    >
                                                                )[
                                                                    `fixed_allowances.${index}.name`
                                                                ]
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            aria-label={`Nominal tunjangan tetap ${index + 1}`}
                                                            inputMode="numeric"
                                                            maxLength={10}
                                                            value={formatThousandDigits(
                                                                allowance.amount,
                                                            )}
                                                            placeholder="500.000"
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                const rows = [
                                                                    ...employeeForm
                                                                        .data
                                                                        .fixed_allowances,
                                                                ];
                                                                rows[index] = {
                                                                    ...rows[
                                                                        index
                                                                    ],
                                                                    amount: normalizeFixedAllowanceInput(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ),
                                                                };
                                                                employeeForm.setData(
                                                                    'fixed_allowances',
                                                                    rows,
                                                                );
                                                            }}
                                                        />
                                                        <InputError
                                                            message={
                                                                (
                                                                    employeeForm.errors as Record<
                                                                        string,
                                                                        string
                                                                    >
                                                                )[
                                                                    `fixed_allowances.${index}.amount`
                                                                ]
                                                            }
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        title="Hapus tunjangan tetap"
                                                        onClick={() =>
                                                            employeeForm.setData(
                                                                'fixed_allowances',
                                                                employeeForm.data.fixed_allowances.filter(
                                                                    (
                                                                        _,
                                                                        rowIndex,
                                                                    ) =>
                                                                        rowIndex !==
                                                                        index,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                employeeForm.setData(
                                                    'fixed_allowances',
                                                    [
                                                        ...employeeForm.data
                                                            .fixed_allowances,
                                                        {
                                                            name: '',
                                                            amount: '',
                                                        },
                                                    ],
                                                )
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Tambah Tunjangan Tetap
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                    <Label htmlFor="employee_is_active">
                                        Status Aktif
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="employee_is_active"
                                            checked={
                                                employeeForm.data.is_active
                                            }
                                            onCheckedChange={(checked) =>
                                                employeeForm.setData(
                                                    'is_active',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label htmlFor="employee_is_active">
                                            Karyawan aktif
                                        </Label>
                                    </div>
                                </div>

                                {editingEmployee && (
                                    <>
                                        <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                            <Label htmlFor="change_effective_date">
                                                Efektif Perubahan
                                            </Label>
                                            <div className="flex flex-col gap-1">
                                                <Input
                                                    id="change_effective_date"
                                                    type="date"
                                                    max={todayDate()}
                                                    value={
                                                        employeeForm.data
                                                            .change_effective_date
                                                    }
                                                    onChange={(event) =>
                                                        employeeForm.setData(
                                                            'change_effective_date',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        employeeForm.errors
                                                            .change_effective_date
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                            <Label htmlFor="change_notes">
                                                Catatan Perubahan
                                            </Label>
                                            <div className="flex flex-col gap-1">
                                                <textarea
                                                    id="change_notes"
                                                    value={
                                                        employeeForm.data
                                                            .change_notes
                                                    }
                                                    onChange={(event) =>
                                                        employeeForm.setData(
                                                            'change_notes',
                                                            event.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                    placeholder="Contoh: promosi hasil evaluasi semester"
                                                />
                                                <InputError
                                                    message={
                                                        employeeForm.errors
                                                            .change_notes
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {employeeFormStep === 3 && (
                            <div className="space-y-4">
                                <div className="grid gap-2 rounded-md border p-3 text-sm">
                                    <p>
                                        <span className="font-medium">
                                            Nama:
                                        </span>{' '}
                                        {employeeForm.data.full_name.trim() ||
                                            '-'}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Kode:
                                        </span>{' '}
                                        {previewEmployeeCode || '-'}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Status:
                                        </span>{' '}
                                        {statusLabels[
                                            employeeForm.data.employment_status
                                        ] ??
                                            employeeForm.data.employment_status}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Perusahaan:
                                        </span>{' '}
                                        {employeeForm.data.sub_company_id === ''
                                            ? '-'
                                            : (subCompanyOptions.find(
                                                  (company) =>
                                                      String(company.id) ===
                                                      employeeForm.data
                                                          .sub_company_id,
                                              )?.name ?? '-')}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Tipe Karyawan:
                                        </span>{' '}
                                        {typeLabels[
                                            employeeForm.data.employment_type
                                        ] ?? employeeForm.data.employment_type}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Metode PPh21:
                                        </span>{' '}
                                        {pph21MethodLabels[
                                            employeeForm.data.pph21_method
                                        ] ?? employeeForm.data.pph21_method}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Nominal PPh21:
                                        </span>{' '}
                                        Rp{' '}
                                        {formatThousandDigits(
                                            employeeForm.data.pph21_rate || '0',
                                        ) || '0'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="family_card_number">
                                            No. KK
                                        </Label>
                                        <div className="space-y-1">
                                            <Input
                                                id="family_card_number"
                                                value={
                                                    employeeForm.data
                                                        .family_card_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'family_card_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .family_card_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="ktp_number">
                                            No. KTP
                                        </Label>
                                        <div className="space-y-1">
                                            <Input
                                                id="ktp_number"
                                                value={
                                                    employeeForm.data.ktp_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'ktp_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .ktp_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="npwp_number">
                                            NPWP
                                        </Label>
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                id="npwp_number"
                                                value={
                                                    employeeForm.data
                                                        .npwp_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'npwp_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .npwp_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="bpjs_kesehatan_number">
                                            BPJS Kesehatan
                                        </Label>
                                        <div className="space-y-1">
                                            <Input
                                                id="bpjs_kesehatan_number"
                                                value={
                                                    employeeForm.data
                                                        .bpjs_kesehatan_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'bpjs_kesehatan_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .bpjs_kesehatan_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="bpjs_ketenagakerjaan_number">
                                            BPJS Tenaga Kerja
                                        </Label>
                                        <div className="space-y-1">
                                            <Input
                                                id="bpjs_ketenagakerjaan_number"
                                                value={
                                                    employeeForm.data
                                                        .bpjs_ketenagakerjaan_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'bpjs_ketenagakerjaan_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .bpjs_ketenagakerjaan_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="sim_a_number">
                                            SIM A
                                        </Label>
                                        <div className="space-y-1">
                                            <Input
                                                id="sim_a_number"
                                                value={
                                                    employeeForm.data
                                                        .sim_a_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'sim_a_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .sim_a_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="sim_b_number">
                                            SIM B
                                        </Label>
                                        <div className="space-y-1">
                                            <Input
                                                id="sim_b_number"
                                                value={
                                                    employeeForm.data
                                                        .sim_b_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'sim_b_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .sim_b_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-center gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="sim_c_number">
                                            SIM C
                                        </Label>
                                        <div className="space-y-1">
                                            <Input
                                                id="sim_c_number"
                                                value={
                                                    employeeForm.data
                                                        .sim_c_number
                                                }
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'sim_c_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors
                                                        .sim_c_number
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid items-start gap-2 md:grid-cols-[180px_1fr]">
                                        <Label htmlFor="notes">Catatan</Label>
                                        <div className="space-y-1">
                                            <textarea
                                                id="notes"
                                                value={employeeForm.data.notes}
                                                onChange={(event) =>
                                                    employeeForm.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={4}
                                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            />
                                            <InputError
                                                message={
                                                    employeeForm.errors.notes
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEmployeeDialogOpen(false)}
                                >
                                    Batal
                                </Button>
                                {employeeFormStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={goToPreviousEmployeeStep}
                                    >
                                        Kembali
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {employeeFormStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={goToNextEmployeeStep}
                                    >
                                        Simpan
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={employeeForm.processing}
                                    >
                                        {editingEmployee
                                            ? 'Simpan Perubahan'
                                            : 'Simpan'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={selectedEmployeeId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedEmployeeId(null);
                        setEditingBankAccount(null);
                        setEditingAllowance(null);
                        setEditingDocument(null);
                        bankAccountForm.reset();
                        bankAccountForm.clearErrors();
                        allowanceForm.reset();
                        allowanceForm.clearErrors();
                        documentForm.reset();
                        documentForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Kelola Rekening & Dokumen</DialogTitle>
                        <DialogDescription>
                            {selectedEmployee
                                ? `${selectedEmployee.employee_code} - ${selectedEmployee.full_name}`
                                : 'Pilih karyawan dari tabel untuk mengelola rekening dan dokumen kepatuhan.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEmployee && (
                        <>
                            <div className="rounded-lg border p-3 text-sm">
                                <p>
                                    <span className="font-medium">
                                        Jabatan:
                                    </span>{' '}
                                    {selectedEmployee.position?.name ?? '-'}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Gaji Pokok:
                                    </span>{' '}
                                    {selectedEmployee.base_salary
                                        ? new Intl.NumberFormat('id-ID', {
                                              style: 'currency',
                                              currency: 'IDR',
                                              maximumFractionDigits: 0,
                                          }).format(
                                              Number(
                                                  selectedEmployee.base_salary,
                                              ),
                                          )
                                        : '-'}
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-4">
                                <Card className="gap-1 py-3">
                                    <CardHeader className="px-4 pb-0">
                                        <CardDescription>Valid</CardDescription>
                                        <CardTitle className="text-2xl text-emerald-600">
                                            {
                                                selectedEmployee
                                                    .compliance_summary.valid
                                            }
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card className="gap-1 py-3">
                                    <CardHeader className="px-4 pb-0">
                                        <CardDescription>
                                            Akan Habis
                                        </CardDescription>
                                        <CardTitle className="text-2xl text-amber-600">
                                            {
                                                selectedEmployee
                                                    .compliance_summary.expiring
                                            }
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card className="gap-1 py-3">
                                    <CardHeader className="px-4 pb-0">
                                        <CardDescription>
                                            Kedaluwarsa
                                        </CardDescription>
                                        <CardTitle className="text-2xl text-rose-600">
                                            {
                                                selectedEmployee
                                                    .compliance_summary.expired
                                            }
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card className="gap-1 py-3">
                                    <CardHeader className="px-4 pb-0">
                                        <CardDescription>
                                            Tanpa File
                                        </CardDescription>
                                        <CardTitle className="text-2xl text-slate-600">
                                            {
                                                selectedEmployee
                                                    .compliance_summary
                                                    .missing_files
                                            }
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>

                            <div className="space-y-3 rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        Daftar Rekening
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={openBankAccountCreate}
                                    >
                                        Tambah Rekening
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {selectedEmployee.bank_accounts.length ===
                                        0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada data rekening.
                                        </p>
                                    )}

                                    {selectedEmployee.bank_accounts.map(
                                        (bankAccount) => (
                                            <div
                                                key={bankAccount.id}
                                                className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {
                                                                bankAccount.bank_name
                                                            }
                                                        </p>
                                                        {bankAccount.is_primary && (
                                                            <Badge>Utama</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            bankAccount.account_number
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            bankAccount.account_holder_name
                                                        }
                                                    </p>
                                                    <p className="hidden text-xs text-muted-foreground">
                                                        Tunjangan tetap:{' '}
                                                        {formatCurrencyDisplay(
                                                            bankAccount.fixed_allowance_amount,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <ActionIconButton
                                                        label="Edit rekening"
                                                        icon={Pencil}
                                                        variant="outline"
                                                        onClick={() =>
                                                            openBankAccountEdit(
                                                                bankAccount,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <form
                                onSubmit={submitBankAccountForm}
                                className="grid gap-3 rounded-lg border p-3 md:grid-cols-2"
                            >
                                <p className="text-sm font-medium md:col-span-2">
                                    {editingBankAccount
                                        ? 'Edit rekening'
                                        : 'Tambah rekening baru'}
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="bank_name">Nama Bank</Label>
                                    <Input
                                        id="bank_name"
                                        value={bankAccountForm.data.bank_name}
                                        onChange={(event) =>
                                            bankAccountForm.setData(
                                                'bank_name',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            bankAccountForm.errors.bank_name
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account_number">
                                        Nomor Rekening
                                    </Label>
                                    <Input
                                        id="account_number"
                                        value={
                                            bankAccountForm.data.account_number
                                        }
                                        onChange={(event) =>
                                            bankAccountForm.setData(
                                                'account_number',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            bankAccountForm.errors
                                                .account_number
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="account_holder_name">
                                        Nama Pemilik
                                    </Label>
                                    <Input
                                        id="account_holder_name"
                                        value={
                                            bankAccountForm.data
                                                .account_holder_name
                                        }
                                        onChange={(event) =>
                                            bankAccountForm.setData(
                                                'account_holder_name',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            bankAccountForm.errors
                                                .account_holder_name
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="branch">Cabang</Label>
                                    <Input
                                        id="branch"
                                        value={bankAccountForm.data.branch}
                                        onChange={(event) =>
                                            bankAccountForm.setData(
                                                'branch',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={bankAccountForm.errors.branch}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Mata Uang</Label>
                                    <Input
                                        id="currency"
                                        value={bankAccountForm.data.currency}
                                        onChange={(event) =>
                                            bankAccountForm.setData(
                                                'currency',
                                                event.target.value,
                                            )
                                        }
                                        maxLength={3}
                                        required
                                    />
                                    <InputError
                                        message={
                                            bankAccountForm.errors.currency
                                        }
                                    />
                                </div>
                                <div className="hidden">
                                    <Label htmlFor="fixed_allowance_amount">
                                        Tunjangan Tetap
                                    </Label>
                                    <Input
                                        id="fixed_allowance_amount"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={formatThousandDigits(
                                            bankAccountForm.data
                                                .fixed_allowance_amount,
                                        )}
                                        onChange={(event) =>
                                            bankAccountForm.setData(
                                                'fixed_allowance_amount',
                                                normalizeFixedAllowanceInput(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="1.250.000"
                                    />
                                    <InputError
                                        message={
                                            bankAccountForm.errors
                                                .fixed_allowance_amount
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 md:items-end">
                                    <Checkbox
                                        id="is_primary"
                                        checked={
                                            bankAccountForm.data.is_primary
                                        }
                                        onCheckedChange={(checked) =>
                                            bankAccountForm.setData(
                                                'is_primary',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label htmlFor="is_primary">
                                        Jadikan rekening utama
                                    </Label>
                                </div>
                                <div className="flex justify-end gap-2 md:col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={openBankAccountCreate}
                                    >
                                        Reset Form
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={bankAccountForm.processing}
                                    >
                                        {editingBankAccount
                                            ? 'Simpan'
                                            : 'Tambah Rekening'}
                                    </Button>
                                </div>
                            </form>

                            <div className="hidden space-y-3 rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        Dokumen Kepatuhan
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={openDocumentCreate}
                                    >
                                        Tambah Dokumen
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {selectedEmployee.documents.length ===
                                        0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada dokumen karyawan.
                                        </p>
                                    )}

                                    {selectedEmployee.documents.map(
                                        (document) => (
                                            <div
                                                key={document.id}
                                                className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-medium">
                                                            {documentTypeLabels[
                                                                document
                                                                    .document_type
                                                            ] ??
                                                                document.document_type}
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                document.compliance_status ===
                                                                'valid'
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {document.compliance_status ===
                                                            'valid'
                                                                ? 'Valid'
                                                                : document.compliance_status ===
                                                                    'expiring'
                                                                  ? 'Akan habis'
                                                                  : document.compliance_status ===
                                                                      'expired'
                                                                    ? 'Kedaluwarsa'
                                                                    : 'File belum ada'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {document.document_number ||
                                                            'Tanpa nomor'}{' '}
                                                        • Berakhir:{' '}
                                                        {formatDateDisplay(
                                                            document.expires_at,
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        File:{' '}
                                                        {document.file_original_name ??
                                                            'Belum diunggah'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {document.download_url && (
                                                        <ActionIconButton
                                                            label="Lihat dokumen"
                                                            icon={Eye}
                                                            variant="outline"
                                                            onClick={() =>
                                                                window.open(
                                                                    document.download_url ??
                                                                        undefined,
                                                                    '_blank',
                                                                )
                                                            }
                                                        />
                                                    )}
                                                    <ActionIconButton
                                                        label="Edit dokumen"
                                                        icon={Pencil}
                                                        variant="outline"
                                                        onClick={() =>
                                                            openDocumentEdit(
                                                                document,
                                                            )
                                                        }
                                                    />
                                                    <ActionIconButton
                                                        label="Hapus dokumen"
                                                        icon={Trash2}
                                                        variant="destructive"
                                                        onClick={() =>
                                                            deleteDocument(
                                                                document,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <form
                                onSubmit={submitDocumentForm}
                                className="hidden gap-3 rounded-lg border p-3 md:grid-cols-2"
                            >
                                <p className="text-sm font-medium md:col-span-2">
                                    {editingDocument
                                        ? 'Edit dokumen'
                                        : 'Tambah dokumen baru'}
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="document_type">
                                        Jenis Dokumen
                                    </Label>
                                    <Select
                                        value={documentForm.data.document_type}
                                        onValueChange={(value) =>
                                            documentForm.setData(
                                                'document_type',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="document_type">
                                            <SelectValue placeholder="Pilih dokumen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.document_types.map(
                                                (documentType) => (
                                                    <SelectItem
                                                        key={documentType.value}
                                                        value={
                                                            documentType.value
                                                        }
                                                    >
                                                        {documentType.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            documentForm.errors.document_type
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="document_number">
                                        Nomor Dokumen
                                    </Label>
                                    <Input
                                        id="document_number"
                                        value={
                                            documentForm.data.document_number
                                        }
                                        onChange={(event) =>
                                            documentForm.setData(
                                                'document_number',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            documentForm.errors.document_number
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="issued_at">
                                        Tanggal Terbit
                                    </Label>
                                    <Input
                                        id="issued_at"
                                        type="date"
                                        value={documentForm.data.issued_at}
                                        onChange={(event) =>
                                            documentForm.setData(
                                                'issued_at',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={documentForm.errors.issued_at}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expires_at">
                                        Tanggal Berakhir
                                    </Label>
                                    <Input
                                        id="expires_at"
                                        type="date"
                                        value={documentForm.data.expires_at}
                                        onChange={(event) =>
                                            documentForm.setData(
                                                'expires_at',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={documentForm.errors.expires_at}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="issuing_authority">
                                        Instansi Penerbit
                                    </Label>
                                    <Input
                                        id="issuing_authority"
                                        value={
                                            documentForm.data.issuing_authority
                                        }
                                        onChange={(event) =>
                                            documentForm.setData(
                                                'issuing_authority',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            documentForm.errors
                                                .issuing_authority
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="document_file">
                                        File Dokumen
                                    </Label>
                                    <Input
                                        id="document_file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        onChange={(event) =>
                                            documentForm.setData(
                                                'document_file',
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            documentForm.errors.document_file
                                        }
                                    />
                                </div>
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="document_notes">
                                        Catatan
                                    </Label>
                                    <textarea
                                        id="document_notes"
                                        rows={3}
                                        value={documentForm.data.notes}
                                        onChange={(event) =>
                                            documentForm.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                    <InputError
                                        message={documentForm.errors.notes}
                                    />
                                </div>
                                {editingDocument && (
                                    <div className="flex items-center gap-2 md:col-span-2">
                                        <Checkbox
                                            id="remove_file"
                                            checked={
                                                documentForm.data.remove_file
                                            }
                                            onCheckedChange={(checked) =>
                                                documentForm.setData(
                                                    'remove_file',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label htmlFor="remove_file">
                                            Hapus file lama jika dokumen perlu
                                            disimpan tanpa lampiran
                                        </Label>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 md:col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={openDocumentCreate}
                                    >
                                        Reset Form
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={documentForm.processing}
                                    >
                                        {editingDocument
                                            ? 'Simpan Dokumen'
                                            : 'Tambah Dokumen'}
                                    </Button>
                                </div>
                            </form>

                            <div className="space-y-3 rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        Daftar Tunjangan
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={openAllowanceCreate}
                                    >
                                        Tambah Tunjangan
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {selectedEmployee.allowances.length ===
                                        0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada data tunjangan.
                                        </p>
                                    )}

                                    {selectedEmployee.allowances.map(
                                        (allowance) => (
                                            <div
                                                key={allowance.id}
                                                className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {allowance.name}
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                allowance.is_active
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {allowance.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Intl.NumberFormat(
                                                            'id-ID',
                                                            {
                                                                style: 'currency',
                                                                currency: 'IDR',
                                                                maximumFractionDigits: 0,
                                                            },
                                                        ).format(
                                                            Number(
                                                                allowance.amount,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <ActionIconButton
                                                        label="Edit tunjangan"
                                                        icon={Pencil}
                                                        variant="outline"
                                                        onClick={() =>
                                                            openAllowanceEdit(
                                                                allowance,
                                                            )
                                                        }
                                                    />
                                                    <ActionIconButton
                                                        label="Hapus tunjangan"
                                                        icon={Trash2}
                                                        variant="destructive"
                                                        onClick={() =>
                                                            deleteAllowance(
                                                                allowance,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <form
                                onSubmit={submitAllowanceForm}
                                className="grid gap-3 rounded-lg border p-3 md:grid-cols-2"
                            >
                                <p className="text-sm font-medium md:col-span-2">
                                    {editingAllowance
                                        ? 'Edit tunjangan'
                                        : 'Tambah tunjangan baru'}
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="allowance_name">Nama</Label>
                                    <Input
                                        id="allowance_name"
                                        value={allowanceForm.data.name}
                                        onChange={(event) =>
                                            allowanceForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={allowanceForm.errors.name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="allowance_amount">
                                        Nominal
                                    </Label>
                                    <Input
                                        id="allowance_amount"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={formatThousandDigits(
                                            allowanceForm.data.amount,
                                        )}
                                        onChange={(event) =>
                                            allowanceForm.setData(
                                                'amount',
                                                normalizeFixedAllowanceInput(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="250.000"
                                        required
                                    />
                                    <InputError
                                        message={allowanceForm.errors.amount}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="allowance_start">
                                        Berlaku Mulai
                                    </Label>
                                    <Input
                                        id="allowance_start"
                                        type="date"
                                        value={
                                            allowanceForm.data
                                                .effective_start_date
                                        }
                                        onChange={(event) =>
                                            allowanceForm.setData(
                                                'effective_start_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            allowanceForm.errors
                                                .effective_start_date
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="allowance_end">
                                        Berlaku Sampai
                                    </Label>
                                    <Input
                                        id="allowance_end"
                                        type="date"
                                        value={
                                            allowanceForm.data
                                                .effective_end_date
                                        }
                                        onChange={(event) =>
                                            allowanceForm.setData(
                                                'effective_end_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            allowanceForm.errors
                                                .effective_end_date
                                        }
                                    />
                                </div>
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="allowance_notes">
                                        Catatan
                                    </Label>
                                    <Input
                                        id="allowance_notes"
                                        value={allowanceForm.data.notes}
                                        onChange={(event) =>
                                            allowanceForm.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={allowanceForm.errors.notes}
                                    />
                                </div>
                                <div className="flex items-center gap-2 md:items-end">
                                    <Checkbox
                                        id="allowance_active"
                                        checked={allowanceForm.data.is_active}
                                        onCheckedChange={(checked) =>
                                            allowanceForm.setData(
                                                'is_active',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label htmlFor="allowance_active">
                                        Aktif
                                    </Label>
                                </div>
                                <div className="flex justify-end gap-2 md:col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={openAllowanceCreate}
                                    >
                                        Reset Form
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={allowanceForm.processing}
                                    >
                                        {editingAllowance
                                            ? 'Simpan'
                                            : 'Tambah Tunjangan'}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
