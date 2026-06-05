"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = { eventId: string; onSuccess: () => void };

export default function RegistrationForm({ eventId, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed."); return; }
      await signIn("credentials", { email, password, redirect: false });
      onSuccess();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink-soft">Full name</label>
        <input type="text" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
          placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink-soft">Email</label>
        <input type="email" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
          placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink-soft">
          Password <span className="font-normal text-xs text-ink-muted">(to log in later)</span>
        </label>
        <input type="password" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
          placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? "Registering…" : "Register for this event"}
      </button>
    </form>
  );
}