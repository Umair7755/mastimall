"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin";
import { AdminButton, AdminField, AdminInput, Card } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mastimall.pk");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await adminFetch("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.replace("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <Card className="w-full max-w-md p-6">
        <p className="text-xl font-semibold text-slate-900">Masti Admin</p>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage the store.</p>
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <AdminField label="Email">
            <AdminInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </AdminField>
          <AdminField label="Password">
            <AdminInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </AdminField>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <AdminButton type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </AdminButton>
        </form>
        <p className="mt-4 text-xs text-slate-500">Default: admin@mastimall.pk / Admin@12345</p>
      </Card>
    </div>
  );
}
