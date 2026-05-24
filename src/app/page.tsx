"use client";

import { useEffect, useState, useCallback } from "react";

interface ChurchStat {
  id: string;
  name: string;
  total: number;
  checkedIn: number;
}

interface RecentCheckIn {
  id: string;
  name: string;
  church: string;
  checkedInAt: string;
}

interface Stats {
  totalChurches: number;
  totalMembers: number;
  checkedInMembers: number;
  pendingMembers: number;
  churchStats: ChurchStat[];
  recentCheckIns: RecentCheckIn[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-shimmer h-8 w-64 rounded-lg bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 h-32 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Churches",
      value: stats?.totalChurches || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
      ),
      color: "text-gold",
      bg: "bg-gold/10",
      glow: "glow-gold",
    },
    {
      label: "Total Members",
      value: stats?.totalMembers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      glow: "",
    },
    {
      label: "Checked In",
      value: stats?.checkedInMembers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: "text-emerald",
      bg: "bg-emerald/10",
      glow: "glow-emerald",
    },
    {
      label: "Pending",
      value: stats?.pendingMembers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      glow: "",
    },
  ];

  const checkedInPercent =
    stats && stats.totalMembers > 0
      ? Math.round((stats.checkedInMembers / stats.totalMembers) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="animate-fadeIn">
        <h1 className="font-heading font-bold text-3xl text-foreground">
          Dashboard
        </h1>
        <p className="text-text-muted mt-1">
          Real-time dinner event overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`glass rounded-2xl p-6 ${card.glow} hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">
              {card.value}
            </p>
            <p className="text-sm text-text-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="glass rounded-2xl p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-foreground">
            Overall Check-in Progress
          </h2>
          <span className="text-2xl font-bold text-gold">
            {checkedInPercent}%
          </span>
        </div>
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
          <div
            className="progress-bar h-full"
            style={{ width: `${checkedInPercent}%` }}
          />
        </div>
        <p className="text-sm text-text-muted mt-2">
          {stats?.checkedInMembers || 0} of {stats?.totalMembers || 0} members
          checked in
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-church progress */}
        <div className="glass rounded-2xl p-6 animate-fadeIn">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
            Church Check-in Progress
          </h2>
          <div className="space-y-4">
            {stats?.churchStats?.length === 0 && (
              <p className="text-text-muted text-sm">
                No churches registered yet. Add churches to see progress.
              </p>
            )}
            {stats?.churchStats?.map((church) => {
              const percent =
                church.total > 0
                  ? Math.round((church.checkedIn / church.total) * 100)
                  : 0;
              return (
                <div key={church.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground font-medium truncate mr-2">
                      {church.name}
                    </span>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {church.checkedIn}/{church.total} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="progress-bar h-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent check-ins */}
        <div className="glass rounded-2xl p-6 animate-fadeIn">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
            Recent Check-ins
          </h2>
          <div className="space-y-3">
            {stats?.recentCheckIns?.length === 0 && (
              <p className="text-text-muted text-sm">
                No check-ins yet. Scan tickets to see activity.
              </p>
            )}
            {stats?.recentCheckIns?.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {checkIn.name}
                  </p>
                  <p className="text-xs text-text-muted">{checkIn.church}</p>
                </div>
                <span className="text-xs text-text-dim whitespace-nowrap">
                  {new Date(checkIn.checkedInAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
