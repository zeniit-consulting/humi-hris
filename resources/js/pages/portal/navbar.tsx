import { Activity, CheckSquare, Clock3, House, User } from 'lucide-react';
import type { PortalLinkMap } from './lib';

type PortalNavbarProps = {
    active: 'home' | 'attendance' | 'activity' | 'payroll' | 'profile' | 'approvals';
    links: PortalLinkMap;
};

const navItems = [
    { key: 'home', label: 'Beranda', icon: House, href: '/portal' },
    { key: 'attendance', label: 'Jadwal', icon: Clock3 },
    { key: 'activity', label: 'Aktivitas', icon: Activity },
    { key: 'approvals', label: 'Approval', icon: CheckSquare },
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
        case 'approvals':
            return links.approvals ?? '/portal/approvals';
        default:
            return '#';
    }
};

export function PortalNavbar({ active, links }: PortalNavbarProps) {
    return (
        <nav
            aria-label="Navigasi portal"
            className="fixed inset-x-0 bottom-0 z-[var(--portal-z-sticky)] w-full"
        >
            <div className="portal-material grid grid-cols-5 gap-1 rounded-t-[1.15rem] rounded-b-none border p-1.5 pb-[max(1.125rem,calc(0.375rem+env(safe-area-inset-bottom)))]">
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
                                    ? 'portal-primary-soft portal-primary-text portal-primary-border border shadow-[inset_0_-2px_0_var(--portal-color-accent-strong)]'
                                    : 'border border-transparent text-[var(--portal-color-muted)]'
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
