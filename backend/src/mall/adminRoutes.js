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
import { Review } from './models/Review.js';
import { Notify } from './models/Notify.js';
import { presentCategory, presentDepartment, presentProduct } from './lib/present.js';
import { presentReview, refreshProductRating } from './lib/reviews.js';
import { pingRevalidate } from './lib/revalidate.js';
import { AGE_BANDS, AUDIENCES, ORDER_STATUSES, RESERVED_SLUGS } from './constants.js';
import { DEFAULT_SALE_BANNER } from './lib/saleBanner.js';
import {
  adminReviewSchema,
  adminReviewUpdateSchema,
  categorySchema,
  departmentSchema,
  homeSchema,
  loginSchema,
  productSchema,
  saleBannerSchema,
  orderStatusSchema,
} from './validators.js';
import {
  requireMallAdmin,
  setMallCookie,
  signMallToken,
} from './middleware/mallAuth.js';

const admin = Router();
const writeLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 80 });

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

function applyEffectivePrice(body) {
  const price = body.price;
  const sale = body.salePrice;
  body.effectivePrice = sale > 0 && sale < price ? sale : price;
  return body;
}

function presentAdminOrder(order) {
  const doc = order.toObject ? order.toObject() : order;
  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber,
    items: (doc.items || []).map((item) => ({
      productId: item.product ? String(item.product) : null,
      title: item.title,
      slug: item.slug,
      image: item.image,
      unitPrice: item.unitPrice,
      qty: item.qty,
    })),
    customer: doc.customer || {},
    payment: {
      method: doc.payment?.method,
      status: doc.payment?.status,
      receipt: doc.payment?.receipt?.url
        ? {
            url: doc.payment.receipt.url,
            fileName: doc.payment.receipt.fileName || '',
            mimeType: doc.payment.receipt.mimeType || '',
            uploadedAt: doc.payment.receipt.uploadedAt,
          }
        : null,
    },
    shipping: doc.shipping || { fee: 0 },
    subtotal: doc.subtotal,
    total: doc.total,
    fragile: !!doc.fragile,
    status: doc.status,
    source: doc.source,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function presentAdminCustomer(customer) {
  const doc = customer?.toObject ? customer.toObject() : customer || {};
  return {
    id: String(doc._id),
    name: doc.name || '',
    email: doc.email || '',
    phone: doc.phone || '',
    role: doc.role || 'customer',
    wishlistCount: Array.isArray(doc.wishlist) ? doc.wishlist.length : 0,
    orderCount: Number(doc.orderCount) || 0,
    cancelledCount: Number(doc.cancelledCount) || 0,
    createdAt: doc.createdAt,
  };
}

function customerOrderQuery(customer) {
  const clauses = [{ user: customer._id }];
  if (customer.phone) clauses.push({ 'customer.phone': customer.phone });
  return { $or: clauses };
}

function presentAdminProduct(product) {
  const base = presentProduct(product, { detail: true });
  const doc = product.toObject ? product.toObject() : product;
  return {
    ...base,
    sku: doc.sku || '',
    status: doc.status,
    stock: doc.stock,
    departmentId: doc.department?._id ? String(doc.department._id) : String(doc.department || ''),
    categoryId: doc.category?._id ? String(doc.category._id) : String(doc.category || ''),
    description: doc.description || '',
    highlights: doc.highlights || [],
    tags: doc.tags || [],
    weightGrams: doc.weightGrams || null,
    seo: doc.seo || {},
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function loadSaleBanner() {
  const doc = await MallSetting.findOne({ key: 'saleBanner' }).lean();
  return { ...DEFAULT_SALE_BANNER, ...(doc?.value || {}) };
}

/** Public banner payload used by the storefront top bar. */
admin.get(
  '/settings/banner',
  asyncHandler(async (_req, res) => {
    res.json({ banner: await loadSaleBanner() });
  })
);

admin.post(
  '/admin/auth/login',
  writeLimit,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findOne({ email: req.body.email.toLowerCase() });
    if (!customer || customer.role !== 'admin') {
      throw new HttpError(401, 'Admin email or password is wrong.');
    }
    const ok = await bcrypt.compare(req.body.password, customer.passwordHash || '');
    if (!ok) throw new HttpError(401, 'Admin email or password is wrong.');
    const token = signMallToken(customer);
    setMallCookie(res, token);
    res.json({
      customer: {
        id: String(customer._id),
        name: customer.name,
        email: customer.email,
        role: customer.role,
      },
    });
  })
);

admin.get(
  '/admin/me',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    if (req.mallUserId) {
      const customer = await MallCustomer.findById(req.mallUserId);
      if (!customer || customer.role !== 'admin') throw new HttpError(403, 'Admin only');
      return res.json({
        customer: {
          id: String(customer._id),
          name: customer.name,
          email: customer.email,
          role: customer.role,
        },
      });
    }
    res.json({ customer: { id: 'token', name: 'Admin', email: '', role: 'admin' } });
  })
);

admin.get(
  '/admin/dashboard',
  requireMallAdmin,
  asyncHandler(async (_req, res) => {
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    // Revenue is booked only after successful delivery.
    const deliveredOnly = { status: 'delivered' };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      productCount,
      activeProducts,
      draftProducts,
      archivedProducts,
      lowStock,
      outOfStock,
      customerCount,
      adminCount,
      orderCount,
      todayOrders,
      revenueAgg,
      todayRevenueAgg,
      statusRows,
      dailyRows,
      topRows,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'draft' }),
      Product.countDocuments({ status: 'archived' }),
      Product.countDocuments({ status: 'active', stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ status: 'active', stock: { $lte: 0 } }),
      MallCustomer.countDocuments({ role: { $ne: 'admin' } }),
      MallCustomer.countDocuments({ role: 'admin' }),
      MallOrder.countDocuments({}),
      MallOrder.countDocuments({ createdAt: { $gte: todayStart } }),
      MallOrder.aggregate([
        { $match: deliveredOnly },
        { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
      MallOrder.aggregate([
        { $match: { createdAt: { $gte: todayStart }, ...deliveredOnly } },
        { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
      MallOrder.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      MallOrder.aggregate([
        { $match: { createdAt: { $gte: since }, ...deliveredOnly } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      MallOrder.aggregate([
        { $match: deliveredOnly },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.slug',
            title: { $first: '$items.title' },
            qty: { $sum: '$items.qty' },
            revenue: { $sum: { $multiply: ['$items.qty', '$items.unitPrice'] } },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 6 },
      ]),
      MallOrder.find({}).sort({ createdAt: -1 }).limit(8),
    ]);

    const dayMap = Object.fromEntries(dailyRows.map((row) => [row._id, row]));
    const salesByDay = [];
    for (let i = 0; i < 14; i += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      salesByDay.push({
        date: key,
        revenue: dayMap[key]?.revenue || 0,
        orders: dayMap[key]?.orders || 0,
      });
    }

    const ordersByStatus = ORDER_STATUSES.map((status) => ({
      status,
      count: statusRows.find((row) => row._id === status)?.count || 0,
    }));

    res.json({
      summary: {
        revenue: revenueAgg[0]?.revenue || 0,
        orders: revenueAgg[0]?.orders || 0,
        orderCount,
        todayOrders,
        todayRevenue: todayRevenueAgg[0]?.revenue || 0,
        productCount,
        activeProducts,
        draftProducts,
        archivedProducts,
        lowStock,
        outOfStock,
        customerCount,
        adminCount,
        avgOrderValue:
          revenueAgg[0]?.orders > 0
            ? Math.round((revenueAgg[0].revenue / revenueAgg[0].orders) * 100) / 100
            : 0,
      },
      salesByDay,
      ordersByStatus,
      topProducts: topRows.map((row) => ({
        slug: row._id,
        title: row.title,
        qty: row.qty,
        revenue: row.revenue,
      })),
      recentOrders: recentOrders.map(presentAdminOrder),
    });
  })
);

admin.get(
  '/admin/products',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const query = {};
    if (req.query.status) query.status = String(req.query.status);
    if (req.query.q) {
      const pattern = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
      query.$or = [{ title: pattern }, { slug: pattern }, { brand: pattern }, { sku: pattern }];
    }
    const [total, items] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('department', 'name slug')
        .populate('category', 'name slug'),
    ]);
    res.json({
      items: items.map(presentAdminProduct),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  })
);

admin.get(
  '/admin/products/:id',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
      .populate('department', 'name slug')
      .populate('category', 'name slug');
    if (!product) throw new HttpError(404, 'Product not found');
    res.json({ product: presentAdminProduct(product) });
  })
);

admin.get(
  '/admin/products/:id/reviews',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).select('_id slug title ratingAvg ratingCount');
    if (!product) throw new HttpError(404, 'Product not found');
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(200);
    res.json({
      product: {
        id: String(product._id),
        title: product.title,
        slug: product.slug,
        ratingAvg: product.ratingAvg || 0,
        ratingCount: product.ratingCount || 0,
      },
      reviews: reviews.map(presentReview),
    });
  })
);

admin.post(
  '/admin/products/:id/reviews',
  requireMallAdmin,
  validate(adminReviewSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, 'Product not found');
    const review = await Review.create({
      product: product._id,
      name: req.body.name,
      rating: req.body.rating,
      title: req.body.title || '',
      text: req.body.text,
      city: req.body.city || '',
      source: 'admin',
    });
    const rating = await refreshProductRating(product._id);
    pingRevalidate(['products', `product:${product.slug}`]);
    res.status(201).json({ review: presentReview(review), rating });
  })
);

admin.patch(
  '/admin/reviews/:id',
  requireMallAdmin,
  validate(adminReviewUpdateSchema),
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new HttpError(404, 'Review not found');
    if (req.body.name != null) review.name = req.body.name;
    if (req.body.rating != null) review.rating = req.body.rating;
    if (req.body.title != null) review.title = req.body.title;
    if (req.body.text != null) review.text = req.body.text;
    if (req.body.city != null) review.city = req.body.city;
    await review.save();

    const product = await Product.findById(review.product).select('slug');
    const rating = await refreshProductRating(review.product);
    if (product?.slug) pingRevalidate(['products', `product:${product.slug}`]);
    res.json({ review: presentReview(review), rating });
  })
);

admin.delete(
  '/admin/reviews/:id',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new HttpError(404, 'Review not found');
    const productId = review.product;
    await Review.deleteOne({ _id: review._id });
    const product = await Product.findById(productId).select('slug');
    const rating = await refreshProductRating(productId);
    if (product?.slug) pingRevalidate(['products', `product:${product.slug}`]);
    res.json({ ok: true, rating });
  })
);

admin.post(
  '/admin/products',
  requireMallAdmin,
  validate(productSchema),
  asyncHandler(async (req, res) => {
    const body = applyEffectivePrice({ ...req.body, slug: assertSlug(req.body.slug) });
    body.department = body.departmentId;
    body.category = body.categoryId;
    if (body.isNew != null) body.newlyAdded = body.isNew;
    delete body.isNew;
    delete body.departmentId;
    delete body.categoryId;
    const exists = await Product.findOne({ slug: body.slug }).select('_id');
    if (exists) throw new HttpError(400, 'A product with this slug already exists.');
    const product = await Product.create(body);
    pingRevalidate(['products', 'departments', 'home', `product:${product.slug}`]);
    const full = await Product.findById(product._id)
      .populate('department', 'name slug')
      .populate('category', 'name slug');
    res.status(201).json({ product: presentAdminProduct(full) });
  })
);

admin.patch(
  '/admin/products/:id',
  requireMallAdmin,
  validate(productSchema.partial()),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, 'Product not found');
    const body = { ...req.body };
    if (body.slug) {
      body.slug = assertSlug(body.slug);
      const clash = await Product.findOne({ slug: body.slug, _id: { $ne: product._id } }).select('_id');
      if (clash) throw new HttpError(400, 'A product with this slug already exists.');
    }
    if (body.departmentId) {
      body.department = body.departmentId;
      delete body.departmentId;
    }
    if (body.categoryId) {
      body.category = body.categoryId;
      delete body.categoryId;
    }
    if (body.isNew != null) {
      body.newlyAdded = body.isNew;
      delete body.isNew;
    }
    Object.assign(product, body);
    if (body.price != null || body.salePrice !== undefined) {
      applyEffectivePrice(product);
    }
    await product.save();
    pingRevalidate(['products', 'departments', 'home', `product:${product.slug}`]);
    const full = await Product.findById(product._id)
      .populate('department', 'name slug')
      .populate('category', 'name slug');
    res.json({ product: presentAdminProduct(full) });
  })
);

admin.delete(
  '/admin/products/:id',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, 'Product not found');
    const productId = product._id;
    const slug = product.slug;

    await Promise.all([
      Review.deleteMany({ product: productId }),
      Notify.deleteMany({ product: productId }),
      MallCustomer.updateMany({ wishlist: productId }, { $pull: { wishlist: productId } }),
      Product.deleteOne({ _id: productId }),
    ]);

    pingRevalidate(['products', 'departments', 'home', `product:${slug}`]);
    res.json({ ok: true, removed: true });
  })
);

admin.get(
  '/admin/orders',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const query = {};
    if (req.query.status) query.status = String(req.query.status);
    if (req.query.q) {
      const pattern = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
      query.$or = [
        { orderNumber: pattern },
        { 'customer.name': pattern },
        { 'customer.phone': pattern },
        { 'customer.city': pattern },
      ];
    }
    const [total, items] = await Promise.all([
      MallOrder.countDocuments(query),
      MallOrder.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    res.json({
      items: items.map(presentAdminOrder),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  })
);

admin.patch(
  '/admin/orders/:id',
  requireMallAdmin,
  validate(orderStatusSchema),
  asyncHandler(async (req, res) => {
    const order = await MallOrder.findById(req.params.id);
    if (!order) throw new HttpError(404, 'Order not found');
    if (req.body.status) order.status = req.body.status;
    if (req.body.paymentStatus) {
      order.payment = order.payment || {};
      order.payment.status = req.body.paymentStatus;
    }
    if (req.body.trackingNumber != null || req.body.courier != null) {
      order.shipping = order.shipping || {};
      if (req.body.trackingNumber != null) order.shipping.trackingNumber = req.body.trackingNumber;
      if (req.body.courier != null) order.shipping.courier = req.body.courier;
    }
    await order.save();
    res.json({ order: presentAdminOrder(order) });
  })
);

admin.get(
  '/admin/customers',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const query = {};
    if (req.query.role) query.role = String(req.query.role);
    if (req.query.q) {
      const pattern = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
      query.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
    }
    const [total, items] = await Promise.all([
      MallCustomer.countDocuments(query),
      MallCustomer.aggregate([
        { $match: query },
        {
          $addFields: {
            adminFirst: { $cond: [{ $eq: ['$role', 'admin'] }, 0, 1] },
          },
        },
        { $sort: { adminFirst: 1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: 'mallorders',
            let: { customerId: '$_id', phone: '$phone' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$user', '$$customerId'] },
                      {
                        $and: [
                          { $ne: ['$$phone', null] },
                          { $ne: ['$$phone', ''] },
                          { $eq: ['$customer.phone', '$$phone'] },
                        ],
                      },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  orderCount: { $sum: 1 },
                  cancelledCount: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
                  },
                },
              },
            ],
            as: 'orderStats',
          },
        },
        {
          $addFields: {
            orderCount: { $ifNull: [{ $arrayElemAt: ['$orderStats.orderCount', 0] }, 0] },
            cancelledCount: { $ifNull: [{ $arrayElemAt: ['$orderStats.cancelledCount', 0] }, 0] },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            role: 1,
            wishlist: 1,
            createdAt: 1,
            orderCount: 1,
            cancelledCount: 1,
          },
        },
      ]),
    ]);
    res.json({
      items: items.map(presentAdminCustomer),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  })
);

admin.get(
  '/admin/customers/:id',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findById(req.params.id);
    if (!customer) throw new HttpError(404, 'Customer not found');

    const match = customerOrderQuery(customer);

    // Link guest checkouts on the same phone to this account for admin history.
    if (customer.phone) {
      await MallOrder.updateMany(
        {
          'customer.phone': customer.phone,
          $or: [{ user: null }, { user: { $exists: false } }],
        },
        { $set: { user: customer._id } }
      );
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const status = req.query.status ? String(req.query.status) : '';
    const listQuery = status ? { ...match, status } : match;

    const [total, orders, byStatus, salesByDay, cancelledOrders, revenueRows] = await Promise.all([
      MallOrder.countDocuments(listQuery),
      MallOrder.find(listQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      MallOrder.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      MallOrder.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 60 },
      ]),
      MallOrder.find({ ...match, status: 'cancelled' }).sort({ createdAt: -1 }).limit(20),
      MallOrder.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            orderCount: { $sum: 1 },
            cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            returnedCount: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0],
              },
            },
          },
        },
      ]),
    ]);

    const statusMap = Object.fromEntries(ORDER_STATUSES.map((item) => [item, 0]));
    for (const row of byStatus) {
      if (row._id in statusMap) statusMap[row._id] = row.count;
    }

    const totals = revenueRows[0] || {
      orderCount: 0,
      cancelledCount: 0,
      deliveredCount: 0,
      returnedCount: 0,
      revenue: 0,
    };

    res.json({
      customer: presentAdminCustomer({
        ...customer.toObject(),
        orderCount: totals.orderCount,
        cancelledCount: totals.cancelledCount,
      }),
      summary: {
        orderCount: totals.orderCount,
        cancelledCount: totals.cancelledCount,
        deliveredCount: totals.deliveredCount,
        returnedCount: totals.returnedCount,
        revenue: totals.revenue,
        avgOrderValue: totals.deliveredCount
          ? Math.round(totals.revenue / totals.deliveredCount)
          : 0,
      },
      ordersByStatus: ORDER_STATUSES.map((statusName) => ({
        status: statusName,
        count: statusMap[statusName] || 0,
      })),
      salesByDay: salesByDay.map((row) => ({
        date: row._id,
        orders: row.orders,
        cancelled: row.cancelled,
        revenue: row.revenue,
      })),
      cancelledOrders: cancelledOrders.map(presentAdminOrder),
      orders: {
        items: orders.map(presentAdminOrder),
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  })
);

admin.patch(
  '/admin/customers/:id',
  requireMallAdmin,
  asyncHandler(async (req, res) => {
    const customer = await MallCustomer.findById(req.params.id);
    if (!customer) throw new HttpError(404, 'Customer not found');
    if (req.body.role && ['customer', 'admin'].includes(req.body.role)) {
      if (String(customer._id) === String(req.mallUserId) && req.body.role !== 'admin') {
        throw new HttpError(400, 'You cannot remove your own admin role.');
      }
      customer.role = req.body.role;
    }
    if (req.body.name != null) customer.name = String(req.body.name).trim();
    await customer.save();
    res.json({ customer: presentAdminCustomer(customer) });
  })
);

admin.get(
  '/admin/catalog-options',
  requireMallAdmin,
  asyncHandler(async (_req, res) => {
    const [departments, categories] = await Promise.all([
      Department.find({}).sort({ order: 1, name: 1 }),
      Category.find({}).sort({ order: 1, name: 1 }).populate('department', 'name slug'),
    ]);
    res.json({
      departments: departments.map((item) => presentDepartment(item)),
      categories: categories.map((item) => ({
        ...presentCategory(item),
        departmentId: item.department?._id ? String(item.department._id) : String(item.department || ''),
        departmentSlug: item.department?.slug || '',
      })),
      audiences: AUDIENCES,
      ageBands: AGE_BANDS,
      orderStatuses: ORDER_STATUSES,
    });
  })
);

admin.get(
  '/admin/settings/banner',
  requireMallAdmin,
  asyncHandler(async (_req, res) => {
    res.json({ banner: await loadSaleBanner() });
  })
);

admin.put(
  '/admin/settings/banner',
  requireMallAdmin,
  validate(saleBannerSchema),
  asyncHandler(async (req, res) => {
    const next = { ...DEFAULT_SALE_BANNER, ...req.body };
    await MallSetting.findOneAndUpdate({ key: 'saleBanner' }, { value: next }, { upsert: true });
    pingRevalidate(['home']);
    res.json({ banner: next });
  })
);

admin.get(
  '/admin/settings/home',
  requireMallAdmin,
  asyncHandler(async (_req, res) => {
    const doc = await MallSetting.findOne({ key: 'home' }).lean();
    res.json({ home: doc?.value || {} });
  })
);

admin.put(
  '/admin/settings/home',
  requireMallAdmin,
  validate(homeSchema),
  asyncHandler(async (req, res) => {
    await MallSetting.findOneAndUpdate({ key: 'home' }, { value: req.body }, { upsert: true });
    pingRevalidate(['home']);
    const doc = await MallSetting.findOne({ key: 'home' }).lean();
    res.json({ home: doc?.value || {} });
  })
);

admin.post(
  '/admin/departments',
  requireMallAdmin,
  validate(departmentSchema),
  asyncHandler(async (req, res) => {
    const slug = assertSlug(req.body.slug);
    const department = await Department.create({ ...req.body, slug, themeKey: req.body.themeKey || slug });
    pingRevalidate(['departments', 'home']);
    res.status(201).json({ department: presentDepartment(department) });
  })
);

admin.post(
  '/admin/categories',
  requireMallAdmin,
  validate(categorySchema),
  asyncHandler(async (req, res) => {
    const slug = assertSlug(req.body.slug);
    const department = await Department.findById(req.body.departmentId);
    if (!department) throw new HttpError(400, 'Department not found');
    const category = await Category.create({ ...req.body, slug, department: department._id });
    pingRevalidate(['departments', 'home']);
    res.status(201).json({ category: presentCategory(category) });
  })
);

export default admin;
