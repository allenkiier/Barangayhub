import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "admin" | "user" | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (newRole: "admin" | "user") => void;
  logout: () => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys (session-based)
const STORAGE_KEY = "barangay_auth_role";
const STORAGE_TIMESTAMP = "barangay_auth_timestamp"; // last activity
const STORAGE_START = "barangay_auth_start"; // absolute start

// Timeouts
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes idle
const ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours max

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize role from sessionStorage without timeout checks
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(STORAGE_KEY) as UserRole;
    } catch (error) {
      console.error("Error reading auth from sessionStorage:", error);
      return null;
    }
  });

  // Clear all authentication data
  const clearAuth = useCallback(() => {
    setRole(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_TIMESTAMP);
      sessionStorage.removeItem(STORAGE_START);
      sessionStorage.removeItem("barangay_auth_token");
      sessionStorage.removeItem("barangay_user_data");
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }, []);

  // Switch role with proper cleanup
  const switchRole = useCallback((newRole: "admin" | "user") => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_TIMESTAMP);
      sessionStorage.removeItem(STORAGE_START);
      sessionStorage.removeItem("barangay_auth_token");
      sessionStorage.removeItem("barangay_user_data");
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
    
    setRole(newRole);
    
    try {
      sessionStorage.setItem(STORAGE_KEY, newRole);
      const now = Date.now().toString();
      sessionStorage.setItem(STORAGE_TIMESTAMP, now);
      sessionStorage.setItem(STORAGE_START, now);
    } catch (error) {
      console.error("Error saving auth to sessionStorage:", error);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  // Track user activity and enforce idle/absolute timeouts
  useEffect(() => {
    if (!role) return;
    
    const updateActivity = () => {
      try {
        sessionStorage.setItem(STORAGE_TIMESTAMP, Date.now().toString());
      } catch (error) {
        console.error("Error updating session timestamp:", error);
      }
    };
    
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, updateActivity));
    
    const checker = setInterval(() => {
      try {
        const last = parseInt(sessionStorage.getItem(STORAGE_TIMESTAMP) || "0", 10);
        const start = parseInt(sessionStorage.getItem(STORAGE_START) || "0", 10);
        const now = Date.now();
        if ((now - last) > IDLE_TIMEOUT || (now - start) > ABSOLUTE_TIMEOUT) {
          console.log('[Auth] Session timeout detected');
          clearAuth();
        }
      } catch (error) {
        console.error("Error checking session timeout:", error);
      }
    }, 60 * 1000); // check every minute
    
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(checker);
    };
  }, [role, clearAuth]);

  const value: AuthContextType = {
    role,
    isAuthenticated: role !== null,
    switchRole,
    logout,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

