import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Eye,
  MessageSquare,
  Mail,
  Phone,
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
import { getSuggestions, updateSuggestion } from "@/db/queries";
import type { Suggestion } from "@/types/database";
import { AddSuggestionDialog, ViewSuggestionDialog } from "@/components/suggestions";

const AdminSuggestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getSuggestions();
      setSuggestions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    const interval = setInterval(() => fetchSuggestions(), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === id);
      if (suggestion) {
        await updateSuggestion(id, { status: newStatus as any });
        toast({ title: "Success", description: "Status updated successfully" });
        fetchSuggestions();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const filteredSuggestions = suggestions.filter((suggestion) => {
    const matchesSearch =
      suggestion.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || suggestion.type === typeFilter;
    const matchesStatus = statusFilter === "all" || suggestion.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const statusCounts = {
    pending: suggestions.filter((s) => s.status === "pending").length,
    reviewed: suggestions.filter((s) => s.status === "reviewed").length,
    addressed: suggestions.filter((s) => s.status === "addressed").length,
  };

  const typeCounts = {
    suggestion: suggestions.filter((s) => s.type === "suggestion").length,
    complaint: suggestions.filter((s) => s.type === "complaint").length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: AlertTriangle },
      reviewed: { variant: "default", icon: Eye },
      addressed: { variant: "default", icon: CheckCircle },
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

  const getTypeBadge = (type: string) => {
    if (type === "suggestion") {
      return (
        <Badge variant="outline" className="gap-1 bg-blue-50">
          <Lightbulb className="h-3 w-3 text-blue-600" />
          <span className="text-blue-600">Suggestion</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 bg-red-50">
        <AlertTriangle className="h-3 w-3 text-red-600" />
        <span className="text-red-600">Complaint</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suggestions</h1>
          <p className="text-muted-foreground">Manage resident feedback and complaints</p>
        </div>
        <Button onClick={() => { setIsAddDialogOpen(true); fetchSuggestions(); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Feedback
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeCounts.suggestion}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeCounts.complaint}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Addressed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.addressed}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="suggestion">Suggestions</SelectItem>
              <SelectItem value="complaint">Complaints</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="addressed">Addressed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-8">No suggestions or complaints found</div>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{suggestion.name}</h3>
                      {getTypeBadge(suggestion.type)}
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{suggestion.message}</p>
                    <div className="text-sm text-muted-foreground grid grid-cols-3 gap-3">
                      {suggestion.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {suggestion.email}
                        </p>
                      )}
                      {suggestion.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {suggestion.phone}
                        </p>
                      )}
                      <p className="text-xs">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Select
                      value={suggestion.status}
                      onValueChange={(value) => handleStatusChange(suggestion.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="addressed">Addressed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      <AddSuggestionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchSuggestions}
      />

      {selectedSuggestion && (
        <ViewSuggestionDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          suggestion={selectedSuggestion}
          onSuccess={fetchSuggestions}
        />
      )}
    </div>
  );
};

export default AdminSuggestions;
