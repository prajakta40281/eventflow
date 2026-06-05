export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "host" | "attendee";
  createdAt: Date;
}

export interface IEvent {
  _id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number | null;
  cutoffDate: string | null;
  isClosed: boolean;
  hostId: string;
  createdAt: Date;
}

export interface IRegistration {
  _id: string;
  eventId: string;
  attendeeId: string;
  name: string;
  email: string;
  cancelledAt: Date | null;
  registeredAt: Date;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "host" | "attendee";
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: "host" | "attendee";
  }
  interface JWT {
    id: string;
    role: "host" | "attendee";
  }
}