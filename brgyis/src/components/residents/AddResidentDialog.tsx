import { useState } from "react";
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

// import { addResident } from "@/db/queries";
// import { persistDatabase } from "@/db/init";
interface AddResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResidentAdded?: () => void;
}

const AddResidentDialog = ({ open, onOpenChange, onResidentAdded }: AddResidentDialogProps) => {
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
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/api/residents", {
        method: "POST",
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
          status: "active",
        }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || error?.details || 'Failed to add resident');
      }
      toast({
        title: "Resident Added",
        description: `${formData.firstName} ${formData.lastName} has been added to the records.`,
      });
      if (typeof onResidentAdded === 'function') onResidentAdded();
      onOpenChange(false);
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        address: "",
        birthdate: "",
        gender: "",
        civilStatus: "",
        contact: "",
        isPWD: "no",
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to add resident');
      toast({ title: "Error", description: err?.message || "Failed to add resident." });
      console.error('Add resident error:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Resident</DialogTitle>
          <DialogDescription>
            Enter the details of the new resident.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && <div className="text-red-500 mb-2">{error}</div>}
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
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    setFormData({ ...formData, middleName: e.target.value })
                  }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
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
                  required
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
                  placeholder="09XX XXX XXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isPWD">PWD Status</Label>
                <Select
                  value={formData.isPWD}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isPWD: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PWD status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="civilStatus">Civil Status</Label>
                <Select
                  value={formData.civilStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, civilStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                    <SelectItem value="Separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Resident</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddResidentDialog;
