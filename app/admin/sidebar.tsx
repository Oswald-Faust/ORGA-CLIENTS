"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, LogOut, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/admin/overview" },
  { icon: Users, label: "Clients", href: "/admin/clients" }, 
  { icon: TrendingUp, label: "Statistiques", href: "/admin/stats" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-white/10 bg-black flex flex-col h-screen shrink-0">
      <div className="p-6">
        <div className="text-xl font-bold tracking-tighter text-white">ORGA<span className="text-zinc-500">MASTER</span></div>
      </div>
      
      <div className="flex-1 px-4 space-y-2">
        <div className="text-xs font-semibold text-zinc-500 mb-4 px-2 tracking-wider uppercase">Menu Principal</div>
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href} className="block">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  isActive 
                    ? "bg-white/10 text-white hover:bg-white/15" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/10"
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            <LogOut className="h-4 w-4" />
            Déconnexion
        </Button>
      </div>
    </div>
  );
}
