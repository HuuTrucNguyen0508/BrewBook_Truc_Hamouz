"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { RecipeService } from "@/lib/services/recipeService";

interface SaveButtonProps {
  recipeId: string;
  className?: string;
}

export default function SaveButton({ recipeId, className }: SaveButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSavedStatus();
    }
  }, [user, recipeId]);

  const checkSavedStatus = async () => {
    try {
      const saved = await RecipeService.isRecipeSaved(recipeId, user!.id);
      setIsSaved(saved);
    } catch (err) {
      console.error("Failed to check saved status:", err);
    }
  };

  const handleToggleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isSaved) {
        await RecipeService.unsaveRecipe(recipeId, user.id);
        setIsSaved(false);
      } else {
        await RecipeService.saveRecipe(recipeId, user.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleSave}
      disabled={loading}
      className={`${className} ${
        isSaved 
          ? "text-red-500 hover:text-red-600" 
          : "text-muted-foreground hover:text-red-500"
      }`}
    >
      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
    </Button>
  );
}
