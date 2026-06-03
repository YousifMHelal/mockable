import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { signInSchema } from "@/lib/validation/auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        // Return null identically for unknown email and bad password so the
        // sign-in flow cannot be used to enumerate registered accounts.
        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});
