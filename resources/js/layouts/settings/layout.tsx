import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarCheck,
    KeyRound,
    MessageSquare,
    Palette,
    ShieldCheck,
    SlidersHorizontal,
    Users,
    WalletCards,
} from 'lucide-react';
import type { ComponentType, PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';

type SettingsNavItem = {
    title: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    requiresManageSubUsers?: boolean;
};

type SettingsNavGroup = {
    title: string;
    items: SettingsNavItem[];
};

const settingsNavGroups: SettingsNavGroup[] = [
    {
        title: 'Operasional & Kebijakan HR',
        items: [
            {
                title: 'Pengaturan Absensi',
                href: '/settings/attendance',
                icon: CalendarCheck,
            },
            {
                title: 'Pengaturan Payroll & Lembur',
                href: '/settings/payroll',
                icon: WalletCards,
            },
            {
                title: 'Pengaturan Approval',
                href: '/hris/approval-settings',
                icon: SlidersHorizontal,
            },
            {
                title: 'Pengguna & Hak Akses',
                href: '/settings/users',
                icon: Users,
                requiresManageSubUsers: true,
            },
            {
                title: 'WhatsApp Gateway',
                href: '/settings/whatsapp',
                icon: MessageSquare,
            },
        ],
    },
    {
        title: 'Akun & Preferensi',
        items: [
            {
                title: 'Profil Perusahaan & Akun',
                href: edit(),
                icon: Building2,
            },
            {
                title: 'Kata Sandi',
                href: editPassword(),
                icon: KeyRound,
            },
            {
                title: 'Autentikasi Dua Faktor',
                href: show(),
                icon: ShieldCheck,
            },
            {
                title: 'Tema & Tampilan',
                href: editAppearance(),
                icon: Palette,
            },
        ],
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { permissions } = usePage<{
        permissions?: { can_manage_sub_users?: boolean };
    }>().props;

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6 md:px-6">
            <Heading
                title="Pengaturan Admin & Perusahaan"
                description="Kelola kebijakan operasional HR, kehadiran, skema penggajian, serta preferensi akun Anda"
            />

            <div className="mt-6 flex flex-col lg:flex-row gap-8 lg:gap-10">
                <aside className="w-full lg:w-64 shrink-0">
                    <nav
                        className="flex flex-col space-y-6"
                        aria-label="Navigasi pengaturan"
                    >
                        {settingsNavGroups.map((group, groupIndex) => {
                            const items = group.items.filter((item) => {
                                if (item.requiresManageSubUsers) {
                                    return permissions?.can_manage_sub_users === true;
                                }
                                return true;
                            });

                            if (items.length === 0) {
                                return null;
                            }

                            return (
                                <div key={groupIndex} className="space-y-1.5">
                                    <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {group.title}
                                    </h4>
                                    <div className="space-y-1">
                                        {items.map((item, index) => {
                                            const active = isCurrentOrParentUrl(item.href);
                                            const Icon = item.icon;

                                            return (
                                                <Button
                                                    key={`${toUrl(item.href)}-${index}`}
                                                    size="sm"
                                                    variant="ghost"
                                                    asChild
                                                    className={cn(
                                                        'w-full justify-start gap-2.5 font-normal text-xs md:text-sm h-9',
                                                        {
                                                            'bg-primary/10 text-primary font-semibold hover:bg-primary/15':
                                                                active,
                                                            'text-muted-foreground hover:text-foreground':
                                                                !active,
                                                        },
                                                    )}
                                                >
                                                    <Link href={item.href}>
                                                        <Icon
                                                            className={cn(
                                                                'h-4 w-4 shrink-0',
                                                                {
                                                                    'text-primary':
                                                                        active,
                                                                    'text-muted-foreground':
                                                                        !active,
                                                                },
                                                            )}
                                                        />
                                                        <span className="truncate">{item.title}</span>
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-2 lg:hidden" />

                <div className="flex-1 min-w-0 max-w-5xl">
                    <section className="w-full space-y-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
