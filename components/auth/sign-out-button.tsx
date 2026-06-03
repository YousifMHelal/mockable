"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() =>
        signOut({
          redirectTo: "/sign-in",
        })
      }
      className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-pill hover:bg-gray-300 transition-colors"
    >
      Sign out
    </button>
  );
}
