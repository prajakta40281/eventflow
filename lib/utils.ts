import slugify from "slugify";

export function makeSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteStr} ${ampm}`;
}

export function seatsLeftLabel(capacity: number | null, registered: number): string {
  if (capacity === null) return "Unlimited spots";
  const left = capacity - registered;
  if (left <= 0) return "Full";
  if (left === 1) return "1 spot left";
  return `${left} spots left`;
}

export function checkRegistrationOpen(event: {
  isClosed: boolean;
  cutoffDate: string | null;
  capacity: number | null;
  registrationCount: number;
  date: string;
}): boolean {
  if (event.isClosed) return false;
  if (event.cutoffDate && new Date() > new Date(event.cutoffDate)) return false;
  if (event.capacity !== null && event.registrationCount >= event.capacity) return false;
  if (new Date() > new Date(event.date + "T23:59:59")) return false;
  return true;
}

export function toCSV(
  rows: Record<string, string | Date | number>[],
  fields: string[]
): string {
  const header = fields.join(",");
  const body = rows.map((row) =>
    fields.map((f) => {
      const val = row[f];
      if (val == null) return "";
      const str = val instanceof Date ? val.toISOString() : String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  return [header, ...body].join("\n");
}