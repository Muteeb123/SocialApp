import { useRemember, usePage, Link } from '@inertiajs/react';
import { memo, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';

// ✅ Shared function to fetch groups
async function fetchGroups() {
    const response = await axios.get('/joinedgroups');
    return response.data.groups.map((group: any) => ({
        title: group.name,
        href: `/home?groupId=${group.id}`,
        sep: group.creator.name.split(' ')[0],
        id: group.id,
    }));
}

const NavMain = memo(function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    const [groupLinks, setGroupLinks] = useRemember<NavItem[]>([], 'sidebar-groupLinks');
    const [groupLoading, setGroupLoading] = useRemember(false, 'sidebar-groupLoading');
    const [openMenus, setOpenMenus] = useRemember<Record<string, boolean>>({}, 'sidebar-openMenus');
    const [groupFetched, setGroupFetched] = useRemember(false, 'sidebar-groupFetched');

    const toggleMenu = async (title: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));

        if (title === 'Groups' && !groupFetched) {
            setGroupLoading(true);
            try {
                const data = await fetchGroups(); // ✅ use shared function
                setGroupLinks(data);
                setGroupFetched(true);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
            } finally {
                setGroupLoading(false);
            }
        }
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.title === 'Groups' ? (
                            <div className="flex w-full items-center justify-between">
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith('/groups')}
                                    className="flex-1"
                                >
                                    <Link
                                        href={item.href!}
                                        prefetch
                                        preserveScroll
                                        preserveState
                                        className="flex items-center gap-2 w-full"
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>

                                <button
                                    onClick={() => toggleMenu('Groups')}
                                    className="px-2 py-2 text-gray-500 hover:text-gray-900 rounded-full bg-gray-100"
                                >
                                    {openMenus['Groups'] ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(item.href!)}
                                tooltip={{ children: item.title }}
                            >
                                <Link
                                    href={item.href!}
                                    prefetch
                                    preserveScroll
                                    preserveState
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}

                        {item.title === 'Groups' && openMenus['Groups'] && (
                            <div className="ml-6 mt-1 space-y-1">
                                {groupLoading ? (
                                    <span className="text-xs text-gray-400">Loading...</span>
                                ) : (
                                    <ul className="space-y-1 ml-6 mt-1">
                                        {groupLinks.map((group) => (
                                            <li key={group.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={page.url === group.href!}
                                                >
                                                    <Link
                                                        href={group.href!}
                                                        prefetch
                                                        preserveScroll
                                                        preserveState
                                                        onClick={() => console.log(group.href!)}
                                                    >
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className="text-sm font-medium text-white truncate">
                                                                {group.title}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 italic opacity-70 ml-2 whitespace-nowrap">
                                                                by {group.sep}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
});

export { NavMain , fetchGroups };
