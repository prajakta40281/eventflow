import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/models/Event";
import { RegistrationModel } from "@/models/Registration";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "host")
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const event = await EventModel.findById(id);
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (event.hostId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const { isClosed } = await req.json();
    if (typeof isClosed === "boolean") { event.isClosed = isClosed; await event.save(); }
    return NextResponse.json({ success: true, isClosed: event.isClosed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "host")
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const event = await EventModel.findById(id);
    if (!event) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (event.hostId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    await EventModel.findByIdAndDelete(id);
    await RegistrationModel.deleteMany({ eventId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}