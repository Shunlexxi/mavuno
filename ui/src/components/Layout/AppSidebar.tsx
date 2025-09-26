import { useLocation, NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Users, User, MessageSquare, ArrowLeft } from "lucide-react";

const farmerItems = [
  { title: "Dashboard", url: "/farmer/dashboard", icon: Home },
  { title: "My Timeline", url: "/farmer/timeline", icon: MessageSquare },
  { title: "Profile", url: "/farmer/profile", icon: User },
  { title: "Back to Pools", url: "/", icon: ArrowLeft },
];

const pledgerItems = [
  { title: "Dashboard", url: "/pledger/dashboard", icon: Home },
  { title: "Farmers Directory", url: "/pledger/farmers", icon: Users },
  { title: "Back to Pools", url: "/", icon: ArrowLeft },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isFarmerRoute = currentPath.startsWith("/farmer");
  const items = isFarmerRoute ? farmerItems : pledgerItems;
  const title = isFarmerRoute ? "Farmer Portal" : "Pledger Portal";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className={collapsed ? "opacity-0" : "opacity-100"}
          >
            {title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
