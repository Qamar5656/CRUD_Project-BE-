import crypto from "crypto";

export default function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}
