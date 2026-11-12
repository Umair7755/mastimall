import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    image: { url: String, alt: String },
    color: { type: String, default: '#EEF0FF' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    filters: [
      {
        key: { type: String },
        label: { type: String },
        type: { type: String },
        options: [{ type: String }],
      },
    ],
    seo: { title: String, description: String, intro: String },
  },
  { timestamps: true }
);

categorySchema.index({ department: 1, slug: 1 }, { unique: true });

export const Category = model('Category', categorySchema);
