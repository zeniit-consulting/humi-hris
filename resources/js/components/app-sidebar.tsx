import { Link, usePage } from '@inertiajs/react';
import {
    BellRing,
    Briefcase,
    CalendarClock,
    CalendarDays,
    CalendarRange,
    ClipboardList,
    GitBranch,
    HandCoins,
    LayoutGrid,
    PackageCheck,
    ShieldCheck,
    Timer,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { SubscriptionStatusBar } from '@/components/subscription-status-bar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as attendancesIndex } from '@/routes/hris/attendances';
import { index as employeesIndex } from '@/routes/hris/employees';
import { index as kasbonsIndex } from '@/routes/hris/kasbons';
import { index as leavesIndex } from '@/routes/hris/leaves';
import { index as overtimesIndex } from '@/routes/hris/overtimes';
import { index as payrollsIndex } from '@/routes/hris/payrolls';
import { index as schedulesIndex } from '@/routes/hris/schedules';
import type { NavGroup, NavItem } from '@/types';

function buildNavGroups(lockedFeatures: string[]): NavGroup[] {
    const locked = (key: string): Pick<NavItem, 'locked'> => ({
        locked: lockedFeatures.includes(key),
    });

    return [
        {
            title: 'Umum',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
        {
            title: 'SDM',
            items: [
                {
                    title: 'Karyawan',
                    href: employeesIndex(),
                    icon: UsersRound,
                },
                {
                    title: 'Rekrutmen',
                    href: '/hris/recruitment',
                    icon: Briefcase,
                    ...locked('recruitment'),
                },
                {
                    title: 'Struktur Organisasi',
                    href: '/hris/organization-chart',
                    icon: GitBranch,
                },
                {
                    title: 'Notifikasi',
                    href: '/hris/notifications',
                    icon: BellRing,
                },
                {
                    title: 'Survey',
                    href: '/hris/surveys',
                    icon: ClipboardList,
                },
            ],
        },
        {
            title: 'Waktu Kerja',
            items: [
                {
                    title: 'Kehadiran',
                    href: attendancesIndex(),
                    icon: CalendarDays,
                },
                {
                    title: 'Jadwal Kerja',
                    href: schedulesIndex(),
                    icon: CalendarRange,
                },
                {
                    title: 'Cuti',
                    href: leavesIndex(),
                    icon: CalendarClock,
                },
                {
                    title: 'Lembur',
                    href: overtimesIndex(),
                    icon: Timer,
                },
            ],
        },
        {
            title: 'Payroll',
            items: [
                {
                    title: 'Penggajian',
                    href: payrollsIndex(),
                    icon: WalletCards,
                    ...locked('payroll'),
                },
                {
                    title: 'Kasbon',
                    href: kasbonsIndex(),
                    icon: HandCoins,
                    ...locked('kasbon'),
                },
                {
                    title: 'Asset Management',
                    href: '/hris/assets',
                    icon: PackageCheck,
                    ...locked('assets'),
                },
            ],
        },
    ];
}

export function AppSidebar() {
    const { subscription, permissions } = usePage().props as {
        subscription?: { locked_features?: string[] };
        permissions?: { can_manage_subscribers?: boolean };
    };
    const mainNavGroups = buildNavGroups(
        subscription?.locked_features ?? [],
    );

    if (permissions?.can_manage_subscribers) {
        mainNavGroups.push({
            title: 'Platform',
            items: [
                {
                    title: 'Subscriber',
                    href: '/admin/subscribers',
                    icon: ShieldCheck,
                },
            ],
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={toUrl(dashboard())} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <SubscriptionStatusBar />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
