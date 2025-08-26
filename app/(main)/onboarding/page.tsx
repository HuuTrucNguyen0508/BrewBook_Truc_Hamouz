"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signInWithProvider } from "@/lib/auth";
import BottomNav from "@/components/nav/BottomNav";

const PREFS = ["Coffee","Matcha","Ube","Seasonal"] as const;

export default function Onboarding() {
  const [prefs, setPrefs] = useState<string[]>([]);
  
  const toggle = (p: string) => setPrefs((s) => 
    s.includes(p) ? s.filter(x=>x!==p) : [...s, p]
  );
  
  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Welcome to BrewBook ☕</h1>
      <p className="text-sm text-neutral-400">Pick your vibe to personalize your feed.</p>
      
      <div className="grid grid-cols-2 gap-2">
        {PREFS.map((p)=> (
          <Button 
            key={p} 
            variant={prefs.includes(p) ? "default" : "secondary"} 
            className="rounded-2xl" 
            onClick={()=>toggle(p)}
          >
            {p}
          </Button>
        ))}
      </div>
      
      <div className="space-y-2">
        <Button 
          className="w-full" 
          onClick={async()=> { 
            window.location.href = await signInWithProvider("google"); 
          }}
        >
          Continue with Google
        </Button>
        <Button 
          className="w-full" 
          variant="secondary" 
          onClick={async()=> { 
            window.location.href = await signInWithProvider("apple"); 
          }}
        >
          Continue with Apple
        </Button>
        <Button 
          className="w-full" 
          variant="ghost" 
          onClick={()=> window.location.href = "/main"}
        >
          Continue as Guest
        </Button>
      </div>
      
      <BottomNav />
    </div>
  );
}
