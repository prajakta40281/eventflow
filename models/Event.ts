import mongoose, { Schema, Document, Model } from "mongoose";

export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number | null;
  cutoffDate: string | null;
  isClosed: boolean;
  hostId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, default: null },
    cutoffDate: { type: String, default: null },
    isClosed: { type: Boolean, default: false },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// eventSchema.index({ slug: 1 });
eventSchema.index({ hostId: 1, createdAt: -1 });

export const EventModel: Model<EventDocument> =
  (mongoose.models.Event as Model<EventDocument>) ||
  mongoose.model<EventDocument>("Event", eventSchema);