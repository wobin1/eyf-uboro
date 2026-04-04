import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/tickets/[ticketId] — get ticket details by ticket ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const member = await prisma.member.findUnique({
      where: { ticketId },
      include: {
        church: { select: { id: true, name: true } },
      },
    });

    if (!member) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }

    return Response.json(member);
  } catch (error) {
    console.error("Failed to fetch ticket:", error);
    return Response.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}
