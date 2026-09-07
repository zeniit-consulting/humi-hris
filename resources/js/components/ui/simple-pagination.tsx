import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationData = {
    data?: unknown[];
    from?: number | null;
    to?: number | null;
    total?: number | null;
    per_page?: number;
    current_page?: number;
    last_page?: number;
    links?: PaginationLink[];
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

interface SimplePaginationProps {
    data: PaginationData;
    className?: string;
    preserveScroll?: boolean;
    preserveState?: boolean;
}

export function SimplePagination({
    data,
    className,
    preserveScroll = true,
    preserveState = true,
}: SimplePaginationProps) {
    const total = data.total ?? (Array.isArray(data.data) ? data.data.length : 0);

    // Try finding active page and per_page if from/to are missing
    let activePage = data.current_page ?? 1;
    if (data.links && data.links.length > 0) {
        const activeLink = data.links.find((l) => l.active && !isNaN(Number(l.label)));
        if (activeLink) {
            activePage = Number(activeLink.label);
        }
    }

    const perPage = data.per_page ?? (Array.isArray(data.data) && data.data.length > 0 ? data.data.length : 15);
    const calculatedFrom = total === 0 ? 0 : (activePage - 1) * perPage + 1;
    const calculatedTo = total === 0 ? 0 : Math.min(activePage * perPage, total);

    const from = total === 0 ? 0 : (data.from ?? calculatedFrom);
    const to = total === 0 ? 0 : (data.to ?? calculatedTo);

    // Find previous and next URLs from direct props or links array
    let prevUrl = data.prev_page_url ?? null;
    let nextUrl = data.next_page_url ?? null;

    if (data.links && data.links.length > 0) {
        if (!prevUrl) {
            const firstLink = data.links[0];
            if (firstLink && (firstLink.label.includes('&laquo;') || firstLink.label.toLowerCase().includes('prev') || firstLink.label.toLowerCase().includes('sebelumnya'))) {
                prevUrl = firstLink.url;
            }
        }
        if (!nextUrl) {
            const lastLink = data.links[data.links.length - 1];
            if (lastLink && (lastLink.label.includes('&raquo;') || lastLink.label.toLowerCase().includes('next') || lastLink.label.toLowerCase().includes('berikutnya'))) {
                nextUrl = lastLink.url;
            }
        }
    }

    const hasPrev = Boolean(prevUrl);
    const hasNext = Boolean(nextUrl);

    if (total === 0) {
        return null;
    }

    return (
        <div className={cn('flex items-center justify-end gap-3 text-sm text-muted-foreground', className)}>
            <span className="tabular-nums select-none">
                {from}–{to} of {total}
            </span>
            <div className="flex items-center gap-1">
                {hasPrev && prevUrl ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground/80 hover:bg-accent hover:text-foreground"
                        asChild
                    >
                        <Link
                            href={prevUrl}
                            preserveScroll={preserveScroll}
                            preserveState={preserveState}
                            aria-label="Halaman sebelumnya"
                        >
                            <ChevronLeft className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/40"
                        disabled
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                )}

                {hasNext && nextUrl ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground/80 hover:bg-accent hover:text-foreground"
                        asChild
                    >
                        <Link
                            href={nextUrl}
                            preserveScroll={preserveScroll}
                            preserveState={preserveState}
                            aria-label="Halaman berikutnya"
                        >
                            <ChevronRight className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/40"
                        disabled
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default SimplePagination;
