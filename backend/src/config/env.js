const REQUIRED = ["MONGODB_URI", "JWT_SECRET"];

export function assertEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing ${missing.join(", ")}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

function origins() {
  const raw = process.env.MALL_WEB_URL || "http://localhost:3000";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  webOrigins: origins(),
  revalidateUrl: process.env.REVALIDATE_URL || "",
  revalidateSecret: process.env.REVALIDATE_SECRET || "",
};
