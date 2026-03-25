import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export async function getCurrentUserSafe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      issuer: "thaverTechInvoiceGenerator",
    });

    if (typeof decoded === "string") return null;

    return decoded;
  } catch {
    return null;
  }
}