import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const churches = await prisma.church.findMany({
      include: {
        _count: { select: { members: true } },
        members: { select: { checkedIn: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    type ChurchWithCounts = {
      id: string; name: string; pastor: string | null; phone: string | null;
      email: string | null; createdAt: Date; updatedAt: Date;
      _count: { members: number }; members: { checkedIn: boolean }[];
    };

    const result = (churches as ChurchWithCounts[]).map((church) => ({
      ...church,
      memberCount: church._count.members,
      checkedInCount: church.members.filter((m) => m.checkedIn).length,
      members: undefined,
      _count: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch churches:", error);
    return Response.json({ error: "Failed to fetch churches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { name, pastor, phone, email } = body;

    if (!name || !name.trim()) {
      return Response.json({ error: "Church name is required" }, { status: 400 });
    }

    const church = await prisma.church.create({
      data: {
        name: name.trim(),
        pastor: pastor?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      },
    });

    return Response.json(church, { status: 201 });
  } catch (error) {
    console.error("Failed to create church:", error);
    return Response.json({ error: "Failed to create church" }, { status: 500 });
  }
}