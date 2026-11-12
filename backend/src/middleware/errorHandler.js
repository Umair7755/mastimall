import { ZodError } from 'zod';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const msg = err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return res.status(400).json({ error: msg });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const message =
      field === 'email'
        ? 'An account with this email already exists.'
        : field
          ? `${field} already exists`
          : 'Already exists';
    return res.status(409).json({ error: message });
  }
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Server error' : err.message });
}
