"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/auth/actions";
import { signUpSchema } from "@/lib/validation/auth";

function UserIcon() {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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

function VoiceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
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

const inputBase =
  "w-full rounded-2xl border bg-surface-low py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60";

export function SignUpForm() {
  const [pending, setPending] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setFormErrors({});
    setFieldErrors({});

    // Client-side validation for instant feedback
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errors[issue.path[0] as string] = issue.message;
      }
      setFieldErrors(errors);
      setPending(false);
      return;
    }

    const result = await signUpAction(formData);

    if (result?.errors) {
      const { form, ...fields } = result.errors;
      if (form) {
        setFormErrors({ form });
      }
      if (Object.keys(fields).length > 0) {
        setFieldErrors(fields);
      }
      setPending(false);
    }
    // On success, signUpAction redirects to /dashboard
  }

  return (
    <div className="flex flex-col items-center">
      {/* Brand */}
      <span className="bg-linear-to-r from-primary to-secondary bg-clip-text font-heading text-2xl font-extrabold text-transparent">
        Mockable
      </span>
      <p className="mb-8 mt-1 text-center text-sm text-muted">
        Create your account to start practicing.
      </p>

      {formErrors.form && (
        <div
          role="alert"
          className="mb-5 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {formErrors.form}
        </div>
      )}

      <form action={handleSubmit} className="flex w-full flex-col gap-5">
        {/* Full name */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-sm font-semibold tracking-wide text-foreground">
            Full name
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <UserIcon />
            </span>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Jane Doe"
              disabled={pending}
              autoComplete="name"
              aria-invalid={!!fieldErrors.name}
              className={`${inputBase} ${
                fieldErrors.name ? "border-error" : "border-outline-variant"
              }`}
            />
          </div>
          {fieldErrors.name && (
            <p className="text-xs text-error">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold tracking-wide text-foreground">
            Email
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
              disabled={pending}
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              className={`${inputBase} ${
                fieldErrors.email ? "border-error" : "border-outline-variant"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-error">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold tracking-wide text-foreground">
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
              disabled={pending}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
              className={`${inputBase} ${
                fieldErrors.password ? "border-error" : "border-outline-variant"
              }`}
            />
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-error">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-pill bg-linear-to-r from-primary to-secondary py-3.5 text-sm font-semibold tracking-wide text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:scale-100 disabled:opacity-70">
          {pending ? "Creating account..." : "Create Account"}
          {!pending && <ArrowIcon />}
        </button>
      </form>

      <div className="mt-8 w-full border-t border-surface-variant pt-6 text-center">
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary transition-colors hover:text-secondary">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
