"use client";
import { useEffect, useState } from "react";
import DrinkOfTheDayCard from "@/components/cards/DrinkOfTheDayCard";
import EmptyState from "@/components/shared/EmptyState";
import { Coffee, Heart } from "lucide-react";
import { RecipeService } from "@/lib/services/recipeService";
import { Recipe } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import SaveButton from "@/components/ui/SaveButton";

export default function HomePage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const allRecipes = await RecipeService.getAllRecipes();
      setRecipes(allRecipes);
      
      if (user) {
        const saved = await RecipeService.getSavedRecipes(user.id);
        setSavedRecipes(saved);
      }
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      setError("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Discover</h1>
        <p className="text-muted-foreground">
          {user ? `Welcome back! Find amazing coffee and specialty drink recipes` : "Find amazing coffee and specialty drink recipes"}
        </p>
      </div>

      <DrinkOfTheDayCard />

      {/* Saved Recipes Section - Only for authenticated users */}
      {user && savedRecipes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Your Saved Recipes
          </h2>
          <div className="grid gap-4">
            {savedRecipes.slice(0, 3).map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <Link href={`/recipes/${recipe.id}`} className="flex-1">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-card-foreground hover:text-coffee-600 transition-colors">
                        {recipe.title}
                      </h3>
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
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Coffee className="w-5 h-5 text-coffee-400" />
                    <SaveButton recipeId={recipe.id} />
                  </div>
                </div>
              </div>
            ))}
            {savedRecipes.length > 3 && (
              <div className="text-center">
                <Link href="/saved">
                  <span className="text-sm text-coffee-600 hover:text-coffee-800 dark:text-coffee-400 dark:hover:text-coffee-200">
                    View all {savedRecipes.length} saved recipes →
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Recipes</h2>
        
        {error ? (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive">{error}</p>
          </div>
        ) : recipes.length === 0 ? (
          <EmptyState
            title="No recipes yet"
            description="Be the first to create a recipe and share it with the community!"
            action={{
              label: "Create Recipe",
              href: "/recipes/new"
            }}
          />
        ) : (
          <div className="grid gap-4">
            {recipes.slice(0, 6).map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <Link href={`/recipes/${recipe.id}`} className="flex-1">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-card-foreground hover:text-coffee-600 transition-colors">
                        {recipe.title}
                      </h3>
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
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Coffee className="w-5 h-5 text-coffee-400" />
                    <SaveButton recipeId={recipe.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
