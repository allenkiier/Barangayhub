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
import { User, Calendar, Phone, Mail, MapPin, Heart, Users } from "lucide-react";
import type { Resident } from "@/types/database";

interface ViewResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: Resident | null;
}

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const ViewResidentDialog = ({
  open,
  onOpenChange,
  resident,
}: ViewResidentDialogProps) => {
  if (!resident) return null;

  const age = calculateAge(resident.dateOfBirth);
  const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-success text-success-foreground",
      inactive: "bg-muted text-muted-foreground",
      moved: "bg-warning text-warning-foreground",
    };
    return styles[status] || "bg-secondary text-secondary-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <User className="h-5 w-5" />
            Resident Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this resident
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2 space-y-6 py-4">
          {/* Name and Status */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Full Name</Label>
            <p className="text-xl font-semibold">{fullName}</p>
            <div className="flex gap-2">
              <Badge className={getStatusBadge(resident.status)}>
                {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Age and Date of Birth */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Age
              </Label>
              <p className="text-2xl font-bold text-primary">{age} years old</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth
              </Label>
              <p className="text-base">
                {new Date(resident.dateOfBirth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Gender and Civil Status */}
          {(resident.gender || resident.civilStatus) && (
            <div className="grid grid-cols-2 gap-4">
              {resident.gender && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gender
                  </Label>
                  <p className="text-base capitalize">{resident.gender}</p>
                </div>
              )}
              {resident.civilStatus && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Civil Status
                  </Label>
                  <p className="text-base capitalize">{resident.civilStatus}</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            {resident.phone && (
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <p className="text-base">{resident.phone}</p>
              </div>
            )}
            {resident.email && (
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <p className="text-base break-words">{resident.email}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <div className="bg-muted p-4 rounded-lg border">
              <p className="text-sm">{resident.address}</p>
            </div>
          </div>

          {/* Record Information */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Resident ID: <span className="font-mono">{resident.id}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Created: {new Date(resident.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last Updated: {new Date(resident.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewResidentDialog;
