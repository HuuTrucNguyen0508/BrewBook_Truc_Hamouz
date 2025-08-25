"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import RecipeForm from "@/components/forms/RecipeForm";
import EmptyState from "@/components/shared/EmptyState";

export default function NewRecipePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Create New Recipe</h1>
        <EmptyState
          title="Authentication Required"
          description="Please sign in to create and share your recipes"
          action={{
            label: "Sign In",
            href: "/auth"
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Recipe</h1>
        <p className="text-muted-foreground">Share your favorite coffee and specialty drink recipes with the community</p>
      </div>
      
      <RecipeForm mode="create" />
    </div>
  );
}
