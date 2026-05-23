import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getSession, isAdminOrBouncer } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!isAdminOrBouncer(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return Response.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { ticketId },
      include: { church: { select: { id: true, name: true } } },
    });

    if (!member) {
      return Response.json({
        error: "Invalid ticket",
        message: "No ticket found with this code. Please check the QR code.",
      }, { status: 404 });
    }

    if (member.checkedIn) {
      return Response.json({
        error: "Already checked in",
        message: `${member.firstName} ${member.lastName} was already checked in at ${member.checkedInAt?.toLocaleString()}.`,
        member: {
          id: member.id, firstName: member.firstName,
          lastName: member.lastName, church: member.church, checkedInAt: member.checkedInAt,
        },
      }, { status: 409 });
    }

    const updatedMember = await prisma.member.update({
      where: { ticketId },
      data: { checkedIn: true, checkedInAt: new Date() },
      include: { church: { select: { id: true, name: true } } },
    });

    return Response.json({
      success: true,
      message: `Welcome, ${updatedMember.firstName} ${updatedMember.lastName}!`,
      member: {
        id: updatedMember.id, firstName: updatedMember.firstName,
        lastName: updatedMember.lastName, church: updatedMember.church,
        checkedInAt: updatedMember.checkedInAt,
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return Response.json({ error: "Scan failed" }, { status: 500 });
  }
}