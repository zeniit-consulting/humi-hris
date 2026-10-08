import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type ConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive' | 'success';
    loading?: boolean;
    onConfirm: () => void;
};

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    variant = 'default',
    loading = false,
    onConfirm,
}: ConfirmationDialogProps) {
    const isDestructive = variant === 'destructive';
    const isSuccess = variant === 'success';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl p-6">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-3">
                        <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                                isDestructive
                                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                                    : isSuccess
                                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                      : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                            }`}
                        >
                            {isDestructive ? (
                                <XCircle className="size-5" />
                            ) : isSuccess ? (
                                <CheckCircle2 className="size-5" />
                            ) : (
                                <AlertTriangle className="size-5" />
                            )}
                        </span>
                        <div>
                            <DialogTitle className="text-base font-semibold leading-6">
                                {title}
                            </DialogTitle>
                        </div>
                    </div>
                    {description && (
                        <DialogDescription className="mt-2 text-sm text-muted-foreground whitespace-normal">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={isDestructive ? 'destructive' : 'default'}
                        className={
                            isSuccess
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : ''
                        }
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
