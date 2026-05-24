"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatTicketId } from "@/lib/utils";
import { generateQRDataURL } from "@/lib/qr";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  ticketId: string;
  checkedIn: boolean;
  church: { id: string; name: string };
}

export default function TicketsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "checked">("all");
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  const fetchMembers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter === "pending") params.set("checkedIn", "false");
      if (filter === "checked") params.set("checkedIn", "true");

      const res = await fetch(`/api/members?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Generate QR codes for visible members
  useEffect(() => {
    const generateQRs = async () => {
      const newQRs: Record<string, string> = {};
      for (const member of members) {
        if (!qrCodes[member.ticketId]) {
          try {
            newQRs[member.ticketId] = await generateQRDataURL(member.ticketId);
          } catch {
            // skip
          }
        }
      }
      if (Object.keys(newQRs).length > 0) {
        setQrCodes((prev) => ({ ...prev, ...newQRs }));
      }
    };
    generateQRs();
  }, [members]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <h1 className="font-heading font-bold text-3xl text-foreground">
          Tickets
        </h1>
        <p className="text-text-muted mt-1">
          {members.length} tickets generated
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search by name or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "checked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                filter === f
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "bg-white/5 text-text-muted border border-border hover:bg-white/10"
              }`}
            >
              {f === "all" ? "All" : f === "pending" ? "Pending" : "Checked In"}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 h-64 animate-shimmer" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No tickets yet
          </h3>
          <p className="text-sm text-text-muted mb-6">
            Add members to churches to generate tickets.
          </p>
          <Link href="/churches">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-navy rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-gold/20 transition-all cursor-pointer">
              Go to Churches
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/tickets/${member.ticketId}`}
              className="glass rounded-2xl p-5 hover:border-gold/20 transition-all duration-200 group block"
            >
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {qrCodes[member.ticketId] ? (
                  <img
                    src={qrCodes[member.ticketId]}
                    alt={`QR code for ${member.firstName}`}
                    className="w-28 h-28 rounded-xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-white/5 animate-pulse" />
                )}
              </div>

              {/* Info */}
              <h3 className="font-medium text-foreground text-center group-hover:text-gold transition-colors">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-xs text-text-muted text-center mt-1">
                {member.church.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <code className="text-[10px] text-gold/80 bg-gold/5 px-2 py-0.5 rounded font-mono">
                  {formatTicketId(member.ticketId)}
                </code>
                {member.checkedIn ? (
                  <Badge variant="success">✓</Badge>
                ) : (
                  <Badge>Pending</Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
