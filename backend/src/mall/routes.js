import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { validate } from '../middleware/validate.js';
import { Department } from './models/Department.js';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { MallOrder } from './models/MallOrder.js';
import { MallCustomer } from './models/MallCustomer.js';
import { MallSetting } from './models/Setting.js';
import { Notify } from './models/Notify.js';
import { Review } from './models/Review.js';
import { presentReview, refreshProductRating } from './lib/reviews.js';
import { presentCategory, presentDepartment, presentOrder, presentProduct } from './lib/present.js';
import { pingRevalidate } from './lib/revalidate.js';
import { readStoreRevisions } from './lib/catalogRevision.js';
import { isPkMobile, normalizePhone } from './lib/phone.js';
import { shippingFee } from './lib/shipping.js';
import { AGE_BANDS, AUDIENCES, RESERVED_SLUGS, SORTS, paymentAccounts } from './constants.js';
import { savePaymentReceipt } from './lib/receipt.js';
import {
  loginSchema,
  orderSchema,
  notifySchema,
  profileUpdateSchema,
  quoteSchema,
  registerSchema,
  reviewSchema,
  supportReplySchema,
  supportStartSchema,
  wishlistSchema,
} from './validators.js';
import { SupportThread } from './models/SupportThread.js';
import { SupportMessage } from './models/SupportMessage.js';
import { MallVisit } from './models/MallVisit.js';
import { MallCart } from './models/MallCart.js';
import { karachiDayKey, newTrackingId } from './lib/analyticsDay.js';
import { isValidResumeToken, newResumeToken } from './lib/cartResume.js';
import {
  appendMessage,
  newPublicId,
  presentMessage,
  presentThread,
} from './lib/support.js';
import {
  clearMallCookie,
  optionalMallAuth,
  requireMallAuth,
  setMallCookie,
  signMallToken,
} from './middleware/mallAuth.js';
import {
  assertNotBlocked,
  checkAccessStatus,
  BLACKLIST_MESSAGE,
} from './lib/blocklist.js';

const mall = Router();

const writeLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40 });
const trackLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 });
const analyticsLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 120 });
const resumeLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40 });

const VISITOR_COOKIE = 'mall_vid';
const GUEST_CART_COOKIE = 'mall_gid';
const TRACKING_COOKIE_MS = 400 * 24 * 60 * 60 * 1000;

function setTrackingCookie(res, name, value) {
  res.cookie(name, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TRACKING_COOKIE_MS,
    path: '/',
  });
}

function normalizeCartItems(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 40)
    .map((item) => ({
      productId: String(item.productId || '').slice(0, 64),
      title: String(item.title || '').slice(0, 160),
      slug: String(item.slug || '').slice(0, 120),
      href: String(item.href || '').slice(0, 200),
      image: String(item.image || '').slice(0, 500),
      qty: Math.min(20, Math.max(1, Number(item.qty) || 1)),
    }))
    .filter((item) => item.productId);
}

function cartItemCount(items) {
  return items.reduce((sum, item) => sum + (item.qty || 0), 0);
}

async function markCartConverted({ guestId, userId, orderId }) {
  const filter = { status: { $ne: 'converted' } };
  if (userId) filter.$or = [{ user: userId }, ...(guestId ? [{ guestId }] : [])];
  else if (guestId) filter.guestId = guestId;
  else return;

  await MallCart.updateMany(filter, {
    $set: {
      status: 'converted',
      convertedOrderId: orderId,
      itemCount: 0,
      items: [],
      lastSeenAt: new Date(),
    },
  });
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertSlug(slug) {
  const clean = String(slug || '').trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
    throw new HttpError(400, 'Slug should use lowercase letters, numbers and dashes.');
  }
  if (RESERVED_SLUGS.includes(clean)) {
    throw new HttpError(400, `"${clean}" is reserved and cannot be a department or category.`);
  }
  return clean;
}

const HERO_TITLE = 'Toys + décor. Full masti.';
const HERO_TEXT =
  'Bacchon ke toys aur ghar ka décor — dono ek jagah. Bas teen taps, asaan shopping.';

/** StoreHome owns product rails; keep hero/trust and drop legacy filter blocks. */
function normalizeHomeSections(sections = []) {
  return sections
    .filter((section) => section && section.active !== false)
    .filter((section) => !['categories', 'audience', 'age', 'budget', 'finder'].includes(section.type))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function normalizeHomeNav(nav = []) {
  const next = (Array.isArray(nav) ? nav : []).map((item) => {
    const label = String(item.label || '').toLowerCase();
    if (label === 'home' || item.href === '/') {
      return { ...item, label: 'Home', href: '/', kind: 'home', soon: false };
    }
    if (label.includes('decor') || label.includes('décor')) {
      return { ...item, href: '/decor', soon: false, kind: 'department' };
    }
    return item;
  });
  if (!next.some((item) => String(item.href || '') === '/' || String(item.label || '').toLowerCase() === 'home')) {
    next.unshift({ label: 'Home', href: '/', kind: 'home' });
  } else {
    const homeIndex = next.findIndex(
      (item) => String(item.href || '') === '/' || String(item.label || '').toLowerCase() === 'home'
    );
    if (homeIndex > 0) {
      const [home] = next.splice(homeIndex, 1);
      next.unshift(home);
    }
  }
  if (!next.some((item) => String(item.href || '').includes('/decor'))) {
    const toysIndex = next.findIndex((item) => String(item.href || '').includes('/toys'));
    next.splice(toysIndex >= 0 ? toysIndex + 1 : 1, 0, {
      label: 'Decor',
      href: '/decor',
      kind: 'department',
    });
  }
  return next;
}

async function loadHome() {
  const doc = await MallSetting.findOne({ key: 'home' }).lean();
  const value = doc?.value || {};
  const raw = Array.isArray(value.sections) ? [...value.sections] : [];
  const sections = normalizeHomeSections(raw);
  return {
    announcement: value.announcement || '',
    whatsapp: value.whatsapp || '',
    nav: normalizeHomeNav(value.nav || []),
    sections: sections.map((section) => {
      if (section.type !== 'hero') return section;
      return {
        ...section,
        title: HERO_TITLE,
        config: { ...(section.config || {}), text: HERO_TEXT },
      };
    }),
  };
}

async function nextOrderNumber() {
  const doc = await MallSetting.findOneAndUpdate(
    { key: 'orderSeq' },
    { $inc: { 'value.n': 1 } },
    { upsert: true, new: true }
  );
  return `MM-${240000 + (doc.value?.n || 1)}`;
}

mall.get(
  '/departments',
  asyncHandler(async (req, res) => {
    const departments = await Department.find({ active: true }).sort({ order: 1, name: 1 });
    const withCategories = req.query.withCategories === '1';
    if (!withCategories) {
      return res.json({ departments: departments.map((item) => presentDepartment(item)) });
    }
    const ids = departments.map((item) => item._id);
    const categories = await Category.find({ department: { $in: ids }, active: true }).sort({ order: 1, name: 1 });
    const grouped = new Map();
    for (const category of categories) {
      const key = String(category.department);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(category);
    }
    res.json({
      departments: departments.map((item) => presentDepartment(item, grouped.get(String(item._id)) || [])),
    });
  })
);

mall.get(
  '/departments/:slug',
  asyncHandler(async (req, res) => {
    const department = await Department.findOne({ slug: req.params.slug, active: true });
    if (!department) throw new HttpError(404, 'Department not found');
    const categories = await Category.find({ department: department._id, active: true }).sort({ order: 1, name: 1 });
    res.json({ department: presentDepartment(department, categories) });
  })
);

mall.get(
  '/categories/:department/:slug',
  asyncHandler(async (req, res) => {
    const department = await Department.findOne({ slug: req.params.department, active: true });
    if (!department) throw new HttpError(404, 'Department not found');
    const category = await Category.findOne({ department: department._id, slug: req.params.slug, active: true });
    if (!category) throw new HttpError(404, 'Category not found');
    const brands = await Product.distinct('brand', {
      category: category._id,
      status: 'active',
      brand: { $nin: [null, ''] },
    });
    const presented = presentCategory(category);
    presented.filters = presented.filters.map((filter) => {
      if (filter.key === 'brand' && (!filter.options || filter.options.length === 0)) {
        return { ...filter, options: brands.filter(Boolean).sort() };
      }
      return filter;
    });
    res.json({
      department: presentDepartment(department),
      category: presented,
    });
  })
);

mall.get(
  '/products/slugs',
  asyncHandler(async (_req, res) => {
    const products = await Product.find({ status: 'active' })
      .select('slug')
      .populate('department', 'slug')
      .populate('category', 'slug')
      .lean();
    res.json({
      slugs: products
        .filter((item) => item.department?.slug && item.category?.slug)
        .map((item) => ({
          slug: item.slug,
          department: item.department.slug,
          category: item.category.slug,
        })),
    });
  })
);

async function productFacets(scope) {
  const [priceRows, ageRows, audienceRows, brandRows, stockRows, saleRows] = await Promise.all([
    Product.aggregate([
      { $match: scope },
      {
        $group: {
          _id: null,
          min: { $min: '$effectivePrice' },
          max: { $max: '$effectivePrice' },
        },
      },
    ]),
    Product.aggregate([
      { $match: scope },
      { $unwind: '$ageBands' },
      { $group: { _id: '$ageBands', count: { $sum: 1 } } },
    ]),
    Product.aggregate([
      { $match: scope },
      { $unwind: '$audience' },
      { $group: { _id: '$audience', count: { $sum: 1 } } },
    ]),
    Product.aggregate([
      { $match: { ...scope, brand: { $nin: [null, ''] } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.countDocuments({ ...scope, stock: { $gt: 0 } }),
    Product.countDocuments({
      ...scope,
      $expr: { $and: [{ $gt: ['$salePrice', 0] }, { $lt: ['$salePrice', '$price'] }] },
    }),
  ]);

  const ageCounts = Object.fromEntries(ageRows.map((row) => [row._id, row.count]));
  const audienceCounts = Object.fromEntries(audienceRows.map((row) => [row._id, row.count]));
  const price = priceRows[0] || {};

  return {
    price: {
      min: Number.isFinite(price.min) ? Math.floor(price.min) : 0,
      max: Number.isFinite(price.max) ? Math.ceil(price.max) : 10000,
    },
    ageBands: AGE_BANDS.map((value) => ({ value, count: ageCounts[value] || 0 })),
    audience: AUDIENCES.map((value) => ({ value, count: audienceCounts[value] || 0 })),
    brands: brandRows.map((row) => ({ value: row._id, count: row.count })),
    inStock: stockRows,
    onSale: saleRows,
  };
}

mall.get(
  '/products',
  asyncHandler(async (req, res) => {
    const scope = { status: 'active' };
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 24));

    if (req.query.department) {
      const department = await Department.findOne({ slug: req.query.department, active: true }).select('_id');
      if (!department) {
        return res.json({
          items: [],
          total: 0,
          page,
          pages: 0,
          facets: {
            price: { min: 0, max: 10000 },
            ageBands: [],
            audience: [],
            brands: [],
            inStock: 0,
            onSale: 0,
          },
        });
      }
      scope.department = department._id;
      if (req.query.category) {
        const category = await Category.findOne({
          department: department._id,
          slug: req.query.category,
          active: true,
        }).select('_id');
        if (!category) {
          return res.json({
            items: [],
            total: 0,
            page,
            pages: 0,
            facets: {
              price: { min: 0, max: 10000 },
              ageBands: [],
              audience: [],
              brands: [],
              inStock: 0,
              onSale: 0,
            },
          });
        }
        scope.category = category._id;
      }
    }

    if (req.query.q) {
      const pattern = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
      scope.$or = [{ title: pattern }, { brand: pattern }, { tags: pattern }];
    }

    if (req.query.tag) {
      const tags = String(req.query.tag)
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
      if (tags.length) scope.tags = { $in: tags };
    }

    if (req.query.excludeAdult === '1') {
      scope.$nor = [{ ageBands: { $eq: ['12-plus'] } }];
    }

    const query = { ...scope };

    if (req.query.audience) {
      const audience = String(req.query.audience)
        .split(',')
        .map((value) => value.trim())
        .filter((value) => AUDIENCES.includes(value));
      if (audience.length) {
        const values = new Set(audience);
        if (!values.has('unisex')) values.add('unisex');
        query.audience = { $in: [...values] };
      }
    }

    if (req.query.age) {
      const ages = String(req.query.age)
        .split(',')
        .map((value) => value.trim())
        .filter((value) => AGE_BANDS.includes(value));
      if (ages.length) query.ageBands = { $in: ages };
    }

    if (req.query.brand) query.brand = String(req.query.brand).trim();
    if (req.query.inStock === '1') query.stock = { $gt: 0 };
    if (req.query.onSale === '1') {
      query.$expr = { $and: [{ $gt: ['$salePrice', 0] }, { $lt: ['$salePrice', '$price'] }] };
    }
    if (req.query.featured === '1') query.isFeatured = true;
    if (req.query.isNew === '1') query.newlyAdded = true;

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if ((Number.isFinite(minPrice) && minPrice > 0) || (Number.isFinite(maxPrice) && maxPrice > 0)) {
      query.effectivePrice = {};
      if (Number.isFinite(minPrice) && minPrice > 0) query.effectivePrice.$gte = minPrice;
      if (Number.isFinite(maxPrice) && maxPrice > 0) query.effectivePrice.$lte = maxPrice;
    }

    const sortKey = SORTS[req.query.sort] ? req.query.sort : 'popular';
    const [total, items, facets] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(SORTS[sortKey])
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('department', 'name slug themeKey')
        .populate('category', 'name slug color'),
      productFacets(scope),
    ]);

    res.json({
      items: items.map((item) => presentProduct(item)),
      total,
      page,
      pages: Math.ceil(total / limit),
      facets,
    });
  })
);

mall.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
      .populate('department', 'name slug themeKey')
      .populate('category', 'name slug color');
    if (!product) throw new HttpError(404, 'Product not found');

    const [related, reviews] = await Promise.all([
      Product.find({
        _id: { $ne: product._id },
        category: product.category._id || product.category,
        status: 'active',
      })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(8)
        .populate('department', 'name slug themeKey')
        .populate('category', 'name slug color'),
      Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(40),
    ]);

    res.json({
      product: presentProduct(product, { detail: true }),
      related: related.map((item) => presentProduct(item)),
      reviews: reviews.map(presentReview),
    });
  })
);

mall.get(
  '/products/:slug/reviews',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' }).select('_id');
    if (!product) throw new HttpError(404, 'Product not found');
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(40);
    res.json({ reviews: reviews.map(presentReview) });
  })
);

mall.post(
  '/products/:slug/reviews',
  writeLimit,
  validate(reviewSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' });
    if (!product) throw new HttpError(404, 'Product not found');
    const review = await Review.create({
      product: product._id,
      name: req.body.name,
      rating: req.body.rating,
      title: req.body.title || '',
      text: req.body.text,
      city: req.body.city || '',
      source: 'customer',
    });
    const rating = await refreshProductRating(product._id);
    pingRevalidate(['products', `product:${product.slug}`]);
    res.status(201).json({ review: presentReview(review), rating });
  })
);

mall.get(
  '/search/suggest',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ items: [] });
    const pattern = new RegExp(escapeRegex(q), 'i');
    const items = await Product.find({ status: 'active', title: pattern })
      .sort({ isFeatured: -1, ratingAvg: -1 })
      .limit(6)
      .populate('department', 'name slug themeKey')
      .populate('category', 'name slug color');
    res.json({ items: items.map((item) => presentProduct(item)) });
  })
);

mall.get(
  '/settings/home',
  asyncHandler(async (_req, res) => {
    res.json(await loadHome());
  })
);

mall.get(
  '/settings/revision',
  asyncHandler(async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(await readStoreRevisions());
  })
);

mall.get(
  '/settings/checkout',
  asyncHandler(async (_req, res) => {
    const accounts = paymentAccounts();
    res.json({
      freeShippingAt: 3000,
      paymentMethods: [accounts.cod, accounts.jazzcash, accounts.easypaisa],
      cities: [
        'Karachi',
        'Lahore',
        'Islamabad',
        'Rawalpindi',
        'Faisalabad',
        'Multan',
        'Peshawar',
        'Quetta',
        'Hyderabad',
        'Sialkot',
        'Gujranwala',
        'Other',
      ],
    });
  })
);

mall.get(
  '/access/status',
  analyticsLimit,
  optionalMallAuth,
  asyncHandler(async (req, res) => {
    let visitorId = String(req.cookies?.[VISITOR_COOKIE] || '').trim();
    if (!visitorId || visitorId.length > 64) {
      visitorId = newTrackingId();
    }
    setTrackingCookie(res, VISITOR_COOKIE, visitorId);

    const guestId = String(req.cookies?.[GUEST_CART_COOKIE] || '').trim();
    const phone = String(req.query?.phone || '').trim();
    const email = String(req.query?.email || '').trim();

    const status = await checkAccessStatus({
      userId: req.mallUserId || undefined,
      guestId: guestId || undefined,
      visitorId,
      phone: phone || undefined,
      email: email || undefined,
    });

    res.json({
      blocked: status.blocked,
      reason: status.blocked ? status.reason || BLACKLIST_MESSAGE : '',
    });
  })
);

mall.post(
  '/analytics/visit',
  analyticsLimit,
  optionalMallAuth,
  asyncHandler(async (req, res) => {
    const path = String(req.body?.path || '/').slice(0, 200);
    if (path.startsWith('/admin')) {
      return res.json({ ok: true, skipped: true });
    }

    let visitorId = String(req.cookies?.[VISITOR_COOKIE] || '').trim();
    if (!visitorId || visitorId.length > 64) {
      visitorId = newTrackingId();
    }
    setTrackingCookie(res, VISITOR_COOKIE, visitorId);

    const guestId = String(req.cookies?.[GUEST_CART_COOKIE] || '').trim();
    await assertNotBlocked({
      userId: req.mallUserId || undefined,
      guestId: guestId || undefined,
      visitorId,
    });

    const day = karachiDayKey();
    await MallVisit.updateOne(
      { visitorId, day },
      {
        $set: {
          path,
          ...(req.mallUserId ? { userId: req.mallUserId } : {}),
        },
        $setOnInsert: { visitorId, day },
      },
      { upsert: true }
    );

    res.json({ ok: true, day });
  })
);

mall.post(
  '/cart/sync',
  analyticsLimit,
  optionalMallAuth,
  asyncHandler(async (req, res) => {
    let guestId = String(req.cookies?.[GUEST_CART_COOKIE] || '').trim();
    if (!guestId || guestId.length > 64) {
      guestId = newTrackingId().replace(/^v_/, 'g_');
    }
    setTrackingCookie(res, GUEST_CART_COOKIE, guestId);

    const visitorId = String(req.cookies?.[VISITOR_COOKIE] || '').trim();
    const contactIn = req.body?.contact || {};
    await assertNotBlocked({
      userId: req.mallUserId || undefined,
      guestId,
      visitorId: visitorId || undefined,
      phone: contactIn.phone || undefined,
      email: contactIn.email || undefined,
    });

    const items = normalizeCartItems(req.body?.items);
    const itemCount = cartItemCount(items);
    let contact = {
      name: String(contactIn.name || '').trim().slice(0, 80),
      phone: String(contactIn.phone || '').trim().slice(0, 20),
      email: String(contactIn.email || '').trim().slice(0, 120).toLowerCase(),
    };

    if (req.mallUserId) {
      const customer = await MallCustomer.findById(req.mallUserId).select('name phone email').lean();
      if (customer) {
        contact = {
          name: contact.name || customer.name || '',
          phone: contact.phone || customer.phone || '',
          email: contact.email || customer.email || '',
        };
      }
    }

    const query = req.mallUserId
      ? { $or: [{ user: req.mallUserId }, { guestId }], status: { $ne: 'converted' } }
      : { guestId, status: { $ne: 'converted' } };

    let cart = await MallCart.findOne(query).sort({ updatedAt: -1 });
    if (!cart) {
      cart = new MallCart({ guestId, user: req.mallUserId || undefined });
    }

    cart.guestId = guestId;
    if (req.mallUserId) cart.user = req.mallUserId;
    cart.items = items;
    cart.itemCount = itemCount;
    cart.contact = contact;
    cart.lastSeenAt = new Date();
    cart.status = itemCount > 0 ? 'active' : cart.status === 'converted' ? 'converted' : 'active';
    if (!cart.resumeToken) cart.resumeToken = newResumeToken();
    await cart.save();

    res.json({
      ok: true,
      cartId: String(cart._id),
      itemCount: cart.itemCount,
      status: cart.status,
      resumeToken: cart.resumeToken || null,
    });
  })
);

/**
 * Public cart resume for WhatsApp / SMS links.
 * Restores items into the shopper's browser; does not expose contact details.
 */
mall.get(
  '/cart/resume/:token',
  resumeLimit,
  asyncHandler(async (req, res) => {
    const token = String(req.params.token || '').trim();
    if (!isValidResumeToken(token)) {
      throw new HttpError(404, 'This cart link is not valid.');
    }

    const cart = await MallCart.findOne({ resumeToken: token });
    if (!cart || cart.status === 'converted' || !(cart.itemCount > 0) || !cart.items?.length) {
      throw new HttpError(404, 'This cart is empty or already ordered.');
    }

    // Keep resume working across devices by aligning guest cookie to this cart.
    if (cart.guestId) {
      setTrackingCookie(res, GUEST_CART_COOKIE, cart.guestId);
    }

    cart.lastSeenAt = new Date();
    if (cart.status !== 'active') cart.status = 'active';
    await cart.save();

    res.set('Cache-Control', 'no-store');
    res.json({
      ok: true,
      items: (cart.items || []).map((item) => ({
        productId: item.productId,
        title: item.title,
        slug: item.slug || '',
        href: item.href || '',
        image: item.image || '',
        qty: item.qty,
      })),
      itemCount: cart.itemCount,
    });
  })
);

mall.post(
  '/quote',
  validate(quoteSchema),
  asyncHandler(async (req, res) => {
    const ids = req.body.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: ids }, status: 'active' });
    const byId = new Map(products.map((product) => [String(product._id), product]));
    const problems = [];
    const lines = [];

    for (const item of req.body.items) {
      const product = byId.get(item.productId);
      if (!product) {
        problems.push('A toy in your cart is no longer available.');
        continue;
      }
      if (product.stock < item.qty) {
        problems.push(
          product.stock > 0 ? `${product.title} only has ${product.stock} left.` : `${product.title} is sold out right now.`
        );
      }
      const unitPrice = product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price;
      lines.push({
        productId: String(product._id),
        title: product.title,
        qty: item.qty,
        unitPrice,
        lineTotal: unitPrice * item.qty,
        stock: product.stock,
      });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const fee = shippingFee(subtotal, req.body.city || 'Other');
    res.json({ lines, subtotal, fee, total: subtotal + fee, problems, freeShippingAt: 3000 });
  })
);

mall.post(
  '/orders',
  writeLimit,
  optionalMallAuth,
  validate(orderSchema),
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.customer.phone);
    if (!isPkMobile(phone)) {
      throw new HttpError(400, 'Phone number should look like 03XX-XXXXXXX.');
    }

    const guestId = String(req.cookies?.[GUEST_CART_COOKIE] || '').trim();
    const visitorId = String(req.cookies?.[VISITOR_COOKIE] || '').trim();
    await assertNotBlocked({
      userId: req.mallUserId || undefined,
      guestId: guestId || undefined,
      visitorId: visitorId || undefined,
      phone,
      email: req.body.customer?.email || undefined,
    });

    const ids = req.body.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: ids }, status: 'active' });
    const byId = new Map(products.map((product) => [String(product._id), product]));

    const lines = [];
    for (const item of req.body.items) {
      const product = byId.get(item.productId);
      if (!product) throw new HttpError(400, 'A toy in your cart is no longer available.');
      if (product.stock < item.qty) {
        throw new HttpError(400, `${product.title} only has ${product.stock} left.`);
      }
      const unitPrice = product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price;
      lines.push({ product, qty: item.qty, unitPrice });
    }

    const decremented = [];
    try {
      for (const line of lines) {
        const updated = await Product.findOneAndUpdate(
          { _id: line.product._id, stock: { $gte: line.qty }, status: 'active' },
          { $inc: { stock: -line.qty } },
          { new: true }
        );
        if (!updated) throw new HttpError(409, `${line.product.title} just sold out. Refresh your cart and try again.`);
        decremented.push(line);
      }
    } catch (error) {
      await Promise.all(
        decremented.map((line) => Product.updateOne({ _id: line.product._id }, { $inc: { stock: line.qty } }))
      );
      throw error;
    }

    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
    const fee = shippingFee(subtotal, req.body.customer.city);
    const orderNumber = await nextOrderNumber();
    const fragile = lines.some((line) => line.product.fragile);

    let order;
    try {
      const needsReceipt = req.body.paymentMethod === 'jazzcash' || req.body.paymentMethod === 'easypaisa';
      const receipt = needsReceipt
        ? await savePaymentReceipt(req.body.paymentReceipt, orderNumber)
        : undefined;
      order = await MallOrder.create({
        orderNumber,
        user: req.mallUserId || undefined,
        items: lines.map((line) => ({
          product: line.product._id,
          title: line.product.title,
          slug: line.product.slug,
          image: line.product.images?.[0]?.url || '',
          unitPrice: line.unitPrice,
          qty: line.qty,
        })),
        customer: { ...req.body.customer, phone },
        payment: {
          method: req.body.paymentMethod,
          status: 'pending',
          ...(receipt ? { receipt } : {}),
        },
        shipping: { fee, courier: '' },
        subtotal,
        total: subtotal + fee,
        fragile,
        status: 'new',
        source: req.body.source,
      });
    } catch (error) {
      await Promise.all(
        lines.map((line) => Product.updateOne({ _id: line.product._id }, { $inc: { stock: line.qty } }))
      );
      throw error;
    }

    console.log(`[masti-mall] new order ${order.orderNumber} for ${phone}. Confirm on WhatsApp.`);
    pingRevalidate(['products', ...lines.map((line) => `product:${line.product.slug}`)]);

    await markCartConverted({
      guestId: guestId || undefined,
      userId: req.mallUserId || undefined,
      orderId: order._id,
    });

    res.status(201).json({ orderNumber: order.orderNumber, order: presentOrder(order) });
  })
);

mall.get(
  '/orders/:orderNumber',
  trackLimit,
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.query.phone);
    if (!isPkMobile(phone)) throw new HttpError(400, 'Phone number should look like 03XX-XXXXXXX.');
    const order = await MallOrder.findOne({ orderNumber: req.params.orderNumber, 'customer.phone': phone });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json({ order: presentOrder(order) });
  })
);

function publicCustomer(customer) {
  return {
    id: String(customer._id),
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    role: customer.role,
  };
}

mall.post(
  '/auth/register',
  writeLimit,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    if (!isPkMobile(phone)) throw new HttpError(400, 'Phone number should look like 03XX-XXXXXXX.');
    const email = req.body.email.toLowerCase().trim();
    const guestId = String(req.cookies?.[GUEST_CART_COOKIE] || '').trim();
    const visitorId = String(req.cookies?.[VISITOR_COOKIE] || '').trim();
    await assertNotBlocked({
      guestId: guestId || undefined,
      visitorId: visitorId || undefined,
      phone,
      email,
    });
    const existing = await MallCustomer.findOne({ email }).select('_id');
    if (existing) throw new HttpError(409, 'An account with this email already exists.');
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const customer = await MallCustomer.create({
      name: req.body.name,
      email,
      phone,
      passwordHash,
      role: 'customer',
    });
    const token = signMallToken(customer);
    setMallCookie(res, token);
    res.status(201).json({ customer: publicCustomer(customer) });
  })
);

mall.post(
  '/auth/login',
  writeLimit,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findOne({ email: req.body.email.toLowerCase() });
    if (!customer) throw new HttpError(401, 'Email or password is wrong.');
    const ok = await bcrypt.compare(req.body.password, customer.passwordHash || '');
    if (!ok) throw new HttpError(401, 'Email or password is wrong.');
    await assertNotBlocked({
      userId: customer._id,
      phone: customer.phone || undefined,
      email: customer.email || undefined,
      guestId: String(req.cookies?.[GUEST_CART_COOKIE] || '').trim() || undefined,
      visitorId: String(req.cookies?.[VISITOR_COOKIE] || '').trim() || undefined,
    });
    setMallCookie(res, signMallToken(customer));
    res.json({ customer: publicCustomer(customer) });
  })
);

mall.post('/auth/logout', (_req, res) => {
  clearMallCookie(res);
  res.json({ ok: true });
});

mall.get(
  '/auth/me',
  requireMallAuth,
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findById(req.mallUserId);
    if (!customer) throw new HttpError(401, 'Not authenticated');
    res.json({ customer: publicCustomer(customer) });
  })
);

mall.patch(
  '/auth/me',
  requireMallAuth,
  writeLimit,
  validate(profileUpdateSchema),
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findById(req.mallUserId);
    if (!customer) throw new HttpError(401, 'Not authenticated');
    const phone = normalizePhone(req.body.phone);
    if (!isPkMobile(phone)) throw new HttpError(400, 'Phone number should look like 03XX-XXXXXXX.');
    customer.name = String(req.body.name).trim();
    customer.phone = phone;
    await customer.save();
    res.json({ customer: publicCustomer(customer) });
  })
);

mall.get(
  '/account/orders',
  requireMallAuth,
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findById(req.mallUserId);
    if (!customer) throw new HttpError(401, 'Not authenticated');

    // Attach older guest orders that used the same phone
    if (customer.phone) {
      await MallOrder.updateMany(
        {
          'customer.phone': customer.phone,
          $or: [{ user: null }, { user: { $exists: false } }],
        },
        { $set: { user: customer._id } }
      );
    }

    const query = customer.phone
      ? { $or: [{ user: customer._id }, { 'customer.phone': customer.phone }] }
      : { user: customer._id };

    const orders = await MallOrder.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({
      orders: orders.map(presentOrder),
      customer: publicCustomer(customer),
    });
  })
);

mall.get(
  '/wishlist',
  requireMallAuth,
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findById(req.mallUserId).populate({
      path: 'wishlist',
      match: { status: 'active' },
      populate: [
        { path: 'department', select: 'name slug themeKey' },
        { path: 'category', select: 'name slug color' },
      ],
    });
    const items = (customer?.wishlist || []).filter(Boolean).map((item) => presentProduct(item));
    res.json({ items });
  })
);

mall.post(
  '/wishlist',
  requireMallAuth,
  validate(wishlistSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.body.productId, status: 'active' }).select('_id');
    if (!product) throw new HttpError(404, 'Product not found');
    const update =
      req.body.action === 'remove'
        ? { $pull: { wishlist: product._id } }
        : { $addToSet: { wishlist: product._id } };
    await MallCustomer.updateOne({ _id: req.mallUserId }, update);
    res.json({ ok: true });
  })
);

mall.post(
  '/notify',
  writeLimit,
  validate(notifySchema),
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    if (!isPkMobile(phone)) throw new HttpError(400, 'Phone number should look like 03XX-XXXXXXX.');
    const product = await Product.findOne({ _id: req.body.productId, status: 'active' }).select('_id');
    if (!product) throw new HttpError(404, 'Product not found');
    await Notify.updateOne(
      { product: product._id, phone },
      { $setOnInsert: { product: product._id, phone } },
      { upsert: true }
    );
    res.status(201).json({ ok: true });
  })
);

mall.post(
  '/support/threads',
  writeLimit,
  validate(supportStartSchema),
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    if (!isPkMobile(phone)) throw new HttpError(400, 'Phone number should look like 03XX-XXXXXXX.');
    const publicId = req.body.publicId || newPublicId();
    let thread = await SupportThread.findOne({ publicId });
    if (!thread) {
      thread = await SupportThread.create({
        publicId,
        name: req.body.name,
        phone,
        status: 'open',
        lastMessageAt: new Date(),
        lastPreview: '',
        unreadAdmin: 0,
        unreadCustomer: 0,
      });
      await appendMessage(thread, {
        from: 'system',
        body: 'Thanks for reaching out. A Masti Mall teammate will reply here shortly.',
      });
    } else {
      thread.name = req.body.name;
      thread.phone = phone;
      await thread.save();
    }
    const message = await appendMessage(thread, { from: 'customer', body: req.body.body });
    const messages = await SupportMessage.find({ thread: thread._id }).sort({ createdAt: 1 }).limit(200);
    res.status(201).json({
      thread: presentThread(thread),
      message: presentMessage(message),
      messages: messages.map(presentMessage),
    });
  })
);

mall.get(
  '/support/threads/:publicId',
  asyncHandler(async (req, res) => {
    const thread = await SupportThread.findOne({ publicId: req.params.publicId });
    if (!thread) throw new HttpError(404, 'Conversation not found');
    // Only clear unread when the chat UI is open (markRead=1). Polling must not wipe it.
    if (req.query.markRead === '1' && thread.unreadCustomer) {
      thread.unreadCustomer = 0;
      await thread.save();
    }
    const messages = await SupportMessage.find({ thread: thread._id }).sort({ createdAt: 1 }).limit(200);
    res.set('Cache-Control', 'no-store');
    res.json({ thread: presentThread(thread), messages: messages.map(presentMessage) });
  })
);

mall.post(
  '/support/threads/:publicId/messages',
  writeLimit,
  validate(supportReplySchema),
  asyncHandler(async (req, res) => {
    const thread = await SupportThread.findOne({ publicId: req.params.publicId });
    if (!thread) throw new HttpError(404, 'Conversation not found');
    const message = await appendMessage(thread, { from: 'customer', body: req.body.body });
    res.status(201).json({ thread: presentThread(thread), message: presentMessage(message) });
  })
);

export default mall;
