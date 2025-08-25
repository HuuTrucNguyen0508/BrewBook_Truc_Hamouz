-- Sample data for development
-- Run this in your Supabase SQL editor after creating the tables

-- Insert sample recipes
INSERT INTO recipes (id, title, description, tags, type, temperature, ingredients, steps, author_id, created_at) VALUES
(
  '1',
  'Classic Cappuccino',
  'A perfect balance of espresso, steamed milk, and milk foam',
  ARRAY['espresso', 'milk', 'foam'],
  'coffee',
  'hot',
  ARRAY['2 shots espresso', '4 oz whole milk'],
  ARRAY['Pull 2 shots of espresso', 'Steam milk to 150°F', 'Pour steamed milk over espresso', 'Top with milk foam'],
  NULL,
  NOW()
),
(
  '2',
  'Iced Matcha Latte',
  'Refreshing green tea latte perfect for hot days',
  ARRAY['matcha', 'milk', 'sweet'],
  'matcha',
  'iced',
  ARRAY['2 tsp matcha powder', '1 tbsp honey', '1 cup milk', 'Ice cubes'],
  ARRAY['Whisk matcha powder with hot water', 'Add honey and stir', 'Fill glass with ice', 'Pour milk over ice', 'Slowly pour matcha mixture'],
  NULL,
  NOW()
),
(
  '3',
  'Ube Latte',
  'Vibrant purple yam latte with coconut milk',
  ARRAY['ube', 'coconut', 'sweet'],
  'ube',
  'hot',
  ARRAY['2 tbsp ube powder', '1 cup coconut milk', '2 tbsp maple syrup', '1/4 tsp vanilla'],
  ARRAY['Heat coconut milk in saucepan', 'Whisk in ube powder', 'Add maple syrup and vanilla', 'Stir until smooth and hot'],
  NULL,
  NOW()
),
(
  '4',
  'Chai Tea Latte',
  'Spiced black tea with steamed milk',
  ARRAY['tea', 'spices', 'milk'],
  'tea',
  'hot',
  ARRAY['2 chai tea bags', '1 cup water', '1 cup milk', '2 tbsp honey'],
  ARRAY['Steep tea bags in hot water for 5 minutes', 'Remove tea bags', 'Steam milk to 150°F', 'Combine tea and milk', 'Stir in honey'],
  NULL,
  NOW()
);

-- Insert some saved recipes (if you have users)
-- INSERT INTO saved_recipes (user_id, recipe_id) VALUES
-- ('user-uuid-here', '1'),
-- ('user-uuid-here', '3');
