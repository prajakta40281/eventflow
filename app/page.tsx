import Link from "next/link";
import EventCard from "@/components/EventCard";

type Event = {
  _id: string; title: string; slug: string; description: string;
  date: string; time: string; location: string;
  capacity: number | null; cutoffDate: string | null;
  isClosed: boolean; registrationCount: number; hostName: string;
};

async function getEvents(): Promise<Event[]> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/events`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function HomePage() {
  const events = await getEvents();
  const upcoming = events.filter(e => new Date(e.date + "T23:59:59") >= new Date());
  const past = events.filter(e => new Date(e.date + "T23:59:59") < new Date());

  return (
    <div className="pb-16">
      <section className="py-20 px-5 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
          Find your next <span className="text-accent">event</span>
        </h1>
        <p className="text-lg text-ink-muted max-w-md mx-auto mb-8 leading-relaxed">
          Register in seconds. No account needed — just your name, email, and a password to log back in later.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register?role=host" className="btn btn-primary btn-lg">Host an event</Link>
          <Link href="#events" className="btn btn-secondary btn-lg">Browse events</Link>
        </div>
      </section>

      <section id="events" className="max-w-5xl mx-auto px-5">
        {events.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <p className="text-lg mb-1">No events yet.</p>
            <Link href="/register?role=host" className="text-accent hover:underline">Be the first host →</Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-10">
                <h2 className="text-base font-semibold text-ink mb-4">Upcoming</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map(e => <EventCard key={e._id} {...e} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div className="opacity-60">
                <h2 className="text-base font-semibold text-ink-muted mb-4">Past events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map(e => <EventCard key={e._id} {...e} />)}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}