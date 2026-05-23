import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
type Role = "ADMIN" | "BOUNCER" | "INVITEE";

const COOKIE_NAME = "eyf_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  memberId?: string | null;
}

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(s);
}

// Hash a password before saving to DB
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

// Compare plain password to stored hash during login
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Create a signed JWT token containing user info
export async function createToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

// Decode and verify a JWT token
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Save session as an HTTP-only cookie (JS on page cannot read it)
export async function setSessionCookie(payload: SessionPayload) {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Delete the session cookie on logout
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Read and decode session from cookie — use in Server Components & API routes
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const isAdmin = (s: SessionPayload | null) => s?.role === "ADMIN";
export const isBouncer = (s: SessionPayload | null) => s?.role === "BOUNCER";
export const isAdminOrBouncer = (s: SessionPayload | null) =>
  s?.role === "ADMIN" || s?.role === "BOUNCER";