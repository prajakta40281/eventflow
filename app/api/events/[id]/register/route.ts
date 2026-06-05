import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/models/Event";
import { UserModel } from "@/models/User";
import { RegistrationModel } from "@/models/Registration";
import { checkRegistrationOpen } from "@/lib/utils";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields required." }, { status: 400 });

    if (!emailRegex.test(email))
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    await connectDB();

    const event = await EventModel.findById(id).lean();
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const regCount = await RegistrationModel.countDocuments({ eventId: event._id, cancelledAt: null });
    const isOpen = checkRegistrationOpen({
      isClosed: event.isClosed,
      cutoffDate: event.cutoffDate,
      capacity: event.capacity,
      registrationCount: regCount,
      date: event.date,
    });

    if (!isOpen)
      return NextResponse.json({ error: "Registrations are closed." }, { status: 403 });

    const normalizedEmail = email.toLowerCase().trim();
    let user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      const hashed = await bcrypt.hash(password, 12);
      user = await UserModel.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashed,
        role: "attendee",
      });
    }

    const existing = await RegistrationModel.findOne({ eventId: event._id, attendeeId: user._id });
    if (existing) {
      if (existing.cancelledAt) {
        existing.cancelledAt = null;
        await existing.save();
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "You are already registered." }, { status: 409 });
    }

    await RegistrationModel.create({
      eventId: event._id,
      attendeeId: user._id,
      name: name.trim(),
      email: normalizedEmail,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}