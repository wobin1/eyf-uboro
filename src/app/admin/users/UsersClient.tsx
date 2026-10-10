"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "BOUNCER" | "INVITEE";
  createdAt: string;
};

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "INVITEE" });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function fetchUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setForm({ name: "", email: "", password: "", role: "INVITEE" });
      fetchUsers();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  }

  const roleColors = { ADMIN: "text-red-400", BOUNCER: "text-blue-400", INVITEE: "text-green-400" };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">User Management</h1>

      {/* Create User Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-4">Create New User</h2>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
          {[
            { label: "Full Name", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "Password", key: "password", type: "password" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none"
            >
              <option value="INVITEE">Invitee</option>
              <option value="BOUNCER">Bouncer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="col-span-2">
            <button
              type="submit" disabled={creating}
              className="px-6 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr className="text-gray-400">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className={`px-4 py-3 font-medium ${roleColors[u.role]}`}>{u.role}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}