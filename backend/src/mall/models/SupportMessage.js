import mongoose from "mongoose";

const { Schema, model } = mongoose;

const supportMessageSchema = new Schema(
  {
    thread: { type: Schema.Types.ObjectId, ref: "SupportThread", required: true, index: true },
    from: { type: String, enum: ["customer", "admin", "system"], required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

supportMessageSchema.index({ thread: 1, createdAt: 1 });

export const SupportMessage = model("SupportMessage", supportMessageSchema);
