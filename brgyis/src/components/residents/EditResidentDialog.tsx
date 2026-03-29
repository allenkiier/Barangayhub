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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
// import { updateResident } from "@/db/queries";
// import { persistDatabase } from "@/db/init";
import { Resident } from "@/types/database";

interface EditResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: Resident | null;
  onResidentUpdated?: () => void;
}

const EditResidentDialog = ({
  open,
  onOpenChange,
  resident,
  onResidentUpdated,
}: EditResidentDialogProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    address: "",
    birthdate: "",
    gender: "",
    civilStatus: "",
    contact: "",
    isPWD: "no",
    status: "active" as "active" | "inactive" | "moved",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resident) {
      setFormData({
        firstName: resident.firstName,
        lastName: resident.lastName,
        middleName: resident.middleName || "",
        address: resident.address,
        birthdate: resident.dateOfBirth,
        gender: resident.gender || "",
        civilStatus: resident.civilStatus || "",
        contact: resident.phone || "",
        isPWD: resident.isPWD ? "yes" : "no",
        status: resident.status,
      });
    }
  }, [resident, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/residents/${resident.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || undefined,
          dateOfBirth: formData.birthdate,
          email: undefined,
          phone: formData.contact || undefined,
          address: formData.address,
          gender: formData.gender as 'male' | 'female' | 'other' || undefined,
          civilStatus: formData.civilStatus as 'single' | 'married' | 'widowed' | 'divorced' | 'separated' || undefined,
          isPWD: formData.isPWD === "yes",
          status: formData.status,
        }),
      });
      if (!res.ok) throw new Error("Failed to update resident");
      toast({
        title: "Resident Updated",
        description: `${formData.firstName} ${formData.lastName} has been updated.`,
      });
      if (typeof onResidentUpdated === 'function') onResidentUpdated();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update resident');
      toast({ title: "Error", description: err?.message || "Failed to update resident." });
      console.error('Update resident error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Resident</DialogTitle>
          <DialogDescription>
            Update the details of the resident.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="overflow-y-auto flex-1 pr-2">
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    setFormData({ ...formData, middleName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthdate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isPWD">PWD Status</Label>
                <select
                  id="isPWD"
                  value={formData.isPWD}
                  onChange={(e) =>
                    setFormData({ ...formData, isPWD: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="civilStatus">Civil Status</Label>
                <select
                  id="civilStatus"
                  value={formData.civilStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, civilStatus: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select Civil Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive" | "moved",
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="moved">Moved</option>
                </select>
              </div>
            </div>
          </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditResidentDialog;
