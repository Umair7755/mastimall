import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, unique: true, sparse: true },
    description: String,
    highlights: [String],
    price: { type: Number, required: true },
    salePrice: Number,
    effectivePrice: { type: Number, index: true },
    stock: { type: Number, default: 0 },
    images: [{ url: String, alt: String }],
    model3d: { glbUrl: String, posterUrl: String },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    audience: [{ type: String, enum: ['baby', 'boys', 'girls', 'unisex'] }],
    ageBands: [{ type: String, enum: ['0-1', '1-3', '3-6', '6-12', '12-plus'] }],
    brand: String,
    tags: [String],
    attributes: { type: Map, of: String },
    weightGrams: Number,
    fragile: { type: Boolean, default: false },
    newlyAdded: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    seo: { title: String, description: String },
  },
  { timestamps: true }
);

productSchema.index({ department: 1, category: 1, status: 1 });
productSchema.index({ ageBands: 1, status: 1 });
productSchema.index({ audience: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: 'text', tags: 'text', brand: 'text' });

productSchema.pre('save', function setEffectivePrice() {
  const sale = this.salePrice;
  this.effectivePrice = sale > 0 && sale < this.price ? sale : this.price;
});

export const Product = model('Product', productSchema);
