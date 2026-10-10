"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatTicketId } from "@/lib/utils";
import { generateQRDataURL } from "@/lib/qr";

interface TicketData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  ticketId: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  church: { id: string; name: string };
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = use(params);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data);
          const qr = await generateQRDataURL(data.ticketId);
          setQrCode(qr);
        }
      } catch (err) {
        console.error("Failed to fetch ticket:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  const handleDownload = () => {
    if (!ticket) return;
    // Download via server-side API route — produces a proper image file
    window.open(`/api/tickets/${ticket.ticketId}/download`, "_blank");
  };


  const handleShare = async () => {
    if (!ticket) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EYF U/boro Ticket - ${ticket.firstName} ${ticket.lastName}`,
          text: `Dinner ticket for ${ticket.firstName} ${ticket.lastName} from ${ticket.church.name}. Ticket ID: ${formatTicketId(ticket.ticketId)}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="glass rounded-2xl p-8 w-full max-w-md h-[600px] animate-shimmer" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          Ticket not found
        </h3>
        <Link href="/tickets">
          <Button variant="secondary">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted animate-fadeIn">
        <Link href="/tickets" className="hover:text-gold transition-colors">
          Tickets
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-foreground">{formatTicketId(ticket.ticketId)}</span>
      </div>

      {/* Ticket card */}
      <div ref={ticketRef} className="ticket-border glass rounded-2xl p-8 animate-slideInUp">
        {/* Event branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold mb-3">
            <span className="text-navy font-heading font-bold text-xl">E</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-gold">
            EYF U/BORO
          </h1>
          <p className="text-sm text-text-muted">Dinner Event</p>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gold/20 my-6" />

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          {qrCode ? (
            <div className="bg-white p-4 rounded-2xl">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-56 h-56"
              />
            </div>
          ) : (
            <div className="w-64 h-64 rounded-2xl bg-white/5 animate-pulse" />
          )}
        </div>

        {/* Member info */}
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-xl text-foreground">
            {ticket.firstName} {ticket.lastName}
          </h2>
          <p className="text-sm text-text-muted">{ticket.church.name}</p>
          <code className="inline-block text-sm text-gold bg-gold/5 px-3 py-1 rounded-lg font-mono">
            {formatTicketId(ticket.ticketId)}
          </code>
        </div>

        {/* Status */}
        <div className="flex justify-center mt-4">
          {ticket.checkedIn ? (
            <Badge variant="success">
              ✓ Checked In at{" "}
              {new Date(ticket.checkedInAt!).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          ) : (
            <Badge variant="warning">Awaiting Check-in</Badge>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gold/20 my-6" />

        <p className="text-xs text-text-dim text-center">
          Present this ticket at the entrance
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 animate-fadeIn">
        <Button onClick={handleDownload} className="flex-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </Button>
        {"share" in navigator && (
          <Button variant="secondary" onClick={handleShare} className="flex-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
