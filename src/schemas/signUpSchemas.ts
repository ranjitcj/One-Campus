import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(4, "Username must be at least 4 characters long")
  .max(25, "Username must be at most 25 characters long")
  .regex(
    /^[a-zA-Z0-9_]*$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const user_role = z.string().default("student").optional();
export const signUpSchema = z.object({
  username: usernameValidation,
  role: user_role,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});
