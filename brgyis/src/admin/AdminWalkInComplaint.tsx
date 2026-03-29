import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { useDatabaseQueries } from "@/db/hooks";
import { Suggestion } from "@/types/database";

interface FormData {
  name: string;
  contact: string;
  description: string;
}

export default function AdminWalkInComplaint() {
  const [complaints, setComplaints] = useState<Suggestion[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] =
    useState<Suggestion | null>(null);
  const [responseText, setResponseText] = useState("");
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    addressed: 0,
  });

  const { getSuggestions, updateSuggestion } =
    useDatabaseQueries();

  useEffect(() => {
    loadComplaints();
    
    // Polling for real-time updates
    const pollInterval = setInterval(() => {
      loadComplaints();
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter]);

  const loadComplaints = async () => {
    try {
      const data = await getSuggestions();
      const walkInComplaints = data.filter(
        (c) => c.message && c.message.includes("WALK-IN:")
      );
      setComplaints(walkInComplaints);

      setStats({
        total: walkInComplaints.length,
        pending: walkInComplaints.filter((c) => c.status === "pending").length,
        reviewed: walkInComplaints.filter((c) => c.status === "reviewed").length,
        addressed: walkInComplaints.filter((c) => c.status === "addressed").length,
      });
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredComplaints(filtered);
  };

  const handleAddResponse = async () => {
    if (!selectedComplaint || !responseText.trim()) {
      setMessage({ type: "error", text: "Please enter a response" });
      return;
    }

    try {
      await updateSuggestion(selectedComplaint.id, {
        response: responseText,
        status: "addressed",
      });

      setMessage({
        type: "success",
        text: "Response added successfully!",
      });
      setResponseText("");
      setShowResponseDialog(false);
      setSelectedComplaint(null);

      setTimeout(() => {
        loadComplaints();
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add response" });
      console.error("Error adding response:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "addressed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Walk-In Complaints</h1>
          </div>
          <p className="text-gray-600">
            Record and manage walk-in visitor complaints
          </p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription
            className={message.type === "error" ? "text-red-800" : "text-green-800"}
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Walk-Ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.reviewed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Addressed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.addressed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="addressed">Addressed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-3">
              <Clock className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">No walk-in complaints found</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {complaint.name}
                        </h3>
                        <Badge className={getTypeColor(complaint.type)}>
                          {complaint.type}
                        </Badge>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {complaint.message?.replace("WALK-IN: ", "")}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {complaint.phone && (
                          <span>📱 {complaint.phone}</span>
                        )}
                        <span>
                          📅{" "}
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {complaint.response && (
                        <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                          <p className="text-xs font-medium text-green-900">
                            ✓ Addressed
                          </p>
                          <p className="text-sm text-green-800">
                            {complaint.response}
                          </p>
                        </div>
                      )}
                    </div>
                    <Dialog open={showResponseDialog && selectedComplaint?.id === complaint.id} onOpenChange={setShowResponseDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Complaint Details</DialogTitle>
                        </DialogHeader>
                        {selectedComplaint && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-600">Name</p>
                                <p className="font-semibold">
                                  {selectedComplaint.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Contact</p>
                                <p className="font-semibold">
                                  {selectedComplaint.phone || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Type</p>
                                <p className="font-semibold">
                                  {selectedComplaint.type}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Status</p>
                                <Badge
                                  className={getStatusColor(
                                    selectedComplaint.status
                                  )}
                                >
                                  {selectedComplaint.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                Complaint
                              </p>
                              <p className="p-3 bg-gray-50 rounded-md text-sm text-gray-800">
                                {selectedComplaint.message?.replace(
                                  "WALK-IN: ",
                                  ""
                                )}
                              </p>
                            </div>

                            {!selectedComplaint.response && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Add Response
                                </p>
                                <Textarea
                                  placeholder="Enter your response..."
                                  value={responseText}
                                  onChange={(e) =>
                                    setResponseText(e.target.value)
                                  }
                                  rows={4}
                                />
                              </div>
                            )}

                            {selectedComplaint.response && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Response
                                </p>
                                <p className="p-3 bg-green-50 rounded-md text-sm text-green-800 border border-green-200">
                                  {selectedComplaint.response}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-3 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowResponseDialog(false);
                                  setSelectedComplaint(null);
                                  setResponseText("");
                                }}
                              >
                                Close
                              </Button>
                              {!selectedComplaint.response && (
                                <Button
                                  onClick={handleAddResponse}
                                  className="bg-green-600 hover:bg-green-700 gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Submit Response
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
