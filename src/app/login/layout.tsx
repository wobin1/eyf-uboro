import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sign In | EYF Uboro",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}