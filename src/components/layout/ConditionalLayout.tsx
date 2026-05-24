"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");

  return (
    <>
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 min-h-screen ${!isLoginPage ? "lg:ml-64" : ""}`}>
        {isLoginPage ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
            {children}
          </div>
        )}
      </main>
      {!isLoginPage && <MobileNav />}
    </>
  );
}