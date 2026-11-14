import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/** One document per visitor per calendar day (Asia/Karachi). */
const mallVisitSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true, maxlength: 64 },
    day: { type: String, required: true, index: true, maxlength: 10 },
    userId: { type: Schema.Types.ObjectId, ref: 'MallCustomer', default: null },
    path: { type: String, default: '/', maxlength: 200 },
  },
  { timestamps: true }
);

mallVisitSchema.index({ visitorId: 1, day: 1 }, { unique: true });

export const MallVisit = model('MallVisit', mallVisitSchema);
