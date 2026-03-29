import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { role } = useAuth();

  const storedRole =
    typeof window !== "undefined" ? sessionStorage.getItem("barangay_auth_role") : null;
  const effectiveRole = role || storedRole;
  const homePath =
    effectiveRole === "admin"
      ? "/admin"
      : effectiveRole === "user"
        ? "/user"
        : "/login";

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to={homePath} className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
