import {
    ExternalLink,
    Eye,
    FileText,
    Paperclip,
    PlaneTakeoff,
    UploadCloud,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AttachmentPreviewDialog } from '@/components/attachment-preview-dialog';
import {
    chips,
    formatDate,
    leaveTypeLabels,
    notifyPortal,
    requestApi,
    statusLabels,
    translatePortalError,
} from './lib';
import type { PortalLinkMap } from './lib';
import { PortalShell } from './shell';

type Props = {
    pageTitle: string;
};

type PortalSummary = {
    employee: { id: number } | null;
    links: PortalLinkMap;
};

type LeavePayload = {
    items: Array<{
        id: number;
        leave_type: string;
        start_date: string;
        end_date: string;
        total_days: number;
        reason: string | null;
        attachment: string | null;
        attachment_name: string | null;
        status: string;
        rejection_reason: string | null;
    }>;
};

export default function PortalLeavesPage({ pageTitle }: Props) {
    const [portal, setPortal] = useState<PortalSummary | null>(null);
    const [items, setItems] = useState<LeavePayload['items']>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [previewAttachment, setPreviewAttachment] = useState<{
        url: string;
        name?: string | null;
        title?: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState({
        leave_type:
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('type') === 'sick'
                ? 'sick'
                : 'annual',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const loadData = async () => {
        try {
            const [portalResponse, leavesResponse] = await Promise.all([
                requestApi<PortalSummary>('/portal/api/summary'),
                requestApi<LeavePayload>(
                    '/portal/api/leaves?scope=all&per_page=20',
                ),
            ]);

            setPortal(portalResponse.data);
            setItems(leavesResponse.data.items);
        } catch (loadError) {
            notifyPortal(
                'error',
                loadError instanceof Error
                    ? translatePortalError(
                          loadError.message,
                          'Data cuti tidak bisa dimuat.',
                      )
                    : 'Data cuti tidak bisa dimuat.',
            );
        }
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validasi ukuran file (maksimal 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            notifyPortal('error', 'Ukuran file maksimal adalah 5MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setAttachment(selectedFile);
    };

    const handleRemoveFile = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!portal?.employee) {
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('employee_id', String(portal.employee.id));
            formData.append('leave_type', form.leave_type);
            formData.append('start_date', form.start_date);
            formData.append('end_date', form.end_date);
            if (form.reason) {
                formData.append('reason', form.reason);
            }
            formData.append('status', 'pending');

            if (attachment) {
                formData.append('attachment', attachment);
            }

            await requestApi('/portal/api/leaves', 'POST', formData);

            setForm({
                leave_type: 'annual',
                start_date: '',
                end_date: '',
                reason: '',
            });
            setAttachment(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            notifyPortal(
                'success',
                form.leave_type === 'sick'
                    ? 'Pengajuan sakit berhasil dikirim.'
                    : 'Pengajuan cuti berhasil dikirim.',
            );
            await loadData();
        } catch (submitError) {
            notifyPortal(
                'error',
                submitError instanceof Error
                    ? translatePortalError(
                          submitError.message,
                          'Pengajuan cuti gagal.',
                      )
                    : 'Pengajuan cuti gagal.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const getAttachmentHelperText = () => {
        switch (form.leave_type) {
            case 'sick':
                return 'Wajib / disarankan melampirkan Surat Keterangan Dokter (SKD) atau surat rawat.';
            case 'other':
                return 'Lampirkan dokumen pendukung untuk cuti khusus (misal: surat nikah, duka cita, persalinan, dll).';
            default:
                return 'Lampirkan dokumen pendukung bila diperlukan (PDF, JPG, PNG, WebP maks. 5MB).';
        }
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Pengajuan cuti"
            description="Ajukan cuti pribadi dan pantau status persetujuannya."
            active="home"
            links={
                portal?.links ?? {
                    attendance: '/portal/attendance',
                    leaves: '/portal/leaves',
                    overtimes: '/portal/overtimes',
                    payroll: '/portal/payroll',
                }
            }
        >
            <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <div className="flex items-center gap-3">
                    <span className="portal-primary-soft inline-flex size-11 items-center justify-center rounded-lg">
                        <PlaneTakeoff className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                            Pengajuan baru
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">
                            Ajukan cuti & izin
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Jenis Cuti / Izin
                        </label>
                        <select
                            value={form.leave_type}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    leave_type: event.target.value,
                                }))
                            }
                            className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
                        >
                            <option value="annual">Cuti Tahunan (Annual Leave)</option>
                            <option value="sick">Izin Sakit (Sick Leave)</option>
                            <option value="unpaid">Izin (Unpaid Leave)</option>
                            <option value="other">Cuti Khusus (Special Leave)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={form.start_date}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        start_date: event.target.value,
                                    }))
                                }
                                className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Tanggal Selesai
                            </label>
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        end_date: event.target.value,
                                    }))
                                }
                                className="h-12 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Alasan / Keterangan
                        </label>
                        <textarea
                            value={form.reason}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    reason: event.target.value,
                                }))
                            }
                            className="min-h-24 w-full rounded-[9px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
                            placeholder="Tuliskan keterangan permohonan cuti atau kondisi sakit..."
                        />
                    </div>

                    {/* File Pendukung Upload Field */}
                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700">
                                File Pendukung (SKD / Dokumen Cuti)
                            </label>
                            {form.leave_type === 'sick' && (
                                <span className="text-[11px] font-medium text-amber-600">
                                    Disarankan SKD
                                </span>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            id="leave-attachment-input"
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {!attachment ? (
                            <label
                                htmlFor="leave-attachment-input"
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-[9px] border border-dashed border-stone-300 bg-stone-50/70 px-4 py-3.5 text-xs font-medium text-slate-600 transition hover:border-teal-500 hover:bg-stone-50"
                            >
                                <UploadCloud className="size-4 text-slate-500" />
                                <span>Pilih Dokumen Pendukung (PDF, JPG, PNG)</span>
                            </label>
                        ) : (
                            <div className="flex items-center justify-between rounded-[9px] border border-teal-200 bg-teal-50/60 px-3.5 py-2.5 text-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText className="size-4 shrink-0 text-teal-600" />
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-teal-900">
                                            {attachment.name}
                                        </p>
                                        <p className="text-[11px] text-teal-700">
                                            {formatFileSize(attachment.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-teal-100 hover:text-rose-600"
                                    title="Hapus file"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        )}

                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                            {getAttachmentHelperText()}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="portal-primary-bg inline-flex h-12 w-full items-center justify-center rounded-[9px] text-sm font-semibold transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim pengajuan'}
                    </button>
                </form>
            </section>

            <section className="mt-5 rounded-[16px] bg-white px-5 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)]">
                <p className="text-xs tracking-[0.22em] text-slate-500 uppercase">
                    Daftar pengajuan
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">
                    Riwayat pengajuan
                </h2>

                <div className="mt-5 space-y-3">
                    {items.length ? (
                        items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[12px] border border-stone-200/80 bg-stone-50 px-4 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {leaveTypeLabels[item.leave_type] ??
                                                item.leave_type}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {formatDate(item.start_date)} -{' '}
                                            {formatDate(item.end_date)} ·{' '}
                                            {item.total_days} hari
                                        </p>
                                        {item.reason ? (
                                            <p className="mt-2 text-sm text-slate-600">
                                                {item.reason}
                                            </p>
                                        ) : null}

                                        {/* Attachment Link / Popup Trigger */}
                                        {item.attachment ? (
                                            <div className="mt-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewAttachment({
                                                            url: item.attachment!,
                                                            name: item.attachment_name,
                                                            title: `Lampiran ${leaveTypeLabels[item.leave_type] ?? 'Cuti'}`,
                                                        })
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/70 px-2.5 py-1.5 text-xs font-medium text-teal-800 shadow-2xs transition hover:bg-teal-100 hover:text-teal-900"
                                                >
                                                    <Eye className="size-3.5 text-teal-600" />
                                                    <span className="max-w-[200px] truncate">
                                                        {item.attachment_name || 'Lihat Dokumen Pendukung'}
                                                    </span>
                                                </button>
                                            </div>
                                        ) : null}

                                        {/* Rejection Note */}
                                        {item.status === 'rejected' && item.rejection_reason ? (
                                            <p className="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">
                                                <strong className="font-semibold">Catatan penolakan:</strong> {item.rejection_reason}
                                            </p>
                                        ) : null}
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${chips[item.status] ?? 'bg-stone-200 text-stone-800'}`}
                                    >
                                        {statusLabels[item.status] ??
                                            item.status}
                                    </span>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[12px] bg-stone-50 px-4 py-5 text-sm text-slate-500">
                            Belum ada pengajuan cuti.
                        </div>
                    )}
                </div>
            </section>

            {/* Popup Dialog Preview Lampiran */}
            <AttachmentPreviewDialog
                open={previewAttachment !== null}
                onOpenChange={(open) => {
                    if (!open) setPreviewAttachment(null);
                }}
                url={previewAttachment?.url ?? null}
                name={previewAttachment?.name}
                title={previewAttachment?.title}
            />
        </PortalShell>
    );
}

