"use client";

import { useState } from "react";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import { formatDate, formatTime } from "@/lib/utils";

type EventData = {
  _id: string; title: string; slug: string; description: string;
  date: string; time: string; location: string; capacity: number | null;
  cutoffDate: string | null; isClosed: boolean; registrationCount: number;
  hostName: string; isOpen: boolean;
};

export default function EventPageClient({
  event, session, alreadyRegistered,
}: {
  event: EventData;
  session: { id: string; role: string } | null;
  alreadyRegistered: boolean;
}) {
  const [registered, setRegistered] = useState(alreadyRegistered);
  const [regCount, setRegCount] = useState(event.registrationCount);
  const isPast = new Date(event.date + "T23:59:59") < new Date();

  return (
    <div className="pb-16">
      <section className="bg-ink text-white py-12 px-5">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm text-white/50 hover:text-white/80 block mb-5">← All events</Link>
          <span className={`badge mb-3 ${isPast ? "badge-past" : event.isOpen ? "badge-open" : "badge-closed"}`}>
            {isPast ? "Past event" : event.isOpen ? "Registrations open" : "Registrations closed"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-2 tracking-tight">{event.title}</h1>
          <p className="text-white/55 text-sm">Hosted by {event.hostName}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_300px] gap-6 items-start">

          <div className="flex flex-col gap-5">
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">Event details</h3>
              <div className="flex flex-col gap-2.5">
                <p className="text-sm text-ink-soft">📅 {formatDate(event.date)} at {formatTime(event.time)}</p>
                <p className="text-sm text-ink-soft">📍 {event.location}</p>
                <p className="text-sm text-ink-soft">
                  👥 {regCount} registered
                  {event.capacity !== null && (
                    <span className="text-ink-muted"> · {Math.max(0, event.capacity - regCount)} spots left</span>
                  )}
                </p>
                {event.cutoffDate && (
                  <p className="text-sm text-ink-soft">⏰ Closes {formatDate(event.cutoffDate)}</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">About this event</h3>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6 sm:sticky sm:top-20">
            {isPast ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">🏁</p>
                <p className="text-sm text-ink-muted">This event has already taken place.</p>
              </div>
            ) : registered ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">🎉</p>
                <h3 className="text-base font-semibold mb-1">You&apos;re in!</h3>
                <p className="text-sm text-ink-muted mb-4">See all your registered events.</p>
                <Link href="/my-events" className="btn btn-secondary w-full">My events →</Link>
              </div>
            ) : !event.isOpen ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">🔒</p>
                <p className="text-sm text-ink-muted">Registrations are closed.</p>
              </div>
            ) : session?.role === "host" ? (
              <p className="text-sm text-ink-muted text-center py-4">
                You&apos;re logged in as a host. Use an attendee account to register.
              </p>
            ) : (
              <>
                <h3 className="text-base font-semibold mb-5">Register for free</h3>
                <RegistrationForm
                  eventId={event._id}
                  onSuccess={() => { setRegistered(true); setRegCount(c => c + 1); }}
                />
                {!session && (
                  <p className="text-xs text-ink-muted text-center mt-4">
                    Already registered?{" "}
                    <Link href="/login" className="text-accent hover:underline">Log in</Link>
                  </p>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}