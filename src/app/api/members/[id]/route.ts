import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: { church: { select: { id: true, name: true } } },
    });

    if (!member) return Response.json({ error: "Member not found" }, { status: 404 });
    return Response.json(member);
  } catch (error) {
    console.error("Failed to fetch member:", error);
    return Response.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, phone, email } = body;

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName && { lastName: lastName.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
      },
      include: { church: { select: { id: true, name: true } } },
    });

    return Response.json(member);
  } catch (error) {
    console.error("Failed to update member:", error);
    return Response.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.member.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete member:", error);
    return Response.json({ error: "Failed to delete member" }, { status: 500 });
  }
}