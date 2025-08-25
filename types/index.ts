export type Recipe = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  type: "coffee"|"matcha"|"ube"|"tea";
  temperature: "hot"|"iced";
  ingredients: string[];
  steps: string[];
  image_url?: string;
  video_url?: string;
  author_id?: string | null;
  created_at?: string;
};
