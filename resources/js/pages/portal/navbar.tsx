import { Clock3, House, User, Wallet } from 'lucide-react';
import type { PortalLinkMap } from './lib';

type PortalNavbarProps = {
    active: 'home' | 'attendance' | 'payroll' | 'profile';
    links: PortalLinkMap;
};

const navItems = [
    { key: 'home', label: 'Beranda', icon: House, href: '/portal' },
    { key: 'attendance', label: 'Absensi', icon: Clock3 },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
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
        case 'payroll':
            return links.payroll ?? '#';
        default:
            return '#';
    }
};

export function PortalNavbar({ active, links }: PortalNavbarProps) {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-4 sm:max-w-lg">
            <div className="grid grid-cols-4 gap-2 rounded-[10px] border border-stone-200 bg-white p-2 shadow-[0_10px_28px_rgba(15,23,42,0.10)]">
                {navItems.map((item) => {
                    const href = getNavItemHref(item.key, links);
                    const isActive = active === item.key;

                    return (
                        <a
                            key={item.key}
                            href={href}
                            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[11px] ${
                                isActive
                                    ? 'portal-primary-text bg-[rgba(0,96,105,0.12)]'
                                    : 'text-slate-600'
                            }`}
                        >
                            <item.icon className="size-4" />
                            <span className="text-[11px] font-semibold">
                                {item.label}
                            </span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}
