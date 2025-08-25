"use client";
import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import { Coffee } from "lucide-react";
import { RecipeService } from "@/lib/services/recipeService";
import { Recipe } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SavedPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadSavedRecipes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSavedRecipes = async () => {
    try {
      const savedRecipes = await RecipeService.getSavedRecipes(user!.id);
      setRecipes(savedRecipes);
    } catch (err) {
      console.error("Failed to fetch saved recipes:", err);
      setError("Failed to load saved recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    try {
      await RecipeService.unsaveRecipe(recipeId, user!.id);
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    } catch (err) {
      console.error("Failed to unsave recipe:", err);
    }
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
        <EmptyState
          title="Authentication Required"
          description="Please sign in to save and view your favorite recipes"
          action={{
            label: "Sign In",
            href: "/auth"
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
        <EmptyState
          title="No saved recipes yet"
          description="Save your favorite recipes to find them quickly later"
          action={{
            label: "Browse Recipes",
            href: "/recipes"
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved Recipes</h1>
      
      <div className="grid gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="p-4 bg-card border border-border rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Link href={`/recipes/${recipe.id}`} className="block">
                  <h3 className="font-semibold text-card-foreground hover:text-coffee-600 transition-colors">
                    {recipe.title}
                  </h3>
                </Link>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{recipe.type}</span>
                  <span>•</span>
                  <span className="capitalize">{recipe.temperature}</span>
                  {recipe.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{recipe.tags.slice(0, 2).join(", ")}</span>
                      {recipe.tags.length > 2 && <span>+{recipe.tags.length - 2}</span>}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Coffee className="w-5 h-5 text-coffee-400" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnsaveRecipe(recipe.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
