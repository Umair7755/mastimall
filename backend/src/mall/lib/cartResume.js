import crypto from 'crypto';
import { MallCart } from '../models/MallCart.js';

export function newResumeToken() {
  return `r_${crypto.randomBytes(18).toString('base64url')}`;
}

export function isValidResumeToken(token) {
  return typeof token === 'string' && /^r_[A-Za-z0-9_-]{16,48}$/.test(token);
}

/** Ensure cart has a durable resume token (creates one if missing). */
export async function ensureResumeToken(cart) {
  if (!cart) return null;
  if (cart.resumeToken && isValidResumeToken(cart.resumeToken)) return cart.resumeToken;

  let token = newResumeToken();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      if (typeof cart.save === 'function' && cart.isNew !== undefined) {
        cart.resumeToken = token;
        await cart.save();
        return token;
      }
      await MallCart.updateOne({ _id: cart._id }, { $set: { resumeToken: token } });
      cart.resumeToken = token;
      return token;
    } catch (error) {
      if (error?.code !== 11000) throw error;
      token = newResumeToken();
    }
  }
  return null;
}
