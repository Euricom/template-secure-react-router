import { ChevronsUpDown } from "lucide-react";
import { Link } from "react-router";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";

export function TeamSwitcher({
  activeOrg,
}: {
  activeOrg: {
    name: string;
    slug: string;
  };
}) {
  if (!activeOrg) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to="/app/organization/select">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {activeOrg.slug.charAt(0).toUpperCase()}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeOrg.name}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
