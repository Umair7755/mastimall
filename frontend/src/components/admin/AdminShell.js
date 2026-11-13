"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { adminFetch } from "@/lib/admin";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/support", label: "Support", icon: MessageCircle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/banner", label: "Sale banner", icon: ImageIcon },
];

export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminFetch("/admin/me")
      .then((data) => {
        if (!alive) return;
        setAdmin(data.customer);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoading(false);
        router.replace("/admin/login");
      });
    return () => {
      alive = false;
    };
  }, [router]);

  async function logout() {
    await adminFetch("/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <p className="text-sm text-slate-300">Loading admin…</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col bg-slate-950 text-white lg:flex">
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-base font-semibold tracking-tight">Masti Admin</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">{admin.email || admin.name}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition",
                  active ? "bg-indigo-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-2">
          <Link
            href="/"
            className="mb-1 inline-flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Store size={16} aria-hidden="true" />
            View store
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold lg:hidden">Masti Admin</p>
              <p className="text-xs text-slate-500">Store control panel</p>
            </div>
            <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline lg:hidden">
              View store
            </Link>
          </div>
          <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold",
                    active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 p-4 lg:p-5">{children}</main>
      </div>
    </div>
  );
}
