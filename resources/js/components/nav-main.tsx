import { useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [groupLinks, setGroupLinks] = useState<NavItem[]>([]);
    const [groupLoading, setGroupLoading] = useState(false);
    const [groupFetched, setGroupFetched] = useState(false);

    const toggleMenu = async (title: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));

        if (title === 'Groups' && !groupFetched) {
            setGroupLoading(true);
            try {
                const response = await axios.get('/api/groups/nav');
                const data = response.data.groups.map((group: any) => ({
                    title: group.name,
                    href: `/groups/${group.id}`,
                }));
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
                                {/* Left side: text + icon -> navigates to /groups */}
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith('/groups')}
                                    className="flex-1"
                                >
                                    <Link href={item.href!} prefetch className="flex items-center gap-2 w-full">
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>

                                {/* Right side: dropdown icon -> toggles submenus */}
                                <button
                                    onClick={() => toggleMenu('Groups')}
                                    className="px-2 py-2 text-gray-500 hover:text-gray-900  rounded-full bg-gray-100"
                                >
                                    {openMenus['Groups'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            </div>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(item.href!)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href!} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}

                        {/* Submenu: only for Groups */}
                        {item.title === 'Groups' && openMenus['Groups'] && (
                            <div className="ml-6 mt-1 space-y-1">
                                {groupLoading ? (
                                    <span className="text-xs text-gray-400">Loading...</span>
                                ) :  (
                                    groupLinks.map((group) => (
                                        <SidebarMenuItem key={group.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={page.url.startsWith(group.href!)}
                                            >
                                                <Link href={group.href!} prefetch>
                                                    <span>{group.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                )}
                            </div>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
