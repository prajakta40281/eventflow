import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/models/Event";
import { RegistrationModel } from "@/models/Registration";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard");
  if (session.user.role !== "host") redirect("/");

  await connectDB();
  const events = await EventModel.find({ hostId: session.user.id }).sort({ createdAt: -1 }).lean();
  const counts = await RegistrationModel.aggregate([
    { $match: { eventId: { $in: events.map(e => e._id) }, cancelledAt: null } },
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

  const safeEvents = events.map(ev => ({
    _id: ev._id.toString(), title: ev.title, slug: ev.slug,
    date: ev.date, time: ev.time, location: ev.location,
    isClosed: ev.isClosed, capacity: ev.capacity,
    registrationCount: countMap.get(ev._id.toString()) ?? 0,
    createdAt: ev.createdAt.toISOString(),
  }));

  const stats = [
    { label: "Events", value: safeEvents.length },
    { label: "Registrations", value: safeEvents.reduce((a, e) => a + e.registrationCount, 0) },
    { label: "Open events", value: safeEvents.filter(e => !e.isClosed).length },
  ];

  return (
    <div className="pb-16">
      <section className="pt-10 pb-6 px-5">
        <div className="max-w-5xl mx-auto flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
            <p className="text-sm text-ink-muted mt-1">Hi {session.user.name} — manage your events below</p>
          </div>
          <Link href="/dashboard/create" className="btn btn-primary">+ New Event</Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white border border-border rounded-lg p-6">
              <p className="text-3xl font-bold text-ink">{s.value}</p>
              <p className="text-xs text-ink-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <DashboardClient events={safeEvents} />
      </div>
    </div>
  );
}