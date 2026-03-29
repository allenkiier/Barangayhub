import { FileText } from "lucide-react";
import DocumentRequestBrowser from "@/components/documents/DocumentRequestBrowser";
import { useEffect, useState, useCallback } from "react";
import { getCurrentUser } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function UserRequestServices() {
  // Get Gmail user info from encrypted session
  const [gmailUser, setGmailUser] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await getCurrentUser<any>();
      if (mounted) setGmailUser(user || {});
    })();
    return () => { mounted = false; };
  }, []);

  const handleRequestSuccess = useCallback(() => {
    toast({
      title: "Request Submitted",
      description: "Your request has been submitted successfully. Please check the admin dashboard for updates.",
    });
    navigate('/admin');
  }, [navigate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Request Documents & Services</h1>
        <p className="text-muted-foreground">
          Browse and request barangay documents and services
        </p>
      </div>

      <DocumentRequestBrowser
        residentId={gmailUser.email || ""}
        residentName={gmailUser.displayName || ""}
        onRequestSuccess={handleRequestSuccess}
      />
    </div>
  );
}
