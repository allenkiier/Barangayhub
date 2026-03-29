import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, TrendingUp, Users, FileText, AlertTriangle, 
  Calendar, Download, Filter, PieChart, LineChart, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDocuments, getResidents, getBlotterRecords } from "@/db/queries";
import { BlotterRecord } from "@/types/database";

interface ReportStats {
  totalResidents: number;
  totalDocuments: number;
  totalBlotters: number;
  documentsByType: { [key: string]: number };
  documentsByStatus: { [key: string]: number };
  blottersByStatus: { [key: string]: number };
}

export default function AdminReports() {
  const [stats, setStats] = useState<ReportStats>({
    totalResidents: 0,
    totalDocuments: 0,
    totalBlotters: 0,
    documentsByType: {},
    documentsByStatus: {},
    blottersByStatus: {},
  });
  const [blotterRecords, setBlotterRecords] = useState<BlotterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    fetchReportData();
    
    // Auto-refresh every 5 seconds to catch new reports
    const interval = setInterval(() => {
      fetchReportData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const residents = await getResidents();
      const documents = await getDocuments();
      const blotters = await getBlotterRecords();

      // Count documents by type
      const docsByType: { [key: string]: number } = {};
      documents.forEach((doc: any) => {
        docsByType[doc.type || 'Unknown'] = (docsByType[doc.type || 'Unknown'] || 0) + 1;
      });

      // Count documents by status
      const docsByStatus: { [key: string]: number } = {};
      documents.forEach((doc: any) => {
        docsByStatus[doc.status || 'Unknown'] = (docsByStatus[doc.status || 'Unknown'] || 0) + 1;
      });

      // Count blotters by status
      const blottersByStatus: { [key: string]: number } = {};
      blotters.forEach((blotter: any) => {
        blottersByStatus[blotter.status || 'Unknown'] = (blottersByStatus[blotter.status || 'Unknown'] || 0) + 1;
      });

      setBlotterRecords(blotters);
      setStats({
        totalResidents: residents.length,
        totalDocuments: documents.length,
        totalBlotters: blotters.length,
        documentsByType: docsByType,
        documentsByStatus: docsByStatus,
        blottersByStatus: blottersByStatus,
      });
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString(),
      summary: {
        totalResidents: stats.totalResidents,
        totalDocuments: stats.totalDocuments,
        totalBlotters: stats.totalBlotters,
      },
      details: stats,
    };
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute('download', `barangay-report-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              Reports & Analytics
            </h1>
            <p className="text-gray-600">Barangay system performance and statistics</p>
          </div>
          <Button 
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={downloadReport}
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all bg-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Residents</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalResidents}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">Registered in system</p>
          </Card>

          <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all bg-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Documents</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">Processed requests</p>
          </Card>

          <Card className="p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all bg-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Incidents</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalBlotters}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">Blotter records</p>
          </Card>
        </div>

        {/* Documents by Type */}
        <Card className="p-8 border border-gray-200 shadow-sm bg-white">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieChart className="h-5 w-5 text-blue-600" />
            </div>
            Documents by Type
          </h3>
          {Object.keys(stats.documentsByType).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">No document data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.documentsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-medium text-gray-900 capitalize">{type?.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ 
                          width: `${(count / stats.totalDocuments) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Status Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Documents by Status */}
          <Card className="p-8 border border-gray-200 shadow-sm bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <LineChart className="h-5 w-5 text-emerald-600" />
              </div>
              Documents by Status
            </h3>
            {Object.keys(stats.documentsByStatus).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No status data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.documentsByStatus).map(([status, count]) => {
                  const percentage = stats.totalDocuments > 0 ? (count / stats.totalDocuments) * 100 : 0;
                  const statusColor = status === 'issued' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : 'bg-red-500';
                  const statusLabel = status === 'issued' ? 'Issued' : status === 'pending' ? 'Pending' : 'Rejected';
                  
                  return (
                    <div key={status} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{statusLabel}</span>
                        <span className="font-bold text-gray-900">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`${statusColor} h-full rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Blotters by Status */}
          <Card className="p-8 border border-gray-200 shadow-sm bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              Incidents by Status
            </h3>
            {Object.keys(stats.blottersByStatus).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No incident data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.blottersByStatus).map(([status, count]) => {
                  const percentage = stats.totalBlotters > 0 ? (count / stats.totalBlotters) * 100 : 0;
                  const statusColor = status === 'closed' ? 'bg-emerald-500' : status === 'open' ? 'bg-red-500' : 'bg-amber-500';
                  const statusLabel = status === 'closed' ? 'Closed' : status === 'open' ? 'Open' : 'In Progress';
                  
                  return (
                    <div key={status} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{statusLabel}</span>
                        <span className="font-bold text-gray-900">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`${statusColor} h-full rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Detailed Blotter Reports Section */}
        <Card className="p-8 border border-gray-200 shadow-sm bg-white">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            All Incident Reports (Blotter)
          </h3>
          {blotterRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium">No incident reports filed yet</p>
              <p className="text-sm text-gray-400 mt-1">Reports will appear here as residents file them</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {blotterRecords.map((report) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case "pending":
                      return "bg-amber-100 text-amber-800";
                    case "investigating":
                      return "bg-blue-100 text-blue-800";
                    case "resolved":
                      return "bg-green-100 text-green-800";
                    case "closed":
                      return "bg-red-100 text-red-800";
                    case "open":
                      return "bg-yellow-100 text-yellow-800";
                    default:
                      return "bg-gray-100 text-gray-800";
                  }
                };

                return (
                  <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{report.reporterName}</h4>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Location:</span> {report.incidentLocation}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Date:</span> {new Date(report.incidentDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Contact:</span> {report.reporterContact}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {report.description && (
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-3 max-h-20 overflow-hidden">
                        {report.description.substring(0, 150)}...
                      </div>
                    )}
                    {report.remarks && (
                      <div className="bg-blue-50 p-3 rounded text-sm border border-blue-200">
                        <p className="font-medium text-blue-900 mb-1">Admin Remarks:</p>
                        <p className="text-blue-800">{report.remarks}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Report Info */}
        <Card className="p-6 bg-purple-50 border border-purple-200">
          <div className="flex gap-4">
            <div className="p-2 bg-purple-100 rounded-lg h-fit">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Report Information</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• This dashboard shows real-time statistics from your barangay database</li>
                <li>• Download the report in JSON format for further analysis</li>
                <li>• All data is automatically updated when changes are made</li>
                <li>• Reports help track system usage and performance metrics</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
