import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  UserCog,
  MessageCircle,
  Settings,
  Building2,
  ClipboardList,
} from "lucide-react";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Officials", href: "/officials", icon: UserCog },
  // FileText (bill) icon for Documents removed as requested
];

const userNavigation = [
  { name: "Dashboard", href: "/user", icon: LayoutDashboard },
  { name: "Request Services", href: "/user/request-services", icon: ClipboardList },
  { name: "Suggestions", href: "/user/suggestions", icon: MessageCircle },
  { name: "Walk-In Complaint", href: "/user/walk-in-complaint", icon: AlertTriangle },
  { name: "Bot Assistant", href: "/user/assistant", icon: MessageCircle },
  { name: "Settings", href: "/user/settings", icon: Settings },
];

interface SidebarProps {
  mode?: "admin" | "user";
}

const Sidebar = ({ mode = "admin" }: SidebarProps) => {
  const location = useLocation();
  const navigation = mode === "user" ? userNavigation : adminNavigation;

  // Debug: Show current role and session role
  let sessionRole = null;
  if (typeof window !== 'undefined') {
    sessionRole = sessionStorage.getItem('barangay_auth_role');
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold text-sidebar-foreground">
              BarangayIS
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Management System
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== "/user" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/60">
              Barangay Information System
            </p>
            <p className="text-xs font-medium text-sidebar-foreground/80">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
