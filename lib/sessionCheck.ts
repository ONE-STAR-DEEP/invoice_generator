import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { SessionUser } from "./types/dataTypes";

export async function getCurrentUserSafe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      issuer: "thaverTechInvoiceGenerator",
    });

    if (typeof decoded === "string") return null;

    if (!decoded.id || !decoded.role) return null;
    
    return {
      id: Number(decoded.id),
      role: decoded.role as SessionUser["role"],
      iss: decoded.iss
    };
  } catch {
    return null;
  }
}