import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function AdminPortal() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate admin authentication
      // In production, this should verify against a secure backend
      if (username === "admin" && password === "admin123") {
        // Store admin session
        sessionStorage.setItem('barangay_auth_role', 'admin');
        const now = Date.now().toString();
        sessionStorage.setItem('barangay_auth_timestamp', now);
        sessionStorage.setItem('barangay_auth_start', now);
        sessionStorage.setItem('barangayUser', JSON.stringify({
          email: 'admin@barangay.local',
          displayName: 'Administrator',
          role: 'admin'
        }));
        
        switchRole("admin");
        navigate('/admin', { replace: true });
        
        toast({
          title: "Login Successful",
          description: "Welcome, Administrator!",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Admin Portal Card */}
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-sm text-gray-500">
                Barangay Management System
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </form>

            {/* Info */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Default credentials for testing:</p>
              <p className="font-mono mt-1">Username: admin | Password: admin123</p>
            </div>
          </div>
        </Card>

        {/* User Portal Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Not an admin?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-blue-600"
              onClick={() => navigate('/login')}
            >
              Go to User Portal
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
