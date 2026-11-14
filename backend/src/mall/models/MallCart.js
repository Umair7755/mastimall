import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    href: { type: String, default: '' },
    image: { type: String, default: '' },
    qty: { type: Number, default: 1, min: 1, max: 20 },
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    name: { type: String, default: '', maxlength: 80 },
    phone: { type: String, default: '', maxlength: 20 },
    email: { type: String, default: '', maxlength: 120 },
  },
  { _id: false }
);

const mallCartSchema = new Schema(
  {
    guestId: { type: String, index: true, maxlength: 64 },
    user: { type: Schema.Types.ObjectId, ref: 'MallCustomer', default: null, index: true },
    /** Unguessable link token for WhatsApp / SMS cart resume. */
    resumeToken: { type: String, unique: true, sparse: true, index: true, maxlength: 64 },
    items: { type: [cartItemSchema], default: [] },
    itemCount: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ['active', 'converted', 'abandoned'],
      default: 'active',
      index: true,
    },
    convertedOrderId: { type: Schema.Types.ObjectId, ref: 'MallOrder', default: null },
    contact: { type: contactSchema, default: () => ({}) },
    lastSeenAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

mallCartSchema.index({ guestId: 1, status: 1 });
mallCartSchema.index({ user: 1, status: 1 });

export const MallCart = model('MallCart', mallCartSchema);
