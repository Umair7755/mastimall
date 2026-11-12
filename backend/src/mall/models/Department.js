import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    themeKey: { type: String, default: 'toys' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    banner: { url: String, alt: String },
    seo: { title: String, description: String },
  },
  { timestamps: true }
);

export const Department = model('Department', departmentSchema);
