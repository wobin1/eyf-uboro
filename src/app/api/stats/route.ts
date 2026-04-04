import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/stats — dashboard statistics
export async function GET() {
  try {
    const [totalChurches, totalMembers, checkedInMembers, recentCheckIns] =
      await Promise.all([
        prisma.church.count(),
        prisma.member.count(),
        prisma.member.count({ where: { checkedIn: true } }),
        prisma.member.findMany({
          where: { checkedIn: true },
          include: {
            church: { select: { name: true } },
          },
          orderBy: { checkedInAt: "desc" },
          take: 10,
        }),
      ]);

    // Per-church stats
    const churches = await prisma.church.findMany({
      include: {
        _count: { select: { members: true } },
        members: {
          select: { checkedIn: true },
        },
      },
      orderBy: { name: "asc" },
    });

    type ChurchWithCounts = Prisma.ChurchGetPayload<{
      include: {
        _count: { select: { members: true } };
        members: { select: { checkedIn: true } };
      };
    }>;

    const churchStats = (churches as ChurchWithCounts[]).map((church) => ({
      id: church.id,
      name: church.name,
      total: church._count.members,
      checkedIn: church.members.filter((m) => m.checkedIn).length,
    }));

    return Response.json({
      totalChurches,
      totalMembers,
      checkedInMembers,
      pendingMembers: totalMembers - checkedInMembers,
      churchStats,
      recentCheckIns: recentCheckIns.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        church: m.church.name,
        checkedInAt: m.checkedInAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
