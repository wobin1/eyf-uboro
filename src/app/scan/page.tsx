"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ScanResult {
  type: "success" | "error" | "duplicate";
  message: string;
  member?: {
    firstName: string;
    lastName: string;
    church: { name: string };
    checkedInAt: string;
  };
}

interface RecentScan {
  id: string;
  name: string;
  church: string;
  time: string;
  status: "success" | "error" | "duplicate";
}

export default function ScannerPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  const handleScan = useCallback(async (ticketId: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success
        setResult({
          type: "success",
          message: data.message,
          member: data.member,
        });
        setRecentScans((prev) => [
          {
            id: Date.now().toString(),
            name: `${data.member.firstName} ${data.member.lastName}`,
            church: data.member.church.name,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "success",
          },
          ...prev,
        ]);

        // Play success beep
        try {
          const audioCtx = new AudioContext();
          const oscillator = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          oscillator.connect(gain);
          gain.connect(audioCtx.destination);
          oscillator.frequency.value = 800;
          gain.gain.value = 0.3;
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15);
        } catch {
          // audio not supported
        }
      } else if (res.status === 409) {
        // Already checked in
        setResult({
          type: "duplicate",
          message: data.message,
          member: data.member,
        });
        setRecentScans((prev) => [
          {
            id: Date.now().toString(),
            name: `${data.member.firstName} ${data.member.lastName}`,
            church: data.member.church.name,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "duplicate",
          },
          ...prev,
        ]);

        // Play error beep
        try {
          const audioCtx = new AudioContext();
          const oscillator = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          oscillator.connect(gain);
          gain.connect(audioCtx.destination);
          oscillator.frequency.value = 300;
          gain.gain.value = 0.3;
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.3);
        } catch {
          // audio not supported
        }
      } else {
        // Invalid ticket
        setResult({
          type: "error",
          message: data.message || "Invalid ticket",
        });
        setRecentScans((prev) => [
          {
            id: Date.now().toString(),
            name: "Unknown",
            church: "Invalid ticket",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "error",
          },
          ...prev,
        ]);
      }

      // Clear result after 3 seconds
      setTimeout(() => {
        setResult(null);
        processingRef.current = false;
      }, 3000);
    } catch (err) {
      console.error("Scan error:", err);
      setResult({
        type: "error",
        message: "Network error. Please try again.",
      });
      setTimeout(() => {
        setResult(null);
        processingRef.current = false;
      }, 3000);
    }
  }, []);

  useEffect(() => {
    let html5QrCode: { stop: () => Promise<void> } | null = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("qr-reader");
        html5QrCode = scanner;
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            handleScan(decodedText);
          },
          () => {
            // QR code not found - this fires continuously, ignore
          }
        );

        setScanning(true);
      } catch (err) {
        console.error("Scanner error:", err);
        setError(
          "Camera access denied. Please allow camera permissions and reload."
        );
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [handleScan]);

  return (
    <div className="max-w-lg mx-auto space-y-6 -mx-4 sm:mx-auto">
      {/* Header - minimal on mobile */}
      <div className="px-4 sm:px-0 animate-fadeIn">
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Scanner
        </h1>
        <p className="text-text-muted text-sm">
          Point camera at ticket QR code
        </p>
      </div>

      {/* Scanner area */}
      <div className="relative animate-fadeIn">
        <div
          className={`glass rounded-2xl overflow-hidden mx-4 sm:mx-0 ${
            result
              ? result.type === "success"
                ? "scan-success"
                : result.type === "duplicate"
                ? "scan-error"
                : "scan-error"
              : ""
          }`}
        >
          {error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-coral/10 flex items-center justify-center text-coral mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
              <p className="text-coral font-medium mb-2">Camera Error</p>
              <p className="text-sm text-text-muted">{error}</p>
            </div>
          ) : (
            <div className="relative">
              <div id="qr-reader" ref={scannerRef} className="w-full" />
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy/50">
                  <div className="animate-pulse text-text-muted text-sm">
                    Starting camera...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scan result overlay */}
        {result && (
          <div className="absolute inset-0 flex items-center justify-center mx-4 sm:mx-0 z-10">
            <div
              className={`glass rounded-2xl p-6 w-full mx-4 text-center animate-checkIn ${
                result.type === "success"
                  ? "border-emerald/50 glow-emerald"
                  : "border-coral/50 glow-coral"
              }`}
            >
              {result.type === "success" ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald/20 flex items-center justify-center text-emerald mb-3">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-emerald">
                    Welcome!
                  </h3>
                  <p className="text-foreground font-medium mt-1">
                    {result.member?.firstName} {result.member?.lastName}
                  </p>
                  <p className="text-sm text-text-muted">
                    {result.member?.church.name}
                  </p>
                </>
              ) : result.type === "duplicate" ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 mb-3">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-amber-400">
                    Already Checked In
                  </h3>
                  <p className="text-foreground font-medium mt-1">
                    {result.member?.firstName} {result.member?.lastName}
                  </p>
                  <p className="text-sm text-text-muted">
                    {result.member?.church.name}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full bg-coral/20 flex items-center justify-center text-coral mb-3">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-coral">
                    Invalid Ticket
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    {result.message}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scanning indicator */}
      {scanning && !result && (
        <div className="flex items-center justify-center gap-2 text-sm text-text-muted px-4 sm:px-0 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          Scanner active — point at a QR code
        </div>
      )}

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <div className="glass rounded-2xl p-4 mx-4 sm:mx-0 animate-fadeIn">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-3">
            Recent Scans
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    scan.status === "success"
                      ? "bg-emerald/10 text-emerald"
                      : scan.status === "duplicate"
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-coral/10 text-coral"
                  }`}
                >
                  {scan.status === "success" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : scan.status === "duplicate" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {scan.name}
                  </p>
                  <p className="text-xs text-text-muted">{scan.church}</p>
                </div>
                <span className="text-xs text-text-dim">{scan.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
