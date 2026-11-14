import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const mallBlocklistSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ['user', 'guest', 'phone', 'email'],
      required: true,
      index: true,
    },
    /** user ObjectId, guestId / visitorId, normalized phone, or email */
    value: { type: String, required: true, maxlength: 120, index: true },
    /** Optional mall_vid when known at block time */
    visitorId: { type: String, default: '', maxlength: 64, index: true },
    reason: { type: String, default: '', maxlength: 240 },
    active: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'MallCustomer', default: null },
    label: { type: String, default: '', maxlength: 120 },
  },
  { timestamps: true }
);

mallBlocklistSchema.index({ kind: 1, value: 1, active: 1 });

export const MallBlocklist = model('MallBlocklist', mallBlocklistSchema);
