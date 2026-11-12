import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mallRoutes from "./mall/routes.js";
import adminRoutes from "./mall/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";
import { UPLOADS_ROOT } from "./mall/lib/receipt.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors({ origin: env.webOrigins, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: "5mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "mastimall-api" }));
  app.use(
    "/api/media",
    express.static(UPLOADS_ROOT, {
      fallthrough: false,
      maxAge: "7d",
      setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    })
  );
  app.use("/api", adminRoutes);
  app.use("/api", mallRoutes);

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorHandler);

  return app;
}
