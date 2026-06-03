import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
