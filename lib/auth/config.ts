import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days, rolling
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth }) {
      // The middleware matcher only runs this on protected paths (/dashboard),
      // so requiring a session here is sufficient. Returning false makes
      // Auth.js redirect to the configured sign-in page with a callbackUrl.
      return !!auth?.user;
    },
  },
  providers: [], // will be added in the full init (lib/auth/index.ts)
};
