import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'MallCustomer' },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        slug: String,
        image: String,
        unitPrice: Number,
        qty: Number,
      },
    ],
    customer: { name: String, phone: String, city: String, address: String, notes: String },
    payment: {
      method: { type: String, enum: ['cod', 'jazzcash', 'easypaisa', 'bank'], default: 'cod' },
      status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      advancePlan: {
        type: String,
        enum: ['none', '25', '50', '100'],
        default: 'none',
        index: true,
      },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      advancePercent: { type: Number, default: 0 },
      advanceAmount: { type: Number, default: 0 },
      balanceAmount: { type: Number, default: 0 },
      advanceStatus: {
        type: String,
        enum: ['none', 'pending', 'verified', 'rejected'],
        default: 'none',
        index: true,
      },
      receipt: {
        url: String,
        fileName: String,
        mimeType: String,
        size: Number,
        uploadedAt: Date,
      },
    },
    shipping: {
      courier: String,
      trackingNumber: String,
      fee: { type: Number, default: 0 },
    },
    pricing: {
      subtotal: Number,
      discountAmount: Number,
      shippingFee: Number,
      total: Number,
      advanceAmount: Number,
      balanceAmount: Number,
    },
    subtotal: Number,
    discountAmount: { type: Number, default: 0 },
    total: Number,
    fragile: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'new',
    },
    source: { type: String, enum: ['web', 'wishlist-whatsapp'], default: 'web' },
  },
  { timestamps: true }
);

export const MallOrder = model('MallOrder', orderSchema);
