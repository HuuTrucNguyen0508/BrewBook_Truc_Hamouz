"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Coffee, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeService } from "@/lib/services/recipeService";
import { Recipe } from "@/types";
import SaveButton from "@/components/ui/SaveButton";
import { useAuth } from "@/contexts/AuthContext";
import TemperatureIcon from "@/components/ui/TemperatureIcon";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default function RecipePage({ params }: RecipePageProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadRecipe();
  }, []);

  const loadRecipe = async () => {
    try {
      const { id } = await params;
      const recipeData = await RecipeService.getRecipeById(id);
      setRecipe(recipeData);
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
      notFound();
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

  if (!recipe) {
    notFound();
  }

  const canEdit = user && (user.id === recipe.author_id || !recipe.author_id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-lg text-muted-foreground">{recipe.description}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="capitalize bg-secondary px-2 py-1 rounded-full">
              {recipe.type}
            </span>
            <span className="capitalize bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
              <TemperatureIcon recipe={recipe} className="w-3 h-3" />
              {recipe.temperature}
            </span>
            {recipe.tags.map((tag) => (
              <span key={tag} className="bg-secondary px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <SaveButton recipeId={recipe.id} />
          {canEdit && (
            <>
              <Button variant="outline" size="icon">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Coffee className="w-5 h-5 text-coffee-400" />
            Ingredients
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-2 h-2 bg-coffee-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-foreground">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Instructions</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.image_url && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Photo</h2>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {recipe.video_url && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Video</h2>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              src={recipe.video_url}
              controls
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
