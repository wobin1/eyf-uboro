import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "EYF Uboro | Dinner Event Management",
  description:
    "Register churches, manage members, generate QR tickets, and scan at the door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-background text-foreground font-sans flex">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </body>
    </html>
  );
}
