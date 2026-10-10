"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatTicketId } from "@/lib/utils";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  ticketId: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

interface Church {
  id: string;
  name: string;
  pastor: string | null;
  phone: string | null;
  email: string | null;
  members: Member[];
}

export default function ChurchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [search, setSearch] = useState("");
  const [memberForm, setMemberForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchChurch = useCallback(async () => {
    try {
      const res = await fetch(`/api/churches/${id}`);
      if (res.ok) {
        const data = await res.json();
        setChurch(data);
      }
    } catch (err) {
      console.error("Failed to fetch church:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChurch();
  }, [fetchChurch]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.firstName.trim() || !memberForm.lastName.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...memberForm, churchId: id }),
      });

      if (res.ok) {
        setShowAddMember(false);
        setMemberForm({ firstName: "", lastName: "", phone: "", email: "" });
        fetchChurch();
      }
    } catch (err) {
      console.error("Failed to add member:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (
    memberId: string,
    name: string
  ) => {
    if (!confirm(`Delete "${name}"? Their ticket will also be removed.`)) return;

    try {
      const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      if (res.ok) fetchChurch();
    } catch (err) {
      console.error("Failed to delete member:", err);
    }
  };

  const filteredMembers =
    church?.members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(search.toLowerCase()) ||
        m.lastName.toLowerCase().includes(search.toLowerCase()) ||
        m.ticketId.toLowerCase().includes(search.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-shimmer h-8 w-64 rounded-lg bg-white/5" />
        <div className="glass rounded-2xl p-6 h-48 animate-shimmer" />
      </div>
    );
  }

  if (!church) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          Church not found
        </h3>
        <Link href="/churches">
          <Button variant="secondary">Back to Churches</Button>
        </Link>
      </div>
    );
  }

  const checkedIn = church.members.filter((m) => m.checkedIn).length;
  const total = church.members.length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted animate-fadeIn">
        <Link href="/churches" className="hover:text-gold transition-colors">
          Churches
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-foreground">{church.name}</span>
      </div>

      {/* Church header card */}
      <div className="glass rounded-2xl p-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-gold">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">
                {church.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-muted">
                {church.pastor && <span>🧑‍🏫 {church.pastor}</span>}
                {church.phone && <span>📞 {church.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{checkedIn}/{total}</p>
              <p className="text-xs text-text-muted">Checked In</p>
            </div>
          </div>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="progress-bar h-full"
                style={{
                  width: `${Math.round((checkedIn / total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Members section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddMember(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Member
        </Button>
      </div>

      {/* Members table */}
      {filteredMembers.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            {search ? "No members found" : "No members yet"}
          </h3>
          <p className="text-sm text-text-muted mb-6">
            {search
              ? "Try a different search term."
              : "Add members to generate their dinner tickets."}
          </p>
          {!search && (
            <Button onClick={() => setShowAddMember(true)}>
              Add First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden animate-fadeIn">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Ticket ID
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Phone
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.email && (
                        <p className="text-xs text-text-muted">{member.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gold bg-gold/5 px-2 py-1 rounded-md font-mono">
                        {formatTicketId(member.ticketId)}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {member.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {member.checkedIn ? (
                        <Badge variant="success">✓ Checked In</Badge>
                      ) : (
                        <Badge>Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/tickets/${member.ticketId}`}>
                          <Button variant="ghost" size="sm">
                            View Ticket
                          </Button>
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteMember(
                              member.id,
                              `${member.firstName} ${member.lastName}`
                            )
                          }
                          className="w-8 h-8 rounded-lg hover:bg-coral/10 flex items-center justify-center text-text-dim hover:text-coral transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-border/50">
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {member.firstName} {member.lastName}
                  </p>
                  {member.checkedIn ? (
                    <Badge variant="success">✓ In</Badge>
                  ) : (
                    <Badge>Pending</Badge>
                  )}
                </div>
                <code className="text-xs text-gold bg-gold/5 px-2 py-1 rounded-md font-mono">
                  {formatTicketId(member.ticketId)}
                </code>
                <div className="flex gap-2 pt-1">
                  <Link href={`/tickets/${member.ticketId}`}>
                    <Button variant="ghost" size="sm">
                      Ticket
                    </Button>
                  </Link>
                  <button
                    onClick={() =>
                      handleDeleteMember(
                        member.id,
                        `${member.firstName} ${member.lastName}`
                      )
                    }
                    className="text-xs text-coral hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="member-firstname"
              label="First Name *"
              placeholder="Jane"
              value={memberForm.firstName}
              onChange={(e) =>
                setMemberForm({ ...memberForm, firstName: e.target.value })
              }
              required
            />
            <Input
              id="member-lastname"
              label="Last Name *"
              placeholder="Doe"
              value={memberForm.lastName}
              onChange={(e) =>
                setMemberForm({ ...memberForm, lastName: e.target.value })
              }
              required
            />
          </div>
          <Input
            id="member-phone"
            label="Phone"
            placeholder="+234..."
            value={memberForm.phone}
            onChange={(e) =>
              setMemberForm({ ...memberForm, phone: e.target.value })
            }
          />
          <Input
            id="member-email"
            label="Email"
            type="email"
            placeholder="jane@email.com"
            value={memberForm.email}
            onChange={(e) =>
              setMemberForm({ ...memberForm, email: e.target.value })
            }
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddMember(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !memberForm.firstName.trim() ||
                !memberForm.lastName.trim()
              }
            >
              {submitting ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
