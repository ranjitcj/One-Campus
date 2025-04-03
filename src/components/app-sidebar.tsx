"use client";

import * as React from "react";
import {
  Clapperboard,
  Command,
  Landmark,
  Library,
  LifeBuoy,
  MessagesSquare,
  Send,
  UserRoundSearch,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./ui/mode-toggle";

const data = {
  navMain: [
    {
      title: "Academy",
      url: "#",
      icon: Landmark,
      items: [
        {
          title: "Check Attendance",
          url: "/dashboard/academy/attendance",
        },
      ],
    },
    {
      title: "Events",
      url: "#",
      icon: Clapperboard,
      items: [
        {
          title: "Ongoing",
          url: "#",
        },
        {
          title: "Upcoming",
          url: "#",
        },
        {
          title: "Pervious",
          url: "#",
        },
      ],
    },
    {
      title: "Library",
      url: "#",
      icon: Library,
      items: [
        {
          title: "Books",
          url: "#",
        },
        {
          title: "Issued Books",
          url: "/dashboard/library/issuedbooks",
        },
        {
          title: "New Announcements",
          url: "#",
        },
        {
          title: "Newspapers",
          url: "#",
        },
      ],
    },
    {
      title: "Clubs",
      url: "#",
      icon: MessagesSquare,
      items: [
        {
          title: "Cricket Club",
          url: "#",
        },
        {
          title: "Chess Club",
          url: "#",
        },
        {
          title: "Coding Club",
          url: "#",
        },
        {
          title: "Drown Club",
          url: "#",
        },
      ],
    },
    {
      title: "Alumni",
      url: "#",
      icon: UserRoundSearch,
      items: [
        {
          title: "Batch 2020",
          url: "#",
        },
        {
          title: "Batch 2019",
          url: "#",
        },
        {
          title: "All Alumni",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">One Campus</span>{" "}
                  <span className="truncate text-xs">TSSM BSCOER NARHE</span>
                </div>
                <ModeToggle />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
