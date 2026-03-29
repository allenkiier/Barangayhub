import { useState, useEffect } from "react";
import { Phone, Mail, Calendar, Edit2, Plus, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditOfficialDialog from "@/components/officials/EditOfficialDialog";
import { getOfficials, updateOfficial, deleteOfficial } from "@/db/queries";

import { toast } from "@/hooks/use-toast";
import type { Official } from "@/types/database";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const Officials = () => {
  const [officialsData, setOfficialsData] = useState<any[]>([]);
  const [dbOfficials, setDbOfficials] = useState<Official[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      setLoading(true);
      const data = await getOfficials();
      if (data.length > 0) {
        // Convert database format to display format
        const formatted = data.map((official) => ({
          id: official.id,
          name: `${official.firstName} ${official.lastName}`,
          firstName: official.firstName,
          lastName: official.lastName,
          position: official.position,
          term: official.term || '2022-2025',
          contact: official.phone || 'N/A',
          email: official.email || 'N/A',
          status: 'Active',
          committee: 'N/A',
        }));
        
        // Sort so Barangay Captain is always first
        const sorted = formatted.sort((a, b) => {
          const aIsCaptain = a.position.toLowerCase().includes('captain');
          const bIsCaptain = b.position.toLowerCase().includes('captain');
          if (aIsCaptain && !bIsCaptain) return -1;
          if (!aIsCaptain && bIsCaptain) return 1;
          return 0;
        });
        
        setOfficialsData(sorted);
        setDbOfficials(data);
      }
    } catch (error) {
      console.error('Error fetching officials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (official: any) => {
    setSelectedOfficial(official);
    setIsEditDialogOpen(true);
  };

  const handleSaveOfficial = async (updatedOfficial: any) => {
    try {
      // Split name if needed
      let firstName = updatedOfficial.firstName || updatedOfficial.name.split(' ')[0];
      let lastName = updatedOfficial.lastName || updatedOfficial.name.split(' ').slice(1).join(' ');

      // Check if this is a database official or hardcoded one
      const isDbOfficial = typeof updatedOfficial.id === 'string';

      if (isDbOfficial) {
        // Update existing database official
        await updateOfficial(updatedOfficial.id, {
          firstName,
          lastName,
          position: updatedOfficial.position,
          email: updatedOfficial.email,
          phone: updatedOfficial.contact,
          term: updatedOfficial.term,
        });
      } else {
        // This is a hardcoded official, we need to add it to the database first
        const { addOfficial } = await import('@/db/queries');
        await addOfficial({
          firstName,
          lastName,
          position: updatedOfficial.position,
          email: updatedOfficial.email,
          phone: updatedOfficial.contact,
          term: updatedOfficial.term,
        });
      }


      // Database persistence is now handled by the backend (MySQL)

      // Refresh the list
      await fetchOfficials();

      toast({
        title: 'Official Updated',
        description: `${updatedOfficial.name}'s information has been saved successfully.`,
      });
    } catch (error) {
      console.error('Error updating official:', error);
      toast({
        title: 'Error',
        description: 'Failed to update official. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOfficial = async (official: any) => {
    const isDbOfficial = typeof official.id === 'string';
    
    if (!isDbOfficial) {
      toast({
        title: 'Cannot Delete',
        description: 'This is a default official and cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${official.name}?`)) {
      return;
    }

    try {
      await deleteOfficial(official.id);

      // Database persistence is now handled by the backend (MySQL)
      await fetchOfficials();

      toast({
        title: 'Official Deleted',
        description: `${official.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error('Error deleting official:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete official. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const displayOfficials = officialsData;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Barangay Officials
              </h1>
              <p className="text-muted-foreground">
                Current elected and appointed officials
              </p>
            </div>
            <Button onClick={() => handleEditClick({ id: 0, name: '', position: '', term: '', contact: '', email: '', status: 'Active', committee: '' })} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Official
            </Button>
          </div>
        </div>

        {/* Captain Card - Featured */}
        {displayOfficials.length > 0 ? (
          <Card className="gradient-hero text-primary-foreground overflow-hidden animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white/20">
                  <AvatarFallback className="bg-white/20 text-2xl font-bold">
                    {getInitials(displayOfficials[0].name)}
                  </AvatarFallback>
                </Avatar>
                  <div>
                    <Badge className="bg-white/20 text-primary-foreground mb-2">
                      {displayOfficials[0].committee || "N/A"}
                    </Badge>
                    <CardTitle className="text-2xl">{displayOfficials[0].name}</CardTitle>
                    <CardDescription className="text-primary-foreground/80 text-lg">
                      {displayOfficials[0].position}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(displayOfficials[0])}
                    className="text-white hover:bg-white/20"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {typeof displayOfficials[0].id === 'string' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOfficial(displayOfficials[0])}
                      className="text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 opacity-80" />
                  <span>Term: {displayOfficials[0].term || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 opacity-80" />
                  <span>{displayOfficials[0].contact || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-80" />
                  <span>{displayOfficials[0].email || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="gradient-hero text-primary-foreground overflow-hidden animate-slide-up">
            <CardContent className="py-12">
              <p className="text-center text-lg opacity-80">No officials added yet. Click "Add Official" to get started.</p>
            </CardContent>
          </Card>
        )}

        {/* Other Officials Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayOfficials.slice(1).map((official, index) => (
            <Card
              key={official.id}
              className="transition-all hover:shadow-card-hover animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(official.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">
                        {official.name}
                      </CardTitle>
                      <CardDescription>{official.position}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(official)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {typeof official.id === 'string' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOfficial(official)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary" className="text-xs">
                  {official.committee}
                </Badge>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{official.term}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{official.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{official.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <EditOfficialDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          official={selectedOfficial}
          onSave={handleSaveOfficial}
        />
      </div>
    </MainLayout>
  );
};

export default Officials;
