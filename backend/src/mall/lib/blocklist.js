import { HttpError } from '../../utils/httpError.js';
import { MallBlocklist } from '../models/MallBlocklist.js';
import { MallCustomer } from '../models/MallCustomer.js';
import { normalizePhone } from './phone.js';

export const BLACKLIST_MESSAGE =
  'You are blacklisted and cannot use this store. Contact support if you think this is a mistake.';

export function blacklistError(message = BLACKLIST_MESSAGE) {
  return new HttpError(403, message, 'BLACKLISTED');
}

export function normalizeEmail(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .slice(0, 120);
}

/**
 * Registered users who are blocked are also matched by phone/email
 * so we only need one blocklist row (kind=user), not three.
 */
export async function findBlockedCustomerByContact({ phone, email } = {}) {
  const or = [];
  const phoneNorm = phone ? normalizePhone(phone) : '';
  const emailNorm = email ? normalizeEmail(email) : '';
  if (phoneNorm) or.push({ phone: phoneNorm });
  if (emailNorm) or.push({ email: emailNorm });
  if (!or.length) return null;
  return MallCustomer.findOne({
    blocked: true,
    role: { $ne: 'admin' },
    $or: or,
  })
    .select('_id name email phone blocked')
    .lean();
}

/**
 * Find an active block matching any of the provided identity signals.
 */
export async function findActiveBlock({ userId, guestId, visitorId, phone, email } = {}) {
  const or = [];
  const uid = userId ? String(userId) : '';
  const gid = String(guestId || '').trim().slice(0, 64);
  const vid = String(visitorId || '').trim().slice(0, 64);
  const phoneNorm = phone ? normalizePhone(phone) : '';
  const emailNorm = email ? normalizeEmail(email) : '';

  if (uid) or.push({ kind: 'user', value: uid });
  if (gid) or.push({ kind: 'guest', value: gid });
  if (vid) {
    or.push({ kind: 'guest', value: vid });
    or.push({ visitorId: vid });
  }
  if (phoneNorm) or.push({ kind: 'phone', value: phoneNorm });
  if (emailNorm) or.push({ kind: 'email', value: emailNorm });

  let hit = null;
  if (or.length) {
    hit = await MallBlocklist.findOne({ active: true, $or: or }).sort({ createdAt: -1 }).lean();
  }
  if (hit) return hit;

  const blockedCustomer = await findBlockedCustomerByContact({ phone: phoneNorm, email: emailNorm });
  if (blockedCustomer) {
    return {
      kind: 'user',
      value: String(blockedCustomer._id),
      reason: BLACKLIST_MESSAGE,
      label: blockedCustomer.name || blockedCustomer.email || '',
      active: true,
    };
  }
  return null;
}

/** Thrown if blocked; returns block doc when blocked for status responses. */
export async function assertNotBlocked(identity = {}) {
  if (identity.userId) {
    const customer = await MallCustomer.findById(identity.userId).select('blocked role').lean();
    if (customer?.role === 'admin') return null;
    if (customer?.blocked) throw blacklistError();
  }

  const hit = await findActiveBlock(identity);
  if (hit) throw blacklistError(hit.reason || BLACKLIST_MESSAGE);
  return null;
}

export async function checkAccessStatus(identity = {}) {
  if (identity.userId) {
    const customer = await MallCustomer.findById(identity.userId).select('blocked role').lean();
    if (customer?.role === 'admin') {
      return { blocked: false, reason: '' };
    }
    if (customer?.blocked) {
      return { blocked: true, reason: BLACKLIST_MESSAGE };
    }
  }

  const hit = await findActiveBlock(identity);
  if (hit) {
    return {
      blocked: true,
      reason: hit.reason || BLACKLIST_MESSAGE,
    };
  }
  return { blocked: false, reason: '' };
}

/** Drop extra phone/email rows when the account already has kind=user. */
export async function collapseCustomerContactBlocks(customer) {
  if (!customer) return;
  const ops = [];
  if (customer.phone) {
    ops.push(deactivateBlocks({ kind: 'phone', value: normalizePhone(customer.phone) }));
  }
  if (customer.email) {
    ops.push(deactivateBlocks({ kind: 'email', value: normalizeEmail(customer.email) }));
  }
  if (ops.length) await Promise.all(ops);
}

export function presentBlock(doc) {
  const row = doc?.toObject ? doc.toObject() : doc || {};
  return {
    id: String(row._id),
    kind: row.kind,
    value: row.value || '',
    visitorId: row.visitorId || '',
    reason: row.reason || '',
    active: Boolean(row.active),
    label: row.label || '',
    createdBy: row.createdBy ? String(row.createdBy) : '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Upsert an active block row for kind+value. */
export async function upsertBlock({
  kind,
  value,
  visitorId = '',
  reason = '',
  label = '',
  createdBy = null,
}) {
  const cleanValue = String(value || '').trim().slice(0, 120);
  if (!cleanValue) return null;

  const update = {
    $set: {
      active: true,
      reason: String(reason || '').trim().slice(0, 240),
      label: String(label || '').trim().slice(0, 120),
      visitorId: String(visitorId || '').trim().slice(0, 64),
      ...(createdBy ? { createdBy } : {}),
    },
    $setOnInsert: { kind, value: cleanValue },
  };

  return MallBlocklist.findOneAndUpdate({ kind, value: cleanValue }, update, {
    upsert: true,
    new: true,
  });
}

export async function deactivateBlocks(filter) {
  return MallBlocklist.updateMany({ ...filter, active: true }, { $set: { active: false } });
}
