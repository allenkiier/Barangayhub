import React, { useState, useEffect, ChangeEvent } from "react";
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import AddResidentDialog from "../components/residents/AddResidentDialog";
import EditResidentDialog from "../components/residents/EditResidentDialog";
import ViewResidentDialog from "../components/residents/ViewResidentDialog";
import { getResidents, deleteResident } from "../db/queries";

import { Resident } from "../types/database";
import { toast } from "../hooks/use-toast";

const AdminResidents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pwdFilter, setPwdFilter] = useState<"all" | "pwd" | "non-pwd">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const data = await getResidents();
      setResidents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResidents(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this resident?")) {
      try {
        await deleteResident(id);

        toast({ title: "Success", description: "Resident deleted successfully" });
        fetchResidents();
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete resident", variant: "destructive" });
      }
    }
  };

  const filteredResidents = residents.filter((resident) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = (
      resident.firstName?.toLowerCase().includes(search) ||
      resident.lastName?.toLowerCase().includes(search) ||
      resident.email?.toLowerCase().includes(search) ||
      resident.address?.toLowerCase().includes(search) ||
      resident.phone?.toLowerCase().includes(search) ||
      (resident.isPWD ? "pwd" : "non-pwd").includes(search)
    );

    const matchesPwd =
      pwdFilter === "all" ||
      (pwdFilter === "pwd" && !!resident.isPWD) ||
      (pwdFilter === "non-pwd" && !resident.isPWD);

    return matchesSearch && matchesPwd;
  });

  const maleResidentsCount = residents.filter((resident) => resident.gender?.toLowerCase() === "male").length;
  const femaleResidentsCount = residents.filter((resident) => resident.gender?.toLowerCase() === "female").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Residents Management</h1>
          <p className="text-muted-foreground">Manage barangay residents information</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground">Male Residents</p>
            <p className="text-2xl font-bold">{maleResidentsCount}</p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground">Female Residents</p>
            <p className="text-2xl font-bold">{femaleResidentsCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search residents or type PWD..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setPwdFilter((prev) =>
                prev === "all" ? "pwd" : prev === "pwd" ? "non-pwd" : "all"
              )
            }
          >
            <Filter className="h-4 w-4 mr-2" />
            {pwdFilter === "all" ? "All" : pwdFilter === "pwd" ? "PWD" : "Non-PWD"}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>PWD</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredResidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No residents found</TableCell>
                </TableRow>
              ) : (
                filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">
                      {resident.firstName} {resident.middleName ? resident.middleName + " " : ""}{resident.lastName}
                    </TableCell>
                    <TableCell>{resident.email || "-"}</TableCell>
                    <TableCell>{resident.phone || "-"}</TableCell>
                    <TableCell>{resident.address || "-"}</TableCell>
                    <TableCell>{resident.isPWD ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Badge variant={resident.status === "active" ? "default" : "secondary"}>
                        {resident.status === "active" ? "Active" : resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedResident(resident);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedResident(resident);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(resident.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddResidentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onResidentAdded={fetchResidents}
      />

      {selectedResident && (
        <>
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
        </>
      )}
    </div>
  );
};

export default AdminResidents;
