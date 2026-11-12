import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { assertEnv, env } from "./config/env.js";
import bcrypt from "bcryptjs";
import { Department } from "./mall/models/Department.js";
import { MallCustomer } from "./mall/models/MallCustomer.js";
import { MallSetting } from "./mall/models/Setting.js";
import { DEFAULT_SALE_BANNER } from "./mall/lib/saleBanner.js";
import { seedCatalog } from "./mall/seed.js";

assertEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_DB_PATH = path.join(__dirname, "..", ".data", "dev-mongo");

async function connectMongo() {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log(`MongoDB connected: ${env.mongoUri}`);
    return { mode: "mongodb", uri: env.mongoUri };
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("MongoDB is not reachable. Using a persistent local database under backend/.data/dev-mongo.");
    console.warn(String(error?.message || error));
  }

  fs.mkdirSync(DEV_DB_PATH, { recursive: true });
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const memory = await MongoMemoryServer.create({
    instance: {
      dbName: "mastimall",
      dbPath: DEV_DB_PATH,
      storageEngine: "wiredTiger",
    },
  });
  const uri = memory.getUri("mastimall");
  await mongoose.connect(uri);
  console.log(`Persistent development database ready at ${DEV_DB_PATH}`);
  return { mode: "memory-persistent", uri };
}

async function ensureAdminAndBanner() {
  const adminEmail = (process.env.MALL_ADMIN_EMAIL || "admin@mastimall.pk").toLowerCase();
  const adminPassword = process.env.MALL_ADMIN_PASSWORD || "Admin@12345";
  const existing = await MallCustomer.findOne({ email: adminEmail });
  if (!existing) {
    await MallCustomer.create({
      name: "Masti Admin",
      email: adminEmail,
      phone: "03001234567",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    });
    console.log(`Admin ready: ${adminEmail}`);
  } else if (existing.role !== "admin") {
    existing.role = "admin";
    await existing.save();
  }

  const banner = await MallSetting.findOne({ key: "saleBanner" });
  if (!banner) {
    await MallSetting.create({
      key: "saleBanner",
      value: {
        ...DEFAULT_SALE_BANNER,
        endsAt: new Date(new Date().getFullYear(), 10, 18, 23, 59, 59, 999).toISOString(),
      },
    });
  }
}

const db = await connectMongo();

if ((await Department.countDocuments()) === 0) {
  await seedCatalog();
}
await ensureAdminAndBanner();

const app = createApp();
app.listen(env.port, async () => {
  const customers = await MallCustomer.countDocuments({});
  console.log(`Masti Mall API on http://127.0.0.1:${env.port} · db=${db.mode} · users=${customers}`);
});
