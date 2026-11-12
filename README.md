# Masti Mall

Online toy shop. One monorepo for free hosting (Vercel + Render):

```
mastimall/
├─ frontend/   Next.js storefront
├─ backend/    Express + MongoDB API
└─ BLUEPRINT.md
```

## Local run

1. Backend (uses `MONGODB_URI` from `.env`; if MongoDB is offline, a persistent local DB is kept under `backend/.data/dev-mongo`):

```bash
cd backend
npm install
npm run dev
```

2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

- Shop: http://localhost:3000  
- Admin: http://localhost:3000/admin (`admin@mastimall.pk` / `Admin@12345`)  
- API: http://127.0.0.1:4000  

From repo root: `npm run dev` (shop), `npm run dev:api` (API), `npm run seed` (reload catalog).

## Free deployment plan

| Piece | Free host | Root / note |
|---|---|---|
| Frontend | **Vercel** | Root Directory = `frontend` |
| Backend | **Render** Web Service | Root Directory = `backend` |
| Database | **MongoDB Atlas** M0 | Set `MONGODB_URI` on Render |
| Receipt images | **Cloudinary** (next step) | Avoid ephemeral disk on Render |

Keep secrets in host env vars — never commit `.env` files.
