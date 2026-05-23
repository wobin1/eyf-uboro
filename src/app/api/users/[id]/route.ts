import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/users/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (session!.userId === id) {
    return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return Response.json({ success: true });
}

// PATCH /api/users/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name, role, password, memberId } = await request.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  if (name) data.name = name.trim();
  if (role) data.role = role;
  if (password) data.passwordHash = await hashPassword(password);
  if (memberId !== undefined) data.memberId = memberId || null;

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, memberId: true },
  });

  return Response.json(updated);
}