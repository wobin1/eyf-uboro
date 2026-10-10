import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/churches/[id] — get church with all members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const church = await prisma.church.findUnique({
      where: { id },
      include: {
        members: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!church) {
      return Response.json({ error: "Church not found" }, { status: 404 });
    }

    return Response.json(church);
  } catch (error) {
    console.error("Failed to fetch church:", error);
    return Response.json({ error: "Failed to fetch church" }, { status: 500 });
  }
}

// PUT /api/churches/[id] — update church
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, pastor, phone, email } = body;

    const church = await prisma.church.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(pastor !== undefined && { pastor: pastor?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
      },
    });

    return Response.json(church);
  } catch (error) {
    console.error("Failed to update church:", error);
    return Response.json({ error: "Failed to update church" }, { status: 500 });
  }
}

// DELETE /api/churches/[id] — delete church (cascades to members)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.church.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete church:", error);
    return Response.json({ error: "Failed to delete church" }, { status: 500 });
  }
}
