import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/members/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        church: { select: { id: true, name: true } },
      },
    });

    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    return Response.json(member);
  } catch (error) {
    console.error("Failed to fetch member:", error);
    return Response.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

// PUT /api/members/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      include: {
        church: { select: { id: true, name: true } },
      },
    });

    return Response.json(member);
  } catch (error) {
    console.error("Failed to update member:", error);
    return Response.json({ error: "Failed to update member" }, { status: 500 });
  }
}

// DELETE /api/members/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.member.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete member:", error);
    return Response.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
