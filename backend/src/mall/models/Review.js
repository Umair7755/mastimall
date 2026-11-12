import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 80, default: '' },
    text: { type: String, required: true, trim: true, maxlength: 800 },
    city: { type: String, trim: true, maxlength: 60, default: '' },
    /** customer = storefront, admin = seeded/managed from admin panel */
    source: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, createdAt: -1 });

export const Review = model('Review', reviewSchema);
