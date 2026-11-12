import { revalidateTag } from "next/cache";

export async function POST(request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const tags = Array.isArray(body.tags) && body.tags.length ? body.tags : ["products", "home", "departments"];
  for (const tag of tags) revalidateTag(tag, "max");
  return Response.json({ ok: true, tags });
}
