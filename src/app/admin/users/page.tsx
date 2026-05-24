import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");
  return <UsersClient />;
}