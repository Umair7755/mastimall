import { MallSetting } from "../models/Setting.js";

async function bumpKey(key) {
  const doc = await MallSetting.findOneAndUpdate(
    { key },
    { $inc: { "value.n": 1 }, $set: { "value.at": Date.now() } },
    { upsert: true, new: true }
  );
  return Number(doc.value?.n) || 1;
}

async function readKey(key) {
  const doc = await MallSetting.findOne({ key }).lean();
  return {
    revision: Number(doc?.value?.n) || 0,
    at: Number(doc?.value?.at) || 0,
  };
}

/** Bump a cheap counter so open store tabs can detect catalog changes. */
export async function bumpCatalogRevision() {
  return bumpKey("catalogRevision");
}

/** Bump when admin changes order/payment/shipping status. */
export async function bumpOrdersRevision() {
  return bumpKey("ordersRevision");
}

/** Bump when support chat messages change. */
export async function bumpSupportRevision() {
  return bumpKey("supportRevision");
}

export async function readCatalogRevision() {
  return readKey("catalogRevision");
}

export async function readOrdersRevision() {
  return readKey("ordersRevision");
}

export async function readSupportRevision() {
  return readKey("supportRevision");
}

export async function readStoreRevisions() {
  const [catalog, orders, support] = await Promise.all([
    readCatalogRevision(),
    readOrdersRevision(),
    readSupportRevision(),
  ]);
  return {
    revision: catalog.revision,
    catalogRevision: catalog.revision,
    ordersRevision: orders.revision,
    supportRevision: support.revision,
    at: Math.max(catalog.at, orders.at, support.at),
  };
}
