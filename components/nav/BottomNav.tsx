"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Heart, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/recipes", icon: BookOpen, label: "Recipes" },
  { href: "/generator", icon: Plus, label: "Generator" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Add saved tab only for authenticated users
  const allNavItems = user ? [...navItems, { href: "/saved", icon: Heart, label: "Saved" }] : navItems;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2">
      <div className="max-w-md mx-auto flex justify-around">
        {allNavItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? "text-coffee-400 bg-coffee-900/20 dark:bg-coffee-800/20" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
