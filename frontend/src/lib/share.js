/** Soft, child-like WhatsApp notes for Mom/Dad — warm, not formal. */

export function askParentMessage(product, url) {
  const title = product?.title || "this toy";
  return [
    `Hi Mom / Dad 💛`,
    ``,
    `I saw a toy I really love on Masti Mall…`,
    `Can we please look at it together?`,
    ``,
    `✨ ${title}`,
    url,
    ``,
    `Pretty please? 🙏🧸`,
  ].join("\n");
}

export function askParentWishlistMessage(items, origin) {
  if (!items?.length) return "";
  if (items.length === 1) {
    const item = items[0];
    return askParentMessage(item, `${origin}${item.href || ""}`);
  }
  const list = items
    .map((item, index) => `${index + 1}. ${item.title}\n${origin}${item.href || item.path || ""}`)
    .join("\n\n");
  return [
    `Hi Mom / Dad 💛`,
    ``,
    `I saved a few toys I love on Masti Mall.`,
    `Can we please look at them together when you have a minute?`,
    ``,
    list,
    ``,
    `Thank you so much 🧸✨`,
  ].join("\n");
}

export function openWhatsAppShare(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
