import { Suspense } from "react";
import { headers } from "next/headers";
import { Fredoka, Nunito_Sans } from "next/font/google";
import { BannerSkeleton } from "@/components/layout/BannerSkeleton";
import { StoreBanner } from "@/components/layout/StoreBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ShopSheet } from "@/components/layout/ShopSheet";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LiveStoreRefresh } from "@/components/layout/LiveStoreRefresh";
import { HelpChat } from "@/components/support/HelpChat";
import { Providers } from "@/components/providers/Providers";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadShell } from "@/lib/data";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans", display: "swap" });

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Masti Mall", template: "%s · Masti Mall" },
  description: "Toys + décor. Full masti. Bacchon ke toys aur ghar ka décor — cash on delivery across Pakistan.",
  icons: {
    icon: [{ url: "/brand/masti-mall-logo.png", type: "image/png" }],
    apple: [{ url: "/brand/masti-mall-logo.png" }],
  },
};

async function StorefrontChrome({ children }) {
  const pathname = (await headers()).get("x-pathname") || "";
  if (pathname.startsWith("/admin")) {
    return children;
  }

  const { home, departments } = await loadShell();
  const shopHref = departments[0] ? `/${departments[0].slug}` : "/";
  const site = siteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Masti Mall",
              url: site,
              logo: `${site}/brand/masti-mall-logo.png`,
              slogan: "Toys + décor. Full masti.",
            },
            {
              "@type": "WebSite",
              name: "Masti Mall",
              url: site,
              potentialAction: {
                "@type": "SearchAction",
                target: `${site}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-sun focus:px-4 focus:py-2"
      >
        Skip to toys
      </a>
      <Suspense fallback={<BannerSkeleton />}>
        <StoreBanner message={home.announcement} />
      </Suspense>
      <Header nav={home.nav} departments={departments} />
      <main id="content" className="mobile-chrome-pad flex-1">
        {children}
      </main>
      <Footer departments={departments} whatsapp={home.whatsapp} />
      <MobileNav />
      <CartDrawer shopHref={shopHref} />
      <ShopSheet departments={departments} />
      <HelpChat />
      <LiveStoreRefresh />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} h-full`}>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Providers>
          <Suspense fallback={children}>
            <StorefrontChrome>{children}</StorefrontChrome>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
