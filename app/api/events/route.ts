import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/models/Event";
import { RegistrationModel } from "@/models/Registration";
import { makeSlug } from "@/lib/utils";

export async function GET() {
  try {
    await connectDB();
    const events = await EventModel.find({}).sort({ createdAt: -1 }).populate("hostId", "name").lean();
    const counts = await RegistrationModel.aggregate([
      { $match: { cancelledAt: null } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));
    return NextResponse.json(
      events.map((ev) => ({
        _id: ev._id.toString(),
        title: ev.title,
        slug: ev.slug,
        description: ev.description,
        date: ev.date,
        time: ev.time,
        location: ev.location,
        capacity: ev.capacity,
        cutoffDate: ev.cutoffDate,
        isClosed: ev.isClosed,
        registrationCount: countMap.get(ev._id.toString()) ?? 0,
        hostName: (ev.hostId as { name?: string })?.name ?? "Unknown",
        createdAt: ev.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load events." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "host")
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { title, description, date, time, location, capacity, cutoffDate } = await req.json();

    if (!title || !description || !date || !time || !location)
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });

    await connectDB();

    let slug = makeSlug(title);
    const exists = await EventModel.findOne({ slug });
    if (exists) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const event = await EventModel.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      capacity: capacity ? parseInt(capacity, 10) : null,
      cutoffDate: cutoffDate || null,
      isClosed: false,
      hostId: session.user.id,
    });

    return NextResponse.json({ _id: event._id.toString(), slug: event.slug }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}