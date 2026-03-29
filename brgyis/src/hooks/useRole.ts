import { useAuth } from "@/contexts/AuthContext";

/**
 * Custom hook for role-based checks and utilities
 * Provides convenient methods for checking user roles and permissions
 */
export function useRole() {
  const { role, isAuthenticated } = useAuth();

  return {
    role,
    isAuthenticated,
    isAdmin: role === "admin",
    isUser: role === "user",
    hasRole: (requiredRole: "admin" | "user") => role === requiredRole,
    canAccess: (requiredRole: "admin" | "user") => 
      isAuthenticated && role === requiredRole,
  };
}

