import { redirect } from "next/navigation";
import { auth } from "./index";

export async function requireAuth() {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}
