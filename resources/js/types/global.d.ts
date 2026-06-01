import type { Auth, SubscriptionInfo } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            appUrl: string;
            auth: Auth;
            sidebarOpen: boolean;
            subscription: SubscriptionInfo | null;
            [key: string]: unknown;
        };
    }
}
