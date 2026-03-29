import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/lib/utils";
import { FileText, AlertTriangle, Home, LogOut, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DocumentRequestBrowser from "@/components/documents/DocumentRequestBrowser";
import BlotterRequestBrowser from "@/components/blotter/BlotterRequestBrowser";
import RequestAdminAccessDialog from "@/components/admin/RequestAdminAccessDialog";

export default function UserPortal() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [gmailUser, setGmailUser] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await getCurrentUser<any>();
      if (mounted) setGmailUser(user || {});
    })();
    return () => { mounted = false; };
  }, []);


  // Example stats, replace with backend API fetch if needed
  const [stats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
  });

  const handleLogout = () => {
    sessionStorage.removeItem("barangayUser");
    sessionStorage.removeItem("barangayGmailUser");
    sessionStorage.removeItem("barangayFacebookUser");
    sessionStorage.removeItem("barangayCurrentUserId");
    logout();
    navigate("/login", { replace: true });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Initializing...</h2>
            <p className="text-gray-600">Please wait while the system loads.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {gmailUser.displayName}!
              </h1>
              <p className="text-gray-600">User Portal</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <RequestAdminAccessDialog
                residentId={gmailUser.email || ""}
                residentName={gmailUser.displayName || ""}
                email={gmailUser.email || ""}
              />
              {!gmailUser.email && (
                <Button
                  className="gap-2"
                  onClick={() => navigate("/login")}
                >
                  <Mail className="h-4 w-4" />
                  Login with Gmail
                </Button>
              )}
              <Button
                className="gap-2 border border-input"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold">{stats.totalRequests}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pendingRequests}
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.approvedRequests}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Ready</Badge>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="w-full grid w-full grid-cols-2 bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger
              value="documents"
              className="rounded-md py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents & Services
            </TabsTrigger>
            <TabsTrigger
              value="blotter"
              className="rounded-md py-3 data-[state=active]:bg-red-100 data-[state=active]:text-red-900"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Incident
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DocumentRequestBrowser
              residentId={gmailUser.email || ""}
              residentName={gmailUser.displayName || ""}
            />
          </TabsContent>

          {/* Blotter Tab */}
          <TabsContent value="blotter" className="space-y-6">
            <BlotterRequestBrowser
              residentId={gmailUser.email || ""}
              residentName={gmailUser.displayName || ""}
              residentEmail={gmailUser.email || ""}
              residentPhone={gmailUser.phone || ""}
            />
          </TabsContent>
        </Tabs>

        {/* Information Footer */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="bg-white p-6">
            <h3 className="font-semibold mb-2">How It Works</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Select the document or service you need</li>
              <li>2. Fill out the request form</li>
              <li>3. Submit your request</li>
              <li>4. Track status in your dashboard</li>
            </ol>
          </Card>

          <Card className="bg-white p-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Contact the barangay office for assistance with:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Document requests</li>
              <li>• Application status</li>
              <li>• General inquiries</li>
            </ul>
          </Card>

          <Card className="bg-white p-6">
            <h3 className="font-semibold mb-2">Important Notes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Requests are processed in order</li>
              <li>• Processing time: 1-3 business days</li>
              <li>• For emergencies, call 911</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
