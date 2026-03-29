import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  Download,
  Eye,
  Check,
  X,
  CheckCircle,
  XCircle,
  Printer,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { Document as BarangayDocument, Resident, BlotterRecord } from "@/types/database";
import PrintableDocument from "@/components/documents/PrintableDocument";
import { deleteDocument, getDocuments, getResidents, updateDocument, addDocument, getBlotterRecords } from "@/db/queries";


import { toast } from "@/hooks/use-toast";


interface DocumentStats {
  total: number;
  pending: number;
  issued: number;
  rejected: number;
}


const PRINT_LOGO_LEFT_KEY = "barangay_print_logo_left";
const PRINT_LOGO_RIGHT_KEY = "barangay_print_logo_right";

function getPrintableSettings() {
  try {
    const raw = localStorage.getItem("barangaySettings");
    const parsed = raw ? JSON.parse(raw) : {};
    const leftFromKey = localStorage.getItem(PRINT_LOGO_LEFT_KEY) || "";
    const rightFromKey = localStorage.getItem(PRINT_LOGO_RIGHT_KEY) || "";

    return {
      ...parsed,
      printLogoLeft: parsed.printLogoLeft || leftFromKey,
      printLogoRight: parsed.printLogoRight || rightFromKey,
    };
  } catch {
    return {};
  }
}


function extractLineValue(content: string | undefined, key: string): string {
  if (!content) return "";
  const line = content.split("\n").find((entry) => entry.startsWith(`${key}:`));
  return line ? line.replace(`${key}:`, "").trim() : "";
}

function buildClearancePrintHtml(doc: BarangayDocument): string {
  const settings = getPrintableSettings();
  const province = settings.province || "Aklan";
  const municipality = settings.municipality || "Numancia";
  const barangayName = settings.barangayName || "Barangay Joyao-Joyao";
  const officeTitle = settings.officeTitle || "Office of the Punong Barangay";
  const punongBarangayName = (settings.punongBarangayName || "PERCY M. RASGO").toUpperCase();
  const printImageLeft = normalizePrintImageSrc("/images/js/image 2.png");
  const printImageRight = normalizePrintImageSrc("/images/image.png");
  const printSignatureFrontImage = normalizePrintImageSrc("/images/js/blog.jpg");
  const fallbackImage = normalizePrintImageSrc("/placeholder.svg");

  const requesterName =
    extractLineValue(doc.content, "Requester") ||
    extractLineValue(doc.content, "Name") ||
    extractLineValue(doc.content, "Full Name") ||
    "____________________________";
  const residentAddress =
    extractLineValue(doc.content, "Address") || "____________________________";
  const residentAge = extractLineValue(doc.content, "Age") || "_____";
  const residentSex =
    extractLineValue(doc.content, "Sex") ||
    extractLineValue(doc.content, "Gender") ||
    "_____";
  const residentCivilStatus =
    extractLineValue(doc.content, "Civil Status") || "_____";
  const residentDob =
    extractLineValue(doc.content, "Date of Birth") ||
    extractLineValue(doc.content, "DOB") ||
    "____________________________";
  const residentPob =
    extractLineValue(doc.content, "Place of Birth") ||
    extractLineValue(doc.content, "POB") ||
    "____________________________";
  const purpose = extractLineValue(doc.content, "Purpose") || "N/A";
  const orNo =
    extractLineValue(doc.content, "OR No") ||
    extractLineValue(doc.content, "OR No.") ||
    extractLineValue(doc.content, "O.R No") ||
    `CLR-${doc.id.slice(0, 8).toUpperCase()}`;

  const issuedAt = new Date(doc.issueDate);
  const timeIssued = Number.isNaN(issuedAt.getTime())
    ? "____________________________"
    : issuedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dateIssued = Number.isNaN(issuedAt.getTime())
    ? "____________________________"
    : issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const dateExpired = doc.expiryDate
    ? new Date(doc.expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "____________________________";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Barangay Clearance</title>
      <style>
                        @media print {
                          @page { margin: 0; }
                          body { margin: 0; }
                          /* Hide browser print headers/footers */
                          html, body { size-adjust: none; }
                        }
        body {
          font-family: "Times New Roman", serif;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .certificate {
          width: 100%;
          max-width: 7.05in;
          margin: 0 auto;
          border: none;
          padding: 0.22in;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          line-height: 1.35;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .header-logo-cell {
          width: 100px;
          vertical-align: top;
          text-align: center;
        }
        .header-text {
          text-align: center;
          vertical-align: top;
        }
        .header-image {
          width: 100px;
          height: 100px;
          object-fit: contain;
          flex: 0 0 100px;
          margin-top: 2px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-top: 14px;
        }
        .field {
          margin-top: 10px;
          font-size: 16px;
          line-height: 1.35;
        }
        .line {
          border-bottom: 1px solid black;
          width: 58%;
          min-width: 180px;
          display: inline-block;
          vertical-align: bottom;
          min-height: 20px;
          padding: 0 4px;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }
        .photo-box {
          width: 96px;
          height: 96px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 11px;
          line-height: 1.2;
          flex-shrink: 0;
        }
        .signature-block {
          flex: 1;
          text-align: center;
          font-size: 14px;
        }
        .thumb-oval {
          width: 78px;
          height: 96px;
          border: 1px solid #000;
          border-radius: 50%;
          margin: 10px auto 8px;
        }
        .footer {
          margin-top: 20px;
          line-height: 1.4;
          font-size: 16px;
        }
        .punong {
          text-align: right;
          margin-top: 12px;
          font-size: 16px;
        }
        .punong-signature-image {
          margin: 6px 0 0 auto;
          width: 900px;
          max-width: 900px;
          height: auto;
          object-fit: contain;
          display: block;
        }
        @media print {
          @page {
            size: A4;
            margin: 0.15in;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .certificate {
            width: 100%;
            max-width: none;
            min-height: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <table class="header-table" role="presentation">
            <tbody>
              <tr>
                <td class="header-logo-cell">
                  <img class="header-image" src="${printImageLeft}" alt="Left Header Image" onerror="this.onerror=null;this.src='${fallbackImage}';" />
                </td>
                <td class="header-text" style="text-align: center;">
                  <div style="font-size:20px; font-weight:bold; letter-spacing:1px; margin-bottom:2px;">Republic of the Philippines</div>
                  <div style="font-size:17px; font-weight:bold; margin-bottom:1px;">Province of Aklan</div>
                  <div style="font-size:17px; font-weight:bold; margin-bottom:1px;">Municipality of Numancia</div>
                  <div style="font-size:22px; font-weight:bold; margin:2px 0 2px 0; letter-spacing:1px;">BARANG JOYAO-JOYAO</div>
                  <div style="font-size:16px; font-weight:600; margin-top:2px;">Office of the Punong Barangay</div>
                </td>
                <td class="header-logo-cell">
                  <img class="header-image" src="${printImageRight}" alt="Right Header Image" onerror="this.onerror=null;this.src='${fallbackImage}';" />
                </td>
              </tr>
            </tbody>
          </table>
          <div class="title">BARANGAY CLEARANCE</div>
        </div>

        <p class="field">
          This is to certify that the person whose name, picture and signature appear hereon has requested a clearance from this office.
        </p>

        <div class="field">Name: <span class="line">${requesterName}</span></div>
        <div class="field">Address: <span class="line">${residentAddress}</span></div>
        <div class="field">Age: <span class="line">${residentAge}</span></div>
        <div class="field">Sex: <span class="line">${residentSex}</span></div>
        <div class="field">Civil Status: <span class="line">${residentCivilStatus}</span></div>
        <div class="field">Date of Birth: <span class="line">${residentDob}</span></div>
        <div class="field">Place of Birth: <span class="line">${residentPob}</span></div>

        <div class="field">Purpose: <span class="line">${purpose}</span></div>

        <div class="signature-section">
          <div class="photo-box">1x1 ID PHOTO</div>
          <div class="signature-block">
            Signature<br><br>
            ____________________
          </div>

          <div class="signature-block">
            Left Thumbmark<br><br>
            <div class="thumb-oval"></div>
            ____________________
          </div>

          <div class="signature-block">
            Right Thumbmark<br><br>
            <div class="thumb-oval"></div>
            ____________________
          </div>
        </div>

        <p class="field">
          This is to certify that he/she is known to me of good moral character and is a law abiding citizen. He/She has no pending case nor derogatory record in this office.
        </p>

        <div class="footer">
          Amount Paid: PHP 50.00 <br>
          O.R No: ${orNo} <br><br>
          Time Issued: ${timeIssued} <br>
          Date Issued: ${dateIssued} <br>
          Date Expired: ${dateExpired}
        </div>

        <div class="punong">
          <b>${punongBarangayName}</b><br>Punong Barangay<br>
          <img class="punong-signature-image" src="${printSignatureFrontImage}" alt="Punong Barangay Signature" width="900" style="width:900px;max-width:900px;height:auto;object-fit:contain;display:block;margin-left:auto;margin-top:6px;" onerror="this.onerror=null;this.src='${fallbackImage}';" />
        </div>
      </div>
    </body>
    </html>
  `;
}

function normalizePrintImageSrc(value: string): string {
  if (!value) return "";

  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  // Data URLs, blob URLs, and full URLs are safe to use directly in popup windows.
  if (
    trimmedValue.startsWith("data:image") ||
    trimmedValue.startsWith("blob:") ||
    /^https?:\/\//i.test(trimmedValue)
  ) {
    return trimmedValue;
  }

  let normalizedPath = trimmedValue;
  if (normalizedPath.startsWith("./")) {
    normalizedPath = normalizedPath.slice(1);
  }
  const pathWithoutLeadingSlash = normalizedPath.startsWith("/")
    ? normalizedPath.slice(1)
    : normalizedPath;

  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const basePath = normalizedBase === "/" ? "" : normalizedBase.replace(/\/$/, "");
  const appRelativePath = `${basePath}/${pathWithoutLeadingSlash}`;
  const encodedPath = encodeURI(appRelativePath);

  // Print window uses about:blank, so convert app-relative paths to absolute URLs.
  const absolutePath =
    typeof window !== "undefined"
      ? `${window.location.origin}${encodedPath}`
      : encodedPath;

  const stamp = Date.now();
  return absolutePath.includes("?") ? `${absolutePath}&t=${stamp}` : `${absolutePath}?t=${stamp}`;
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<BarangayDocument[]>([]);
  const [debugDocuments, setDebugDocuments] = useState<BarangayDocument[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<BarangayDocument | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    pending: 0,
    issued: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchDocuments();

    // Real-time updates: listen for localStorage changes
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'barangay_document_requests' || event.key === 'barangayDB') {
        fetchDocuments();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Also update when window/tab regains focus
    const handleFocus = () => fetchDocuments();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const [documentData, residentData] = await Promise.all([getDocuments(), getResidents()]);
      setDocuments(documentData);
      setDebugDocuments(documentData);
      setResidents(residentData);
      setStats({
        total: documentData.length,
        pending: documentData.filter((d) => d.status === "pending").length,
        issued: documentData.filter((d) => d.status === "issued").length,
        rejected: documentData.filter((d) => d.status === "rejected").length,
      });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedDocument) return;
    setProcessing(true);
    try {
      await updateDocument(selectedDocument.id, {
        status: "issued",
        content: reviewNotes.trim() || selectedDocument.content,
      });

      toast({
        title: "Success",
        description: "Document request has been accepted and issued.",
      });
      setReviewNotes("");
      setSelectedDocument(null);
      setShowActionDialog(false);
      setActionType(null);
      await fetchDocuments();
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast({
        title: "Error",
        description: "Failed to accept the request.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedDocument) return;
    setProcessing(true);
    try {
      await updateDocument(selectedDocument.id, {
        status: "rejected",
        content: reviewNotes.trim() || selectedDocument.content,
      });

      toast({
        title: "Success",
        description: "Document request has been rejected.",
      });
      setReviewNotes("");
      setSelectedDocument(null);
      setShowActionDialog(false);
      setActionType(null);
      await fetchDocuments();
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast({
        title: "Error",
        description: "Failed to reject the request.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Always render PrintableDocument for selectedDocument (hidden) for print extraction
  // This ensures admin print uses the exact Print Preview markup
  const handlePrintDocument = (documentToPrint?: BarangayDocument) => {
    const doc = documentToPrint || selectedDocument;
    if (!doc) return;
    const printImageLeft = normalizePrintImageSrc("/images/js/image 2.png");
    const printImageRight = normalizePrintImageSrc("/images/image.png");
    const fallbackImage = normalizePrintImageSrc("/placeholder.svg");
    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) {
      toast({
        title: "Error",
        description:
          "Failed to open print window. Please check your browser's popup settings.",
        variant: "destructive",
      });
      return;
    }

    const printWhenReady = () => {
      const images = Array.from(printWindow.document.images || []);

      const runPrint = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 200);
      };

      if (images.length === 0) {
        runPrint();
        return;
      }

      let completed = 0;
      let hasPrinted = false;
      const maybePrint = () => {
        if (!hasPrinted && completed >= images.length) {
          hasPrinted = true;
          runPrint();
        }
      };

      images.forEach((img) => {
        if (img.complete) {
          completed += 1;
          maybePrint();
          return;
        }

        const settle = () => {
          completed += 1;
          maybePrint();
        };

        img.addEventListener("load", settle, { once: true });
        img.addEventListener("error", settle, { once: true });
      });

      // Fail-safe so print still proceeds if an image event never fires.
      setTimeout(() => {
        if (!hasPrinted) {
          hasPrinted = true;
          runPrint();
        }
      }, 1800);
    };


    // Use special print layout for Clearance and Indigency
    const docType = doc.type?.toLowerCase() || "";
    // Match any common variations for Certificate of Indigency
    const isIndigency = [
      "indigency",
      "certificate of indigency",
      "indigency certificate",
      "cert. of indigency"
    ].some(type => docType.includes(type));
    if (docType.includes("clearance")) {
      printWindow.document.write(buildClearancePrintHtml(doc));
      printWindow.document.close();
      if (printWindow.document.readyState === "complete") {
        printWhenReady();
      } else {
        printWindow.onload = printWhenReady;
      }
      return;
    }
    if (isIndigency) {
      // Use the exact markup and styles from user Print Preview (DocumentRequestBrowser)
      const extract = (key, fallback = "") => {
        if (!doc.content) return fallback;
        const line = doc.content.split("\n").find((entry) => entry.toLowerCase().startsWith(key.toLowerCase() + ":"));
        return line ? line.split(":").slice(1).join(":").trim() : fallback;
      };
      const requesterName = extract("Name") || extract("Requester") || extract("Full Name") || "____________________________";
      const age = extract("Age") || "_____";
      const sex = extract("Sex") || extract("Gender") || "_____";
      const civilStatus = extract("Civil Status") || "_____";
      setTimeout(() => {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Document - Certificate of Indigency</title>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Times New Roman', serif; background: #fff; margin: 0; padding: 0; overflow: hidden; }
                .preview-bg { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 7in; height: 7in; object-fit: contain; opacity: 0.08; z-index: 0; pointer-events: none; }
                .indigency-card { background: #fff; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 2.5rem 2rem 2.5rem 0.5rem; margin: 0 auto; width: 8.3in; min-height: 11.7in; max-width: 100vw; position: relative; overflow: hidden; }
                .indigency-inner { position: relative; overflow: hidden; border-radius: 0.5rem; border: 1px solid #d1d5db; background: #fff; padding: 3rem 2rem 3rem 0.5rem; font-size: 22px; line-height: 2.1; font-family: serif; width: 100%; min-height: 10.5in; display: block; }
                .header-row { display: grid; grid-template-columns: 50px 1fr 50px; align-items: center; gap: 2px; text-align: center; margin-bottom: 0; }
                .header-img { height: 50px; width: 50px; object-fit: contain; }
                .header-center { margin-bottom: 0.2em; text-align: left; display: flex; flex-direction: column; align-items: flex-start; }
                .header-center p { margin: 0; font-size: 13px; line-height: 1.05; }
                .header-center .header-line { font-size: 13px; line-height: 1.05; }
                .header-center .barangay { font-size: 16px; font-weight: bold; letter-spacing: 1px; margin-top: 4px; text-decoration: none; line-height: 1.05; }
                .header-center .office { font-size: 13px; font-style: italic; margin-top: 2px; line-height: 1.05; }
                .indigency-title { text-align: center; font-weight: bold; letter-spacing: 2px; margin-bottom: 32px; font-size: 36px; }
                .indigency-section { margin-bottom: 18px; font-size: 22px; }
                .indigency-signature { margin-top: 60px; text-align: right; }
                .indigency-signature p { margin: 0; font-size: 22px; }
                .indigency-signature img { margin: 18px 0 0 auto; width: 900px; max-width: 100%; height: auto; object-fit: contain; display: block; }
                @media print {
                  @page { margin: 0; }
                  body { margin: 0; }
                  html, body { size-adjust: none; }
                }
              </style>
            </head>
            <body>
              <div class="indigency-card">
                <div class="indigency-inner">
                  <img src="/images/js/bry.png" alt="Preview background" class="preview-bg" />
                  <div class="header-row">
                    <img src="/images/js/image 2.png" alt="Left header" class="header-img" />
                    <img src="/images/image.png" alt="Right header" class="header-img" />
                    <div class="header-center">
                      <p class="header-line">Republic of the Philippines</p>
                      <p class="header-line">Province of Aklan</p>
                      <p class="header-line">Municipality of Numancia</p>
                      <p class="barangay">BARANGAY JOYAO-JOYAO</p>
                      <span style="display: block; width: 100%; border-bottom: 2px solid #222; margin: 2px 0 4px 0;"></span>
                      <p class="office">Office of the Punong Barangay</p>
                    </div>
                  </div>
                  <p class="indigency-title text-center font-bold tracking-wide mb-3">CERTIFICATE OF INDIGENCY</p>
                  <p class="indigency-section mb-2"><strong>TO WHOM IT MAY CONCERN:</strong></p>
                  <p class="indigency-section mb-2">
                    This is to certify that <strong>${requesterName}</strong>, age <strong>${age}</strong>, sex <strong>${sex}</strong>, civil status <strong>${civilStatus}</strong>, and a resident of Purok 2, Barangay Joyao-Joyao, Numancia, Aklan belongs to the indigent families.
                  </p>
                  <p class="indigency-section">
                    Issued at Barangay Joyao-Joyao, Numancia, Aklan, Philippines.
                  </p>
                  <div class="indigency-signature">
                    <p class="font-bold">PERCY M. RASGO</p>
                    <p>Punong Barangay</p>
                    <img src="/images/js/blog.jpg" alt="Signature preview" class="mx-auto mt-1 h-auto w-900px max-w-full object-contain" />
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 100);
        };
      }, 100);
      return;
    }

    setSelectedDocument(doc);

    // Match user-side document printing by using the shared PrintableDocument markup.
    setTimeout(() => {
      const printContent = printRef.current?.querySelector(".print-content");
      if (!printContent) return;

      const htmlContent = (printContent as HTMLElement).innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Document - ${doc.type}</title>
            <meta charset="utf-8">
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 100);
      };
    }, 100);
  };

  const handleDownloadDocument = (documentToDownload?: BarangayDocument) => {
    const doc = documentToDownload || selectedDocument;
    if (!doc) return;

    try {
      const docType = (doc.type || "document").replace(/-/g, " ").toUpperCase();
      const issuedDate = new Date(doc.issueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const fileBase = (doc.type || "document")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const fileName = `${fileBase || "document"}-${doc.id.slice(0, 8)}.txt`;

      const documentText = [
        "BARANGAY DOCUMENT COPY",
        "======================",
        `Document Type: ${docType}`,
        `Document ID: ${doc.id}`,
        `Resident ID: ${doc.residentId}`,
        `Issue Date: ${issuedDate}`,
        `Status: ${(doc.status || "").toUpperCase()}`,
        "",
        "CONTENT",
        "-------",
        doc.content || "No content available.",
      ].join("\n");

      const blob = new Blob([documentText], { type: "text/plain;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download started",
        description: `Saved as ${fileName}`,
      });
    } catch (error) {
      console.error("Failed to download document:", error);
      toast({
        title: "Error",
        description: "Failed to download document copy.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (documentToDelete: BarangayDocument) => {
    const confirmed = window.confirm("Delete this document permanently? This cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteDocument(documentToDelete.id);
      await fetchDocuments();
      toast({
        title: "Document deleted",
        description: "The document has been permanently removed.",
      });
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter((doc) => {
      // Debug panel for troubleshooting
      // Place this near the top of your return statement or wherever you want to see the raw data
      // Remove or comment out after debugging

      /* Debug Panel: Raw Document Requests */
      // <div className="bg-yellow-50 border border-yellow-300 rounded p-4 my-6">
      //   <h3 className="font-bold text-yellow-800 mb-2">Debug: Raw Document Requests</h3>
      //   <pre className="overflow-x-auto text-xs text-yellow-900 bg-yellow-100 p-2 rounded max-h-64">
      //     {JSON.stringify(debugDocuments, null, 2)}
      //   </pre>
      // </div>
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.type?.toLowerCase().includes(q) ||
        doc.residentId?.toLowerCase().includes(q) ||
        doc.content?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "issued":
        return "bg-gradient-to-r from-green-300 via-emerald-400 to-green-500 text-white shadow-md border border-green-400";
      case "pending":
        return "bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 text-amber-900 shadow-md border border-amber-300";
      case "rejected":
        return "bg-gradient-to-r from-red-300 via-rose-400 to-red-500 text-white shadow-md border border-red-400";
      default:
        return "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 text-gray-800 border border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "issued":
        return <Check className="h-4 w-4" />;
      case "pending":
        return <FileText className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Hidden PrintableDocument for print extraction (always in sync with Print Preview) */}
      <div style={{ display: 'none' }} ref={printRef}>
        {selectedDocument && (
          <PrintableDocument document={selectedDocument} resident={residents.find(r => r.id === selectedDocument.residentId)} />
        )}
      </div>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            Document Requests
          </h1>
          <p className="text-gray-600">Manage all document requests</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by type, resident, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="issued">Issued</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table of document requests */}
          <div className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">No documents found</div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{doc.type}</h3>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full border-2 ${getStatusColor(doc.status)}`}
                          style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {getStatusIcon(doc.status)}
                          <span className="ml-1">{doc.status}</span>
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground grid grid-cols-3 gap-3">
                        <p><strong>Resident:</strong> {doc.residentId}</p>
                        <p><strong>Date:</strong> {new Date(doc.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span className={`font-semibold ${getStatusColor(doc.status)}`}>{doc.status}</span></p>
                      </div>
                      {doc.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold" onClick={async () => { setSelectedDocument(doc); setActionType('accept'); setShowActionDialog(true); }}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold" onClick={() => { setSelectedDocument(doc); setActionType('reject'); setShowActionDialog(true); }}>
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="bg-gradient-to-br from-indigo-200 via-indigo-400 to-indigo-600 text-indigo-900 hover:from-indigo-300 hover:to-indigo-700 shadow-lg border border-indigo-300">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-2xl border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-indigo-100">
                          <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setShowViewDialog(true); }} className="hover:bg-blue-100 text-blue-900 font-semibold">
                            <Eye className="h-4 w-4 mr-2 text-blue-500" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintDocument(doc)} className="hover:bg-green-100 text-green-900 font-semibold">
                            <Printer className="h-4 w-4 mr-2 text-green-500" /> Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadDocument(doc)} className="hover:bg-yellow-100 text-yellow-900 font-semibold">
                            <Download className="h-4 w-4 mr-2 text-yellow-500" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDocument(doc)} className="hover:bg-red-100 text-red-900 font-semibold">
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedDocument(doc); setActionType('reject'); setShowActionDialog(true); }} className="hover:bg-rose-100 text-rose-900 font-semibold">
                            <X className="h-4 w-4 mr-2 text-rose-500" /> Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => { await updateDocument(doc.id, { status: 'pending' }); await fetchDocuments(); toast({ title: 'Marked as Pending', description: 'Document status set to pending.' }); }} className="hover:bg-amber-100 text-amber-900 font-semibold">
                            <FileText className="h-4 w-4 mr-2 text-amber-500" /> Mark as Pending
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
