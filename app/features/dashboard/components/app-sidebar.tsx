import * as React from "react";
import { AudioWaveform, Command, GalleryVerticalEnd, type LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { useLocation } from "react-router";
import { authClient } from "~/lib/auth-client";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
  };
  navMain: {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
  impersonated: boolean;
  activeOrg: { name: string; slug: string };
}

export function AppSidebar({ user, navMain, impersonated, activeOrg, ...props }: AppSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const updatedNavMain = navMain.map((item) => {
    // Check if the current pathname matches the item's URL exactly
    const isExactMatch = item.url === pathname;

    // Check if any of the sub-items match the current pathname
    const hasMatchingSubItem = item.items?.some((subItem) => {
      // Special case for /app - requires exact match
      if (subItem.url === "/app") {
        return pathname === "/app";
      }

      // For dynamic routes, we need to check if the pathname matches the pattern
      if (subItem.url.includes(":")) {
        // Convert the dynamic route pattern to a regex
        const pattern = subItem.url.replace(/:[^/]+/g, "[^/]+");
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(pathname);
      }
      // For static routes, check if the pathname starts with the subItem URL
      // This handles parent-child route relationships
      return pathname.startsWith(subItem.url);
    });

    return { ...item, isActive: isExactMatch || hasMatchingSubItem };
  });

  const handleStopImpersonation = async () => {
    try {
      await authClient.admin.stopImpersonating();
      navigate("/app");
    } catch (error) {
      console.error("Failed to stop impersonation:", error);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher activeOrg={activeOrg} />
        {impersonated && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-yellow-800">Impersonation Mode Active</h3>
              <p className="text-sm text-yellow-700">
                You are currently impersonating another user.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                onClick={handleStopImpersonation}
              >
                Stop Impersonation
              </Button>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={updatedNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
