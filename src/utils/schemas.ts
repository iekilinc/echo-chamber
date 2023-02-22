import { z } from "zod";

export const idSchema = z.string().cuid();

export const bodyMinLength = 1;
export const bodyMaxLength = 270;
export const postBodySchema = z
  .string()
  .trim()
  .min(1, { message: `Post body may not be empty` })
  .max(bodyMaxLength, {
    message: `Post body may not exceed ${bodyMaxLength} characters`,
  });

export const postSortSchema = z.enum(["NEWEST", "OLDEST"]);

export const usernameMin = 1;
export const usernameMax = 20;
export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_]*$/, {
    message:
      "Username may only consist of alphanumeric characters (a-z, A-Z, 0-9) and underscores (_)",
  })
  .min(usernameMin, {
    message: `Username must be at least ${usernameMin} charcters long`,
  })
  .max(usernameMax, {
    message: `Username may not exceed ${usernameMax} characters`,
  });
