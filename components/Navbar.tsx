"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg tracking-tight text-ink">
          event<span className="text-accent">flow</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/" className="btn btn-ghost btn-sm">Browse</Link>
          {session ? (
            <>
              {session.user.role === "host" && (
                <>
                  <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                  <Link href="/dashboard/create" className="btn btn-primary btn-sm">+ New Event</Link>
                </>
              )}
              {session.user.role === "attendee" && (
                <Link href="/my-events" className="btn btn-ghost btn-sm">My Events</Link>
              )}
              <span className="text-sm text-ink-muted ml-2 pl-3 border-l border-border max-w-[120px] truncate">
                {session.user.name}
              </span>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-secondary btn-sm ml-1">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="sm:hidden flex flex-col gap-1.5 p-2" onClick={() => setOpen(!open)}>
          <span className={`block w-5 h-0.5 bg-ink transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-ink transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-ink transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-border bg-white px-5 py-4 flex flex-col gap-2">
          <Link href="/" className="btn btn-ghost w-full justify-start" onClick={() => setOpen(false)}>Browse</Link>
          {session ? (
            <>
              {session.user.role === "host" && (
                <>
                  <Link href="/dashboard" className="btn btn-ghost w-full justify-start" onClick={() => setOpen(false)}>Dashboard</Link>
                  <Link href="/dashboard/create" className="btn btn-primary w-full" onClick={() => setOpen(false)}>+ New Event</Link>
                </>
              )}
              {session.user.role === "attendee" && (
                <Link href="/my-events" className="btn btn-ghost w-full justify-start" onClick={() => setOpen(false)}>My Events</Link>
              )}
              <div className="border-t border-border pt-3 mt-1">
                <p className="text-sm text-ink-muted mb-2">{session.user.name}</p>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-secondary w-full">Sign out</button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost w-full justify-start" onClick={() => setOpen(false)}>Log in</Link>
              <Link href="/register" className="btn btn-primary w-full" onClick={() => setOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}