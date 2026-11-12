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
  wishlistSchema,
} from './validators.js';
import {
  clearMallCookie,
  optionalMallAuth,
  requireMallAuth,
  setMallCookie,
  signMallToken,
} from './middleware/mallAuth.js';

const mall = Router();

const writeLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40 });
const trackLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 });

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

async function loadHome() {
  const doc = await MallSetting.findOne({ key: 'home' }).lean();
  const value = doc?.value || {};
  const sections = Array.isArray(value.sections) ? [...value.sections] : [];
  sections.sort((a, b) => (a.order || 0) - (b.order || 0));
  return {
    announcement: value.announcement || '',
    whatsapp: value.whatsapp || '',
    nav: value.nav || [],
    sections: sections
      .filter((section) => section.active !== false)
      .map((section) => {
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

export default mall
