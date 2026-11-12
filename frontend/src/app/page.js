import { HomeSections } from "@/components/home/HomeSections";
import { loadShell } from "@/lib/data";

export const metadata = {
  title: { absolute: "Masti Mall" },
  description: "Toys + décor. Full masti. Bacchon ke toys aur ghar ka décor — cash on delivery across Pakistan.",
};

export default async function HomePage() {
  const { home, departments } = await loadShell();
  return (
    <div data-department={departments[0]?.themeKey}>
      <HomeSections sections={home.sections || []} departments={departments} />
    </div>
  );
}
