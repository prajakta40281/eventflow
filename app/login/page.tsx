"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Incorrect email or password."); return; }
      router.push(callbackUrl);
      router.refresh();
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-20 pb-16">
      <div className="bg-white border border-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-ink-muted mb-7">Sign in to your EventFlow account</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Email</label>
            <input type="email" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
              placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">Password</label>
            <input type="password" className="w-full px-3.5 py-2.5 border border-border rounded bg-white text-sm outline-none focus:border-accent placeholder:text-gray-400 transition-colors"
              placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="btn btn-primary w-full mt-1" disabled={loading}>
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="border-t border-border my-6" />
        <p className="text-center text-sm text-ink-muted">
          No account?{" "}
          <Link href="/register" className="text-accent font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}