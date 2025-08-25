"use client";
import { Coffee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GeneratorPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-coffee-400 to-violet-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">AI Recipe Generator</h1>
        <p className="text-muted-foreground">
          Generate creative recipe ideas using artificial intelligence
        </p>
      </div>

      <div className="p-6 bg-card border border-border rounded-lg text-center space-y-4">
        <Coffee className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-semibold">AI Features Temporarily Unavailable</h2>
        <p className="text-muted-foreground">
          Our AI recipe generator is currently being updated. In the meantime, you can create recipes manually or browse existing ones.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/recipes/new">
            <Button>
              <Coffee className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline">
              Browse Recipes
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How it works</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-card border border-border rounded-lg text-center">
            <div className="w-8 h-8 bg-coffee-100 dark:bg-coffee-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-coffee-600 dark:text-coffee-400 font-semibold">1</span>
            </div>
            <h4 className="font-medium mb-2">Describe Your Ingredients</h4>
            <p className="text-sm text-muted-foreground">
              Tell us what ingredients you have available
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg text-center">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-violet-600 dark:text-violet-400 font-semibold">2</span>
            </div>
            <h4 className="font-medium mb-2">AI Generates Ideas</h4>
            <p className="text-sm text-muted-foreground">
              Our AI creates unique recipe combinations
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg text-center">
            <div className="w-8 h-8 bg-coffee-100 dark:bg-coffee-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-coffee-600 dark:text-coffee-400 font-semibold">3</span>
            </div>
            <h4 className="font-medium mb-2">Save & Share</h4>
            <p className="text-sm text-muted-foreground">
              Save your favorite recipes and share with others
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
