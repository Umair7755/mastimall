import crypto from "node:crypto";
import { SupportMessage } from "../models/SupportMessage.js";
import { SupportThread } from "../models/SupportThread.js";
import { bumpSupportRevision } from "./catalogRevision.js";

export function newPublicId() {
  return crypto.randomBytes(12).toString("hex");
}

export function presentThread(thread) {
  const doc = thread.toObject ? thread.toObject() : thread;
  return {
    id: String(doc._id),
    publicId: doc.publicId,
    name: doc.name,
    phone: doc.phone,
    status: doc.status,
    lastMessageAt: doc.lastMessageAt,
    lastPreview: doc.lastPreview || "",
    unreadAdmin: doc.unreadAdmin || 0,
    unreadCustomer: doc.unreadCustomer || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function presentMessage(message) {
  const doc = message.toObject ? message.toObject() : message;
  return {
    id: String(doc._id),
    from: doc.from,
    body: doc.body,
    createdAt: doc.createdAt,
  };
}

export async function appendMessage(thread, { from, body }) {
  const message = await SupportMessage.create({
    thread: thread._id,
    from,
    body,
  });
  thread.lastMessageAt = message.createdAt;
  if (from !== "system") thread.lastPreview = body.slice(0, 240);
  if (from === "customer") {
    thread.unreadAdmin = (thread.unreadAdmin || 0) + 1;
    thread.status = "open";
  } else if (from === "admin") {
    thread.unreadCustomer = (thread.unreadCustomer || 0) + 1;
  }
  await thread.save();
  bumpSupportRevision().catch(() => null);
  return message;
}
