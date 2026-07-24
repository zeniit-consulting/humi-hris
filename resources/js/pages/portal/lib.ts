export type MobileResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type PortalLinkMap = {
    attendance: string;
    leaves: string;
    overtimes: string;
    kasbons?: string;
    payroll: string;
    activity?: string;
    client_visits?: string;
    performance_activity?: string;
    reprimands?: string;
    approvals?: string;
    profile?: string;
    dashboard?: string;
};

export type PortalToastType = 'success' | 'error' | 'info';

export type PortalToastPayload = {
    type: PortalToastType;
    message: string;
};

export const notifyPortal = (type: PortalToastType, message: string) => {
    const normalizedMessage = message.trim();

    if (normalizedMessage === '') {
        return;
    }

    window.dispatchEvent(
        new CustomEvent<PortalToastPayload>('portal-toast', {
            detail: {
                type,
                message: normalizedMessage,
            },
        }),
    );
};

export const notifyPortalAfterRedirect = (
    type: PortalToastType,
    message: string,
) => {
    const normalizedMessage = message.trim();

    if (normalizedMessage === '') {
        return;
    }

    window.sessionStorage.setItem(
        'portal-toast',
        JSON.stringify({
            type,
            message: normalizedMessage,
        } satisfies PortalToastPayload),
    );
};

export const deviceTimezone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

export const localDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const localMonthString = (date = new Date()) =>
    localDateString(date).slice(0, 7);

export async function requestApi<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>,
): Promise<MobileResponse<T>> {
    const browserTimezone = deviceTimezone();
    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Timezone': browserTimezone,
            ...(xsrfCookie
                ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfCookie) }
                : {}),
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const payload = (await response.json()) as MobileResponse<T>;

    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Request failed.');
    }

    return payload;
}

export const chips: Record<string, string> = {
    present: 'portal-primary-soft',
    late: 'bg-amber-100 text-amber-900',
    on_leave: 'bg-sky-100 text-sky-900',
    absent: 'bg-rose-100 text-rose-900',
    pending: 'bg-stone-200 text-stone-800',
    approved: 'portal-primary-soft',
    rejected: 'bg-rose-100 text-rose-900',
    cancelled: 'bg-stone-200 text-stone-800',
    saved: 'bg-zinc-900 text-white',
    draft: 'bg-stone-200 text-stone-800',
    not_started: 'bg-stone-200 text-stone-800',
    in_progress: 'portal-primary-soft',
    pending_manager_review: 'bg-amber-100 text-amber-900',
    completed: 'bg-zinc-900 text-white',
    locked: 'bg-zinc-900 text-white',
    open: 'portal-primary-soft',
    done: 'bg-zinc-900 text-white',
    active: 'portal-primary-soft',
    resolved: 'bg-zinc-900 text-white',
    void: 'bg-stone-200 text-stone-800',
};

export const statusLabels: Record<string, string> = {
    present: 'Hadir',
    late: 'Terlambat',
    on_leave: 'Cuti',
    absent: 'Tidak hadir',
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    saved: 'Tersimpan',
    draft: 'Draf',
    not_started: 'Belum mulai',
    in_progress: 'Berjalan',
    pending_manager_review: 'Menunggu review',
    completed: 'Selesai',
    locked: 'Dikunci',
    open: 'Terbuka',
    done: 'Selesai',
    active: 'Aktif',
    resolved: 'Selesai',
    void: 'Dibatalkan',
};

export const leaveTypeLabels: Record<string, string> = {
    annual: 'Cuti tahunan',
    sick: 'Cuti sakit',
    unpaid: 'Cuti tanpa gaji',
    other: 'Cuti lainnya',
};

export const translatePortalError = (
    message: string | null | undefined,
    fallback = 'Permintaan tidak bisa diproses.',
) => {
    if (!message) {
        return fallback;
    }

    const normalized = message.trim();
    const lower = normalized.toLowerCase();

    const translations: Array<[RegExp, string]> = [
        [/request failed/i, 'Permintaan tidak bisa diproses.'],
        [
            /unauthenticated/i,
            'Sesi Anda sudah berakhir. Silakan login kembali.',
        ],
        [/the employee id field is required/i, 'Data karyawan wajib diisi.'],
        [/the shift id field is required/i, 'Shift wajib diisi.'],
        [
            /the attendance date field is required/i,
            'Tanggal absensi wajib diisi.',
        ],
        [/the status field is required/i, 'Status wajib diisi.'],
        [/the work date field is required/i, 'Tanggal lembur wajib diisi.'],
        [/the start date field is required/i, 'Tanggal mulai wajib diisi.'],
        [/the end date field is required/i, 'Tanggal selesai wajib diisi.'],
        [/the start time field is required/i, 'Jam mulai wajib diisi.'],
        [/the end time field is required/i, 'Jam selesai wajib diisi.'],
        [/the bank name field is required/i, 'Nama bank wajib diisi.'],
        [
            /the account number field is required/i,
            'Nomor rekening wajib diisi.',
        ],
        [
            /the account holder name field is required/i,
            'Nama pemilik rekening wajib diisi.',
        ],
        [/the phone field/i, 'Nomor telepon tidak valid.'],
        [/the address field/i, 'Alamat tidak valid.'],
    ];

    const match = translations.find(([pattern]) => pattern.test(normalized));

    if (match) {
        return match[1];
    }

    if (lower.includes('field is required')) {
        return 'Mohon lengkapi data yang wajib diisi.';
    }

    return normalized;
};

export const formatTime = (value: string | null) => {
    if (!value) {
        return '--:--';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(date);
};

export const formatDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T12:00:00`)
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(date);
};

export const formatCurrency = (value: string | number | null) => {
    if (value === null || value === '') {
        return 'Belum tersedia';
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
        return String(value);
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue);
};
