import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!isAdmin(session)) return Response.json({ error: "Forbidden" }, { status: 403 });

    const [totalChurches, totalMembers, checkedInMembers, recentCheckIns] =
      await Promise.all([
        prisma.church.count(),
        prisma.member.count(),
        prisma.member.count({ where: { checkedIn: true } }),
        prisma.member.findMany({
          where: { checkedIn: true },
          include: { church: { select: { name: true } } },
          orderBy: { checkedInAt: "desc" },
          take: 10,
        }),
      ]);

    const churches = await prisma.church.findMany({
      include: {
        _count: { select: { members: true } },
        members: { select: { checkedIn: true } },
      },
      orderBy: { name: "asc" },
    });

    type ChurchWithCounts = {
      id: string; name: string;
      _count: { members: number };
      members: { checkedIn: boolean }[];
    };

    const churchStats = (churches as ChurchWithCounts[]).map((church) => ({
      id: church.id, name: church.name,
      total: church._count.members,
      checkedIn: church.members.filter((m) => m.checkedIn).length,
    }));

    return Response.json({
      totalChurches, totalMembers, checkedInMembers,
      pendingMembers: totalMembers - checkedInMembers,
      churchStats,
      recentCheckIns: recentCheckIns.map((m: {
        id: string; firstName: string; lastName: string;
        checkedInAt: Date | null; church: { name: string };
      }) => ({
        id: m.id, name: `${m.firstName} ${m.lastName}`,
        church: m.church.name, checkedInAt: m.checkedInAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}