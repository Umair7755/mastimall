import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

const COOKIE = 'mall_token';

function mallSecret() {
  return `${env.jwtSecret}:mall`;
}

export function signMallToken(customer) {
  return jwt.sign({ sub: String(customer._id), aud: 'mall', role: customer.role }, mallSecret(), {
    expiresIn: '30d',
  });
}

export function readMallToken(req) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  return bearer || req.cookies?.[COOKIE] || null;
}

export function verifyMallToken(token) {
  const payload = jwt.verify(token, mallSecret());
  if (payload.aud !== 'mall') {
    const error = new Error('Invalid token');
    throw error;
  }
  return payload;
}

export function setMallCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearMallCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

export function optionalMallAuth(req, _res, next) {
  const token = readMallToken(req);
  if (!token) return next();
  try {
    const payload = verifyMallToken(token);
    req.mallUserId = payload.sub;
    req.mallRole = payload.role;
  } catch {
    /* guest */
  }
  next();
}

export function requireMallAuth(req, res, next) {
  const token = readMallToken(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = verifyMallToken(token);
    req.mallUserId = payload.sub;
    req.mallRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Log in again.' });
  }
}

export function requireMallAdmin(req, res, next) {
  const configured = process.env.MALL_ADMIN_TOKEN;
  const header = req.headers['x-mall-admin-token'];
  if (configured && header && header === configured) return next();

  requireMallAuth(req, res, () => {
    if (req.mallRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  });
}
