import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/models/Event";
import { RegistrationModel } from "@/models/Registration";
import { toCSV } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "host")
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { eventId } = await params;
    await connectDB();
    const event = await EventModel.findById(eventId).lean();
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (event.hostId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const regs = await RegistrationModel.find({ eventId, cancelledAt: null })
      .sort({ registeredAt: 1 })
      .lean();
    const fieldsParam = new URL(req.url).searchParams.get("fields") ?? "name,email";
    const allowed = ["name", "email"];
    const fields = fieldsParam
      .split(",")
      .map((f) => f.trim())
      .filter((f) => allowed.includes(f));
    const csv = toCSV(
      regs.map((r) => ({ name: r.name, email: r.email })),
      fields.length ? fields : ["name", "email"]
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${event.slug}-attendees.csv"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}