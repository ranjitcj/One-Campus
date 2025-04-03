"use client";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import { useState } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  // Track open/closed state for each menu item
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Create a deep copy of items to potentially modify
  const filteredItems = items.map((item) => {
    // If the item is Academy and the user is a teacher, add Check Attendance
    if (item.title === "Academy" && user?.role === "Teacher") {
      return {
        ...item,
        items: [
          ...(item.items || []),
          {
            title: "Take Class Attendance",
            url: "/dashboard/academy/classattendance",
          },
        ],
      };
    }
    return item;
  });

  // Toggle function for menu items
  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={openItems[item.title]}
            onOpenChange={(open) =>
              setOpenItems((prev) => ({ ...prev, [item.title]: open }))
            }
          >
            <SidebarMenuItem>
              {item.items?.length ? (
                // If has subitems, clicking the button toggles the menu
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <SidebarMenuAction className="ml-auto">
                        <ChevronRight
                          className={
                            openItems[item.title]
                              ? "rotate-90 transition-transform"
                              : "transition-transform"
                          }
                        />
                      </SidebarMenuAction>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                // If no subitems, regular link without toggle
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
