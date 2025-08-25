"use client";

import { Coffee, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DrinkOfTheDayCard() {
  // Static drink of the day since OpenAI is disabled
  const drinkOfTheDay = {
    title: "Velvety Ube Latte",
    description: "A creamy, purple-hued latte made with ube (purple yam) and steamed milk",
    type: "ube",
    temperature: "hot",
    tags: ["ube", "latte", "creamy", "purple"]
  };

  return (
    <div className="p-6 bg-gradient-to-br from-coffee-50 to-violet-50 dark:from-coffee-950/50 dark:to-violet-950/50 border border-coffee-200 dark:border-coffee-800 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-coffee-600 dark:text-coffee-400" />
          <span className="text-sm font-medium text-coffee-700 dark:text-coffee-300">
            Drink of the Day
          </span>
        </div>
        <Coffee className="w-6 h-6 text-coffee-500" />
      </div>
      
      <h3 className="text-xl font-bold text-coffee-900 dark:text-coffee-100 mb-2">
        {drinkOfTheDay.title}
      </h3>
      
      <p className="text-coffee-700 dark:text-coffee-300 mb-4 line-clamp-2">
        {drinkOfTheDay.description}
      </p>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 bg-coffee-100 dark:bg-coffee-900 text-coffee-700 dark:text-coffee-300 text-xs rounded-full capitalize">
          {drinkOfTheDay.type}
        </span>
        <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs rounded-full capitalize">
          {drinkOfTheDay.temperature}
        </span>
        {drinkOfTheDay.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="px-2 py-1 bg-white/50 dark:bg-black/20 text-coffee-600 dark:text-coffee-400 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Link href="/recipes/new" className="flex-1">
          <Button className="w-full bg-coffee-600 hover:bg-coffee-700 text-white">
            <Coffee className="w-4 h-4 mr-2" />
            Create Recipe
          </Button>
        </Link>
        <Link href="/generator" className="flex-1">
          <Button variant="outline" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Get Inspired
          </Button>
        </Link>
      </div>
    </div>
  );
}
