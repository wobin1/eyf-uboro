import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, isAdmin } from "@/lib/auth";

// GET /api/users — list all users (ADMIN only)
export async function GET() {
  const session = await getSession();
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, role: true, memberId: true, createdAt: true,
      member: { select: { firstName: true, lastName: true, church: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(users);
}

// POST /api/users — create a user (ADMIN only)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { email, password, name, role, memberId } = await request.json();

  if (!email || !password || !name || !role) {
    return Response.json({ error: "email, password, name, and role are required" }, { status: 400 });
  }
  if (!["ADMIN", "BOUNCER", "INVITEE"].includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return Response.json({ error: "Email already in use" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      name: name.trim(),
      role,
      memberId: memberId || null,
    },
    select: { id: true, email: true, name: true, role: true, memberId: true, createdAt: true },
  });

  return Response.json(user, { status: 201 });
}