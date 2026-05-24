import { SignJWT, jwtVerify } from "jose";

type Role = "ADMIN" | "BOUNCER" | "INVITEE";

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

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}