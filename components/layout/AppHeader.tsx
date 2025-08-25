"use client";
import { Coffee, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function AppHeader() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Coffee className="w-6 h-6 text-coffee-400" />
        <h1 className="text-xl font-bold">BrewBook</h1>
      </Link>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-coffee-100 dark:bg-coffee-800 rounded-full">
              <User className="w-4 h-4 text-coffee-600 dark:text-coffee-400" />
              <span className="text-sm font-medium text-coffee-700 dark:text-coffee-300">
                {user.email?.split('@')[0]}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-coffee-600 hover:text-coffee-800 dark:text-coffee-400 dark:hover:text-coffee-200"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Link href="/auth">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
