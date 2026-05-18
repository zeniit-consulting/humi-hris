import { Link } from '@inertiajs/react';
import { ChevronDown, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import type { NavGroup } from '@/types';

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const activeGroupTitle = useMemo(
        () =>
            groups.find((group) =>
                group.items.some((item) => isCurrentUrl(item.href)),
            )?.title ?? groups[0]?.title ?? null,
        [groups, isCurrentUrl],
    );
    const [openGroupTitle, setOpenGroupTitle] = useState<string | null>(
        activeGroupTitle,
    );

    useEffect(() => {
        setOpenGroupTitle(activeGroupTitle);
    }, [activeGroupTitle]);

    return (
        <>
            {groups.map((group) => (
                <Collapsible
                    key={group.title}
                    open={openGroupTitle === group.title}
                    onOpenChange={(open) =>
                        setOpenGroupTitle(open ? group.title : null)
                    }
                >
                    <SidebarGroup className="px-2 py-0">
                        <CollapsibleTrigger asChild>
                            <SidebarGroupLabel className="cursor-pointer justify-between hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                                <span>{group.title}</span>
                                <ChevronDown
                                    className={`size-4 transition-transform ${
                                        openGroupTitle === group.title
                                            ? 'rotate-180'
                                            : ''
                                    }`}
                                />
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem
                                            key={`${group.title}-${item.title}`}
                                        >
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isCurrentUrl(
                                                    item.href,
                                                )}
                                                tooltip={{
                                                    children: item.title,
                                                }}
                                            >
                                                <Link
                                                    href={toUrl(item.href)}
                                                    prefetch
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span className="flex-1">
                                                        {item.title}
                                                    </span>
                                                    {item.locked && (
                                                        <Lock className="ml-auto size-3 opacity-50" />
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            ))}
        </>
    );
}
