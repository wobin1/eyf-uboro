"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }

      const { role } = data.user;
      if (role === "ADMIN") router.push(from || "/");
      else if (role === "BOUNCER") router.push("/scan");
      else router.push("/my-ticket");

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1.5">Email address</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                     focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Password</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                     focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-colors"
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-yellow-500 text-black font-semibold
                   hover:bg-yellow-400 transition-colors disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-bold text-2xl">EYF Uboro</h1>
          <p className="text-gray-400 text-sm mt-1">Dinner Event Management</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-6">Sign in to your account</h2>
          <Suspense fallback={<div className="animate-pulse h-48 rounded-xl bg-white/5" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}