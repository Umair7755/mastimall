import { PictureTile } from "@/components/home/PictureTile";
import { Carousel } from "@/components/ui/Carousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AGE_BANDS } from "@/lib/constants";
import { CONTAINER } from "@/lib/layout";

export function AgePicker({ title = "Shop by age" }) {
  return (
    <section id="age" className={`${CONTAINER} scroll-mt-28 py-3 lg:py-5`}>
      <div className="rounded-[1.5rem] bg-gradient-to-br from-mint via-white to-brand-soft p-3 sm:p-4">
        <SectionHeading title={title} text="Pick the age band that fits." />
        <Carousel itemClassName="w-[40%] sm:w-[26%] lg:w-[16%]">
          {AGE_BANDS.map((item) => (
            <PictureTile
              key={item.slug}
              href={`/age/${item.slug}`}
              title={item.label}
              image={item.image}
              color={item.color}
              shape="circle"
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
