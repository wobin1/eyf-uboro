import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/members — list members, optionally filter by churchId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const churchId = searchParams.get("churchId");
    const checkedIn = searchParams.get("checkedIn");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (churchId) where.churchId = churchId;
    if (checkedIn !== null && checkedIn !== undefined && checkedIn !== "") {
      where.checkedIn = checkedIn === "true";
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { ticketId: { contains: search, mode: "insensitive" } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      include: {
        church: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(members);
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return Response.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

// POST /api/members — create a new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, churchId } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return Response.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    if (!churchId) {
      return Response.json(
        { error: "Church ID is required" },
        { status: 400 }
      );
    }

    // Verify church exists
    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) {
      return Response.json({ error: "Church not found" }, { status: 404 });
    }

    const member = await prisma.member.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        churchId,
      },
      include: {
        church: { select: { id: true, name: true } },
      },
    });

    return Response.json(member, { status: 201 });
  } catch (error) {
    console.error("Failed to create member:", error);
    return Response.json({ error: "Failed to create member" }, { status: 500 });
  }
}
