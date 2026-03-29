import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Shield, Building2 } from "lucide-react";

export default function LoginChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <Building2 className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Barangay IS</h1>
            <p className="text-xl text-gray-600 mt-2">Management System</p>
            <p className="text-gray-500 mt-1">Choose your login type to continue</p>
          </div>
        </div>

        {/* Login Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Login Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-200 hover:border-blue-500"
            onClick={() => navigate("/login")}
          >
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resident Portal</h2>
                <p className="text-gray-600 mt-2 text-sm">
                  Login as a barangay resident to request documents and access services
                </p>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/login")}
              >
                Continue as User
              </Button>
            </div>
          </Card>

          {/* Admin Login Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-200 hover:border-indigo-500"
            onClick={() => navigate("/admin-login")}
          >
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-indigo-100 rounded-full">
                  <Shield className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
                <p className="text-gray-600 mt-2 text-sm">
                  Login as an administrator to manage residents, documents, and reports
                </p>
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate("/admin-login")}
              >
                Continue as Admin
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2026 Barangay Information System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
