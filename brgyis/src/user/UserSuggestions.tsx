import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { addSuggestion, getSuggestions } from "@/db/queries";

import { Lightbulb, AlertTriangle, CheckCircle, Clock, Send, Eye } from "lucide-react";
import type { Suggestion } from "@/types/database";

const UserSuggestions = () => {
  const [formData, setFormData] = useState({
    type: "suggestion" as "suggestion" | "complaint",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<Suggestion[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const fetchUserSuggestions = async () => {
    setLoadingFeedback(true);
    try {
      const data = await getSuggestions();
      // Filter by name to show only this user's suggestions
      const filtered = data.filter(s => s.name?.toLowerCase() === formData.name.toLowerCase());
      setUserSuggestions(filtered);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (formData.name.trim()) {
      fetchUserSuggestions();
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Name and message are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const suggestionData = {
        type: formData.type as "suggestion" | "complaint",
        name: formData.name,
        email: formData.email && formData.email.trim() ? formData.email : undefined,
        phone: formData.phone && formData.phone.trim() ? formData.phone : undefined,
        message: formData.message,
        status: "pending" as const,
      };
      
      await addSuggestion(suggestionData);



      toast({
        title: "Success",
        description: `Your ${formData.type === "suggestion" ? "suggestion" : "complaint"} has been submitted successfully. Thank you for your feedback!`,
      });

      setFormData({
        type: "suggestion",
        name: formData.name,
        email: "",
        phone: "",
        message: "",
      });

      // Refresh list
      fetchUserSuggestions();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "addressed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "suggestion" ? (
      <Lightbulb className="h-4 w-4 text-blue-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "reviewed":
        return <Eye className="h-4 w-4 text-blue-600" />;
      case "addressed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar mode="user" />
      <div className="flex-1 pl-64 p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Submit Feedback</h1>
        <p className="text-muted-foreground">
          Share your suggestions or complaints to help us improve our services
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Feedback</CardTitle>
              <CardDescription>
                We value your input and will respond to your feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="font-semibold">
                      Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          type: value as "suggestion" | "complaint",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-semibold">
                      Your Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+63 9XX-XXX-XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-semibold">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Please describe your suggestion or complaint in detail..."
                    rows={5}
                    required
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Your Total Submissions</p>
                <p className="text-3xl font-bold">{userSuggestions.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {userSuggestions.filter(s => s.status === "pending").length}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Addressed</p>
                <p className="text-2xl font-bold text-green-600">
                  {userSuggestions.filter(s => s.status === "addressed").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Feedback Section */}
      {userSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Feedback History</CardTitle>
            <CardDescription>
              Track the status of your submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingFeedback ? (
                <div className="text-center py-8">Loading feedback...</div>
              ) : (
                userSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(suggestion.type)}
                        <span className="font-semibold capitalize">
                          {suggestion.type}
                        </span>
                      </div>
                      <Badge className={getStatusBadgeColor(suggestion.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(suggestion.status)}
                          {suggestion.status.charAt(0).toUpperCase() +
                            suggestion.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {suggestion.message}
                    </p>
                    {suggestion.response && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          Response from Barangay:
                        </p>
                        <p className="text-sm text-blue-800">
                          {suggestion.response}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(suggestion.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
export default UserSuggestions;
