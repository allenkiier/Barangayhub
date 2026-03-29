
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getResidentById, getDocumentsByResident, addDocument } from "@/db/queries";

// Helper to fetch resident by email
async function getResidentByEmail(email: string) {
  const response = await fetch(`http://localhost:3001/api/residents/email/${encodeURIComponent(email)}`);
  if (!response.ok) return null;
  return await response.json();
}
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, AlertTriangle, MessageSquare, LogOut, Home } from "lucide-react";
import PopulationChart from "@/components/dashboard/PopulationChart";
import DocumentStats from "@/components/dashboard/DocumentStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { getCurrentUser } from "@/lib/utils";
import RequestAdminAccessDialog from "@/components/admin/RequestAdminAccessDialog";
import { toast } from "@/hooks/use-toast";

export default function UserDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [residentId, setResidentId] = useState<string | null>(null);


  useEffect(() => {
    // Use session user's email to look up resident ID via backend endpoint
    getCurrentUser().then(async (sessionUser) => {
      if (sessionUser && sessionUser.email) {
        try {
          const resident = await getResidentByEmail(sessionUser.email);
          setResidentId(resident ? resident.id : null);
        } catch (err) {
          setResidentId(null);
        }
      } else {
        setResidentId(null);
      }
      setLoading(false); // Always stop loading after checking user
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!residentId) {
      setUser(null);
      setDocuments([]);
      return;
    }
    const load = async () => {
      try {
        const u = await getResidentById(residentId);
        const docs = u ? await getDocumentsByResident(residentId) : [];
        if (!mounted) return;
        setUser(u);
        setDocuments(docs || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [residentId]);

  const handleRequestDocument = async () => {
    if (!user || !residentId) return;
    await addDocument({
      type: "barangay-clearance",
      residentId,
      issueDate: new Date().toISOString(),
      content: "Request for Barangay Clearance",
      status: "pending",
    });
    const docs = await getDocumentsByResident(residentId);
    setDocuments(docs || []);
    toast({
      title: "Request Submitted",
      description: "Your document request has been submitted and is pending approval.",
      variant: "default",
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('barangayUser');
    logout();
    navigate('/', { replace: true });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // Show dashboard UI even if user is not found, but display a message
    // Show dashboard UI for all users

  // Helper for status display
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "Pending Approval";
      case "issued": return "Approved / Issued";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  // Print handler (for issued documents)
  const handlePrint = (doc) => {
    // For demo: print the document details
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`<html><head><title>Print Document</title></head><body>`);
    printWindow.document.write(`<h2>Barangay Document</h2>`);
    printWindow.document.write(`<p><strong>Type:</strong> ${doc.type}</p>`);
    printWindow.document.write(`<p><strong>Status:</strong> ${getStatusLabel(doc.status)}</p>`);
    printWindow.document.write(`<p><strong>Issued:</strong> ${doc.issueDate}</p>`);
    if (user) {
      printWindow.document.write(`<hr><p>Resident: ${user.firstName} ${user.lastName}</p>`);
    } else {
      printWindow.document.write(`<hr><p>Resident: Not found</p>`);
    }
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Home className="h-7 w-7 text-blue-600" />
                </div>
                Resident Dashboard
              </h1>
              <p className="text-sm text-gray-500">Barangay Information System - Resident Portal</p>
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
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Button 
                className="h-24 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold"
                onClick={() => navigate('/user/request-services')}
              >
                <FileText className="h-6 w-6" />
                <span>Request Documents</span>
              </Button>
              <Button 
                className="h-24 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold"
                onClick={() => navigate('/user/suggestions')}
              >
                <MessageSquare className="h-6 w-6" />
                <span>Suggestions</span>
              </Button>
              <Button 
                className="h-24 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl flex flex-col items-center justify-center gap-3 shadow-md font-semibold"
                onClick={() => navigate('/user/walk-in-complaint')}
              >
                <AlertTriangle className="h-6 w-6" />
                <span>Walk-In Complaint</span>
              </Button>
            </div>
          </section>

          {/* Statistics */}
          <section>
            <h2 className="text-xl font-bold mb-4">Document Statistics</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-blue-200 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">My Documents</p>
                    <p className="text-4xl font-bold text-gray-900">{documents.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">Total requested</p>
              </Card>
              <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-emerald-200 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Issued</p>
                    <p className="text-4xl font-bold text-gray-900">{documents.filter((d:any) => d.status === 'issued').length}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">Documents issued</p>
              </Card>
              <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:border-orange-200 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                    <p className="text-4xl font-bold text-gray-900">{documents.filter((d:any) => d.status === 'pending').length}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">Pending requests</p>
              </Card>
            </div>
          </section>

          {/* Profile */}
          <section>
            <h2 className="text-xl font-bold mb-4">My Profile</h2>
            <Card className="p-6 mb-8">
              <div className="space-y-2">
                {user ? (
                  <>
                    <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                    <div><strong>Address:</strong> {user.address}</div>
                    <div><strong>Status:</strong> {user.status}</div>
                  </>
                ) : (
                  <div className="text-yellow-700">You are not registered as a resident. No profile data available.</div>
                )}
              </div>
            </Card>
          </section>

          {/* My Documents */}
          <section>
            <h2 className="text-xl font-bold mb-4">My Documents</h2>
            <Card className="p-6 mb-8">
              {documents.length === 0 ? (
                <div>No documents found.</div>
              ) : (
                <ul className="space-y-4">
                  {documents.map((doc) => (
                    <li key={doc.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-50">
                      <div className="flex-1">
                        <div><strong>Type:</strong> {doc.type}</div>
                        <div><strong>Status:</strong> {getStatusLabel(doc.status)}</div>
                        <div><strong>Issued:</strong> {doc.issueDate ? new Date(doc.issueDate).toLocaleString() : 'N/A'}</div>
                      </div>
                      {doc.status === 'issued' && (
                        <Button variant="outline" onClick={() => handlePrint(doc)} className="mt-2 md:mt-0">Print</Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Button onClick={handleRequestDocument} className="w-full mt-6">Request Barangay Clearance</Button>
            </Card>
          </section>

          {/* Charts */}
          <section>
            <h2 className="text-xl font-bold mb-4">Statistics & Activity</h2>
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                <PopulationChart />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                <DocumentStats />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
              <RecentActivity />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
