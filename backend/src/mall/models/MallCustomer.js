import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const customerSchema = new Schema(
  {
    name: { type: String, trim: true, default: '' },
    phone: { type: String, index: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: String,
    addresses: [{ label: String, city: String, address: String }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

customerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const MallCustomer = model('MallCustomer', customerSchema);
