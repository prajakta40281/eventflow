"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "", location: "", capacity: "", cutoffDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inputClass = "w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create event."); return; }
      router.push(`/events/${data.slug}`);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-16">
      <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink block mb-6">← Dashboard</Link>
      <h1 className="text-2xl font-bold text-ink mb-1">Create an event</h1>
      <p className="text-sm text-ink-muted mb-7">A shareable link is generated automatically from the title.</p>

      <div className="bg-white border border-border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Event title *</label>
            <input type="text" className={inputClass} placeholder="Byamn Dev Meetup 2026"
              value={form.title} onChange={e => update("title", e.target.value)} required autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Description *</label>
            <textarea className={`${inputClass} resize-y min-h-[120px]`} rows={5}
              placeholder="What's this event about?"
              value={form.description} onChange={e => update("description", e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-soft">Date *</label>
              <input type="date" className={inputClass} value={form.date} onChange={e => update("date", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-soft">Time *</label>
              <input type="time" className={inputClass} value={form.time} onChange={e => update("time", e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Location *</label>
            <input type="text" className={inputClass} placeholder="Bengaluru or Online via Zoom"
              value={form.location} onChange={e => update("location", e.target.value)} required />
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-soft">
                Capacity <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input type="number" className={inputClass} placeholder="Unlimited" min={1}
                value={form.capacity} onChange={e => update("capacity", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-soft">
                Reg. cutoff <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input type="date" className={inputClass} value={form.cutoffDate} onChange={e => update("cutoffDate", e.target.value)} />
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Creating…" : "Create event"}
            </button>
            <Link href="/dashboard" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}