import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getAuthSecret } from "./config";

export interface UserSessionPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  adminRole?: string;
  sellerSlug?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: UserSessionPayload): Promise<string> {
  const secret = getAuthSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}
