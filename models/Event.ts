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

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const eventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
      validate: {
        validator: (v: string) => dateRegex.test(v),
        message: "Date must be in YYYY-MM-DD format",
      },
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      validate: {
        validator: (v: string) => timeRegex.test(v),
        message: "Time must be in HH:MM 24-hour format",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters"],
      maxlength: [300, "Location cannot exceed 300 characters"],
    },
    capacity: {
      type: Number,
      default: null,
      min: [1, "Capacity must be at least 1"],
      max: [100000, "Capacity cannot exceed 100,000"],
      validate: {
        validator: (v: number | null) => v === null || Number.isInteger(v),
        message: "Capacity must be a whole number",
      },
    },
    cutoffDate: {
      type: String,
      default: null,
      validate: {
        validator: (v: string | null) => v === null || dateRegex.test(v),
        message: "Cutoff date must be in YYYY-MM-DD format",
      },
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Host ID is required"],
    },
  },
  { timestamps: true }
);

// eventSchema.index({ slug: 1 });
eventSchema.index({ hostId: 1, createdAt: -1 });

export const EventModel: Model<EventDocument> =
  (mongoose.models.Event as Model<EventDocument>) ||
  mongoose.model<EventDocument>("Event", eventSchema);