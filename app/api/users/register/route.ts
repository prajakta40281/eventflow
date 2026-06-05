import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role)
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    if (!["host", "attendee"].includes(role))
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    
    await connectDB();
    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const hashed = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
    });
    return NextResponse.json(
      { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}