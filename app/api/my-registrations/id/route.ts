import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/models/Registration";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const reg = await RegistrationModel.findById(id);
    if (!reg) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (reg.attendeeId.toString() !== session.user.id)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (reg.cancelledAt)
      return NextResponse.json({ error: "Already cancelled." }, { status: 400 });
    reg.cancelledAt = new Date();
    await reg.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}