import React, { useRef, Suspense, lazy } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutProvider } from "@/contexts/LayoutContext";

import UserDashboard from "./UserDashboard";
import UserRequestServices from "./UserRequestServices";
import Residents from "@/pages/Residents";
import Documents from "@/pages/Documents";
import Blotter from "@/pages/Blotter";
import Officials from "@/pages/Officials";
import UserSuggestions from "./UserSuggestions";
import UserWalkInComplaint from "@/user/UserWalkInComplaint";
import Assistant from "@/pages/Assistant";
import UserSettings from "./UserSettings";

export default function UserLayout() {
  const { role, isAuthenticated } = useAuth();
  // Removed obsolete useDatabase logic; all persistence is now backend
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fix: define lastSavedAt as null (or set to a real value if available)
  const lastSavedAt = null;

  // Check if user role is stored in sessionStorage
  const storedRole = typeof window !== "undefined" && 
    sessionStorage.getItem("barangay_auth_role");

  // Allow access if role is "user" in context or stored in sessionStorage
  const hasUserAccess = (isAuthenticated && role === "user") || storedRole === "user";

  if (!hasUserAccess) {
    const redirectTo = role === "admin" ? "/admin" : "/";
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <LayoutProvider hasLayout={true}>
      <div className="min-h-screen bg-background">
        <Sidebar mode="user" />
        <div className="pl-64">
          <div className="p-8">
            <Routes>
              <Route index element={<UserDashboard />} />
              <Route path="request-services" element={<UserRequestServices />} />
              <Route path="suggestions" element={<Suspense fallback={<div>Loading...</div>}><UserSuggestions /></Suspense>} />
              <Route path="walk-in-complaint" element={<Suspense fallback={<div>Loading...</div>}><UserWalkInComplaint /></Suspense>} />
              <Route path="assistant" element={<Suspense fallback={<div>Loading...</div>}><Assistant /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<div>Loading...</div>}><UserSettings /></Suspense>} />
              <Route path="residents" element={<Residents />} />
              <Route path="documents" element={<Documents />} />
              <Route path="blotter" element={<Blotter />} />
              <Route path="officials" element={<Officials />} />
            </Routes>
          </div>
          <div className="fixed bottom-2 right-2 z-50">
            <div className="bg-white/90 backdrop-blur px-3 py-2 rounded shadow border text-xs flex items-center gap-2">
              <span className="text-muted-foreground">Last saved:</span>
              <span className="font-mono">
                {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
              {/* Controls removed per request */}
            </div>
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
}
