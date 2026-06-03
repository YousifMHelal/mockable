"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation/auth";
import { hashPassword } from "./password";
import { signIn } from "./index";

export async function signUpAction(formData: FormData) {
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
    return { errors };
  }

  const { name, email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: { name, email, passwordHash },
    });
  } catch (err) {
    // Unique constraint violation: the email is already registered. Relying on
    // the DB constraint (rather than a separate findUnique) closes the
    // check-then-create race between concurrent sign-ups.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        errors: { email: "An account with this email already exists." },
      };
    }

    console.error("[signUpAction]", err);
    return {
      errors: { form: "An error occurred. Please try again." },
    };
  }

  // signIn throws a NEXT_REDIRECT to /dashboard on success — it MUST run
  // outside the try/catch above so the redirect is not swallowed.
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}
