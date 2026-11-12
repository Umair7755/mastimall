import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const MallSetting = model('MallSetting', settingSchema);
