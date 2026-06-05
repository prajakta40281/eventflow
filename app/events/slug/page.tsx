import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { EventModel } from "@/models/Event";
import { RegistrationModel } from "@/models/Registration";
import { UserModel } from "@/models/User";
import { checkRegistrationOpen } from "@/lib/utils";
import EventPageClient from "./EventPageClient";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  await connectDB();

  const event = await EventModel.findOne({ slug }).lean();
  if (!event) notFound();

  const host = await UserModel.findById(event.hostId).select("name").lean();
  const regCount = await RegistrationModel.countDocuments({ eventId: event._id, cancelledAt: null });

  let alreadyRegistered = false;
  if (session?.user?.role === "attendee") {
    const reg = await RegistrationModel.findOne({
      eventId: event._id,
      attendeeId: session.user.id,
      cancelledAt: null,
    }).lean();
    alreadyRegistered = !!reg;
  }

  const isOpen = checkRegistrationOpen({
    isClosed: event.isClosed,
    cutoffDate: event.cutoffDate,
    capacity: event.capacity,
    registrationCount: regCount,
    date: event.date,
  });

  return (
    <EventPageClient
      event={{
        _id: event._id.toString(),
        title: event.title,
        slug: event.slug,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        capacity: event.capacity,
        cutoffDate: event.cutoffDate,
        isClosed: event.isClosed,
        registrationCount: regCount,
        hostName: host?.name ?? "Unknown",
        isOpen,
      }}
      session={session ? { id: session.user.id, role: session.user.role } : null}
      alreadyRegistered={alreadyRegistered}
    />
  );
}