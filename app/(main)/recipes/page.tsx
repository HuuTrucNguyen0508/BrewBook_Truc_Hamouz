"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import { RecipeService } from "@/lib/services/recipeService";
import { Recipe } from "@/types";
import SaveButton from "@/components/ui/SaveButton";
import TemperatureIcon from "@/components/ui/TemperatureIcon";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const allRecipes = await RecipeService.getAllRecipes();
      setRecipes(allRecipes);
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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <Link href="/recipes/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Recipe
            </Button>
          </Link>
        </div>
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <Link href="/recipes/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Recipe
            </Button>
          </Link>
        </div>
        <EmptyState
          title="No recipes yet"
          description="Create your first recipe to get started"
          action={{
            label: "Create Recipe",
            href: "/recipes/new"
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Link href="/recipes/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Recipe
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-4">
        {recipes.map((recipe) => (
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
                <TemperatureIcon recipe={recipe} />
                <SaveButton recipeId={recipe.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
