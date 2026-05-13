import { Link, usePage } from '@inertiajs/react';
import {
    BellRing,
    Briefcase,
    Building2,
    CalendarClock,
    CalendarDays,
    CalendarRange,
    CalendarSync,
    ClipboardList,
    FileText,
    GitBranch,
    HandCoins,
    ReceiptText,
    LayoutGrid,
    PackageCheck,
    ShieldCheck,
    ScrollText,
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
                    title: 'Sub Company',
                    href: '/hris/sub-companies',
                    icon: Building2,
                },
                {
                    title: 'Manpower Request',
                    href: '/hris/manpower-requests',
                    icon: ClipboardList,
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
            title: 'Approval',
            items: [
                {
                    title: 'Approval Absensi',
                    href: '/hris/attendance-approvals',
                    icon: CalendarDays,
                },
                {
                    title: 'Approval Cuti',
                    href: '/hris/leave-approvals',
                    icon: CalendarClock,
                },
                {
                    title: 'Approval Lembur',
                    href: '/hris/overtime-approvals',
                    icon: Timer,
                },
                {
                    title: 'Approval Jadwal',
                    href: '/hris/shift-change-requests',
                    icon: CalendarSync,
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
                    title: 'Billing Klien',
                    href: '/hris/client-billings',
                    icon: ReceiptText,
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
        auth?: { user?: { role?: string } | null };
        subscription?: { locked_features?: string[] };
        permissions?: { can_manage_subscribers?: boolean };
    };
    const { auth } = usePage().props as { auth?: { user?: { role?: string } | null } };
    const mainNavGroups = auth?.user?.role === 'client_supervisor'
        ? [{
            title: 'Klien',
            items: [{
                title: 'Approval',
                href: '/client/approvals',
                icon: ShieldCheck,
            }],
        }]
        : buildNavGroups(subscription?.locked_features ?? []);

    if (permissions?.can_manage_subscribers) {
        mainNavGroups.push({
            title: 'Platform',
            items: [
                {
                    title: 'Subscriber',
                    href: '/admin/subscribers',
                    icon: ShieldCheck,
                },
                {
                    title: 'Invoice',
                    href: '/admin/invoices',
                    icon: FileText,
                },
                {
                    title: 'Audit Log',
                    href: '/admin/audit-logs',
                    icon: ScrollText,
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
