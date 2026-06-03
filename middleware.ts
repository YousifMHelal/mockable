import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Build an Edge-safe Auth.js instance from the credential-free config only.
// This intentionally does NOT import lib/auth (Prisma adapter + bcrypt), which
// cannot run in the Edge runtime. JWT verification in the `authorized` callback
// is all the middleware needs to gate protected routes.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*"],
};
