import { Link } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LockedFeatureBannerProps {
    featureName: string;
    planRequired: 'core' | 'plus';
}

export function LockedFeatureBanner({
    featureName,
    planRequired,
}: LockedFeatureBannerProps) {
    const planLabel = planRequired === 'core' ? 'Core' : 'Plus';

    return (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40">
            <Lock className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="flex-1 text-sm text-amber-800 dark:text-amber-300">
                Fitur <strong>{featureName}</strong> tidak tersedia di paket
                Anda. Upgrade ke paket{' '}
                <strong>{planLabel}</strong> untuk mengakses fitur ini.
            </p>
            <Button
                asChild
                size="sm"
                variant="outline"
                className="shrink-0 border-amber-400 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-800/60"
            >
                <Link href="/billing">Upgrade Sekarang</Link>
            </Button>
        </div>
    );
}
