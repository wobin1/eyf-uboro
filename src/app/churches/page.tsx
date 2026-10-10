"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface Church {
  id: string;
  name: string;
  pastor: string | null;
  phone: string | null;
  email: string | null;
  memberCount: number;
  checkedInCount: number;
}

export default function ChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    pastor: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchChurches = useCallback(async () => {
    try {
      const res = await fetch("/api/churches");
      if (res.ok) {
        const data = await res.json();
        setChurches(data);
      }
    } catch (err) {
      console.error("Failed to fetch churches:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/churches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", pastor: "", phone: "", email: "" });
        fetchChurches();
      }
    } catch (err) {
      console.error("Failed to create church:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all members and their tickets.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/churches/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchChurches();
      }
    } catch (err) {
      console.error("Failed to delete church:", err);
    }
  };

  const filtered = churches.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.pastor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="font-heading font-bold text-3xl text-foreground">
            Churches
          </h1>
          <p className="text-text-muted mt-1">
            {churches.length} registered {churches.length === 1 ? "church" : "churches"}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Church
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md animate-fadeIn">
        <Input
          placeholder="Search churches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Church grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 h-48 animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            {search ? "No churches found" : "No churches yet"}
          </h3>
          <p className="text-sm text-text-muted mb-6">
            {search
              ? "Try a different search term."
              : "Start by registering a church."}
          </p>
          {!search && (
            <Button onClick={() => setShowModal(true)}>Add First Church</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((church) => {
            const percent =
              church.memberCount > 0
                ? Math.round((church.checkedInCount / church.memberCount) * 100)
                : 0;

            return (
              <div
                key={church.id}
                className="glass rounded-2xl p-6 hover:border-gold/20 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-gold">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(church.id, church.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-coral/10 flex items-center justify-center text-text-dim hover:text-coral transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>

                <Link href={`/churches/${church.id}`} className="block">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-1 group-hover:text-gold transition-colors">
                    {church.name}
                  </h3>
                  {church.pastor && (
                    <p className="text-sm text-text-muted mb-3">
                      {church.pastor}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      {church.memberCount} members
                    </span>
                    <span className="flex items-center gap-1 text-emerald">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {church.checkedInCount} checked in
                    </span>
                  </div>

                  {church.memberCount > 0 && (
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="progress-bar h-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Church Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Church"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="church-name"
            label="Church Name *"
            placeholder="e.g. Living Faith Church"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Input
            id="church-pastor"
            label="Pastor / Leader"
            placeholder="e.g. Pastor John"
            value={formData.pastor}
            onChange={(e) =>
              setFormData({ ...formData, pastor: e.target.value })
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="church-phone"
              label="Phone"
              placeholder="+234..."
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <Input
              id="church-email"
              label="Email"
              type="email"
              placeholder="church@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.name.trim()}>
              {submitting ? "Adding..." : "Add Church"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
