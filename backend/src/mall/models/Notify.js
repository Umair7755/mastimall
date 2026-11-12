import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notifySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

notifySchema.index({ product: 1, phone: 1 }, { unique: true });

export const Notify = model("Notify", notifySchema);
