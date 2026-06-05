import mongoose, { Schema, Document, Model } from "mongoose";

export interface RegistrationDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  attendeeId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  cancelledAt: Date | null;
  registeredAt: Date;
}

const registrationSchema = new Schema<RegistrationDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "registeredAt", updatedAt: false } }
);

registrationSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, cancelledAt: 1 });
registrationSchema.index({ attendeeId: 1, registeredAt: -1 });

export const RegistrationModel: Model<RegistrationDocument> =
  (mongoose.models.Registration as Model<RegistrationDocument>) ||
  mongoose.model<RegistrationDocument>("Registration", registrationSchema);