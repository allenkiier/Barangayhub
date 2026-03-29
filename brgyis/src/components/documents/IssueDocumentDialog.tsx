import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
// import { addDocument, getResidents } from "@/db/queries";
import { persistDatabase } from "@/db/init";
import type { Resident } from "@/types/database";

interface IssueDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType?: string | null;
}

const documentTypes = [
  { value: "clearance", label: "Barangay Clearance" },
  { value: "residency", label: "Certificate of Residency" },
  { value: "indigency", label: "Certificate of Indigency" },
  { value: "business", label: "Business Permit" },
];

const IssueDocumentDialog = ({
  open,
  onOpenChange,
  documentType,
}: IssueDocumentDialogProps) => {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    documentType: documentType || "",
    residentId: "",
    residentName: "",
    purpose: "",
    remarks: "",
    // User-specific fields
    fullName: "",
    email: "",
    contactNumber: "",
    address: "",
  });
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const res = await fetch('/api/residents');
        const data = await res.json();
        setResidents(data);
      } catch (error) {
        console.error("Error fetching residents:", error);
      }
    };
    if (open && role === "admin") {
      fetchResidents();
    }
    
    // Pre-fill user info from Gmail
    if (open && role === "user") {
      const gmailUser = JSON.parse(localStorage.getItem('barangayGmailUser') || '{}');
      setFormData(prev => ({
        ...prev,
        email: gmailUser.email || '',
        fullName: '', // Leave blank for user to fill
      }));
    }
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const issueDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const documentContent = role === "user" 
        ? `Requester: ${formData.fullName}\nEmail: ${formData.email}\nContact: ${formData.contactNumber}\nAddress: ${formData.address}\nPurpose: ${formData.purpose}\nRemarks: ${formData.remarks}`
        : `Purpose: ${formData.purpose}\nRemarks: ${formData.remarks}`;

      const documentData = {
        type: documentTypes.find(t => t.value === formData.documentType)?.label || formData.documentType,
        residentId: role === "admin" ? (formData.residentId || null) : formData.email,
        issueDate,
        expiryDate: expiryDate.toISOString().split('T')[0],
        content: documentContent,
        status: role === "user" ? 'pending' : 'issued',
      };

      console.log('[IssueDocumentDialog] Adding document:', documentData);

      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      });
      // Optionally: refresh or notify parent

      toast({
        title: role === "user" ? "Document Requested" : "Document Issued",
        description: role === "user" 
          ? "Your document request has been submitted successfully. You will be notified once it's processed."
          : `Document has been issued successfully for ${formData.residentName}.`,
      });
      
      // Close dialog and reset form
      onOpenChange(false);
      setFormData({
        documentType: "",
        residentId: "",
        residentName: "",
        purpose: "",
        remarks: "",
        fullName: "",
        email: "",
        contactNumber: "",
        address: "",
      });
    } catch (error) {
      console.error("Error issuing document:", error);
      toast({
        title: "Error",
        description: "Failed to issue document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {role === "user" ? "Request Document" : "Issue Document"}
          </DialogTitle>
          <DialogDescription>
            {role === "user" 
              ? "Fill in your details to request a barangay document. Your request will be reviewed by the admin."
              : "Fill in the details to issue a new barangay document."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 py-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-sm font-semibold">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.documentType || documentType || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, documentType: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === "admin" ? (
              <div className="space-y-2">
                <Label htmlFor="residentName" className="text-sm font-semibold">
                  Resident <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.residentId}
                  onValueChange={(value) => {
                    const resident = residents.find(r => r.id === value);
                    setFormData({ 
                      ...formData, 
                      residentId: value,
                      residentName: resident ? `${resident.firstName} ${resident.lastName}` : ''
                    });
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map((resident) => (
                      <SelectItem key={resident.id} value={resident.id}>
                        {resident.firstName} {resident.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Juan Dela Cruz"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="juan@gmail.com"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-sm font-semibold">
                    Contact Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, contactNumber: e.target.value })
                    }
                    placeholder="09123456789"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold">
                    Complete Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Zone 1, Barangay Name, City"
                    rows={2}
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-sm font-semibold">
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                placeholder="Enter the purpose of the document (e.g., Employment, School requirement, Loan application)"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-sm font-semibold">
                Additional Remarks
              </Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Any additional notes or special requests (optional)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[140px]">
              {loading ? (role === "user" ? "Sending..." : "Issuing...") : (role === "user" ? "Send Request" : "Issue Document")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDocumentDialog;
