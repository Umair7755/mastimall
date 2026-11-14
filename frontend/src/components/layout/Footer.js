import Link from "next/link";
import {
  Baby,
  Heart,
  HeartHandshake,
  MessageCircle,
  Package,
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

function FootLink({ href, icon: Icon, children }) {
  return (
    <Link href={href} className="inline-flex min-h-10 items-center gap-2 text-white/90 transition hover:text-sun">
      <Icon aria-hidden="true" size={16} className="text-sun" />
      {children}
    </Link>
  );
}

export function Footer({ departments = [], whatsapp = "" }) {
  const wa = String(whatsapp || "").replace(/[^\d]/g, "");
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
            <MastiLogo height={56} className="text-[56px]" />
            <p className="mt-2 text-sm font-medium text-sun/90">Easy for kids. Fast for parents.</p>
            <p className="mt-3 max-w-xs text-white/85">
              Toys + décor for Pakistani homes. Browse by age, room, or budget — then order in under a minute.
            </p>
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
            <p className="font-display text-lg">Help</p>
            <ul className="mt-3 grid gap-1">
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
                <FootLink href="/search?onSale=1" icon={Search}>
                  Deals
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
          <p className={`${CONTAINER} py-3 text-center text-sm text-white/85`}>
            © 2026 Masti Mall · All rights reserved ·{" "}
            <Link href="/terms" className="underline-offset-2 hover:text-sun hover:underline">
              Terms of Service
            </Link>{" "}
            · Made with love in Pakistan
          </p>
        </div>
      </footer>
    </div>
  );
}
