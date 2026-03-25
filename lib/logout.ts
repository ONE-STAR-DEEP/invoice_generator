"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.set("session", "", {
    httpOnly: true,
    expires: new Date(0), // expire immediately
    path: "/",
  });

  redirect("/");
}