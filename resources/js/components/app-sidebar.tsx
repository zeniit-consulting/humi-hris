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
    MapPinned,
    PackageCheck,
    ShieldCheck,
    ShoppingCart,
    ScrollText,
    SlidersHorizontal,
    Timer,
    TrendingUp,
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
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as attendancesIndex } from '@/routes/hris/attendances';
import { index as employeesIndex } from '@/routes/hris/employees';
import { index as kasbonsIndex } from '@/routes/hris/kasbons';
import { index as leavesIndex } from '@/routes/hris/leaves';
import { index as overtimesIndex } from '@/routes/hris/overtimes';
import { index as payrollsIndex } from '@/routes/hris/payrolls';
import { index as reportsIndex } from '@/routes/hris/reports';
import { index as schedulesIndex } from '@/routes/hris/schedules';
import type { NavGroup, NavItem } from '@/types';

type CompanyFeatures = {
    show_sub_company_menu?: boolean;
    show_manpower_request_menu?: boolean;
};

function buildNavGroups(
    lockedFeatures: string[],
    companyFeatures: CompanyFeatures = {},
    allowedModules?: string[] | null,
): NavGroup[] {
    const locked = (key: string): Pick<NavItem, 'locked'> => ({
        locked: lockedFeatures.includes(key),
    });

    const can = (module: string) =>
        !allowedModules || allowedModules.includes(module);

    const organizationItems: NavItem[] = can('employees')
        ? [
              {
                  title: 'Karyawan',
                  href: employeesIndex(),
                  icon: UsersRound,
              },
              ...(companyFeatures.show_sub_company_menu === false
                  ? []
                  : [
                        {
                            title: 'Sub Company',
                            href: '/hris/sub-companies',
                            icon: Building2,
                        } satisfies NavItem,
                    ]),
              {
                  title: 'Struktur Organisasi',
                  href: '/hris/organization-chart',
                  icon: GitBranch,
              },
              {
                  title: 'Rekrutmen',
                  href: '/hris/recruitment',
                  icon: Briefcase,
                  ...locked('recruitment'),
              },
              ...(companyFeatures.show_manpower_request_menu === false
                  ? []
                  : [
                        {
                            title: 'Manpower Request',
                            href: '/hris/manpower-requests',
                            icon: ClipboardList,
                        } satisfies NavItem,
                    ]),
              {
                  title: 'Teguran',
                  href: '/hris/reprimands',
                  icon: ScrollText,
              },
          ]
        : [];

    const workingTimeItems: NavItem[] = [
        ...(can('attendances')
            ? [
                  {
                      title: 'Kehadiran',
                      href: attendancesIndex(),
                      icon: CalendarDays,
                  },
              ]
            : []),
        ...(can('schedules')
            ? [
                  {
                      title: 'Jadwal Kerja',
                      href: schedulesIndex(),
                      icon: CalendarRange,
                  },
              ]
            : []),
        ...(can('attendances')
            ? [
                  {
                      title: 'Kunjungan Client',
                      href: '/hris/client-visits',
                      icon: MapPinned,
                  },
              ]
            : []),
        ...(can('leaves')
            ? [
                  {
                      title: 'Cuti',
                      href: leavesIndex(),
                      icon: CalendarClock,
                  },
              ]
            : []),
        ...(can('overtimes')
            ? [
                  {
                      title: 'Lembur',
                      href: overtimesIndex(),
                      icon: Timer,
                  },
              ]
            : []),
    ];

    const hasAnyApprovalAccess =
        can('attendances') ||
        can('schedules') ||
        can('leaves') ||
        can('overtimes');

    const approvalItems: NavItem[] = [
        ...(can('attendances')
            ? [
                  {
                      title: 'Approval Absensi',
                      href: '/hris/attendance-approvals',
                      icon: CalendarDays,
                  },
              ]
            : []),
        ...(can('schedules')
            ? [
                  {
                      title: 'Approval Jadwal',
                      href: '/hris/shift-change-requests',
                      icon: CalendarSync,
                  },
              ]
            : []),
        ...(can('leaves')
            ? [
                  {
                      title: 'Approval Cuti',
                      href: '/hris/leave-approvals',
                      icon: CalendarClock,
                  },
              ]
            : []),
        ...(can('overtimes')
            ? [
                  {
                      title: 'Approval Lembur',
                      href: '/hris/overtime-approvals',
                      icon: Timer,
                  },
              ]
            : []),
        ...(hasAnyApprovalAccess
            ? [
                  {
                      title: 'Pengaturan Approval',
                      href: '/hris/approval-settings',
                      icon: SlidersHorizontal,
                  },
              ]
            : []),
    ];

    const payrollItems: NavItem[] = can('payrolls')
        ? [
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
                  title: 'Reimbursement',
                  href: '/hris/reimbursements',
                  icon: ReceiptText,
              },
              {
                  title: 'Billing Klien',
                  href: '/hris/client-billings',
                  icon: ReceiptText,
              },
              {
                  title: 'Laporan',
                  href: reportsIndex(),
                  icon: FileText,
              },
          ]
        : [];

    const operationalItems: NavItem[] = [
        ...(can('operational')
            ? [
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
              ]
            : []),
        ...(can('employees') || can('operational')
            ? [
                  {
                      title: 'Performance',
                      href: '/hris/performances',
                      icon: TrendingUp,
                      ...locked('performance'),
                  },
              ]
            : []),
        ...(can('operational')
            ? [
                  {
                      title: 'Asset Management',
                      href: '/hris/assets',
                      icon: PackageCheck,
                      ...locked('assets'),
                  },
                  {
                      title: 'Request Pengadaan Aset',
                      href: '/hris/assets/procurement-requests',
                      icon: ShoppingCart,
                      ...locked('assets'),
                  },
              ]
            : []),
    ];

    const groups: NavGroup[] = [
        {
            title: 'Organisasi',
            items: organizationItems,
        },
        {
            title: 'Waktu Kerja',
            items: workingTimeItems,
        },
        {
            title: 'Approval',
            items: approvalItems,
        },
        {
            title: 'Payroll',
            items: payrollItems,
        },
        {
            title: 'Operasional',
            items: operationalItems,
        },
    ];

    return groups.filter((group) => group.items.length > 0);
}

export function AppSidebar() {
    const { isCurrentUrl } = useCurrentUrl();
    const { subscription, permissions, companyFeatures } = usePage().props as {
        auth?: { user?: { role?: string } | null };
        subscription?: { locked_features?: string[] };
        permissions?: {
            can_manage_subscribers?: boolean;
            allowed_modules?: string[] | null;
            is_sub_admin?: boolean;
        };
        companyFeatures?: CompanyFeatures;
    };
    const { auth } = usePage().props as {
        auth?: { user?: { role?: string } | null };
    };
    const mainNavGroups =
        auth?.user?.role === 'client_supervisor'
            ? [
                  {
                      title: 'Klien',
                      items: [
                          {
                              title: 'Approval',
                              href: '/client/approvals',
                              icon: ShieldCheck,
                          },
                      ],
                  },
              ]
            : buildNavGroups(
                  subscription?.locked_features ?? [],
                  companyFeatures,
                  permissions?.allowed_modules,
              );

    if (permissions?.can_manage_subscribers) {
        const platformItems: NavItem[] = [
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
        ];

        if (mainNavGroups.length >= 5) {
            mainNavGroups[mainNavGroups.length - 1].items.push(
                ...platformItems,
            );
        } else {
            mainNavGroups.push({
                title: 'Platform',
                items: platformItems,
            });
        }
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
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(dashboard())}
                                    tooltip={{
                                        children: 'Dashboard',
                                    }}
                                >
                                    <Link href={toUrl(dashboard())} prefetch>
                                        <LayoutGrid />
                                        <span className="flex-1">
                                            Dashboard
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <SubscriptionStatusBar />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
