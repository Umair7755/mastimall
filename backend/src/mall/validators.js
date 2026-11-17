import { z } from 'zod';
import {
  AGE_BANDS,
  AUDIENCES,
  CHECKOUT_PAYMENT_METHODS,
  ORDER_STATUSES,
} from './constants.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(10).max(20),
  password: z.string().min(8).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(20),
});

const ADVANCE_PLANS = z.enum(['none', '25', '50', '100']);

export const quoteSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(30),
  city: z.string().trim().min(2).max(80).optional().default('Other'),
  advancePlan: ADVANCE_PLANS.optional().default('none'),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(30),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(10).max(20),
    city: z.string().trim().min(2).max(80),
    address: z.string().trim().min(6).max(240),
    notes: z.string().trim().max(300).optional().default(''),
  }),
  paymentMethod: z.enum(CHECKOUT_PAYMENT_METHODS),
  paymentReceipt: z.string().max(4_000_000).optional().default(''),
  advancePlan: ADVANCE_PLANS.optional().default('none'),
  source: z.enum(['web', 'wishlist-whatsapp']).default('web'),
}).superRefine((data, ctx) => {
  const advance = data.advancePlan && data.advancePlan !== 'none';
  if (advance && data.paymentMethod === 'cod') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paymentMethod'],
      message: 'Choose JazzCash or EasyPaisa to send your advance payment.',
    });
  }
  if (data.paymentMethod === 'cod' && !advance) return;
  if (!data.paymentReceipt || data.paymentReceipt.length < 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paymentReceipt'],
      message: advance
        ? 'Please attach your advance payment receipt (JazzCash or EasyPaisa).'
        : 'Please attach your JazzCash or EasyPaisa payment receipt.',
    });
  }
});

export const notifySchema = z.object({
  productId: z.string().min(1),
  phone: z.string().trim().min(10).max(20),
});

export const wishlistSchema = z.object({
  productId: z.string().min(1),
  action: z.enum(['add', 'remove']).default('add'),
});

export const departmentSchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(40),
  themeKey: z.string().trim().min(2).max(40).optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  banner: z.object({ url: z.string(), alt: z.string().optional() }).optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(60),
  departmentId: z.string().min(1),
  image: z.object({ url: z.string(), alt: z.string().optional() }).optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  filters: z
    .array(z.object({ key: z.string(), label: z.string(), type: z.string(), options: z.array(z.string()).optional() }))
    .optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional(), intro: z.string().optional() }).optional(),
});

export const productSchema = z.object({
  title: z.string().trim().min(2).max(140),
  slug: z.string().trim().min(2).max(140),
  sku: z.string().trim().optional(),
  description: z.string().max(4000).optional(),
  highlights: z.array(z.string()).max(8).optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional(),
  model3d: z.object({ glbUrl: z.string().optional(), posterUrl: z.string().optional() }).optional(),
  departmentId: z.string().min(1),
  categoryId: z.string().min(1),
  audience: z.array(z.enum(AUDIENCES)).optional(),
  ageBands: z.array(z.enum(AGE_BANDS)).optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  weightGrams: z.number().optional(),
  fragile: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export const homeSchema = z.object({
  announcement: z.string().max(180).optional(),
  whatsapp: z.string().max(20).optional(),
  nav: z.array(z.record(z.any())).optional(),
  sections: z.array(z.record(z.any())).optional(),
});

export const saleBannerSchema = z.object({
  enabled: z.boolean(),
  badge: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(160).optional().default(''),
  ctaLabel: z.string().trim().min(1).max(40),
  ctaHref: z.string().trim().min(1).max(200),
  endsAt: z.union([z.string().min(1), z.null()]).optional().nullable(),
  message: z.string().trim().max(180).optional().default(''),
});

export const orderStatusSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(['pending', 'partial', 'paid', 'failed', 'refunded']).optional(),
    advanceStatus: z.enum(['none', 'pending', 'verified', 'rejected']).optional(),
    trackingNumber: z.string().trim().max(80).optional(),
    courier: z.string().trim().max(80).optional(),
  })
  .refine(
    (value) =>
      value.status != null ||
      value.paymentStatus != null ||
      value.advanceStatus != null ||
      value.trackingNumber != null ||
      value.courier != null,
    { message: 'Provide at least one field to update.' }
  );

export const reviewSchema = z.object({
  name: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).optional().default(''),
  text: z.string().trim().min(8).max(800),
  city: z.string().trim().max(60).optional().default(''),
});

export const adminReviewSchema = z.object({
  name: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).optional().default(''),
  text: z.string().trim().min(8).max(800),
  city: z.string().trim().max(60).optional().default(''),
});

export const adminReviewUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().trim().max(80).optional(),
    text: z.string().trim().min(8).max(800).optional(),
    city: z.string().trim().max(60).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'Provide at least one field to update.' });

export const supportStartSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(20),
  body: z.string().trim().min(4).max(2000),
  publicId: z.string().trim().min(8).max(64).optional(),
});

export const supportReplySchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const supportAdminStatusSchema = z.object({
  status: z.enum(['open', 'closed']).optional(),
  markRead: z.boolean().optional(),
});
