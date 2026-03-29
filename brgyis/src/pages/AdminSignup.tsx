import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock, User, ArrowLeft } from "lucide-react";
import { addUser, getUserByEmail } from "@/db/queries";
import { createPasswordHash } from "@/lib/utils";

export default function AdminSignup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedUsername = username.trim().toLowerCase();

      // Validation
      if (!normalizedUsername || !password || !confirmPassword) {
        toast({
          title: "Error",
          description: "All fields are required",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (normalizedUsername.length < 3) {
        toast({
          title: "Error",
          description: "Username must be at least 3 characters",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Store the admin in localStorage for persistence across sessions
      // In production, this should be sent to a secure backend
      
      // Check if username already exists
      // Check if email/username already exists
      const email = normalizedUsername + '@admin.local';
      const existing = await getUserByEmail(email);
      if (existing) {
        toast({
          title: "Error",
          description: "Admin username already exists",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { salt, hash } = await createPasswordHash(password);
      await addUser({
        email,
        displayName: normalizedUsername,
        passwordHash: hash,
        passwordSalt: salt,
        isAdmin: true
      } as any);
      await import("@/db/init").then(m => m.persistDatabase && m.persistDatabase());
      toast({
        title: "Account Created",
        description: "Admin account created successfully! Please login.",
      });
      setTimeout(() => {
        navigate('/admin-login', { replace: true });
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Admin Login */}
        <Button
          variant="ghost"
          onClick={() => navigate('/admin-login')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Login
        </Button>

        {/* Admin Signup Card */}
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-4 bg-indigo-100 rounded-full">
                  <Shield className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create Admin Account</h1>
              <p className="text-sm text-gray-500">
                Barangay Management System
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleAdminSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">At least 3 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">At least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate('/admin-login')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
