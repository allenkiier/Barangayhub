import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileText, User, Calendar, MapPin, Clock, X } from "lucide-react";
import type { Document } from "@/types/database";

interface ViewDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  residentName?: string;
}

const ViewDocumentDialog = ({
  open,
  onOpenChange,
  document,
  residentName,
}: ViewDocumentDialogProps) => {
  if (!document) return null;

  // Parse content to extract purpose and remarks
  const contentLines = (document.content || '').split('\n');
  const purpose = contentLines[0]?.replace('Purpose: ', '') || 'N/A';
  const remarks = contentLines[1]?.replace('Remarks: ', '') || 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this document
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2 space-y-6 py-4">
          {/* Document Type */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Type
            </Label>
            <p className="text-lg font-medium">{document.type}</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Status</Label>
            <div>
              <Badge
                variant={document.status === "issued" ? "default" : "secondary"}
                className={
                  document.status === "issued"
                    ? "bg-success text-success-foreground"
                    : "bg-warning text-warning-foreground"
                }
              >
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Resident Name */}
          {residentName && (
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Issued To
              </Label>
              <p className="text-base">{residentName}</p>
            </div>
          )}

          {/* Issue Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Issued
              </Label>
              <p className="text-base">
                {new Date(document.issueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expiry Date
              </Label>
              <p className="text-base">
                {new Date(document.expiryDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Purpose</Label>
            <p className="text-base bg-muted/50 rounded-md p-3">{purpose}</p>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Remarks</Label>
            <p className="text-base bg-muted/50 rounded-md p-3">{remarks}</p>
          </div>

          {/* Document ID */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Document ID</Label>
            <p className="text-xs font-mono bg-muted/30 rounded px-2 py-1 inline-block">
              {document.id}
            </p>
          </div>

          {/* Created/Updated */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Created At</Label>
              <p className="text-xs">
                {new Date(document.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="text-xs">
                {new Date(document.updatedAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDocumentDialog;
