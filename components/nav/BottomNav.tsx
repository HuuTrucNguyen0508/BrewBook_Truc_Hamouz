"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User, Bot } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/" || pathname === "/main";
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <Link
          href="/main"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/main") 
              ? "text-coffee-600 dark:text-coffee-400" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        
        <Link
          href="/recipes"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/recipes") 
              ? "text-coffee-600 dark:text-coffee-400" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-xs">Recipes</span>
        </Link>
        
        <Link
          href="/saved"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/saved") 
              ? "text-coffee-600 dark:text-coffee-400" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className="w-5 h-5 mb-1" />
          <span className="text-xs">Saved</span>
        </Link>
        
        <Link
          href="/admin/ai-agent"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/admin/ai-agent") 
              ? "text-coffee-600 dark:text-coffee-400" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bot className="w-5 h-5 mb-1" />
          <span className="text-xs">AI Agent</span>
        </Link>
        
        <Link
          href="/onboarding"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/onboarding") 
              ? "text-coffee-600 dark:text-coffee-400" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
