"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";

type Reg = {
  _id: string; eventId: string; eventTitle: string; eventSlug: string;
  eventDate: string; eventTime: string; eventLocation: string;
  registeredAt: string; cancelledAt: string | null;
};

export default function MyEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?callbackUrl=/my-events");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/my-registrations")
      .then(r => r.json())
      .then(data => { setRegs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  async function cancel(id: string) {
    if (!confirm("Cancel this registration?")) return;
    setCancelling(id);
    const res = await fetch(`/api/my-registrations/${id}`, { method: "DELETE" });
    if (res.ok) setRegs(prev => prev.map(r => r._id === id ? { ...r, cancelledAt: new Date().toISOString() } : r));
    setCancelling(null);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-5 h-5 border-2 border-black/10 border-t-ink-muted rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const active = regs.filter(r => !r.cancelledAt);
  const cancelled = regs.filter(r => r.cancelledAt);

  return (
    <div className="pb-16">
      <section className="pt-10 pb-6 px-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-ink">My Events</h1>
          <p className="text-sm text-ink-muted mt-1">Registrations for {session.user.name}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        {regs.length === 0 ? (
          <div className="bg-white border border-border rounded-lg text-center py-12">
            <p className="text-4xl mb-2">🎟️</p>
            <h3 className="text-base font-semibold mb-2">No registrations yet</h3>
            <p className="text-sm text-ink-muted mb-5">Find an event and register.</p>
            <Link href="/" className="btn btn-primary">Browse events</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink mb-3">Active</h2>
                <div className="flex flex-col gap-2">
                  {active.map(reg => {
                    const isPast = new Date(reg.eventDate + "T23:59:59") < new Date();
                    return (
                      <div key={reg._id} className="bg-white border border-border rounded-lg p-5 flex justify-between items-start flex-wrap gap-3">
                        <div>
                          <span className={`badge mb-2 ${isPast ? "badge-past" : "badge-open"}`}>
                            {isPast ? "Past" : "Registered"}
                          </span>
                          <p className="text-sm font-semibold text-ink">
                            <Link href={`/events/${reg.eventSlug}`} className="hover:text-accent transition-colors">
                              {reg.eventTitle}
                            </Link>
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {formatDate(reg.eventDate)} · {formatTime(reg.eventTime)} · {reg.eventLocation}
                          </p>
                        </div>
                        {!isPast && (
                          <button className="btn btn-danger btn-sm" disabled={cancelling === reg._id} onClick={() => cancel(reg._id)}>
                            {cancelling === reg._id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cancelled.length > 0 && (
              <div className="opacity-50">
                <h2 className="text-sm font-semibold text-ink-muted mb-3">Cancelled</h2>
                <div className="flex flex-col gap-2">
                  {cancelled.map(reg => (
                    <div key={reg._id} className="bg-white border border-border rounded-lg p-5">
                      <span className="badge badge-closed mb-2">Cancelled</span>
                      <p className="text-sm font-semibold text-ink">{reg.eventTitle}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{formatDate(reg.eventDate)} · {reg.eventLocation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}