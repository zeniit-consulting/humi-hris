import { Activity, Clock3, House, User } from 'lucide-react';
import type { PortalLinkMap } from './lib';

type PortalNavbarProps = {
    active: 'home' | 'attendance' | 'activity' | 'payroll' | 'profile';
    links: PortalLinkMap;
};

const navItems = [
    { key: 'home', label: 'Beranda', icon: House, href: '/portal' },
    { key: 'attendance', label: 'Jadwal', icon: Clock3 },
    { key: 'activity', label: 'Aktivitas', icon: Activity },
    { key: 'profile', label: 'Profil', icon: User },
] as const;

const getNavItemHref = (key: string, links: PortalLinkMap): string => {
    switch (key) {
        case 'home':
            return '/portal';
        case 'profile':
            return '/portal/profile';
        case 'attendance':
            return links.attendance ?? '#';
        case 'activity':
            return links.activity ?? '/portal/activity';
        case 'payroll':
            return links.payroll ?? '#';
        default:
            return '#';
    }
};

export function PortalNavbar({ active, links }: PortalNavbarProps) {
    return (
        <nav
            aria-label="Navigasi portal"
            className="fixed inset-x-0 bottom-0 z-[var(--portal-z-sticky)] mx-auto w-full max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:max-w-xl sm:px-6 md:max-w-2xl"
        >
            <div className="portal-material grid grid-cols-4 gap-1 rounded-[1.15rem] border p-1.5">
                {navItems.map((item) => {
                    const href = getNavItemHref(item.key, links);
                    const isActive = active === item.key;

                    return (
                        <a
                            key={item.key}
                            href={href}
                            aria-current={isActive ? 'page' : undefined}
                            className={`portal-focus-ring portal-pressable flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[var(--portal-radius-control)] ${
                                isActive
                                    ? 'bg-[var(--portal-accent-soft)] text-[var(--portal-accent-strong)]'
                                    : 'text-[var(--portal-text-muted)]'
                            }`}
                        >
                            <item.icon
                                aria-hidden="true"
                                className="size-[18px]"
                            />
                            <span className="max-w-full truncate text-[11px] font-semibold tracking-[-0.01em]">
                                {item.label}
                            </span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}
