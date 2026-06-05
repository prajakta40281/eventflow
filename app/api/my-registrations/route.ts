import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/models/Registration";
import { EventModel } from "@/models/Event";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    await connectDB();
    const regs = await RegistrationModel.find({ attendeeId: session.user.id })
      .sort({ registeredAt: -1 })
      .lean();
    const events = await EventModel.find({ _id: { $in: regs.map((r) => r.eventId) } })
      .select("_id title slug date time location")
      .lean();
    const evMap = new Map(events.map((e) => [e._id.toString(), e]));
    return NextResponse.json(
      regs.map((r) => {
        const ev = evMap.get(r.eventId.toString());
        return {
          _id: r._id.toString(),
          eventId: r.eventId.toString(),
          eventTitle: ev?.title ?? "Unknown",
          eventSlug: ev?.slug ?? "",
          eventDate: ev?.date ?? "",
          eventTime: ev?.time ?? "",
          eventLocation: ev?.location ?? "",
          registeredAt: r.registeredAt,
          cancelledAt: r.cancelledAt,
        };
      })
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}