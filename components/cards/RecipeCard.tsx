"use client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/types";
import SaveButton from "@/components/ui/SaveButton";
import TemperatureIcon from "@/components/ui/TemperatureIcon";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden bg-card border-border hover:border-coffee-300 transition-colors group">
      <Link href={`/recipes/${recipe.id}`} className="block">
        {recipe.image_url && (
          <div className="aspect-square overflow-hidden">
            <img 
              src={recipe.image_url} 
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        
        <div className="p-3">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-card-foreground group-hover:text-coffee-600 transition-colors">
            {recipe.title}
          </h3>
          
          <div className="flex gap-1 mb-2">
            <Badge variant="secondary" className="text-xs">
              {recipe.type}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <TemperatureIcon recipe={recipe} className="w-3 h-3" />
              {recipe.temperature}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {recipe.description || `${recipe.ingredients.length} ingredients`}
          </p>
        </div>
      </Link>
      
      <div className="absolute top-2 right-2">
        <SaveButton recipeId={recipe.id} />
      </div>
    </Card>
  );
}
