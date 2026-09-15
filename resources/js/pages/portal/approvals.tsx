import {
    AlertCircle,
    Calendar,
    CalendarDays,
    CalendarSync,
    Check,
    ChevronRight,
    ClipboardCheck,
    Clock,
    ExternalLink,
    Eye,
    FileText,
    Paperclip,
    PlaneTakeoff,
    Timer,
    User,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { AttachmentPreviewDialog } from '@/components/attachment-preview-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { notifyPortal, requestApi, translatePortalError } from './lib';
import { PortalShell } from './shell';

type Item = {
    id: number;
    type: 'attendance' | 'leave' | 'overtime' | 'shift_change' | string;
    employee_label: string;
    stage: number;
    created_at: string | null;
    title?: string;
    subtitle?: string;
    reason?: string | null;
    attachment?: string | null;
    attachment_name?: string | null;
    badge?: string;
};

const typeConfig: Record<
    string,
    { label: string; icon: typeof CalendarDays; color: string; badgeBg: string; badgeText: string }
> = {
    attendance: {
        label: 'Koreksi Absensi',
        icon: Clock,
        color: 'bg-amber-500 text-white',
        badgeBg: 'bg-amber-50 border-amber-200/80',
        badgeText: 'text-amber-800',
    },
    leave: {
        label: 'Cuti & Izin',
        icon: PlaneTakeoff,
        color: 'bg-sky-500 text-white',
        badgeBg: 'bg-sky-50 border-sky-200/80',
        badgeText: 'text-sky-800',
    },
    overtime: {
        label: 'Lembur',
        icon: Timer,
        color: 'bg-indigo-500 text-white',
        badgeBg: 'bg-indigo-50 border-indigo-200/80',
        badgeText: 'text-indigo-800',
    },
    shift_change: {
        label: 'Tukar Shift',
        icon: CalendarSync,
        color: 'bg-purple-500 text-white',
        badgeBg: 'bg-purple-50 border-purple-200/80',
        badgeText: 'text-purple-800',
    },
};

export default function PortalApprovalsPage({
    pageTitle,
}: {
    pageTitle: string;
}) {
    const [items, setItems] = useState<Item[]>([]);
    const [processing, setProcessing] = useState<string | null>(null);
    const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
    const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
    const [rejectItem, setRejectItem] = useState<Item | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [previewAttachment, setPreviewAttachment] = useState<{
        url: string;
        name?: string | null;
        title?: string;
    } | null>(null);

    const load = async () => {
        try {
            const response = await requestApi<{ items: Item[] }>(
                '/portal/api/approvals',
            );
            setItems(response.data.items);
        } catch (error) {
            notifyPortal(
                'error',
                error instanceof Error
                    ? translatePortalError(
                          error.message,
                          'Inbox approval tidak dapat dimuat.',
                      )
                    : 'Inbox approval tidak dapat dimuat.',
            );
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const executeAction = async (item: Item, action: 'approve' | 'reject', reason?: string) => {
        const key = `${item.type}-${item.id}`;
        setProcessing(key);
        try {
            await requestApi(
                `/portal/api/approvals/${item.type}/${item.id}/${action}`,
                'POST',
                action === 'reject' ? { reason } : {},
            );
            notifyPortal(
                'success',
                action === 'approve'
                    ? 'Pengajuan berhasil disetujui.'
                    : 'Pengajuan telah ditolak.',
            );
            setSwipedItemId(null);
            setSelectedDetailItem(null);
            setRejectItem(null);
            setRejectReason('');
            await load();
        } catch (error) {
            notifyPortal(
                'error',
                error instanceof Error
                    ? translatePortalError(
                          error.message,
                          'Approval gagal diproses.',
                      )
                    : 'Approval gagal diproses.',
            );
        } finally {
            setProcessing(null);
        }
    };

    const handleConfirmReject = () => {
        if (!rejectItem) return;
        if (!rejectReason.trim()) {
            notifyPortal('error', 'Alasan penolakan wajib diisi.');
            return;
        }
        void executeAction(rejectItem, 'reject', rejectReason.trim());
    };

    return (
        <PortalShell
            title={pageTitle}
            eyebrow="Persetujuan"
            description="Proses pengajuan yang menunggu persetujuan Anda."
            active="approvals"
            links={{
                attendance: '/portal/attendance',
                leaves: '/portal/leaves',
                overtimes: '/portal/overtimes',
                payroll: '/portal/payroll',
                activity: '/portal/activity',
                reprimands: '/portal/reprimands',
                approvals: '/portal/approvals',
            }}
        >
            <div className="space-y-4">
                {/* Header Card */}
                <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                <ClipboardCheck className="size-6" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-teal-700 uppercase">
                                    Inbox Approval
                                </p>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                    Menunggu Tindakan
                                </h2>
                            </div>
                        </div>
                        {items.length > 0 && (
                            <span className="flex size-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-xs">
                                {items.length}
                            </span>
                        )}
                    </div>
                    {items.length > 0 && (
                        <p className="mt-3 text-xs text-slate-500">
                            Geser kartu ke kiri <span className="font-semibold text-slate-700">←</span> untuk menyetujui atau menolak dengan cepat, atau klik kartu untuk melihat detail lengkap.
                        </p>
                    )}
                </section>

                {/* List Items */}
                <div className="space-y-3">
                    {items.length ? (
                        items.map((item) => {
                            const key = `${item.type}-${item.id}`;
                            const isSwiped = swipedItemId === key;
                            const isBusy = processing === key;

                            return (
                                <SwipeableApprovalCard
                                    key={key}
                                    item={item}
                                    isOpen={isSwiped}
                                    isBusy={isBusy}
                                    onToggleSwipe={() =>
                                        setSwipedItemId((current) =>
                                            current === key ? null : key,
                                        )
                                    }
                                    onApprove={() => void executeAction(item, 'approve')}
                                    onReject={() => {
                                        setRejectItem(item);
                                        setRejectReason('');
                                    }}
                                    onOpenDetail={() => setSelectedDetailItem(item)}
                                />
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-12 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                                <ClipboardCheck className="size-6" />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                Semua Bersih & Selesai!
                            </p>
                            <p className="mt-1 max-w-xs text-xs text-slate-500">
                                Tidak ada permohonan izin, cuti, atau lembur yang sedang menunggu persetujuan Anda saat ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog Detail Lengkap */}
            <Dialog
                open={selectedDetailItem !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedDetailItem(null);
                }}
            >
                <DialogContent className="max-w-md rounded-2xl bg-white p-6">
                    {selectedDetailItem && (
                        <div className="space-y-4">
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                            typeConfig[selectedDetailItem.type]?.badgeBg ?? 'bg-slate-100'
                                        } ${
                                            typeConfig[selectedDetailItem.type]?.badgeText ?? 'text-slate-800'
                                        }`}
                                    >
                                        {typeConfig[selectedDetailItem.type]?.label ?? selectedDetailItem.type}
                                    </span>
                                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                                        Tahap {selectedDetailItem.stage}
                                    </span>
                                </div>
                                <DialogTitle className="mt-2 text-left text-base font-bold text-slate-900">
                                    {selectedDetailItem.title ?? 'Detail Pengajuan'}
                                </DialogTitle>
                                <DialogDescription className="text-left text-xs text-slate-500">
                                    Diajukan oleh <strong className="text-slate-700">{selectedDetailItem.employee_label}</strong> pada {selectedDetailItem.created_at ?? '-'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 rounded-xl border border-stone-200/80 bg-stone-50 p-4 text-xs text-slate-700">
                                {selectedDetailItem.subtitle && (
                                    <div>
                                        <p className="font-semibold text-slate-500">Waktu / Jadwal:</p>
                                        <p className="mt-0.5 font-medium text-slate-900">
                                            {selectedDetailItem.subtitle}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-slate-500">Alasan / Deskripsi:</p>
                                    <p className="mt-0.5 leading-relaxed text-slate-800 whitespace-pre-wrap">
                                        {selectedDetailItem.reason || (
                                            <span className="italic text-slate-400">Tidak ada keterangan tambahan.</span>
                                        )}
                                    </p>
                                </div>
                                {selectedDetailItem.attachment && (
                                    <div>
                                        <p className="font-semibold text-slate-500">Lampiran / Dokumen Pendukung:</p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewAttachment({
                                                    url: selectedDetailItem.attachment!,
                                                    name: selectedDetailItem.attachment_name,
                                                    title: `Lampiran ${selectedDetailItem.title || 'Pengajuan'}`,
                                                })
                                            }
                                            className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/70 px-3 py-2 text-xs font-semibold text-teal-800 shadow-2xs transition hover:bg-teal-100 hover:text-teal-900"
                                        >
                                            <Eye className="size-3.5 text-teal-600" />
                                            <span className="max-w-[200px] truncate">
                                                {selectedDetailItem.attachment_name || 'Lihat Dokumen Pendukung'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="flex flex-row gap-2 pt-2 sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const target = selectedDetailItem;
                                        setSelectedDetailItem(null);
                                        setRejectItem(target);
                                        setRejectReason('');
                                    }}
                                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 sm:flex-none sm:px-4"
                                >
                                    Tolak Permohonan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void executeAction(selectedDetailItem, 'approve')}
                                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 sm:flex-none sm:px-4"
                                >
                                    Setujui Sekarang
                                </button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog Alasan Penolakan */}
            <Dialog
                open={rejectItem !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectItem(null);
                        setRejectReason('');
                    }
                }}
            >
                <DialogContent className="max-w-sm rounded-2xl bg-white p-5">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-700">
                            <AlertCircle className="size-5" />
                            Tolak Pengajuan
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Tuliskan alasan penolakan untuk disampaikan kepada karyawan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-2 space-y-2">
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Contoh: Jadwal bertabrakan dengan shift lain / kuota tidak mencukupi."
                            rows={3}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-slate-800 outline-none transition focus:border-rose-400 focus:bg-white"
                            autoFocus
                        />
                    </div>

                    <DialogFooter className="flex flex-row gap-2 pt-2 sm:justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setRejectItem(null);
                                setRejectReason('');
                            }}
                            className="flex-1 rounded-xl border border-stone-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50 sm:flex-none sm:px-3"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmReject}
                            disabled={!rejectReason.trim() || processing !== null}
                            className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 sm:flex-none sm:px-4"
                        >
                            Konfirmasi Tolak
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

/**
 * Komponen Card Approval Interaktif Swipe-to-Reveal (Apple Style)
 */
function SwipeableApprovalCard({
    item,
    isOpen,
    isBusy,
    onToggleSwipe,
    onApprove,
    onReject,
    onOpenDetail,
}: {
    item: Item;
    isOpen: boolean;
    isBusy: boolean;
    onToggleSwipe: () => void;
    onApprove: () => void;
    onReject: () => void;
    onOpenDetail: () => void;
}) {
    const config = typeConfig[item.type] ?? {
        label: item.type,
        icon: FileText,
        color: 'bg-slate-600 text-white',
        badgeBg: 'bg-slate-100 border-slate-200',
        badgeText: 'text-slate-800',
    };
    const IconComponent = config.icon;

    const [dragOffset, setDragOffset] = useState(0);
    const startX = useRef(0);
    const isDragging = useRef(false);
    const ACTION_WIDTH = 152; // Lebar total tombol aksi geser

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        isDragging.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        if (isOpen) {
            // Jika sudah terbuka, geser ke kanan menutup (diff > 0)
            const newOffset = Math.min(Math.max(-ACTION_WIDTH + diff, -ACTION_WIDTH), 0);
            setDragOffset(newOffset);
        } else {
            // Jika tertutup, hanya izinkan geser ke kiri (diff < 0)
            if (diff < 0) {
                const newOffset = Math.max(diff, -ACTION_WIDTH - 20);
                setDragOffset(newOffset);
            }
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;

        if (isOpen) {
            // Jika ditarik ke kanan lebih dari 30px, tutup
            if (dragOffset > -ACTION_WIDTH + 40) {
                onToggleSwipe();
            }
        } else {
            // Jika ditarik ke kiri lebih dari 40px, buka
            if (dragOffset < -40) {
                onToggleSwipe();
            }
        }
        setDragOffset(0);
    };

    const offsetStyle = dragOffset !== 0
        ? { transform: `translateX(${dragOffset}px)`, transition: 'none' }
        : isOpen
          ? { transform: `translateX(-${ACTION_WIDTH}px)`, transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)' }
          : { transform: 'translateX(0px)', transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)' };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-stone-100 shadow-xs">
            {/* Background Action Buttons (Apple iOS Swipe Action style) */}
            <div className="absolute inset-y-0 right-0 flex w-[152px] items-stretch">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onReject();
                    }}
                    disabled={isBusy}
                    className="flex w-[76px] flex-col items-center justify-center gap-1 bg-rose-500 text-white transition active:bg-rose-600 disabled:opacity-50"
                    aria-label="Tolak"
                >
                    <X className="size-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tolak</span>
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onApprove();
                    }}
                    disabled={isBusy}
                    className="flex w-[76px] flex-col items-center justify-center gap-1 bg-emerald-500 text-white transition active:bg-emerald-600 disabled:opacity-50"
                    aria-label="Setujui"
                >
                    <Check className="size-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Setujui</span>
                </button>
            </div>

            {/* Front Card Layer */}
            <div
                style={offsetStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                    if (isOpen) {
                        onToggleSwipe();
                    } else {
                        onOpenDetail();
                    }
                }}
                className="relative z-10 flex cursor-pointer items-center justify-between border border-stone-200/90 bg-white p-4 transition-colors select-none hover:bg-stone-50/70"
            >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    {/* Icon Badge */}
                    <div
                        className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${config.color} shadow-xs`}
                    >
                        <IconComponent className="size-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.badgeBg} ${config.badgeText}`}
                            >
                                {item.badge ?? config.label}
                            </span>
                            <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
                                Tahap {item.stage}
                            </span>
                            {item.attachment && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
                                    <Paperclip className="size-2.5" />
                                    Lampiran
                                </span>
                            )}
                            <span className="text-[10px] text-stone-400">
                                {item.created_at ?? ''}
                            </span>
                        </div>

                        {/* Title (Nama Pemohon & Jenis Pengajuan) */}
                        <h3 className="mt-1 truncate text-xs font-bold text-slate-900">
                            {item.employee_label}
                        </h3>

                        {/* Subtitle (Jadwal/Waktu/Tipe) */}
                        {item.subtitle && (
                            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-600">
                                {item.subtitle}
                            </p>
                        )}

                        {/* Deskripsi / Alasan dengan Ellipsis */}
                        {item.reason && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                                <span className="font-medium text-slate-600">Alasan:</span> {item.reason}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Arrow & Swipe Hint */}
                <div className="ml-2 flex shrink-0 items-center gap-1 text-slate-400">
                    <ChevronRight className="size-4" />
                </div>
            </div>
        </div>
    );
}

