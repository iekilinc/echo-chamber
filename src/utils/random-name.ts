import { randomBytes } from "crypto";
import { usernameMax } from "./schemas";

export const generateRandomUsername = () => {
  // Each byte is represented with two hexadecimal values
  // Thus, to get the maximum username length, we divide it by 2
  const byteCount = Math.floor(usernameMax / 2);
  const buffer = randomBytes(byteCount);
  const username = buffer.toString("hex");

  return username;
};
