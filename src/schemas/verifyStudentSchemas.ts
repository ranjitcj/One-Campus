import { z } from "zod";

export const verifyStudentSchema = z.object({
  rollno: z
    .string()
    .min(1, "Roll number is required")
});
