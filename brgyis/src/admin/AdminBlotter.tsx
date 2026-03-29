import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Check,
  RotateCcw,
  Trash2,
} from "lucide-react";
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
import AddBlotterDialog from "@/components/blotter/AddBlotterDialog";
import ViewBlotterDialog from "@/components/blotter/ViewBlotterDialog";
import PrintableBlotterReport from "@/components/blotter/PrintableBlotterReport";
import { deleteBlotterRecord, getBlotterRecords, updateBlotterStatus } from "@/db/queries";

import type { BlotterRecord } from "@/types/database";

const AdminBlotter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBlotter, setSelectedBlotter] = useState<BlotterRecord | null>(null);
  const [blotters, setBlotters] = useState<BlotterRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const attemptedReloadOnEmptyRef = useRef(false);

  const fetchBlotters = async () => {
    setLoading(true);
    try {
      const data = await getBlotterRecords();
      // Worker may initialize with an empty in-memory DB without throwing.
      // Try one recovery pass from persisted storage when the first read is empty.
      if (data.length === 0 && !attemptedReloadOnEmptyRef.current) {
        attemptedReloadOnEmptyRef.current = true;

        const recovered = await getBlotterRecords();
        setBlotters(recovered);
      } else {
        setBlotters(data);
      }
    } catch (error) {
      try {
        // Recover if worker DB was reset in-memory by reloading persisted DB, then retry once.
        await reloadDatabase();
        const recovered = await getBlotterRecords();
        setBlotters(recovered);
      } catch (retryError) {
        console.error("Failed to fetch blotter reports:", retryError);
        toast({
          title: "Unable to load blotter reports",
          description: "The system could not load records. Please refresh and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlotters();
    // Poll for new blotters every 10 seconds so admin sees updates immediately
    const interval = setInterval(() => fetchBlotters(), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateBlotterStatus(id, newStatus as any);
      toast({ title: "Success", description: "Status updated successfully" });
      fetchBlotters();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDeletePending = async (id: string) => {
    const confirmed = window.confirm("Delete this pending blotter report?");
    if (!confirmed) return;

    try {
      await deleteBlotterRecord(id);
      toast({ title: "Success", description: "Pending blotter report deleted" });
      fetchBlotters();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete report", variant: "destructive" });
    }
  };

  const filteredBlotters = blotters.filter((blotter) => {
    const matchesSearch =
      blotter.reporterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blotter.reporterContact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blotter.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blotter.incidentLocation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || blotter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    pending: blotters.filter((b) => b.status === "pending").length,
    investigating: blotters.filter((b) => b.status === "investigating").length,
    resolved: blotters.filter((b) => b.status === "resolved").length,
    closed: blotters.filter((b) => b.status === "closed").length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      investigating: { variant: "default", icon: AlertTriangle },
      resolved: { variant: "default", icon: CheckCircle },
      closed: { variant: "secondary", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blotter Reports</h1>
          <p className="text-muted-foreground">Manage incident reports and complaints</p>
        </div>
        <Button onClick={() => { setIsAddDialogOpen(true); fetchBlotters(); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Report
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Investigating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.investigating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blotter reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBlotters.length === 0 ? (
            <div className="text-center py-8">No blotter reports found</div>
          ) : (
            filteredBlotters.map((blotter) => (
              <Card key={blotter.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{blotter.reporterName}</h3>
                      {getStatusBadge(blotter.status)}
                    </div>
                    <div className="text-sm text-muted-foreground grid grid-cols-3 gap-3">
                      <p><strong>Reporter:</strong> {blotter.reporterName}</p>
                      <p><strong>Contact:</strong> {blotter.reporterContact}</p>
                      <p><strong>Location:</strong> {blotter.incidentLocation}</p>
                      <p><strong>Date:</strong> {new Date(blotter.incidentDate).toLocaleDateString()}</p>
                      {blotter.summonDate && (
                        <p><strong>Summon Date:</strong> {new Date(blotter.summonDate).toLocaleDateString()}</p>
                      )}
                      {blotter.summonTime && (
                        <p><strong>Summon Time:</strong> {blotter.summonTime}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBlotter(blotter);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {blotter.status === 'investigating' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStatusChange(blotter.id, 'resolved')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                    {blotter.status === 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(blotter.id, 'investigating')}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reopen
                      </Button>
                    )}
                    {blotter.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePending(blotter.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                    <Select
                      value={blotter.status}
                      onValueChange={(value) => handleStatusChange(blotter.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      <AddBlotterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchBlotters}
      />

      {selectedBlotter && (
        <ViewBlotterDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          record={selectedBlotter}
        />
      )}
    </div>
  );
};

export default AdminBlotter;
