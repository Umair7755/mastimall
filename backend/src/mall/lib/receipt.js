import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { HttpError } from '../../utils/httpError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_ROOT = path.join(__dirname, '..', '..', '..', 'uploads');
const RECEIPTS_DIR = path.join(UPLOADS_ROOT, 'receipts');

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_BYTES = 2.5 * 1024 * 1024;

function sanitizeOrderNumber(value) {
  return String(value || 'order')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40);
}

/** Persist a payment receipt data-URL and return a public media path. */
export async function savePaymentReceipt(dataUrl, orderNumber) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new HttpError(400, 'Please attach your JazzCash or EasyPaisa payment receipt.');
  }

  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) {
    throw new HttpError(400, 'Receipt must be a JPG, PNG, or WebP image.');
  }

  const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  const ext = ALLOWED[mime];
  if (!ext) throw new HttpError(400, 'Receipt must be a JPG, PNG, or WebP image.');

  const buffer = Buffer.from(match[2].replace(/\s+/g, ''), 'base64');
  if (!buffer.length) throw new HttpError(400, 'Receipt file looks empty. Try another photo.');
  if (buffer.length > MAX_BYTES) {
    throw new HttpError(400, 'Receipt is too large. Please upload an image under 2.5 MB.');
  }

  await fs.mkdir(RECEIPTS_DIR, { recursive: true });
  const fileName = `${sanitizeOrderNumber(orderNumber)}-${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`;
  const absolute = path.join(RECEIPTS_DIR, fileName);
  await fs.writeFile(absolute, buffer);

  return {
    url: `/api/media/receipts/${fileName}`,
    fileName,
    mimeType: mime,
    size: buffer.length,
    uploadedAt: new Date(),
  };
}
