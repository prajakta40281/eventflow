import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/models/Event";
import { RegistrationModel } from "@/models/Registration";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "host")
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const eventId = new URL(req.url).searchParams.get("eventId");
    await connectDB();
    if (eventId) {
      const event = await EventModel.findOne({ _id: eventId, hostId: session.user.id });
      if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const hostEvents = await EventModel.find({ hostId: session.user.id }).select("_id title").lean();
    const eventTitleMap = new Map(hostEvents.map((e) => [e._id.toString(), e.title]));
    const ids = eventId ? [eventId] : hostEvents.map((e) => e._id);
    const regs = await RegistrationModel.find({ eventId: { $in: ids }, cancelledAt: null })
      .sort({ registeredAt: -1 })
      .lean();
    return NextResponse.json(
      regs.map((r) => ({
        _id: r._id.toString(),
        name: r.name,
        email: r.email,
        registeredAt: r.registeredAt,
        eventId: r.eventId.toString(),
        eventTitle: eventTitleMap.get(r.eventId.toString()) ?? "Unknown",
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

