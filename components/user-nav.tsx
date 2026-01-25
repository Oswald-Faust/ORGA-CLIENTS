"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function UserNav({ email, name }: { email: string, name?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block text-right">
        <div className="text-sm font-medium text-white">{name}</div>
        <div className="text-xs text-zinc-500">{email}</div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-zinc-400 hover:text-white hover:bg-white/10"
        title="Se déconnecter"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
