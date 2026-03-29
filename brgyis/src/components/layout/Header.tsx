import React, { useState, useEffect } from "react";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDocuments } from "@/db/queries";
import type { Document } from "@/types/database";

const Header = () => {
  const { role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const [pendingRequests, setPendingRequests] = useState<Document[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isAdmin || !isAuthenticated) return;

    const fetchPendingRequests = async () => {
      try {
        const documents = await getDocuments();
        const pending = documents.filter(doc => doc.status === "pending");
        setPendingRequests(pending);
        setNotificationCount(pending.length);
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
      }
    };

    fetchPendingRequests();
    
    // Refresh every 3 seconds for real-time updates (more aggressive)
    const interval = setInterval(fetchPendingRequests, 3000);
    return () => clearInterval(interval);
  }, [isAdmin, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Don't show role switch or user info if not authenticated
  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-card">
        {/* Search bar removed */}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-card">
      {/* Search bar removed */}
      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown (Admin Only) */}
        {/* Notification icon removed for admin as requested */}

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-1.5 hover:bg-muted transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-sm text-left">
                <p className="font-medium">{isAdmin ? 'admin' : 'user'}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? 'Administrator' : 'Resident'}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{isAdmin ? 'admin' : 'user'}</p>
              <p className="text-xs text-muted-foreground">{isAdmin ? 'Administrator' : 'Resident'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
