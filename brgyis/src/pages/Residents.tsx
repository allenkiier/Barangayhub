import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import AddResidentDialog from "@/components/residents/AddResidentDialog";
import EditResidentDialog from "@/components/residents/EditResidentDialog";
import ViewResidentDialog from "@/components/residents/ViewResidentDialog";

// API endpoints for residents
import { Resident } from "@/types/database";
import { toast } from "@/hooks/use-toast";

const Residents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/residents");
      if (!res.ok) throw new Error("Failed to fetch residents");
      const data = await res.json();
      setResidents(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResidents(); }, []);

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setIsEditDialogOpen(true);
  };

  const handleView = (resident: Resident) => {
    setSelectedResident(resident);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (resident: Resident) => {
    if (!confirm(`Are you sure you want to delete ${resident.firstName} ${resident.lastName}?`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/residents/${resident.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete resident");
      toast({
        title: "Resident Deleted",
        description: `${resident.firstName} ${resident.lastName} has been deleted.`,
      });
      fetchResidents();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete resident.",
        variant: "destructive",
      });
      console.error('Delete resident error:', err);
    }
  };

  const filteredResidents = residents.filter(
    (resident) =>
      `${resident.firstName} ${resident.lastName} ${resident.middleName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resident.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Residents
            </h1>
            <p className="text-muted-foreground">
              Manage barangay resident records
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Resident
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search residents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card animate-slide-up">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Birthdate</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Civil Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.lastName}, {resident.firstName} {resident.middleName}</TableCell>
                  <TableCell>{resident.address}</TableCell>
                  <TableCell>{resident.dateOfBirth}</TableCell>
                  <TableCell>{resident.gender ? resident.gender.charAt(0).toUpperCase() + resident.gender.slice(1) : '-'}</TableCell>
                  <TableCell>{resident.civilStatus ? resident.civilStatus.charAt(0).toUpperCase() + resident.civilStatus.slice(1) : '-'}</TableCell>
                  <TableCell>{resident.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        resident.status === "active" ? "default" : "secondary"
                      }
                      className={
                        resident.status === "active"
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleView(resident)}>
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => handleEdit(resident)}>
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(resident)}>
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddResidentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onResidentAdded={fetchResidents} />
      <EditResidentDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        resident={selectedResident}
        onResidentUpdated={fetchResidents}
      />
      <ViewResidentDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        resident={selectedResident}
      />
    </MainLayout>
  );
};

export default Residents;
