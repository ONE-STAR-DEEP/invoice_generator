"use client";

import { logout } from "@/lib/logout";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="mt-4 flex gap-2 items-center text-sm text-red-500 hover:underline"
      ><LogOut className="w-4 h-4" />
        <p>
          Logout
        </p>
      </button>
    </form>
  );
}