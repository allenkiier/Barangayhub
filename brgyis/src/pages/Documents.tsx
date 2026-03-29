
import { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getCurrentUser } from "../lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, Printer, MoreVertical, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Document, Resident } from "../types/database";
import { toast } from "sonner";

type DocumentRow = Document & { residentName: string };

const statusColor = (s: string) => {
  switch (s) {
    case "issued": return "default";
    case "pending": return "secondary";
    case "rejected": return "destructive";
    //
    default: return "secondary";
  }
};

const Documents = () => {
  const [data, setData] = useState<DocumentRow[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<DocumentRow | null>(null);
  const [statusTab, setStatusTab] = useState<string>("all");
  const [user, setUser] = useState<any>(null);
  const [resident, setResident] = useState<Resident | null>(null);

  // Fetch all documents and resident names from backend API
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (u && u.id) {
        // Fetch resident info for display
        const res = await fetch(`/api/residents`).then(r => r.json());
        const found = res.find((r: any) => r.id === u.id) || null;
        setResident(found);
      }
      // Fetch all documents
      const docs = await fetch(`/api/documents`).then(r => r.json());
      // Fetch all residents for name lookup
      const residents = await fetch(`/api/residents`).then(r => r.json());
      const residentMap = new Map(residents.map((r: any) => [r.id, r]));
      setData(docs.map((doc: any) => ({
        ...doc,
        residentName: residentMap.has(doc.residentId)
          ? `${residentMap.get(doc.residentId).firstName} ${residentMap.get(doc.residentId).middleName ? residentMap.get(doc.residentId).middleName.charAt(0) + '. ' : ''}${residentMap.get(doc.residentId).lastName}`
          : "Unknown"
      })));
    })();
  }, []);

  const filtered = data.filter((d) =>
    (`${d.residentName} ${d.type} ${d.content || ''}`.toLowerCase().includes(search.toLowerCase())) &&
    (statusTab === "all" || d.status === statusTab)
  );

  return (
    <MainLayout>
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold mb-2">Document Requests</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search your requests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" /> Request Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a Document</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                if (!user || !resident) return toast.error("User not found");
                const fd = new FormData(e.currentTarget);
                const type = fd.get("type") as string;
                const purpose = fd.get("purpose") as string;
                const now = new Date();
                try {
                  await fetch(`/api/documents`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      type,
                      residentId: user.id,
                      issueDate: now.toISOString().split("T")[0],
                      status: "pending",
                      content: purpose,
                    })
                  });
                  // Refresh list (all documents)
                  const docs = await fetch(`/api/documents`).then(r => r.json());
                  const residents = await fetch(`/api/residents`).then(r => r.json());
                  const residentMap = new Map(residents.map((r: any) => [r.id, r]));
                  setData(docs.map((doc: any) => ({
                    ...doc,
                    residentName: residentMap.has(doc.residentId)
                      ? `${residentMap.get(doc.residentId).firstName} ${residentMap.get(doc.residentId).middleName ? residentMap.get(doc.residentId).middleName.charAt(0) + '. ' : ''}${residentMap.get(doc.residentId).lastName}`
                      : "Unknown"
                  })));
                  setAddOpen(false);
                  toast.success("Document request submitted!");
                } catch (err) {
                  toast.error("Failed to submit request");
                }
              }}>
                <div>
                  <Label>Your Name</Label>
                  <Input value={resident ? `${resident.firstName} ${resident.middleName ? resident.middleName.charAt(0) + '. ' : ''}${resident.lastName}` : ''} disabled readOnly />
                </div>
                <div>
                  <Label htmlFor="type">Document Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Barangay Clearance">Barangay Clearance</SelectItem>
                      <SelectItem value="Certificate of Residency">Certificate of Residency</SelectItem>
                      <SelectItem value="Certificate of Indigency">Certificate of Indigency</SelectItem>
                      <SelectItem value="Business Permit">Business Permit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input id="purpose" name="purpose" placeholder="State the purpose" required />
                </div>
                <Button type="submit" className="w-full">Submit Request</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={statusTab} onValueChange={setStatusTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="released">Released</TabsTrigger>
          </TabsList>
        </Tabs>
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-16">View</TableHead>
                    <TableHead className="w-12">More</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium text-sm">{d.residentName}</TableCell>
                      <TableCell className="text-sm">{d.type}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{d.content}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor(d.status) as any} className="text-[11px]">{d.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{d.createdAt?.split('T')[0]}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelected(d)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="font-display">Document Details</DialogTitle>
                            </DialogHeader>
                            {selected && (
                              <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                  <div><span className="text-muted-foreground">Resident:</span><span className="font-medium">{selected.residentName}</span></div>
                                  <div><span className="text-muted-foreground">Type:</span><span className="font-medium">{selected.type}</span></div>
                                  <div><span className="text-muted-foreground">Purpose:</span><span className="font-medium">{selected.content}</span></div>
                                  <div><span className="text-muted-foreground">Status:</span><span><Badge variant={statusColor(selected.status) as any}>{selected.status}</Badge></span></div>
                                  <div><span className="text-muted-foreground">Request Date:</span><span className="font-medium">{selected.createdAt?.split('T')[0]}</span></div>
                                </div>
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => {
                                    const printContent = document.createElement("div");
                                    printContent.innerHTML = `
                                      <h2>Document Details</h2>
                                      <p><strong>Resident:</strong> ${selected.residentName}</p>
                                      <p><strong>Type:</strong> ${selected.type}</p>
                                      <p><strong>Purpose:</strong> ${selected.content}</p>
                                      <p><strong>Status:</strong> ${selected.status}</p>
                                      <p><strong>Request Date:</strong> ${selected.createdAt?.split('T')[0]}</p>
                                    `;
                                    const printWindow = window.open("", "_blank", "width=600,height=600");
                                    if (printWindow) {
                                      printWindow.document.write('<html><head><title>Print Document</title></head><body>' + printContent.innerHTML + '</body></html>');
                                      printWindow.document.close();
                                      printWindow.focus();
                                      printWindow.print();
                                      printWindow.close();
                                    }
                                  }}
                                >
                                  <Printer className="h-4 w-4 mr-2" /> Print Document
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="More options">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.info(`Edit document #${d.id}`)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setData(prev => prev.map(doc => doc.id === d.id ? { ...doc, status: "pending" } : doc))}>
                              <span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>Set as Pending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setData(prev => prev.map(doc => doc.id === d.id ? { ...doc, status: "issued" } : doc))}>
                              <span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Approve</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setData(prev => prev.map(doc => doc.id === d.id ? { ...doc, status: "rejected" } : doc))}>
                              <span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Reject</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setData(prev => prev.map(doc => doc.id === d.id ? { ...doc, status: "issued", releaseDate: new Date().toISOString().split("T")[0] } : doc))}>
                              <span className="inline-flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>Release</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setData(prev => prev.filter(doc => doc.id !== d.id));
                              toast.success("Document deleted");
                            }} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No documents found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Documents;

