import mongoose from "mongoose";

const { Schema, model } = mongoose;

const supportThreadSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20, index: true },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastPreview: { type: String, default: "", maxlength: 240 },
    unreadAdmin: { type: Number, default: 0 },
    unreadCustomer: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SupportThread = model("SupportThread", supportThreadSchema);
