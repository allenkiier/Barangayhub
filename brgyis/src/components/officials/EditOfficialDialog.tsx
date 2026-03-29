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
import { toast } from "@/hooks/use-toast";

interface Official {
  id: number;
  name: string;
  position: string;
  term: string;
  contact: string;
  email: string;
  status: string;
  committee: string;
}

interface EditOfficialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  official: Official | null;
  onSave: (official: Official) => void;
}

const EditOfficialDialog = ({
  open,
  onOpenChange,
  official,
  onSave,
}: EditOfficialDialogProps) => {
  const [formData, setFormData] = useState<Official>(
    official || {
      id: 0,
      name: "",
      position: "",
      term: "",
      contact: "",
      email: "",
      status: "Active",
      committee: "",
    }
  );

  useEffect(() => {
    if (official) {
      setFormData(official);
    }
  }, [official]);

  const handleChange = (field: keyof Official, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.position || !formData.contact || !formData.email) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
    toast({
      title: "Official Updated",
      description: `${formData.name}'s information has been updated successfully.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{official?.id ? 'Edit Official' : 'Add Official'}</DialogTitle>
          <DialogDescription>
            {official?.id ? 'Update the information of the barangay official.' : 'Add a new barangay official to the system.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Hon. Roberto M. Santos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="e.g., Barangay Captain"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="committee">Committee</Label>
                <Input
                  id="committee"
                  value={formData.committee}
                  onChange={(e) => handleChange("committee", e.target.value)}
                  placeholder="e.g., Executive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term</Label>
                <Input
                  id="term"
                  value={formData.term}
                  onChange={(e) => handleChange("term", e.target.value)}
                  placeholder="e.g., 2022-2025"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                placeholder="e.g., 09171234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g., official@barangay.gov.ph"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                placeholder="e.g., Active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{official?.id ? 'Save Changes' : 'Add Official'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOfficialDialog;
