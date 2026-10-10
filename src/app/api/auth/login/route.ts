import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always run verifyPassword even if user not found (prevents timing attacks)
    const dummyHash = "$2a$12$dummyhashtopreventtimingattack00";
    const valid = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, dummyHash).then(() => false);

    if (!user || !valid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      memberId: user.memberId,
    });

    return Response.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, memberId: user.memberId },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}