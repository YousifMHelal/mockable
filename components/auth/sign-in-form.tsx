"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only honor same-origin relative paths to avoid an open-redirect via
  // ?callbackUrl=https://evil.example. "//evil" is also rejected.
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl &&
    rawCallbackUrl.startsWith("/") &&
    !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/dashboard";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      setError("Invalid email or password.");
      setPending(false);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div className="flex flex-col items-center">
      {/* Brand */}
      <span className="bg-linear-to-r from-primary to-secondary bg-clip-text font-heading text-2xl font-extrabold text-transparent">
        Mockable
      </span>

      {/* Header */}
      <div className="mb-8 mt-6 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted">Sign in to continue your prep.</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form action={handleSubmit} className="flex w-full flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold tracking-wide text-foreground"
          >
            Email address
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <MailIcon />
            </span>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              disabled={pending}
              autoComplete="email"
              className="w-full rounded-2xl border border-outline-variant bg-surface py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold tracking-wide text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <LockIcon />
            </span>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              disabled={pending}
              autoComplete="current-password"
              className="w-full rounded-2xl border border-outline-variant bg-surface py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-pill bg-linear-to-r from-primary to-secondary py-3.5 text-sm font-semibold tracking-wide text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:scale-100 disabled:opacity-70"
        >
          {pending ? "Signing in..." : "Sign In"}
          {!pending && <ArrowIcon />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-primary transition-colors hover:text-secondary"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
