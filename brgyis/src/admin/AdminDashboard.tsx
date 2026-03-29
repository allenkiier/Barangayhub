import React, { useEffect, useState } from "react";
import { usePendingWalkInComplaints } from "@/hooks/usePendingWalkInComplaints";
import { getDocuments } from "@/db/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, AlertTriangle, Home, Shield, LogOut, UserCheck, BarChart3, TrendingUp, MessageSquare, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
// import AdminRequestsManager from "@/components/admin/AdminRequestsManager";
import UserRequestsManager from "@/components/admin/UserRequestsManager";
import PopulationChart from "@/components/dashboard/PopulationChart";
import DocumentStats from "@/components/dashboard/DocumentStats";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function AdminDashboard() {
  const pendingWalkIn = usePendingWalkInComplaints();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [totalResidents, setTotalResidents] = useState<number>(0);
  const [households, setHouseholds] = useState<number>(0);
  const [documentsIssued, setDocumentsIssued] = useState<number>(0);
  const [pendingDocumentRequests, setPendingDocumentRequests] = useState<number>(0);
  const [activeBlotters, setActiveBlotters] = useState<number>(0);
  const [pendingBlotters, setPendingBlotters] = useState<number>(0);
  const [pendingSuggestions, setPendingSuggestions] = useState<number>(0);
  const [pendingWalkInComplaints, setPendingWalkInComplaints] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [debugDocuments, setDebugDocuments] = useState<any[]>([]);

  useEffect(() => {
    setTotalResidents(0);
    setHouseholds(0);
    setActiveBlotters(0);
    setPendingBlotters(0);
    setPendingSuggestions(0);
    setPendingWalkInComplaints(0);
    // Fetch document stats from database
    (async () => {
      try {
        const docs = await getDocuments();
        setDocumentsIssued(docs.filter((d: any) => d.status === "issued").length);
        setPendingDocumentRequests(docs.filter((d: any) => d.status === "pending").length);
        setDebugDocuments(docs);
      } catch (err) {
        setDocumentsIssued(0);
        setPendingDocumentRequests(0);
        setDebugDocuments([]);
      }
    })();
  }, [refreshKey]);
          {/* Debug Panel: Raw Document Requests */}
          <div className="bg-yellow-50 border border-yellow-300 rounded p-4 my-6">
            <h3 className="font-bold text-yellow-800 mb-2">Debug: Raw Document Requests</h3>
            <pre className="overflow-x-auto text-xs text-yellow-900 bg-yellow-100 p-2 rounded max-h-64">
              {JSON.stringify(debugDocuments, null, 2)}
            </pre>
          </div>

  const handleLogout = () => {
    sessionStorage.removeItem('barangayUser');
    sessionStorage.removeItem('barangayGmailUser');
    sessionStorage.removeItem('barangayFacebookUser');
    sessionStorage.removeItem('barangayCurrentUserId');
    logout();
    navigate('/', { replace: true });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Shield className="h-7 w-7 text-indigo-600" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">Barangay Information System - Administration</p>
            </div>
            <Button 
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              className="h-24 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold"
              onClick={() => navigate('/admin/residents')}
            >
              <Users className="h-6 w-6" />
              <span>Manage Residents</span>
            </Button>
            <Button 
              className="h-24 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold relative"
              onClick={() => navigate('/admin/blotter')}
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Blotter Reports</span>
              {pendingBlotters > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                  {pendingBlotters > 9 ? '9+' : pendingBlotters}
                </div>
              )}
            </Button>
            <Button 
              className="h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold relative"
              onClick={() => {
                setRefreshKey((k) => k + 1);
                navigate('/admin/documents');
              }}
            >
              <FileText className="h-6 w-6" />
              <span>Documents</span>
              {pendingDocumentRequests > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                  {pendingDocumentRequests > 9 ? '9+' : pendingDocumentRequests}
                </div>
              )}
            </Button>
            <Button 
              className="h-24 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold"
              onClick={() => navigate('/admin/reports')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Reports</span>
            </Button>
            <Button 
              className="h-24 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold relative overflow-visible"
              onClick={() => navigate('/admin/suggestions')}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Suggestions</span>
              {pendingSuggestions > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                  {pendingSuggestions > 9 ? '9+' : pendingSuggestions}
                </div>
              )}
            </Button>
            <Button 
              className="h-24 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold relative md:col-span-2 lg:col-span-1"
              onClick={() => window.location.href = 'http://localhost:8081/#/admin/walk-in-complaint'}
            >
              <Clock className="h-6 w-6" />
              <span>Walk-In Complaints</span>
              {pendingWalkIn > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                  {pendingWalkIn > 9 ? '9+' : pendingWalkIn}
                </div>
              )}
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-blue-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Residents</p>
                  <p className="text-4xl font-bold text-gray-900">{totalResidents}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Active residents</p>
            </Card>
            <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-emerald-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Households</p>
                  <p className="text-4xl font-bold text-gray-900">{households}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <Home className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Registered families</p>
            </Card>
            <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-amber-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Documents Issued</p>
                  <p className="text-4xl font-bold text-gray-900">{documentsIssued}</p>
                </div>
                {/* Bill icon removed as requested */}
              </div>
              <p className="text-xs text-gray-500 font-medium">Processed requests</p>
            </Card>
            <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-red-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Active Blotters</p>
                  <p className="text-4xl font-bold text-gray-900">{activeBlotters}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Open incidents</p>
            </Card>
            <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-cyan-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Pending Feedback</p>
                  <p className="text-4xl font-bold text-gray-900">{pendingSuggestions}</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Awaiting review</p>
            </Card>
          </div>

          {/* Request Managers Grid */}
          <div className="grid gap-6 lg:grid-cols-1">
            {/* User Document Requests Manager */}
            <div id="user-document-requests-section" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  User Document Requests
                </h3>
              </div>
              <div>
                <UserRequestsManager refreshKey={refreshKey} />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
              <PopulationChart />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
              <DocumentStats />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              Recent Activity
            </h3>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}