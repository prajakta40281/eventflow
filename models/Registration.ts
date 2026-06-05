import mongoose, { Schema, Document, Model } from "mongoose";

export interface RegistrationDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  attendeeId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  cancelledAt: Date | null;
  registeredAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registrationSchema = new Schema<RegistrationDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    attendeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Attendee ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => emailRegex.test(v),
        message: "Please provide a valid email address",
      },
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: "registeredAt", updatedAt: false } }
);

registrationSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, cancelledAt: 1 });
registrationSchema.index({ attendeeId: 1, registeredAt: -1 });

export const RegistrationModel: Model<RegistrationDocument> =
  (mongoose.models.Registration as Model<RegistrationDocument>) ||
  mongoose.model<RegistrationDocument>("Registration", registrationSchema);