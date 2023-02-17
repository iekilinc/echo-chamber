import { z } from "zod";

export const idSchema = z.string().cuid();

const bodyMaxLength = 270;
export const postBodySchema = z
  .string()
  .trim()
  .min(1, { message: `Post body may not be empty` })
  .max(bodyMaxLength, {
    message: `Post body may not exceed ${bodyMaxLength} characters`,
  });
