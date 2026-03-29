import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, MessageSquare, Lightbulb, AlertTriangle } from "lucide-react";
import type { Suggestion } from "@/types/database";
import { updateSuggestion } from "@/db/queries";
import { toast } from "@/hooks/use-toast";

interface ViewSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: Suggestion | null;
  onSuccess?: () => void;
}

const ViewSuggestionDialog = ({
  open,
  onOpenChange,
  suggestion,
  onSuccess,
}: ViewSuggestionDialogProps) => {
  const [response, setResponse] = useState(suggestion?.response || "");
  const [loading, setLoading] = useState(false);

  if (!suggestion) return null;

  const handleSaveResponse = async () => {
    setLoading(true);
    try {
      await updateSuggestion(suggestion.id, { response });
      toast({ title: "Success", description: "Response saved successfully" });
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save response", variant: "destructive" });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {suggestion.type === "suggestion" ? (
              <Lightbulb className="h-5 w-5 text-blue-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            {suggestion.type === "suggestion" ? "Suggestion" : "Complaint"} Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{suggestion.name}</h3>
              <Badge className={getStatusBadgeColor(suggestion.status)}>
                {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {suggestion.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {suggestion.email}
                </p>
              )}
              {suggestion.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {suggestion.phone}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {new Date(suggestion.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Label>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap text-sm">
              {suggestion.message}
            </div>
          </div>

          {/* Response */}
          <div className="space-y-2">
            <Label htmlFor="response" className="font-semibold">Response/Action Taken (Optional)</Label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Document your response or action taken to address this feedback..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Close
          </Button>
          <Button 
            onClick={handleSaveResponse}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSuggestionDialog;
