import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { addSuggestion, getSuggestions } from "@/db/queries";
import { Suggestion } from "@/types/database";

interface FormData {
  name: string;
  contact: string;
  description: string;
}

import Sidebar from "@/components/layout/Sidebar";

export default function UserWalkInComplaint() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact: "",
    description: "",
  });
  const [complaints, setComplaints] = useState<Suggestion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });



  useEffect(() => {
    loadComplaints();
    
    // Polling for real-time updates (admin responses)
    const pollInterval = setInterval(() => {
      loadComplaints();
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, []);

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
        resolved: walkInComplaints.filter((c) => c.status === "addressed").length,
      });
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    setLoading(true);
    try {
      await addSuggestion({
        type: "complaint",
        name: formData.name,
        phone: formData.contact,
        message: `WALK-IN: ${formData.description}`,
        status: "pending",
      });

      setMessage({
        type: "success",
        text: "Walk-in complaint submitted successfully!",
      });
      setFormData({ name: "", contact: "", description: "" });
      setShowForm(false);

      setTimeout(() => {
        loadComplaints();
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to submit complaint. Please try again.",
      });
      console.error("Error submitting complaint:", error);
    } finally {
      setLoading(false);
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
    return type === "complaint"
      ? "bg-red-100 text-red-800"
      : "bg-purple-100 text-purple-800";
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar mode="user" />
      <div className="flex-1 pl-64 p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Walk-In Complaints</h1>
        <p className="text-gray-600">
          File a complaint when visiting the barangay office
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Complaints
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
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.resolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit New Complaint Button */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            File New Complaint
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              File Walk-In Complaint
            </DialogTitle>
            <DialogDescription>
              Submit your complaint while visiting the barangay office
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <Input
                placeholder="Enter your contact number"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                type="tel"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Complaint Details <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe your complaint in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complaints List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Walk-In Records
        </h2>

        {complaints.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">No walk-in complaints filed yet</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
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
                        {complaint.response && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <span>✓</span>
                            <span>Responded</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
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
                        <div className="mt-3 p-3 bg-green-50 rounded-md border-2 border-green-200 animate-pulse">
                          <p className="text-xs font-bold text-green-900 mb-1 flex items-center gap-2">
                            ✓ Admin Response
                          </p>
                          <p className="text-sm text-green-800 font-medium">
                            {complaint.response}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
