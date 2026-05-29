import { Link, usePage } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSidebar } from '@/components/ui/sidebar';

const planLabels: Record<string, string> = {
    free: 'Free Trial',
    core: 'Basic',
    plus: 'Plus',
};

const statusLabels: Record<string, string> = {
    trial: 'Trial',
    active: 'Aktif',
    expired: 'Kedaluwarsa',
    cancelled: 'Dibatalkan',
};

const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    trial: 'secondary',
    active: 'default',
    expired: 'destructive',
    cancelled: 'outline',
};

export function SubscriptionStatusBar() {
    const { subscription, auth } = usePage().props;
    const { state } = useSidebar();

    // Hanya tampilkan untuk admin (bukan sub-user)
    if (!subscription || (auth as any).user.parent_user_id) return null;

    const isCollapsed = state === 'collapsed';

    if (isCollapsed) {
        return (
            <Link
                href="/billing"
                className="flex justify-center py-2 text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
                title={`Paket ${planLabels[subscription.plan_slug]} — ${statusLabels[subscription.status]}`}
            >
                <CreditCard className="size-4" />
            </Link>
        );
    }

    return (
        <Link
            href="/billing"
            className="group flex items-center gap-2 rounded-md px-2 py-2 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
            <CreditCard className="size-4 shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs leading-none font-medium">
                        Paket {planLabels[subscription.plan_slug]}
                    </span>
                    <Badge
                        variant={statusVariant[subscription.status]}
                        className="h-4 px-1 py-0 text-[10px]"
                    >
                        {statusLabels[subscription.status]}
                    </Badge>
                </div>
                {subscription.days_remaining > 0 && (
                    <span className="text-[10px] leading-none text-sidebar-foreground/50">
                        {subscription.days_remaining} hari tersisa
                    </span>
                )}
            </div>
        </Link>
    );
}
