import { ExternalLink, FileText, Paperclip } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type AttachmentPreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string | null;
    name?: string | null;
    title?: string;
    description?: string;
};

export function AttachmentPreviewDialog({
    open,
    onOpenChange,
    url,
    name,
    title = 'Pratinjau Dokumen Lampiran',
    description,
}: AttachmentPreviewDialogProps) {
    const [imageError, setImageError] = useState(false);

    if (!url) return null;

    const fileName = name || url.split('/').pop() || 'Dokumen';
    const isPdf =
        /\.pdf$/i.test(url) ||
        /\.pdf/i.test(fileName) ||
        url.toLowerCase().includes('pdf');
    const isImage =
        !isPdf &&
        (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url) ||
            /\.(jpg|jpeg|png|webp|gif|svg)/i.test(fileName));

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) setImageError(false);
                onOpenChange(isOpen);
            }}
        >
            <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-6">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                            <Paperclip className="size-4" />
                        </span>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="truncate text-xs text-slate-500">
                        {description || `File: ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="my-2 flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50/80 p-2">
                    {isImage && !imageError ? (
                        <img
                            src={url}
                            alt={fileName}
                            onError={() => setImageError(true)}
                            className="max-h-[60vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
                        />
                    ) : isPdf ? (
                        <div className="w-full">
                            <iframe
                                src={url}
                                title={fileName}
                                className="h-[60vh] w-full rounded-lg border border-stone-200 bg-white"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                <FileText className="size-7" />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                {fileName}
                            </p>
                            <p className="mt-1 max-w-xs text-xs text-slate-500">
                                File siap dibuka di jendela baru atau diunduh ke perangkat Anda.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-2 sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl"
                    >
                        Tutup
                    </Button>

                    <Button
                        asChild
                        size="sm"
                        className="bg-teal-700 hover:bg-teal-800 rounded-xl text-white shadow-xs"
                    >
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={fileName}
                            className="inline-flex items-center gap-1.5"
                        >
                            <ExternalLink className="size-3.5" />
                            <span>Buka / Unduh File</span>
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
