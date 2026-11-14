import Link from "next/link";
import {
  Baby,
  Globe,
  Heart,
  HeartHandshake,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import { MastiLogo } from "@/components/brand/MastiLogo";
import { TrustBar } from "@/components/home/TrustBar";
import { AGE_BANDS, AUDIENCES, BUDGETS } from "@/lib/constants";
import { CONTAINER } from "@/lib/layout";

const SUPPORT_EMAIL = "support@mastimall.store";
const SUPPORT_PHONE = "03044471631";
const SUPPORT_PHONE_DISPLAY = "0304-4471631";
const SITE_DOMAIN = "mastimall.store";
const SITE_URL = "https://mastimall.store";

function FootLink({ href, icon: Icon, children, external = false }) {
  const className =
    "inline-flex min-h-10 items-center gap-2 text-white/90 transition hover:text-sun";
  if (external) {
    return (
      <a href={href} className={className} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        <Icon aria-hidden="true" size={16} className="text-sun" />
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      <Icon aria-hidden="true" size={16} className="text-sun" />
      {children}
    </Link>
  );
}

export function Footer({ departments = [], whatsapp = "" }) {
  const waDigits = String(whatsapp || SUPPORT_PHONE).replace(/[^\d]/g, "");
  const wa = waDigits.startsWith("92") ? waDigits : waDigits.replace(/^0/, "92");

  return (
    <div className="mt-6">
      <TrustBar />

      <footer className="relative overflow-hidden bg-brand-dark text-white">
        <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-coral/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-sun/20 blur-3xl" />

        <div className={`${CONTAINER} relative grid gap-3 py-7 sm:grid-cols-2 lg:grid-cols-4`}>
          {[
            { icon: ShieldCheck, title: "Checked prices", text: "Totals are verified on the server." },
            { icon: Truck, title: "Pakistan delivery", text: "COD nationwide · wallets with receipt." },
            { icon: Package, title: "Free from Rs 3,000", text: "Lower orders still ship for a small fee." },
            { icon: HeartHandshake, title: "Guest checkout", text: "Name, phone, city, address. Done." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl bg-white/8 p-4 backdrop-blur">
                <Icon aria-hidden="true" size={22} className="text-sun" />
                <p className="mt-2 font-display text-lg">{item.title}</p>
                <p className="mt-1 text-sm text-white/80">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className={`${CONTAINER} relative grid gap-8 pb-8 pt-1 sm:grid-cols-2 lg:grid-cols-4`}>
          <div>
            <MastiLogo height={88} theme="dark" slogan="moods" orbit tagline={false} className="max-w-[16rem]" />
            <p className="mt-2 text-sm font-medium text-sun/90">Easy for kids. Fast for parents.</p>
            <p className="mt-3 max-w-xs text-white/85">
              Toys + décor for Pakistani homes. Browse by age, room, or budget — then order in under a minute.
            </p>
            <ul className="mt-4 grid gap-1.5 text-sm text-white/90">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="inline-flex min-h-9 items-center gap-2 transition hover:text-sun"
                >
                  <Mail aria-hidden="true" size={16} className="text-sun" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="inline-flex min-h-9 items-center gap-2 transition hover:text-sun"
                >
                  <Phone aria-hidden="true" size={16} className="text-sun" />
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={SITE_URL}
                  className="inline-flex min-h-9 items-center gap-2 transition hover:text-sun"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe aria-hidden="true" size={16} className="text-sun" />
                  {SITE_DOMAIN}
                </a>
              </li>
            </ul>
            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-sun px-5 font-display text-ink"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle aria-hidden="true" size={18} />
                WhatsApp help
              </a>
            ) : null}
          </div>

          <div>
            <p className="font-display text-lg">Shop</p>
            <ul className="mt-3 grid gap-1">
              {departments.map((department) => (
                <li key={department.id}>
                  <FootLink href={`/${department.slug}`} icon={Store}>
                    {department.name}
                  </FootLink>
                </li>
              ))}
              {AUDIENCES.map((item) => (
                <li key={item.slug}>
                  <FootLink href={`/for/${item.slug}`} icon={item.slug === "baby" ? Baby : UserRound}>
                    {item.label}
                  </FootLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-lg">Find faster</p>
            <ul className="mt-3 grid gap-1">
              {AGE_BANDS.slice(0, 4).map((item) => (
                <li key={item.slug}>
                  <FootLink href={`/age/${item.slug}`} icon={Search}>
                    Ages {item.label}
                  </FootLink>
                </li>
              ))}
              {BUDGETS.slice(0, 3).map((item) => (
                <li key={item.slug}>
                  <FootLink href={`/budget/${item.slug}`} icon={Wallet}>
                    {item.label}
                  </FootLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-lg">Contact & help</p>
            <ul className="mt-3 grid gap-1">
              <li>
                <FootLink href={`mailto:${SUPPORT_EMAIL}`} icon={Mail} external>
                  {SUPPORT_EMAIL}
                </FootLink>
              </li>
              <li>
                <FootLink href={`tel:${SUPPORT_PHONE}`} icon={Phone} external>
                  {SUPPORT_PHONE_DISPLAY}
                </FootLink>
              </li>
              <li>
                <FootLink href={`https://wa.me/${wa}`} icon={MessageCircle} external>
                  WhatsApp {SUPPORT_PHONE_DISPLAY}
                </FootLink>
              </li>
              <li>
                <FootLink href={SITE_URL} icon={Globe} external>
                  {SITE_DOMAIN}
                </FootLink>
              </li>
              <li>
                <FootLink href="/track" icon={Package}>
                  Track an order
                </FootLink>
              </li>
              <li>
                <FootLink href="/cart" icon={ShoppingBag}>
                  Cart
                </FootLink>
              </li>
              <li>
                <FootLink href="/wishlist" icon={Heart}>
                  Wishlist
                </FootLink>
              </li>
              <li>
                <FootLink href="/delivery-terms" icon={Truck}>
                  Delivery Terms
                </FootLink>
              </li>
              <li>
                <FootLink href="/terms" icon={ShieldCheck}>
                  Terms of Service
                </FootLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-[#1e1b4b]">
          <div className={`${CONTAINER} py-3.5 text-center text-sm text-white/85`}>
            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>© 2026 Masti Mall</span>
              <span className="text-white/40" aria-hidden="true">
                ·
              </span>
              <a href={SITE_URL} className="underline-offset-2 hover:text-sun hover:underline">
                {SITE_DOMAIN}
              </a>
              <span className="text-white/40" aria-hidden="true">
                ·
              </span>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline-offset-2 hover:text-sun hover:underline">
                {SUPPORT_EMAIL}
              </a>
              <span className="text-white/40" aria-hidden="true">
                ·
              </span>
              <a href={`tel:${SUPPORT_PHONE}`} className="underline-offset-2 hover:text-sun hover:underline">
                {SUPPORT_PHONE_DISPLAY}
              </a>
              <span className="text-white/40" aria-hidden="true">
                ·
              </span>
              <Link href="/delivery-terms" className="underline-offset-2 hover:text-sun hover:underline">
                Delivery Terms
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
