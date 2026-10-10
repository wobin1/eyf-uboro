import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export default async function MyTicketPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "INVITEE") redirect("/");

  if (!session.memberId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No ticket linked to your account. Contact an admin.</p>
      </div>
    );
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    include: { church: true },
  });

  if (!member) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar with logout */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-yellow-500 to-yellow-600 flex items-center justify-center font-bold text-black text-sm">
            E
          </div>
          <span className="font-semibold text-foreground">EYF Uboro</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{session.name}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Ticket */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-center mb-6">
            <h1 className="font-bold text-2xl">Your Ticket</h1>
            <p className="text-gray-400 text-sm mt-1">EYF Uboro Dinner Event</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Name</span>
              <span className="font-medium">{member.firstName} {member.lastName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Church</span>
              <span className="font-medium">{member.church.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Ticket ID</span>
              <code className="text-yellow-400 text-xs">{member.ticketId}</code>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Status</span>
              {member.checkedIn
                ? <span className="text-green-400 font-medium">✓ Checked In</span>
                : <span className="text-yellow-400 font-medium">Not yet checked in</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}