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
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const events = await getEvents();
  const upcoming = events.filter(e => new Date(e.date + "T23:59:59") >= new Date());
  const past = events.filter(e => new Date(e.date + "T23:59:59") < new Date());

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <section style={{ padding: "5rem 1.25rem 4rem", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 1rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
          Find your next{" "}
          <span style={{ color: "var(--accent)" }}>event</span>
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--ink-muted)", margin: "0 0 2rem", maxWidth: "500px", marginInline: "auto" }}>
          Register for events in seconds. No account needed — just your name and email.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/register?role=host" className="btn btn-primary">Host an event</Link>
          <Link href="#events" className="btn btn-secondary">Browse events</Link>
        </div>
      </section>

      <section id="events" className="container">
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--ink-muted)" }}>
            <p>No events yet. <Link href="/register?role=host" style={{ color: "var(--accent)" }}>Be the first host.</Link></p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Upcoming</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
                  {upcoming.map(e => <EventCard key={e._id} {...e} />)}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "var(--ink-muted)" }}>Past events</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", opacity: 0.6 }}>
                  {past.map(e => <EventCard key={e._id} {...e} />)}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}