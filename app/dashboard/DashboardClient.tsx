"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

type EventSummary = {
  _id: string; title: string; slug: string;
  date: string; time: string; location: string;
  isClosed: boolean; capacity: number | null;
  registrationCount: number; createdAt: string;
};

type Reg = {
  _id: string; name: string; email: string;
  registeredAt: string; eventId: string; eventTitle: string;
};

export default function DashboardClient({ events }: { events: EventSummary[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(events[0]?._id ?? null);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exportFields, setExportFields] = useState("name,email");

  async function loadRegs(id: string) {
    if (loadedId === id) return;
    setLoadingRegs(true);
    const res = await fetch(`/api/registrations?eventId=${id}`);
    if (res.ok) { setRegs(await res.json()); setLoadedId(id); }
    setLoadingRegs(false);
  }

  function select(id: string) { setSelectedId(id); setSearch(""); loadRegs(id); }

  async function toggleClose(ev: EventSummary) {
    setToggling(ev._id);
    await fetch(`/api/events/${ev._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isClosed: !ev.isClosed }),
    });
    router.refresh();
    setToggling(null);
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event and all registrations? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(null);
  }

  const selectedEvent = events.find(e => e._id === selectedId);
  const filtered = regs.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  if (events.length === 0) {
    return (
      <div className="bg-white border border-border rounded-lg text-center py-12 px-6">
        <p className="text-4xl mb-2">🎪</p>
        <h3 className="text-base font-semibold mb-2">No events yet</h3>
        <p className="text-sm text-ink-muted mb-5">Create your first event to start getting registrations.</p>
        <Link href="/dashboard/create" className="btn btn-primary">Create an event</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-sm font-semibold text-ink mb-3">Your events</h2>
        <div className="flex flex-col gap-2">
          {events.map(ev => (
            <div key={ev._id} onClick={() => select(ev._id)}
              className={`bg-white rounded-lg p-4 cursor-pointer transition-all border-2 ${
                selectedId === ev._id ? "border-accent bg-accent-light" : "border-border hover:border-gray-300"
              }`}>
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{ev.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{formatDate(ev.date)} · {ev.location}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge bg-blue-50 text-blue-600">{ev.registrationCount} registered</span>
                  <button className="btn btn-secondary btn-sm" disabled={toggling === ev._id}
                    onClick={e => { e.stopPropagation(); toggleClose(ev); }}>
                    {ev.isClosed ? "Reopen" : "Close"}
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={deleting === ev._id}
                    onClick={e => { e.stopPropagation(); deleteEvent(ev._id); }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div>
          <div className="flex justify-between items-center flex-wrap gap-3 mb-3">
            <h2 className="text-sm font-semibold text-ink">Registrations — {selectedEvent.title}</h2>
            <div className="flex items-center gap-2">
              <select className="border border-border rounded px-3 py-1.5 text-xs bg-white text-ink outline-none focus:border-accent"
                value={exportFields} onChange={e => setExportFields(e.target.value)}>
                <option value="name,email">Name + Email</option>
                <option value="email">Email only</option>
              </select>
              <a href={`/api/export/${selectedEvent._id}?fields=${exportFields}`} download className="btn btn-secondary btn-sm">
                ↓ Export CSV
              </a>
            </div>
          </div>

          <input type="search" placeholder="Search by name or email…"
            className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors mb-3"
            value={search} onChange={e => setSearch(e.target.value)} />

          {loadingRegs ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-black/10 border-t-ink-muted rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-border rounded-lg text-center py-8 text-sm text-ink-muted">
              {search ? "No results match your search." : "No registrations yet for this event."}
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-paper-warm border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide w-10">#</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Registered at</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg, i) => (
                    <tr key={reg._id} className="border-b border-border last:border-0 hover:bg-paper transition-colors">
                      <td className="px-4 py-3 text-xs text-ink-muted">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-ink-soft">{reg.name}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${reg.email}`} className="text-sm text-accent hover:underline">{reg.email}</a>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">
                        {new Date(reg.registeredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}