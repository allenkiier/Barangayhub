import { useEffect, useState } from "react";
import { getSuggestions } from "@/db/queries";

export function usePendingWalkInComplaints() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchPending() {
      try {
        const suggestions = await getSuggestions();
        const walkInPending = suggestions.filter(
          (s) =>
            s.type === "complaint" &&
            s.status === "pending" &&
            s.message && s.message.startsWith("WALK-IN:")
        );
        if (mounted) setPendingCount(walkInPending.length);
      } catch {
        if (mounted) setPendingCount(0);
      }
    }
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return pendingCount;
}
