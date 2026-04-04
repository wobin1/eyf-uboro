"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface GuestEntry {
  id: string;
  firstName: string;
  lastName: string;
  ticketId: string;
  checkedInAt: string;
  church: { id: string; name: string };
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/members?checkedIn=true");
      if (res.ok) {
        const data = await res.json();
        // Sort by check-in time, most recent first
        const sorted = data.sort(
          (a: GuestEntry, b: GuestEntry) =>
            new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
        );
        setGuests(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch guests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 10000);
    return () => clearInterval(interval);
  }, [fetchGuests]);

  const filtered = guests.filter(
    (g) =>
      g.firstName.toLowerCase().includes(search.toLowerCase()) ||
      g.lastName.toLowerCase().includes(search.toLowerCase()) ||
      g.church.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Name", "Church", "Ticket ID", "Check-in Time"];
    const rows = filtered.map((g) => [
      `${g.firstName} ${g.lastName}`,
      g.church.name,
      g.ticketId,
      formatDate(g.checkedInAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guest-list-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="font-heading font-bold text-3xl text-foreground">
            Guest List
          </h1>
          <p className="text-text-muted mt-1">
            {guests.length} guests checked in
          </p>
        </div>
        {guests.length > 0 && (
          <Button variant="secondary" onClick={handleExportCSV}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="max-w-md animate-fadeIn">
        <Input
          placeholder="Search by name or church..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Guest list */}
      {loading ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald/10 flex items-center justify-center text-emerald mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            {search ? "No guests found" : "No check-ins yet"}
          </h3>
          <p className="text-sm text-text-muted">
            {search
              ? "Try a different search term."
              : "Guests will appear here after scanning their tickets."}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden animate-fadeIn">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    #
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Guest
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Church
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Check-in Time
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((guest, i) => (
                  <tr
                    key={guest.id}
                    className="border-b border-border/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-text-dim">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">
                        {guest.firstName} {guest.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {guest.church.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {formatDate(guest.checkedInAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">✓ Checked In</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-border/50">
            {filtered.map((guest, i) => (
              <div key={guest.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {guest.firstName} {guest.lastName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {guest.church.name} •{" "}
                      {new Date(guest.checkedInAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant="success">✓</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
