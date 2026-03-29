import React from "react";
import { useState, useEffect } from "react";
// Now using local database only
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  FileCheck,
  Home,
  HandHeart,
  Store,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentUser } from "@/lib/utils";
// import { getDocumentsByResident, addDocument } from "@/db/queries";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  details: string;
}

interface DocumentRequest {
  id: string;
  type: string;
  typeName: string;
  status: "pending" | "issued" | "rejected";
  requestedDate: string;
  issuedDate?: string;
}

const documentTypes: DocumentType[] = [
  {
    id: "clearance",
    name: "Barangay Clearance",
    description: "General purpose clearance certificate",
    icon: FileCheck,
    color: "bg-blue-100 text-blue-800",
    details: "Official clearance from the barangay. Valid for 1 year. Required for employment, travel, and other official purposes.",
  },
  {
    id: "residency",
    name: "Certificate of Residency",
    description: "Proof of residence in the barangay",
    icon: Home,
    color: "bg-green-100 text-green-800",
    details: "Proves that you are a resident of this barangay. Valid for 1 year. Required for school enrollment and other purposes.",
  },
  {
    id: "indigency",
    name: "Certificate of Indigency",
    description: "For financial assistance purposes",
    icon: HandHeart,
    color: "bg-orange-100 text-orange-800",
    details: "Used for scholarship applications and financial assistance programs. Must be endorsed by the barangay officials.",
  },
  {
    id: "business",
    name: "Business Permit",
    description: "Barangay business clearance",
    icon: Store,
    color: "bg-purple-100 text-purple-800",
    details: "Required for business operations in the barangay. Must comply with barangay regulations and zoning rules.",
  },
  {
    id: "barangay-certificate",
    name: "Barangay Certificate",
    description: "General barangay certificate",
    icon: FileCheck,
    color: "bg-red-100 text-red-800",
    details: "Official barangay certificate for various purposes. Can be customized based on your specific needs.",
  },
  {
    id: "blotter-report",
    name: "File Blotter Report",
    description: "Report an incident to barangay officials",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800",
    details: "File an incident report with the barangay. All reports are kept confidential and investigated by barangay officials.",
  },
];

const clearancePurposeOptions = [
  "Employment",
  "Job Application",
  "Travel",
  "Scholarship",
  "Police Requirement",
  "Business Requirement",
  "Bank Requirement",
  "Others",
];

interface DocumentRequestBrowserProps {
  residentId?: string;
  residentName?: string;
  onRequestSuccess?: () => void;
}

export default function DocumentRequestBrowser({
  residentId = "user",
  residentName = "User",
  onRequestSuccess,
}: DocumentRequestBrowserProps) {
  const [sessionUser, setSessionUser] = useState<{ email?: string; displayName?: string }>({});
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [requesterName, setRequesterName] = useState(residentName || "User");
  const [purpose, setPurpose] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [clearancePurpose, setClearancePurpose] = useState("");
  const [clearancePurposeOther, setClearancePurposeOther] = useState("");
  const [clearanceName, setClearanceName] = useState(residentName || "");
  const [clearanceAddress, setClearanceAddress] = useState("");
  const [clearanceAge, setClearanceAge] = useState("");
  const [clearanceSex, setClearanceSex] = useState("");
  const [clearanceCivilStatus, setClearanceCivilStatus] = useState("");
  const [clearanceDob, setClearanceDob] = useState("");
  const [clearancePob, setClearancePob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  const effectiveResidentId = (residentId && residentId !== "user" ? residentId : sessionUser.email) || "user";
  const effectiveResidentName = (residentName && residentName !== "User" ? residentName : sessionUser.displayName) || "User";

  // Load requests from local database on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/documents/resident/${effectiveResidentId}`);
        const data = await res.json();
        setRequests(((data || []).map((doc: any) => ({
          id: doc.id,
          type: doc.type,
          typeName: doc.type,
          status: doc.status as "pending" | "issued" | "rejected",
          requestedDate: doc.issueDate,
          issuedDate: doc.status === "issued" ? doc.issueDate : undefined,
        })) as DocumentRequest[]));
      } catch (error) {
        console.error("Failed to load requests from backend:", error);
      }
    })();
  }, [effectiveResidentId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const currentUser = await getCurrentUser<{ email?: string; displayName?: string }>();
      if (mounted && currentUser) {
        setSessionUser(currentUser);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ...existing code...

  const handleRequestDocument = async (docType: DocumentType) => {
    setSelectedDoc(docType);
    setRequesterName(effectiveResidentName);
    setPurpose("");
    setAge("");
    setSex("");
    setCivilStatus("");
    setClearancePurpose("");
    setClearancePurposeOther("");
    setClearanceName(effectiveResidentName || "");
    setClearanceAddress("");
    setClearanceAge("");
    setClearanceSex("");
    setClearanceCivilStatus("");
    setClearanceDob("");
    setClearancePob("");
    setIsDialogOpen(true);
  };

  const submitRequest = async () => {
    if (!selectedDoc) return;

    // For blotter reports, we need description
    if (selectedDoc.id === "blotter-report" && !purpose.trim()) {
      toast({
        title: "Error",
        description: "Please provide a detailed description of the incident.",
        variant: "destructive",
      });
      return;
    }

    // For indigency requests, we also need demographic fields used in print layout.
    if (selectedDoc.id === "indigency") {
      if (!requesterName.trim()) {
        toast({
          title: "Error",
          description: "Please provide the name of user.",
          variant: "destructive",
        });
        return;
      }
      const parsedAge = Number(age);
      if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid age.",
          variant: "destructive",
        });
        return;
      }
      if (!sex.trim()) {
        toast({
          title: "Error",
          description: "Please provide sex.",
          variant: "destructive",
        });
        return;
      }
      if (!civilStatus.trim()) {
        toast({
          title: "Error",
          description: "Please provide civil status.",
          variant: "destructive",
        });
        return;
      }
    }

    if (selectedDoc.id === "clearance") {
      if (!clearancePurpose.trim()) {
        toast({
          title: "Error",
          description: "Please select a purpose for Barangay Clearance.",
          variant: "destructive",
        });
        return;
      }
      if (clearancePurpose === "Others" && !clearancePurposeOther.trim()) {
        toast({
          title: "Error",
          description: "Please specify the purpose.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Add new request to local database
      const newRequest = {
        document_type: selectedDoc.name,
        residentid: effectiveResidentId,
        status: "pending",
        content: selectedDoc.id === 'indigency'
          ? `Requester: ${requesterName.trim()}\nEmail: ${effectiveResidentId}\nAge: ${age.trim()}\nSex: ${sex.trim()}\nCivil Status: ${civilStatus.trim()}\nRemarks: `
          : selectedDoc.id === 'clearance'
            ? `Requester: ${clearanceName.trim() || effectiveResidentName}\nEmail: ${effectiveResidentId}\nAddress: ${clearanceAddress.trim()}\nAge: ${clearanceAge.trim()}\nSex: ${clearanceSex.trim()}\nCivil Status: ${clearanceCivilStatus.trim()}\nDate of Birth: ${clearanceDob.trim()}\nPlace of Birth: ${clearancePob.trim()}\nPurpose: ${clearancePurpose === "Others" ? clearancePurposeOther.trim() : clearancePurpose}\nRemarks: `
            : `Requester: ${effectiveResidentName}\nEmail: ${effectiveResidentId}\nRemarks: `,
      };
      // Map newRequest to match addDocument's expected fields
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedDoc.id,
          residentId: effectiveResidentId,
          status: "pending",
          content: newRequest.content || "",
          issueDate: new Date().toISOString(),
          expiryDate: null,
        })
      });
      toast({
        title: "Success",
        description: selectedDoc.id === "blotter-report"
          ? "Your incident report has been submitted. Barangay officials will investigate."
          : `Your request for ${selectedDoc.name} has been submitted and will be reviewed by an admin. You will be notified once it is approved or rejected.`,
      });
      // Reload requests from backend
      const res = await fetch(`/api/documents/resident/${effectiveResidentId}`);
      const data = await res.json();
      setRequests(((data || []).map((doc: any) => ({
        id: doc.id,
        type: doc.type,
        typeName: doc.type,
        status: doc.status as "pending" | "issued" | "rejected",
        requestedDate: doc.issueDate,
        issuedDate: doc.status === "issued" ? doc.issueDate : undefined,
      })) as DocumentRequest[]));
      setSelectedDoc(null);
      setRequesterName(effectiveResidentName);
      setPurpose("");
      setAge("");
      setSex("");
      setCivilStatus("");
      setClearancePurpose("");
      setClearancePurposeOther("");
      setClearanceName(effectiveResidentName || "");
      setClearanceAddress("");
      setClearanceAge("");
      setClearanceSex("");
      setClearanceCivilStatus("");
      setClearanceDob("");
      setClearancePob("");
      setIsDialogOpen(false);
      onRequestSuccess?.();
    } catch (error) {
      console.error("Failed to submit request:", error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6" />
            Request Documents & Services
          </CardTitle>
          <CardDescription>
            Browse and request barangay documents and services. Your requests will be reviewed and processed by barangay officials.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Document Types Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Documents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            return (
              <Card 
                key={docType.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRequestDocument(docType)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${docType.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline">{docType.id}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {docType.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {docType.description}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestDocument(docType);
                    }}
                    className="w-full"
                  >
                    Request Document
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* User's Submitted Requests Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Submitted Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Type</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Requested</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4">No requests found.</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-3 py-2 border">{req.typeName || req.type}</td>
                    <td className="px-3 py-2 border capitalize">{req.status}</td>
                    <td className="px-3 py-2 border">{req.requestedDate || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Dialog */}
      {selectedDoc && (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setSelectedDoc(null);
            setRequesterName(effectiveResidentName);
            setPurpose("");
            setAge("");
            setSex("");
            setCivilStatus("");
            setClearanceName(effectiveResidentName || "");
            setClearanceAddress("");
            setClearanceAge("");
            setClearanceSex("");
            setClearanceCivilStatus("");
            setClearanceDob("");
            setClearancePob("");
          } else {
            setIsDialogOpen(true);
          }
        }}>
          <DialogContent className="sm:max-w-[760px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <selectedDoc.icon className="h-5 w-5" />
                {selectedDoc.id === "blotter-report" ? "File Incident Report" : `Request ${selectedDoc.name}`}
              </DialogTitle>
              <DialogDescription>
                {selectedDoc.id === "blotter-report" 
                  ? "Provide detailed information about the incident"
                  : "Fill out the details below to request this document"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Document Details */}
              {selectedDoc.id === "clearance" ? (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Print Preview (Barangay Clearance)</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      This is the format used when your barangay clearance is printed.
                    </p>
                    <div className="rounded-md border border-gray-300 bg-white p-4 text-[11px] leading-relaxed font-serif">
                      <div className="text-center">
                        <div className="grid grid-cols-[150px_1fr_150px] items-start gap-2">
                          {React.createElement('img', { src: '/images/js/image 2.png', alt: 'Left header', className: 'h-[150px] w-[150px] object-contain' })}
                          <div>
                            <p>Republic of the Philippines</p>
                            <p>Province of Aklan</p>
                            <p>Municipality of Numancia</p>
                            <p className="font-bold">BARANGAY JOYAO-JOYAO</p>
                            <p>Office of the Punong Barangay</p>
                          </div>
                          {React.createElement('img', { src: '/images/image.png', alt: 'Right header', className: 'h-[150px] w-[150px] object-contain' })}
                        </div>
                        <p className="mt-3 text-center font-bold tracking-wide">BARANGAY CLEARANCE</p>
                      </div>

                      <p className="mt-3">
                        This is to certify that the person whose name, picture and signature appear hereon has requested a clearance from this office.
                      </p>

                      <div className="mt-2">Name: <span className="inline-block min-w-[180px] border-b border-black">{clearanceName || "________________"}</span></div>
                      <div className="mt-1">Address: <span className="inline-block min-w-[180px] border-b border-black">{clearanceAddress || "________________"}</span></div>
                      <div className="mt-1">Age: <span className="inline-block min-w-[80px] border-b border-black">{clearanceAge || "____"}</span></div>
                      <div className="mt-1">Sex: <span className="inline-block min-w-[80px] border-b border-black">{clearanceSex || "____"}</span></div>
                      <div className="mt-1">Civil Status: <span className="inline-block min-w-[120px] border-b border-black">{clearanceCivilStatus || "____"}</span></div>
                      <div className="mt-1">Date of Birth: <span className="inline-block min-w-[180px] border-b border-black">{clearanceDob || "________________"}</span></div>
                      <div className="mt-1">Place of Birth: <span className="inline-block min-w-[180px] border-b border-black">{clearancePob || "________________"}</span></div>
                      <div className="mt-1">Purpose: <span className="inline-block min-w-[180px] border-b border-black">________________</span></div>
                      <div className="mt-1">Selected Purpose: <span className="inline-block min-w-[180px] border-b border-black">{clearancePurpose === "Others" ? (clearancePurposeOther || "________________") : (clearancePurpose || "________________")}</span></div>

                      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                        <div className="mx-auto h-14 w-14 border border-black text-[9px] flex items-center justify-center">1x1 ID PHOTO</div>
                        <div>
                          Signature
                          <div className="mt-3 border-t border-black">&nbsp;</div>
                        </div>
                        <div>
                          Left Thumbmark
                          <div className="mx-auto my-1 h-10 w-8 rounded-full border border-black" />
                          <div className="border-t border-black">&nbsp;</div>
                        </div>
                        <div>
                          Right Thumbmark
                          <div className="mx-auto my-1 h-10 w-8 rounded-full border border-black" />
                          <div className="border-t border-black">&nbsp;</div>
                        </div>
                      </div>

                      <p className="mt-3">
                        This is to certify that he/she is known to me of good moral character and is a law abiding citizen. He/She has no pending case nor derogatory record in this office.
                      </p>

                      <div className="mt-3">
                        <p>Amount Paid: PHP 50.00</p>
                        <p>O.R No: CLR-XXXXXXXX</p>
                        <p>Time Issued: ______</p>
                        <p>Date Issued: ______</p>
                        <p>Date Expired: ______</p>
                      </div>

                      <div className="mt-3 text-right">
                        <p className="font-bold">PERCY M. RASGO</p>
                        <p>Punong Barangay</p>
                        {React.createElement('img', { src: '/images/js/blog.jpg', alt: 'Signature preview', className: 'ml-auto mt-1 h-auto w-[900px] max-w-full object-contain' })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : selectedDoc.id === "indigency" ? (
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Print Preview (Certificate of Indigency)</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      This is the format used when your certificate is printed.
                    </p>
                    <div className="relative overflow-hidden rounded-md border border-gray-300 bg-white p-4 text-[11px] leading-relaxed font-serif">
                      {React.createElement('img', { src: '/images/js/bry.png', alt: 'Preview background', className: 'absolute inset-0 h-full w-full object-cover opacity-10' })}
                      <div className="relative z-10 grid grid-cols-[150px_1fr_150px] items-center gap-2 text-center mb-3">
                        {React.createElement('img', { src: '/images/js/image 2.png', alt: 'Left header', className: 'h-[150px] w-[150px] object-contain' })}
                        <div>
                          <p>Republic of the Philippines</p>
                          <p>Province of Aklan</p>
                          <p>Municipality of Numancia</p>
                          <p className="font-bold">BARANGAY JOYAO-JOYAO</p>
                          <p>Office of the Punong Barangay</p>
                        </div>
                        {React.createElement('img', { src: '/images/image.png', alt: 'Right header', className: 'h-[150px] w-[150px] object-contain' })}
                      </div>
                      <p className="relative z-10 text-center font-bold tracking-wide mb-3">CERTIFICATE OF INDIGENCY</p>
                      <p className="relative z-10 mb-2"><strong>TO WHOM IT MAY CONCERN:</strong></p>
                      <p className="relative z-10 mb-2">
                        This is to certify that <strong>{requesterName.trim() || "____________________________"}</strong>,
                        age <strong>{age.trim() || "_____"}</strong>, sex <strong>{sex.trim() || "_____"}</strong>, civil status <strong>{civilStatus.trim() || "_____"}</strong>,
                        and a resident of Purok 2, Barangay Joyao-Joyao, Numancia, Aklan belongs to the indigent families.
                      </p>
                      <p className="relative z-10">
                        Issued at Barangay Joyao-Joyao, Numancia, Aklan, Philippines.
                      </p>
                      <div className="relative z-10 mt-4">
                        <div className="text-right">
                          <p className="font-bold">PERCY M. RASGO</p>
                          <p>Punong Barangay</p>
                        </div>
                        {React.createElement('img', { src: '/images/js/blog.jpg', alt: 'Signature preview', className: 'mx-auto mt-1 h-auto w-[900px] max-w-full object-contain' })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">About this document</h4>
                    <p className="text-sm text-gray-600">
                      {selectedDoc.details}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Requester Info */}
              <div className="space-y-2">
                <Label>Requesting for</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{effectiveResidentName}</p>
                  <p className="text-sm text-muted-foreground">
                    {effectiveResidentId}
                  </p>
                </div>
              </div>

              {selectedDoc.id === "indigency" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="requesterName">Name of User *</Label>
                    <Input
                      id="requesterName"
                      placeholder="e.g. Juan Dela Cruz"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      placeholder="e.g. 27"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex *</Label>
                    <Input
                      id="sex"
                      placeholder="e.g. Male"
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="civilStatus">Civil Status *</Label>
                    <Input
                      id="civilStatus"
                      placeholder="e.g. Single"
                      value={civilStatus}
                      onChange={(e) => setCivilStatus(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Description (for blotter reports only) */}
              {selectedDoc.id === "clearance" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="clearanceName">Name</Label>
                      <Input
                        id="clearanceName"
                        placeholder="e.g. Juan Dela Cruz"
                        value={clearanceName}
                        onChange={(e) => setClearanceName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clearanceAddress">Address</Label>
                      <Input
                        id="clearanceAddress"
                        placeholder="Complete address"
                        value={clearanceAddress}
                        onChange={(e) => setClearanceAddress(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clearanceAge">Age</Label>
                      <Input
                        id="clearanceAge"
                        placeholder="e.g. 21"
                        value={clearanceAge}
                        onChange={(e) => setClearanceAge(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clearanceSex">Sex</Label>
                      <Input
                        id="clearanceSex"
                        placeholder="e.g. Male"
                        value={clearanceSex}
                        onChange={(e) => setClearanceSex(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clearanceCivilStatus">Civil Status</Label>
                      <Input
                        id="clearanceCivilStatus"
                        placeholder="e.g. Single"
                        value={clearanceCivilStatus}
                        onChange={(e) => setClearanceCivilStatus(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clearanceDob">Date of Birth</Label>
                      <Input
                        id="clearanceDob"
                        placeholder="MM/DD/YYYY"
                        value={clearanceDob}
                        onChange={(e) => setClearanceDob(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="clearancePob">Place of Birth</Label>
                      <Input
                        id="clearancePob"
                        placeholder="City / Province"
                        value={clearancePob}
                        onChange={(e) => setClearancePob(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clearancePurpose">Purpose *</Label>
                    <Select
                      value={clearancePurpose}
                      onValueChange={setClearancePurpose}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="clearancePurpose">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {clearancePurposeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {clearancePurpose === "Others" && (
                    <div className="space-y-2">
                      <Label htmlFor="clearancePurposeOther">Specify Purpose *</Label>
                      <Input
                        id="clearancePurposeOther"
                        placeholder="Type your purpose"
                        value={clearancePurposeOther}
                        onChange={(e) => setClearancePurposeOther(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Description (for blotter reports only) */}
              {selectedDoc.id === "blotter-report" && (
                <div className="space-y-2">
                  <Label htmlFor="purpose">
                    Incident Description *
                  </Label>
                  <Textarea
                    id="purpose"
                    placeholder="Provide detailed description of the incident..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Providing detailed information helps officials investigate effectively
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={submitRequest}
                  disabled={
                    isSubmitting ||
                    (selectedDoc.id === "blotter-report" && !purpose.trim()) ||
                    (selectedDoc.id === "indigency" && !requesterName.trim()) ||
                    (selectedDoc.id === "clearance" && (!clearancePurpose.trim() || (clearancePurpose === "Others" && !clearancePurposeOther.trim())))
                  }
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : selectedDoc.id === "blotter-report" ? "File Report" : "Submit Request"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedDoc(null);
                    setPurpose("");
                    setClearancePurpose("");
                    setClearancePurposeOther("");
                    setClearanceName(effectiveResidentName || "");
                    setClearanceAddress("");
                    setClearanceAge("");
                    setClearanceSex("");
                    setClearanceCivilStatus("");
                    setClearanceDob("");
                    setClearancePob("");
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Information Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Easy Process</p>
                <p className="text-xs text-muted-foreground">
                  Simple form to request any document
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Fast Processing</p>
                <p className="text-xs text-muted-foreground">
                  Processed within 1-3 business days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Track Status</p>
                <p className="text-xs text-muted-foreground">
                  Check your request status anytime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
