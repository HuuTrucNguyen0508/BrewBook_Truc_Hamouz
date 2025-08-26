import { Thermometer, Snowflake } from "lucide-react";
import { Recipe } from "@/types";

interface TemperatureIconProps {
  recipe: Recipe;
  className?: string;
}

export default function TemperatureIcon({ recipe, className = "w-5 h-5" }: TemperatureIconProps) {
  if (recipe.temperature === "iced") {
    return <Snowflake className={`${className} text-blue-400`} />;
  }
  
  return <Thermometer className={`${className} text-red-400`} />;
}
