import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "EYF Uboro | Dinner Event Management",
  description: "Register churches, manage members, generate QR tickets, and scan at the door.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-background text-foreground font-sans flex">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}