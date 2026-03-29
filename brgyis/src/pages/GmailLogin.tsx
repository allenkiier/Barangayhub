import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { secureSessionSet, verifyPassword } from "@/lib/utils";
import { getUserByEmail } from "@/db/queries";
import { LogIn, UserPlus } from "lucide-react";

const GmailLogin = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email.trim() || !password) {
        toast({ title: "Error", description: "Enter email and password.", variant: "destructive" });
        return;
      }
      const user = await getUserByEmail(email.trim().toLowerCase());
      if (!user) {
        toast({ title: "Error", description: "Account not found.", variant: "destructive" });
        return;
      }
      if (user.isAdmin) {
        toast({ title: "Error", description: "This account is for admin only. Please use the Admin Login page.", variant: "destructive" });
        return;
      }
      const ok = await verifyPassword(password, user.passwordSalt, user.passwordHash);
      if (!ok) {
        toast({ title: "Error", description: "Invalid credentials.", variant: "destructive" });
        return;
      }
      const sessionUser = { email: user.email, displayName: user.displayName, provider: "password", loginTime: new Date().toISOString(), verified: true };
      await secureSessionSet("barangayUser", sessionUser);
      toast({ title: "Welcome", description: `Logged in as ${user.displayName}.` });
      switchRole("user");
      navigate("/user", { replace: true });
    } catch (err) {
      console.error("Password login error", err);
      toast({ title: "Error", description: "Login failed.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Barangay Bis</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg mt-2"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/signup")} 
                className="w-full h-11 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create New Account
              </Button>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account? <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/signup")}>Sign up here</span>
          </p>
          
          {/* Admin Portal Link */}
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={() => navigate("/admin-portal")}
              className="text-gray-500 hover:text-blue-600 text-sm"
            >
              Admin Portal →
            </Button>
          </div>
        </div>
      </div>
  );
};

export default GmailLogin;
