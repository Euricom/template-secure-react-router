import { Outlet, redirect, useOutletContext } from "react-router";
import { AppSidebar } from "./components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { auth } from "~/lib/auth";
import { Toaster } from "~/components/ui/sonner";
import type { Route } from "./+types/layout";
import { Package, Users, type LucideIcon } from "lucide-react";
import { Settings2 } from "lucide-react";
import { useMemo } from "react";
import type { Organization } from "@prisma/client";
import type { ActiveOrg } from "../organization/orgCheck.layout";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: { title: string; url: string }[];
};

const navMain: NavItem[] = [
  {
    title: "Products",
    url: "#",
    icon: Package,
    items: [
      {
        title: "Dashboard",
        url: "/app",
      },
      {
        title: "Products",
        url: "/app/products",
      },
    ],
  },
  {
    title: "Organization",
    url: "/app/organization",
    icon: Users,
    items: [
      {
        title: "General",
        url: "/app/organization/",
      },
      {
        title: "Members",
        url: "/app/organization/members",
      },
      {
        title: "Access",
        url: "/app/organization/access",
      },
      {
        title: "Teams",
        url: "/app/organization/teams",
      },
    ],
  },
];

const navAdmin: NavItem[] = [
  {
    title: "Admin",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "Users",
        url: "/app/admin/users",
      },
      {
        title: "Roles",
        url: "#",
      },
    ],
  },
];

export const loader = async ({ request }: { request: Request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  return {
    user: {
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
    impersonated: session.session.impersonatedBy !== null,
  };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { activeOrg } = useOutletContext<{ activeOrg: ActiveOrg }>();
  const navItems = useMemo(() => {
    if (loaderData.user.role?.includes("admin")) {
      return [...navMain, ...navAdmin];
    }
    return navMain;
  }, [loaderData.user.role]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={loaderData.user}
        navMain={navItems}
        impersonated={loaderData.impersonated}
        activeOrg={activeOrg}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
