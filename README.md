# EventFlow

A full-stack event registration and management system built for the Byamn Summer Web Development Internship 2026.

Hosts create events and manage registrations from a protected dashboard. Attendees register on a public event page — no account needed upfront.

**Live URL:** https://eventflow-omega-one.vercel.app  
**GitHub:** https://github.com/prajakta40281/eventflow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Frontend | React 19 |
| Language | TypeScript (strict mode, no `any` types) |
| Styling | Tailwind CSS v4 |
| Database | MongoDB Atlas (free tier) |
| Auth | NextAuth.js v5 (beta) |

---

## Features

### Host
- Sign up and log in via NextAuth credentials provider
- Create events with title, description, date, time, location, capacity, and registration cutoff
- Protected dashboard — only the event creator can view their own registrations
- Search and filter attendees by name or email
- Manually close or reopen registrations
- Delete events (removes all associated registrations)
- Export attendee list as CSV — Name + Email only, passwords never included

### Attendee
- Browse all public events without logging in
- Register for an event by submitting Name, Email, and Password
- Password is hashed with bcrypt before storage — never stored in plain text
- Log in to view all registered events in one place
- Cancel a registration after logging in

### Bonus Features
- Duplicate registration prevention — same email cannot register twice per event
- Auto-close when event reaches capacity
- Registration cutoff date enforcement
- Responsive, mobile-first UI with hamburger menu on mobile

---

## Security

| Requirement | How it's handled |
|---|---|
| Host dashboard protected | Every registrations API route checks `session.user.id` against `event.hostId` — mismatches return 403 |
| Passwords hashed | `bcrypt.hash(password, 12)` before saving to MongoDB — plain text never touches the database |
| Passwords never in dashboard | `Registration` model has no password field — structurally impossible to expose |
| Passwords never in CSV export | Export API only selects `name` and `email` fields — password field does not exist on Registration |
| TypeScript throughout | `strict: true` and `noImplicitAny: true` in `tsconfig.json` — zero `any` types in the codebase |

---

## Project Structure

    eventflow/
    ├── app/
    │   ├── api/
    │   │   ├── auth/[...nextauth]/route.ts
    │   │   ├── events/
    │   │   │   ├── route.ts
    │   │   │   └── [id]/
    │   │   │       ├── route.ts
    │   │   │       └── register/route.ts
    │   │   ├── registrations/route.ts
    │   │   ├── my-registrations/
    │   │   │   ├── route.ts
    │   │   │   └── [id]/route.ts
    │   │   ├── export/[eventId]/route.ts
    │   │   └── users/register/route.ts
    │   ├── dashboard/
    │   │   ├── page.tsx
    │   │   ├── DashboardClient.tsx
    │   │   └── create/page.tsx
    │   ├── events/[slug]/
    │   │   ├── page.tsx
    │   │   └── EventPageClient.tsx
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── my-events/page.tsx
    │   ├── globals.css
    │   └── layout.tsx
    ├── components/
    │   ├── Navbar.tsx
    │   ├── EventCard.tsx
    │   └── RegistrationForm.tsx
    ├── lib/
    │   ├── db.ts
    │   ├── auth.ts
    │   └── utils.ts
    ├── models/
    │   ├── User.ts
    │   ├── Event.ts
    │   └── Registration.ts
    ├── types/
    │   └── index.ts
    ├── .env.example
    └── README.md

---

## Running Locally

### Prerequisites

- Node.js 18 or higher
- A MongoDB Atlas account (free tier)
- Git

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/eventflow.git
cd eventflow
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/eventflow?retryWrites=true&w=majority
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**4. Run the dev server**

```bash
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random string used to sign JWT tokens |
| `NEXTAUTH_URL` | Full URL of your app — no trailing slash |

---

## MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free M0 cluster
2. Under **Security → Database Access** — create a user with password auth
3. Under **Security → Network Access** — add `0.0.0.0/0` to allow access from anywhere
4. Under **Database → Connect → Drivers** — copy the connection string
5. Replace `<password>` with your user's password and add `/eventflow` before `?retryWrites`

---

## Deployment (Vercel)

**1. Push to GitHub**

```bash
git add .
git commit -m "feat: complete eventflow app"
git push origin main
```

**2. Import to Vercel**

- Go to https://vercel.com → New Project → Import your repo
- Add these environment variables before deploying:

| Name | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `NEXTAUTH_SECRET` | Your generated secret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

**3. Deploy**

Click Deploy. Vercel auto-detects Next.js. Takes about 2 minutes.

---

## How It Works

1. Host signs up at `/register` and selects "I'm a Host"
2. Host creates an event at `/dashboard/create`
3. A public link is generated: `/events/byamn-dev-meetup-2026`
4. Attendee opens the link, fills Name, Email, Password and registers
5. Attendee account is created and they are signed in automatically
6. Host opens `/dashboard` and sees Name and Email only — no passwords shown
7. Host clicks Export CSV and downloads the attendee list

---

## Author

Built by Prajakta Mundkar for Byamn Summer Web Development Internship 2026.
