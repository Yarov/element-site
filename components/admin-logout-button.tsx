"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  return (
    <Button
      onClick={() => signOut({ redirectTo: "/admin/login" })}
      className="border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-950"
      size="sm"
      variant="outline"
    >
      <LogOut className="size-3.5" />
      Salir
    </Button>
  );
}
