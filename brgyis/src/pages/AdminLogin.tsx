import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock, User } from "lucide-react";
import { getUserByEmail } from "@/db/queries";
import { verifyPassword } from "@/lib/utils";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedUsername = username.trim().toLowerCase();
      const email = normalizedUsername + '@admin.local';
      const user = await getUserByEmail(email);
      console.log('[AdminLogin] Looking for admin with email:', email);
      console.log('[AdminLogin] User found:', user);
      if (user && user.isAdmin) {
        const valid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
        if (valid) {
          sessionStorage.setItem('barangay_auth_role', 'admin');
          const now = Date.now().toString();
          sessionStorage.setItem('barangay_auth_timestamp', now);
          sessionStorage.setItem('barangay_auth_start', now);
          sessionStorage.setItem('barangayUser', JSON.stringify({
            email: user.email,
            displayName: user.displayName,
            role: 'admin'
          }));
          switchRole("admin");
          navigate('/admin', { replace: true });
          toast({
            title: "Login Successful",
            description: `Welcome, ${user.displayName}!`,
          });
        } else {
          toast({
            title: "Login Failed",
            description: "Incorrect password for admin account.",
            variant: "destructive",
          });
        }
      } else if (user && !user.isAdmin) {
        toast({
          title: "Login Failed",
          description: "This account is not an admin. Please use the User Login page.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Admin account not found.",
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
        {/* Admin Portal Card */}
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-4 bg-indigo-100 rounded-full">
                  <Shield className="h-12 w-12 text-indigo-600" />
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
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Don't have an admin account?{" "}
                <button
                  onClick={() => navigate('/admin-signup')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Create one here
                </button>
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                type="button"
              >
                Not an admin? Go to User Login
              </button>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}
