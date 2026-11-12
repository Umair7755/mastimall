import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getSaleBanner } from "@/lib/data";

/** Streams sale banner settings so the layout can show a skeleton first. */
export async function StoreBanner({ message = "" }) {
  const banner = await getSaleBanner();
  return <AnnouncementBar banner={banner} message={message} />;
}
