import Link from "next/link";
import { formatDate, formatTime, checkRegistrationOpen } from "@/lib/utils";

type Props = {
  _id: string; title: string; slug: string; description: string;
  date: string; time: string; location: string;
  capacity: number | null; cutoffDate: string | null;
  isClosed: boolean; registrationCount: number; hostName: string;
};

export default function EventCard(props: Props) {
  const isOpen = checkRegistrationOpen({
    isClosed: props.isClosed,
    cutoffDate: props.cutoffDate,
    capacity: props.capacity,
    registrationCount: props.registrationCount,
    date: props.date,
  });
  const isPast = new Date(props.date + "T23:59:59") < new Date();

  return (
    <Link href={`/events/${props.slug}`} className="block group">
      <article className="bg-white border border-border rounded-lg p-6 h-full flex flex-col gap-3 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md cursor-pointer">
        <div className="flex justify-between items-start">
          <span className={`badge ${isPast ? "badge-past" : isOpen ? "badge-open" : "badge-closed"}`}>
            {isPast ? "Past" : isOpen ? "Open" : "Closed"}
          </span>
          <span className="text-xs text-ink-muted">{props.registrationCount} going</span>
        </div>
        <h3 className="text-base font-semibold text-ink leading-snug">{props.title}</h3>
        <p className="text-sm text-ink-muted leading-relaxed line-clamp-2 flex-1">{props.description}</p>
        <div className="pt-3 border-t border-border flex flex-col gap-1">
          <p className="text-xs text-ink-soft">📅 {formatDate(props.date)} · {formatTime(props.time)}</p>
          <p className="text-xs text-ink-muted">📍 {props.location}</p>
        </div>
        <p className="text-xs text-ink-muted">by {props.hostName}</p>
      </article>
    </Link>
  );
}