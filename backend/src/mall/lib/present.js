function ref(doc, fields) {
  if (!doc) return null;
  if (doc._id && doc.slug) {
    const out = { id: String(doc._id), name: doc.name, slug: doc.slug };
    for (const key of fields) if (doc[key] != null) out[key] = doc[key];
    return out;
  }
  return { id: String(doc) };
}

function currentPrice(product) {
  const sale = product.salePrice;
  if (sale > 0 && sale < product.price) return sale;
  return product.price;
}

export function presentProduct(product, { detail = false } = {}) {
  const doc = product.toObject ? product.toObject({ virtuals: false }) : product;
  const onSale = doc.salePrice > 0 && doc.salePrice < doc.price;
  const base = {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    price: doc.price,
    salePrice: onSale ? doc.salePrice : null,
    currentPrice: currentPrice(doc),
    stock: doc.stock,
    inStock: doc.stock > 0,
    images: doc.images || [],
    model3d: doc.model3d?.glbUrl ? doc.model3d : null,
    department: ref(doc.department, ['themeKey']),
    category: ref(doc.category, ['color']),
    audience: doc.audience || [],
    ageBands: doc.ageBands || [],
    brand: doc.brand || '',
    isNew: !!doc.newlyAdded,
    isFeatured: !!doc.isFeatured,
    ratingAvg: doc.ratingAvg || 0,
    ratingCount: doc.ratingCount || 0,
    fragile: !!doc.fragile,
  };

  if (!detail) return base;

  return {
    ...base,
    sku: doc.sku || '',
    description: doc.description || '',
    highlights: doc.highlights || [],
    tags: doc.tags || [],
    weightGrams: doc.weightGrams || null,
    seo: doc.seo || {},
  };
}

export function presentCategory(category) {
  const doc = category.toObject ? category.toObject() : category;
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    image: doc.image || null,
    color: doc.color || '#EEF0FF',
    order: doc.order || 0,
    filters: doc.filters || [],
    seo: doc.seo || {},
  };
}

export function presentDepartment(department, categories = null) {
  const doc = department.toObject ? department.toObject() : department;
  const out = {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    themeKey: doc.themeKey || doc.slug,
    order: doc.order || 0,
    active: !!doc.active,
    banner: doc.banner || null,
    seo: doc.seo || {},
  };
  if (categories) out.categories = categories.map(presentCategory);
  return out;
}

export function presentOrder(order) {
  const doc = order.toObject ? order.toObject() : order;
  return {
    orderNumber: doc.orderNumber,
    items: (doc.items || []).map((item) => ({
      title: item.title,
      slug: item.slug,
      image: item.image,
      unitPrice: item.unitPrice,
      qty: item.qty,
    })),
    customer: {
      name: doc.customer?.name,
      city: doc.customer?.city,
    },
    payment: {
      method: doc.payment?.method,
      status: doc.payment?.status,
      advancePlan: doc.payment?.advancePlan || 'none',
      discountPercent: doc.payment?.discountPercent || 0,
      discountAmount: doc.payment?.discountAmount || doc.discountAmount || 0,
      advancePercent: doc.payment?.advancePercent || 0,
      advanceAmount: doc.payment?.advanceAmount || 0,
      balanceAmount: doc.payment?.balanceAmount || 0,
      advanceStatus: doc.payment?.advanceStatus || 'none',
      receipt: doc.payment?.receipt?.url
        ? {
            url: doc.payment.receipt.url,
            uploadedAt: doc.payment.receipt.uploadedAt,
          }
        : null,
    },
    shipping: doc.shipping || { fee: 0 },
    pricing: doc.pricing || null,
    subtotal: doc.subtotal,
    discountAmount: doc.discountAmount || doc.payment?.discountAmount || 0,
    total: doc.total,
    fragile: !!doc.fragile,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
