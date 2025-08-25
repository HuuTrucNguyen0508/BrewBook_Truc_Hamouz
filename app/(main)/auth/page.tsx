"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-coffee-50 to-violet-50 dark:from-coffee-950 dark:to-violet-950">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Coffee className="w-8 h-8 text-coffee-600 dark:text-coffee-400" />
            <h1 className="text-3xl font-bold text-coffee-900 dark:text-coffee-100">
              BrewBook
            </h1>
          </div>
          <p className="text-coffee-700 dark:text-coffee-300">
            {mode === "login" 
              ? "Welcome back! Sign in to your account" 
              : "Join BrewBook and start sharing your recipes"
            }
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm mode={mode} onSuccess={handleAuthSuccess} />

        {/* Mode Toggle */}
        <div className="text-center">
          <p className="text-sm text-coffee-600 dark:text-coffee-400">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button
            variant="link"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-coffee-700 dark:text-coffee-300 hover:text-coffee-900 dark:hover:text-coffee-100"
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
