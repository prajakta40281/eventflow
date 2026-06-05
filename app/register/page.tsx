"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") === "host" ? "host" : "attendee";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"host" | "attendee">(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Sign up failed."); return; }
      await signIn("credentials", { email, password, redirect: false });
      router.push(role === "host" ? "/dashboard" : "/");
      router.refresh();
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-20 pb-16">
      <div className="bg-white border border-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-ink mb-1">Create an account</h1>
        <p className="text-sm text-ink-muted mb-6">
          {role === "host" ? "Start hosting events" : "Track your registrations"}
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["host", "attendee"] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all font-sans ${
                role === r ? "border-accent bg-accent-light" : "border-border bg-white hover:bg-paper-warm"
              }`}>
              <div className="text-2xl mb-1">{r === "host" ? "🎪" : "🎟️"}</div>
              <div className="text-sm font-medium">{r === "host" ? "I'm a Host" : "I'm an Attendee"}</div>
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Full name</label>
            <input type="text" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
              placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Email</label>
            <input type="email" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
              placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Password</label>
            <input type="password" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
              placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="btn btn-primary w-full mt-1" disabled={loading}>
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <div className="border-t border-border my-6" />
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}