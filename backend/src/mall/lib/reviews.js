import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

export function presentReview(doc) {
  const item = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(item._id),
    productId: item.product ? String(item.product) : null,
    name: item.name,
    rating: item.rating,
    title: item.title || '',
    text: item.text,
    city: item.city || '',
    source: item.source || 'customer',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/** Recalculate product.ratingAvg / ratingCount from live Review docs. */
export async function refreshProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;
  const ratingAvg = Math.round(avg * 10) / 10;
  const ratingCount = count;
  await Product.updateOne({ _id: productId }, { $set: { ratingAvg, ratingCount } });
  return { ratingAvg, ratingCount };
}
