import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Printer,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AddBlotterDialog from "@/components/blotter/AddBlotterDialog";
import ViewBlotterDialog from "@/components/blotter/ViewBlotterDialog";
import PrintableBlotterReport from "@/components/blotter/PrintableBlotterReport";
import { getBlotterRecords, updateBlotterStatus } from "@/db/queries";
import type { BlotterRecord } from "@/types/database";

const statusCards = [
  {
    title: "Pending",
    count: 5,
    icon: Clock,
    color: "bg-warning/10 text-warning border-warning/20",
  },
  {
    title: "Under Investigation",
    count: 3,
    icon: AlertTriangle,
    color: "bg-info/10 text-info border-info/20",
  },
  {
    title: "Resolved",
    count: 42,
    icon: CheckCircle,
    color: "bg-success/10 text-success border-success/20",
  },
  {
    title: "Dismissed",
    count: 8,
    icon: XCircle,
    color: "bg-muted text-muted-foreground border-muted",
  },
];

const blotterRecords = [
  {
    id: "BLT-2024-001",
    date: "2024-01-15",
    complainant: "Juan Dela Cruz",
    respondent: "Pedro Santos",
    type: "Noise Complaint",
    location: "Zone 3",
    status: "Pending",
    description: "Excessive noise during late hours from karaoke",
  },
  {
    id: "BLT-2024-002",
    date: "2024-01-14",
    complainant: "Maria Garcia",
    respondent: "Jose Reyes",
    type: "Property Dispute",
    location: "Zone 1",
    status: "Under Investigation",
    description: "Boundary dispute between adjacent properties",
  },
  {
    id: "BLT-2024-003",
    date: "2024-01-13",
    complainant: "Ana Santos",
    respondent: "Carlos Mendoza",
    type: "Verbal Altercation",
    location: "Zone 2",
    status: "Resolved",
    description: "Heated argument resolved through mediation",
  },
  {
    id: "BLT-2024-004",
    date: "2024-01-12",
    complainant: "Roberto Cruz",
    respondent: "Unknown",
    type: "Theft",
    location: "Zone 4",
    status: "Under Investigation",
    description: "Reported theft of bicycle",
  },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Pending: "bg-warning text-warning-foreground",
    "Under Investigation": "bg-info text-info-foreground",
    Resolved: "bg-success text-success-foreground",
    Dismissed: "bg-muted text-muted-foreground",
  };
  return styles[status] || "";
};

const Blotter = () => {
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [blotterRecords, setBlotterRecords] = useState<BlotterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<BlotterRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchBlotterRecords();
  }, []);

  const fetchBlotterRecords = async () => {
    try {
      setLoading(true);
      const data = await getBlotterRecords();
      setBlotterRecords(data);
    } catch (error) {
      console.error("Error fetching blotter records:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0,
    };
    blotterRecords.forEach(record => {
      const status = record.status.toLowerCase();
      if (status === 'pending') counts.pending++;
      else if (status === 'investigating' || status === 'under investigation') counts.investigating++;
      else if (status === 'resolved') counts.resolved++;
      else if (status === 'dismissed') counts.dismissed++;
    });
    return counts;
  };

  const counts = getStatusCounts();

  const filteredRecords = blotterRecords.filter(
    (record) =>
      record.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (recordId: string, newStatus: string) => {
    try {
      await updateBlotterStatus(recordId, newStatus);
      toast({
        title: "Status Updated",
        description: `Blotter record status updated to ${newStatus}`,
      });
      fetchBlotterRecords(); // Refresh the list
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewBlotter = (record: BlotterRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handlePrintBlotter = (record: BlotterRecord) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Blotter Report - BLT-${record.id.slice(0, 8)}</title>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      const root = printWindow.document.getElementById('root');
      if (root) {
        import('react-dom/client').then(({ createRoot }) => {
          const reactRoot = createRoot(root);
          reactRoot.render(<PrintableBlotterReport record={record} />);
          
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Blotter Records
            </h1>
            <p className="text-muted-foreground">
              {role === "admin" ? "Manage incident reports and complaints" : "View incident reports and complaints"}
            </p>
          </div>
          {role === "admin" && (
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4 animate-slide-up">
          <Card className="border bg-warning/10 text-warning border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{counts.pending}</div>
            </CardContent>
          </Card>
          <Card className="border bg-info/10 text-info border-info/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
              <AlertTriangle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{counts.investigating}</div>
            </CardContent>
          </Card>
          <Card className="border bg-success/10 text-success border-success/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{counts.resolved}</div>
            </CardContent>
          </Card>
          <Card className="border bg-muted text-muted-foreground border-muted">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
              <XCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{counts.dismissed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by case ID, complainant, or respondent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Blotter Records */}
        <div className="grid gap-4 animate-slide-up">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                Loading blotter records...
              </CardContent>
            </Card>
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No blotter records found. Click "New Report" to file one.
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => {
              // Extract parts from description
              const lines = record.description.split('\n');
              const typeMatch = lines.find(l => l.startsWith('Type:'));
              const complainantMatch = lines.find(l => l.startsWith('Complainant:'));
              const respondentMatch = lines.find(l => l.startsWith('Respondent:'));
              const detailsMatch = lines.find(l => l.startsWith('Details:'));
              
              const type = typeMatch ? typeMatch.replace('Type: ', '') : 'N/A';
              const complainant = complainantMatch ? complainantMatch.replace('Complainant: ', '') : 'N/A';
              const respondent = respondentMatch ? respondentMatch.replace('Respondent: ', '') : 'N/A';
              const details = detailsMatch ? detailsMatch.replace('Details: ', '') : record.description;

              return (
                <Card key={record.id} className="transition-all hover:shadow-card-hover">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">BLT-{record.id.slice(0, 8)}</CardTitle>
                          <Badge className={getStatusBadge(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {type} • {record.incidentLocation} • {record.incidentDate}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBlotter(record)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintBlotter(record)}
                          className="gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                        {role === "admin" && (
                          <Select
                            value={record.status}
                            onValueChange={(value) => handleStatusChange(record.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="investigating">Under Investigation</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Complainant</p>
                        <p className="font-medium">{complainant}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Respondent</p>
                        <p className="font-medium">{respondent}</p>
                      </div>
                      <div className="md:col-span-1">
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-sm text-muted-foreground">
                          {details.substring(0, 100)}{details.length > 100 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                    {record.remarks && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground">Remarks</p>
                        <p className="text-sm">{record.remarks}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <AddBlotterDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            fetchBlotterRecords(); // Refresh data when dialog closes
          }
        }} 
      />

      <ViewBlotterDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        record={selectedRecord}
      />
    </MainLayout>
  );
};

export default Blotter;
