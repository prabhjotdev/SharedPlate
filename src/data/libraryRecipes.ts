// High-protein recipe library with vegetarian and chicken options
// This data should be seeded to Firebase Firestore 'libraryRecipes' collection

export const libraryRecipes = [
  // BREAKFAST (10 recipes)
  {
    title: "Greek Yogurt Protein Bowl",
    category: "breakfast",
    ingredients: `2 cups Greek yogurt (plain, full-fat)
1/4 cup almonds, sliced
2 tbsp chia seeds
1/2 cup mixed berries
1 tbsp honey
1 tbsp peanut butter`,
    steps: `1. Add Greek yogurt to a bowl
2. Top with sliced almonds and chia seeds
3. Add fresh berries
4. Drizzle with honey and peanut butter
5. Mix gently and enjoy`
  },
  {
    title: "Scrambled Eggs with Cottage Cheese",
    category: "breakfast",
    ingredients: `4 large eggs
1/2 cup cottage cheese
2 tbsp butter
Salt and pepper to taste
Fresh chives, chopped
2 slices whole grain toast`,
    steps: `1. Whisk eggs with cottage cheese
2. Melt butter in a non-stick pan over medium-low heat
3. Add egg mixture and stir gently
4. Cook until just set, still slightly creamy
5. Season with salt and pepper
6. Top with fresh chives
7. Serve with toast`
  },
  {
    title: "Protein Pancakes",
    category: "breakfast",
    ingredients: `1 cup oats
1 scoop vanilla protein powder
1 banana, mashed
2 eggs
1/2 cup Greek yogurt
1/2 tsp baking powder
Butter for cooking`,
    steps: `1. Blend oats into flour in a blender
2. Add protein powder, banana, eggs, yogurt, and baking powder
3. Blend until smooth
4. Heat a pan with butter over medium heat
5. Pour 1/4 cup batter per pancake
6. Cook until bubbles form, flip and cook 1 more minute
7. Serve with fresh fruit or nut butter`
  },
  {
    title: "Egg White Veggie Omelette",
    category: "breakfast",
    ingredients: `6 egg whites
1/4 cup spinach, chopped
1/4 cup bell peppers, diced
2 tbsp feta cheese
1 tbsp olive oil
Salt and pepper
Fresh herbs`,
    steps: `1. Whisk egg whites with salt and pepper
2. Heat olive oil in a non-stick pan
3. Sauté vegetables until tender
4. Pour in egg whites
5. Cook until edges set
6. Add feta cheese
7. Fold omelette in half
8. Serve with fresh herbs`
  },
  {
    title: "Overnight Protein Oats",
    category: "breakfast",
    ingredients: `1 cup rolled oats
1 scoop protein powder
1 cup almond milk
2 tbsp chia seeds
1 tbsp almond butter
1/2 cup berries
Honey to taste`,
    steps: `1. Mix oats, protein powder, milk, and chia seeds
2. Stir in almond butter
3. Cover and refrigerate overnight
4. In the morning, top with berries
5. Drizzle with honey
6. Can be eaten cold or microwaved`
  },
  {
    title: "Chicken Sausage Breakfast Scramble",
    category: "breakfast",
    ingredients: `2 chicken sausage links, sliced
4 eggs, beaten
1 cup spinach
1/2 cup cherry tomatoes, halved
2 tbsp olive oil
Salt and pepper
Hot sauce (optional)`,
    steps: `1. Heat olive oil in a large skillet
2. Cook sausage slices until browned
3. Add spinach and tomatoes
4. Pour in beaten eggs
5. Scramble until eggs are cooked through
6. Season with salt, pepper
7. Add hot sauce if desired`
  },
  {
    title: "Tofu Scramble",
    category: "breakfast",
    ingredients: `1 block firm tofu, drained
1 tbsp nutritional yeast
1/2 tsp turmeric
1/4 cup bell peppers, diced
1/4 cup onion, diced
2 tbsp olive oil
Salt and pepper
Fresh spinach`,
    steps: `1. Press tofu and crumble into pieces
2. Heat olive oil in a pan
3. Sauté onions and peppers until soft
4. Add crumbled tofu
5. Sprinkle with turmeric and nutritional yeast
6. Cook for 5-7 minutes, stirring
7. Add spinach until wilted
8. Season and serve`
  },
  {
    title: "Smoked Salmon Avocado Toast",
    category: "breakfast",
    ingredients: `2 slices whole grain bread
1 ripe avocado
4 oz smoked salmon
2 tbsp cream cheese
Capers
Red onion, thinly sliced
Lemon juice
Everything bagel seasoning`,
    steps: `1. Toast bread until golden
2. Spread cream cheese on toast
3. Mash avocado with lemon juice
4. Spread avocado over cream cheese
5. Top with smoked salmon
6. Garnish with capers and red onion
7. Sprinkle with everything seasoning`
  },
  {
    title: "Peanut Butter Banana Smoothie",
    category: "breakfast",
    ingredients: `1 banana, frozen
2 tbsp peanut butter
1 scoop vanilla protein powder
1 cup almond milk
1 tbsp honey
1/2 cup Greek yogurt
Ice cubes`,
    steps: `1. Add all ingredients to blender
2. Blend until smooth and creamy
3. Add more milk if too thick
4. Pour into glass
5. Enjoy immediately`
  },
  {
    title: "Chickpea Flour Omelette",
    category: "breakfast",
    ingredients: `1/2 cup chickpea flour
1/2 cup water
1/4 tsp turmeric
1/4 tsp cumin
Salt and pepper
2 tbsp olive oil
Vegetables of choice
Fresh herbs`,
    steps: `1. Whisk chickpea flour with water until smooth
2. Add turmeric, cumin, salt, pepper
3. Let batter rest 10 minutes
4. Heat olive oil in a pan
5. Pour batter and swirl to spread
6. Add vegetables on one half
7. Cook until edges crisp
8. Fold and serve with herbs`
  },

  // LUNCH (10 recipes)
  {
    title: "Grilled Chicken Caesar Salad",
    category: "lunch",
    ingredients: `2 chicken breasts
1 head romaine lettuce, chopped
1/2 cup parmesan, shaved
1/4 cup Caesar dressing
1 cup whole grain croutons
Lemon wedges
Black pepper`,
    steps: `1. Season chicken with salt and pepper
2. Grill chicken 6-7 minutes per side
3. Let rest, then slice
4. Toss lettuce with dressing
5. Add croutons and parmesan
6. Top with sliced chicken
7. Serve with lemon wedges`
  },
  {
    title: "Quinoa Buddha Bowl",
    category: "lunch",
    ingredients: `1 cup quinoa, cooked
1 cup chickpeas, roasted
1 cup roasted sweet potato cubes
1 cup kale, massaged
1/4 cup hummus
1 avocado, sliced
Tahini dressing
Seeds for topping`,
    steps: `1. Arrange quinoa in a bowl as base
2. Add roasted chickpeas and sweet potato
3. Add massaged kale
4. Top with hummus and avocado
5. Drizzle with tahini dressing
6. Sprinkle with seeds
7. Enjoy warm or cold`
  },
  {
    title: "Chicken Lettuce Wraps",
    category: "lunch",
    ingredients: `1 lb ground chicken
1 tbsp sesame oil
3 cloves garlic, minced
1 tbsp ginger, grated
3 tbsp soy sauce
1 tbsp hoisin sauce
1 head butter lettuce
Green onions, sliced
Sriracha (optional)`,
    steps: `1. Heat sesame oil in a pan
2. Cook ground chicken until browned
3. Add garlic and ginger, cook 1 minute
4. Stir in soy sauce and hoisin
5. Cook 2-3 minutes
6. Spoon into lettuce cups
7. Top with green onions
8. Add sriracha if desired`
  },
  {
    title: "Lentil Soup",
    category: "lunch",
    ingredients: `2 cups green or brown lentils
1 onion, diced
3 carrots, diced
3 celery stalks, diced
4 cloves garlic
6 cups vegetable broth
1 can diced tomatoes
2 tsp cumin
Salt and pepper
Fresh lemon juice`,
    steps: `1. Sauté onion, carrots, celery until soft
2. Add garlic and cumin, cook 1 minute
3. Add lentils, broth, and tomatoes
4. Bring to boil, then simmer 25-30 minutes
5. Season with salt and pepper
6. Finish with fresh lemon juice
7. Serve with crusty bread`
  },
  {
    title: "Greek Chicken Pita",
    category: "lunch",
    ingredients: `2 chicken breasts, grilled and sliced
4 whole wheat pitas
1 cup cucumber, diced
1 cup cherry tomatoes, halved
1/2 red onion, sliced
1/2 cup feta cheese
1/2 cup tzatziki sauce
Fresh dill`,
    steps: `1. Warm pitas slightly
2. Spread tzatziki inside each pita
3. Add sliced grilled chicken
4. Top with cucumber, tomatoes, onion
5. Add crumbled feta
6. Garnish with fresh dill
7. Fold and enjoy`
  },
  {
    title: "Black Bean Tacos",
    category: "lunch",
    ingredients: `2 cans black beans, drained
1 tsp cumin
1 tsp chili powder
8 corn tortillas
1 cup shredded cabbage
1 avocado, sliced
Fresh cilantro
Lime wedges
Hot sauce`,
    steps: `1. Heat beans with cumin and chili powder
2. Mash slightly, keep some whole
3. Warm tortillas
4. Divide beans among tortillas
5. Top with cabbage and avocado
6. Add cilantro and lime juice
7. Add hot sauce to taste`
  },
  {
    title: "Tuna Salad Stuffed Avocado",
    category: "lunch",
    ingredients: `2 cans tuna, drained
2 tbsp Greek yogurt
1 tbsp Dijon mustard
1/4 cup celery, diced
2 tbsp red onion, minced
2 avocados, halved
Salt and pepper
Lemon juice`,
    steps: `1. Mix tuna with yogurt and mustard
2. Add celery and red onion
3. Season with salt, pepper, lemon juice
4. Halve avocados and remove pit
5. Fill each half with tuna salad
6. Serve immediately`
  },
  {
    title: "Edamame Fried Rice",
    category: "lunch",
    ingredients: `3 cups cooked brown rice, cold
1 cup edamame, shelled
3 eggs, beaten
2 tbsp soy sauce
1 tbsp sesame oil
3 green onions, sliced
1 cup mixed vegetables
Ginger, minced`,
    steps: `1. Heat sesame oil in a large pan or wok
2. Scramble eggs, set aside
3. Stir-fry vegetables and edamame
4. Add cold rice and stir-fry 3-4 minutes
5. Add soy sauce and ginger
6. Return eggs to pan
7. Top with green onions`
  },
  {
    title: "Chicken Avocado Wrap",
    category: "lunch",
    ingredients: `2 grilled chicken breasts, sliced
2 large whole wheat tortillas
1 avocado, mashed
1/2 cup Greek yogurt
1 cup spinach
1/2 cup shredded carrots
Salt, pepper, lime juice`,
    steps: `1. Mix mashed avocado with Greek yogurt
2. Season with salt, pepper, lime juice
3. Spread mixture on tortillas
4. Layer spinach and carrots
5. Add sliced chicken
6. Roll up tightly
7. Slice in half diagonally`
  },
  {
    title: "Mediterranean Chickpea Salad",
    category: "lunch",
    ingredients: `2 cans chickpeas, drained
1 cucumber, diced
1 cup cherry tomatoes, halved
1/2 red onion, diced
1/2 cup kalamata olives
1/2 cup feta cheese
3 tbsp olive oil
2 tbsp lemon juice
Fresh oregano`,
    steps: `1. Combine chickpeas, cucumber, tomatoes
2. Add onion and olives
3. Crumble in feta cheese
4. Whisk olive oil with lemon juice
5. Pour dressing over salad
6. Add fresh oregano
7. Toss and serve`
  },

  // DINNER (15 recipes)
  {
    title: "Baked Lemon Herb Chicken",
    category: "dinner",
    ingredients: `4 chicken thighs, bone-in
3 tbsp olive oil
4 cloves garlic, minced
2 lemons, juiced and zested
Fresh rosemary and thyme
Salt and pepper
1 lb baby potatoes, halved`,
    steps: `1. Preheat oven to 425°F
2. Mix olive oil, garlic, lemon, herbs
3. Season chicken with salt and pepper
4. Place chicken and potatoes in baking dish
5. Pour lemon herb mixture over
6. Bake 35-40 minutes until chicken is 165°F
7. Let rest 5 minutes before serving`
  },
  {
    title: "Grilled Chicken with Quinoa",
    category: "dinner",
    ingredients: `4 chicken breasts
1 cup quinoa
2 cups chicken broth
1 cup cherry tomatoes
1 cucumber, diced
1/4 cup feta cheese
Fresh basil
Olive oil and lemon`,
    steps: `1. Cook quinoa in broth, let cool
2. Season and grill chicken 6-7 min per side
3. Let chicken rest, then slice
4. Mix quinoa with tomatoes, cucumber
5. Add feta and basil
6. Dress with olive oil and lemon
7. Serve chicken over quinoa salad`
  },
  {
    title: "Paneer Tikka Masala",
    category: "dinner",
    ingredients: `14 oz paneer, cubed
1 cup Greek yogurt
2 tbsp tikka masala paste
1 can coconut milk
1 onion, diced
3 cloves garlic
1 inch ginger
2 cups tomato sauce
Fresh cilantro
Basmati rice for serving`,
    steps: `1. Marinate paneer in yogurt and half the spice paste
2. Sauté onion until golden
3. Add garlic, ginger, remaining paste
4. Pour in tomato sauce and coconut milk
5. Simmer 15 minutes
6. Grill or pan-fry marinated paneer
7. Add paneer to sauce
8. Serve over rice with cilantro`
  },
  {
    title: "Chicken Stir-Fry",
    category: "dinner",
    ingredients: `1.5 lbs chicken breast, sliced thin
2 cups broccoli florets
1 red bell pepper, sliced
1 cup snap peas
3 tbsp soy sauce
1 tbsp oyster sauce
2 cloves garlic
1 tbsp ginger
Sesame oil
Brown rice`,
    steps: `1. Cook rice according to package
2. Heat oil in wok over high heat
3. Stir-fry chicken until cooked, set aside
4. Stir-fry vegetables 3-4 minutes
5. Add garlic and ginger
6. Return chicken to wok
7. Add sauces, toss to coat
8. Serve over brown rice`
  },
  {
    title: "Baked Salmon with Asparagus",
    category: "dinner",
    ingredients: `4 salmon fillets
1 lb asparagus, trimmed
3 tbsp olive oil
4 cloves garlic, minced
1 lemon, sliced
Fresh dill
Salt and pepper
Honey mustard glaze`,
    steps: `1. Preheat oven to 400°F
2. Arrange salmon and asparagus on sheet pan
3. Drizzle with olive oil
4. Season with garlic, salt, pepper
5. Top salmon with lemon slices
6. Bake 15-18 minutes
7. Garnish with fresh dill
8. Drizzle with honey mustard`
  },
  {
    title: "Turkey Meatballs in Marinara",
    category: "dinner",
    ingredients: `1.5 lbs ground turkey
1/2 cup breadcrumbs
1 egg
3 cloves garlic, minced
1/4 cup parmesan
Fresh basil
2 cups marinara sauce
Whole wheat pasta
Mozzarella for topping`,
    steps: `1. Mix turkey, breadcrumbs, egg, garlic, parmesan
2. Form into golf ball-sized meatballs
3. Brown meatballs in a pan
4. Add marinara sauce
5. Simmer 20 minutes
6. Cook pasta according to package
7. Serve meatballs over pasta
8. Top with mozzarella and basil`
  },
  {
    title: "Chickpea Curry",
    category: "dinner",
    ingredients: `2 cans chickpeas, drained
1 can coconut milk
2 cups spinach
1 onion, diced
3 cloves garlic
1 tbsp curry powder
1 tsp garam masala
1 can diced tomatoes
Fresh cilantro
Naan bread`,
    steps: `1. Sauté onion until translucent
2. Add garlic and spices, cook 1 minute
3. Add tomatoes and coconut milk
4. Stir in chickpeas
5. Simmer 15-20 minutes
6. Add spinach until wilted
7. Serve with naan and cilantro`
  },
  {
    title: "Grilled Chicken Fajitas",
    category: "dinner",
    ingredients: `1.5 lbs chicken breast
3 bell peppers, sliced
2 onions, sliced
2 tbsp fajita seasoning
3 tbsp olive oil
Flour tortillas
Sour cream
Guacamole
Lime wedges`,
    steps: `1. Season chicken with fajita seasoning
2. Grill chicken until cooked through
3. Sauté peppers and onions until charred
4. Slice chicken into strips
5. Warm tortillas
6. Serve with all toppings
7. Squeeze lime over fajitas`
  },
  {
    title: "Lentil Dal",
    category: "dinner",
    ingredients: `1.5 cups red lentils
1 can coconut milk
4 cups vegetable broth
1 onion, diced
4 cloves garlic
1 tbsp ginger, grated
2 tsp cumin
1 tsp turmeric
Fresh cilantro
Rice for serving`,
    steps: `1. Sauté onion until golden
2. Add garlic, ginger, and spices
3. Add lentils and broth
4. Bring to boil, simmer 20 minutes
5. Stir in coconut milk
6. Cook 5 more minutes
7. Season to taste
8. Serve over rice with cilantro`
  },
  {
    title: "Chicken Shawarma Bowl",
    category: "dinner",
    ingredients: `1.5 lbs chicken thighs
2 tsp cumin
2 tsp paprika
1 tsp turmeric
1 tsp cinnamon
2 cups cooked rice
Pickled onions
Hummus
Cucumber-tomato salad
Tahini sauce`,
    steps: `1. Mix spices together
2. Coat chicken in spices and olive oil
3. Marinate 30 minutes or overnight
4. Grill or pan-fry chicken until done
5. Slice chicken
6. Arrange rice in bowls
7. Top with chicken and all toppings
8. Drizzle with tahini`
  },
  {
    title: "Stuffed Bell Peppers",
    category: "dinner",
    ingredients: `6 bell peppers, tops removed
1 lb ground chicken
1 cup cooked quinoa
1 can black beans
1 cup corn
1 cup salsa
1 cup shredded cheese
Cumin and chili powder
Fresh cilantro`,
    steps: `1. Preheat oven to 375°F
2. Brown ground chicken with spices
3. Mix with quinoa, beans, corn, half the salsa
4. Stuff peppers with mixture
5. Top with remaining salsa and cheese
6. Bake 30-35 minutes
7. Garnish with cilantro`
  },
  {
    title: "Tofu Stir-Fry with Peanut Sauce",
    category: "dinner",
    ingredients: `1 block extra-firm tofu, cubed
2 cups broccoli
1 red bell pepper, sliced
1 cup edamame
3 tbsp peanut butter
2 tbsp soy sauce
1 tbsp maple syrup
1 tbsp rice vinegar
Garlic and ginger
Brown rice`,
    steps: `1. Press and cube tofu
2. Pan-fry tofu until crispy
3. Stir-fry vegetables
4. Mix peanut butter, soy sauce, maple syrup, vinegar
5. Add garlic and ginger to vegetables
6. Return tofu to pan
7. Pour sauce over and toss
8. Serve over brown rice`
  },
  {
    title: "Grilled Chicken Souvlaki",
    category: "dinner",
    ingredients: `2 lbs chicken breast, cubed
1/4 cup olive oil
3 cloves garlic, minced
2 tbsp lemon juice
1 tbsp oregano
Greek salad
Tzatziki sauce
Pita bread
Lemon wedges`,
    steps: `1. Mix olive oil, garlic, lemon, oregano
2. Marinate chicken 2+ hours
3. Thread onto skewers
4. Grill 10-12 minutes, turning
5. Prepare Greek salad
6. Warm pita bread
7. Serve skewers with tzatziki and salad`
  },
  {
    title: "Black Bean Burgers",
    category: "dinner",
    ingredients: `2 cans black beans, drained
1/2 cup oats
1 egg
1/2 onion, diced
2 cloves garlic
1 tsp cumin
Salt and pepper
Burger buns
Avocado, lettuce, tomato`,
    steps: `1. Mash beans, leaving some chunks
2. Mix in oats, egg, onion, garlic, spices
3. Form into patties
4. Refrigerate 30 minutes
5. Pan-fry or grill 4-5 minutes per side
6. Toast buns
7. Assemble with toppings`
  },
  {
    title: "Teriyaki Chicken",
    category: "dinner",
    ingredients: `4 chicken thighs
1/2 cup soy sauce
1/4 cup honey
2 tbsp rice vinegar
3 cloves garlic
1 tbsp ginger
1 tbsp cornstarch
Sesame seeds
Green onions
Steamed rice and broccoli`,
    steps: `1. Mix soy sauce, honey, vinegar, garlic, ginger
2. Marinate chicken 1+ hour
3. Reserve marinade
4. Grill or bake chicken until done
5. Simmer marinade with cornstarch to thicken
6. Brush glaze on chicken
7. Top with sesame seeds and green onions
8. Serve with rice and broccoli`
  },

  // SNACKS (8 recipes)
  {
    title: "Hard Boiled Eggs with Everything Seasoning",
    category: "snacks",
    ingredients: `6 eggs
Everything bagel seasoning
Salt`,
    steps: `1. Place eggs in pot, cover with cold water
2. Bring to boil
3. Remove from heat, cover, let sit 12 minutes
4. Transfer to ice bath
5. Peel when cool
6. Cut in half
7. Sprinkle with everything seasoning and salt`
  },
  {
    title: "Cottage Cheese with Berries",
    category: "snacks",
    ingredients: `1 cup cottage cheese
1/2 cup mixed berries
1 tbsp honey
2 tbsp granola
Mint leaves`,
    steps: `1. Spoon cottage cheese into bowl
2. Top with fresh berries
3. Drizzle with honey
4. Sprinkle granola
5. Garnish with mint`
  },
  {
    title: "Spiced Roasted Chickpeas",
    category: "snacks",
    ingredients: `2 cans chickpeas, drained and dried
2 tbsp olive oil
1 tsp cumin
1 tsp paprika
1/2 tsp garlic powder
Salt`,
    steps: `1. Preheat oven to 400°F
2. Pat chickpeas very dry
3. Toss with olive oil and spices
4. Spread on baking sheet
5. Roast 30-40 minutes, shaking halfway
6. Let cool to crisp up`
  },
  {
    title: "Greek Yogurt Dip with Veggies",
    category: "snacks",
    ingredients: `1 cup Greek yogurt
1 cucumber, grated and squeezed dry
2 cloves garlic, minced
1 tbsp dill, fresh
1 tbsp lemon juice
Carrots, celery, bell peppers for dipping`,
    steps: `1. Mix yogurt with cucumber
2. Add garlic, dill, lemon juice
3. Season with salt
4. Refrigerate 30 minutes
5. Serve with cut vegetables`
  },
  {
    title: "Edamame with Sea Salt",
    category: "snacks",
    ingredients: `2 cups frozen edamame in pods
1 tbsp sesame oil
Flaky sea salt
Red pepper flakes (optional)`,
    steps: `1. Boil edamame 4-5 minutes
2. Drain well
3. Toss with sesame oil
4. Sprinkle with sea salt
5. Add red pepper flakes if desired
6. Eat warm or cold`
  },
  {
    title: "Protein Energy Balls",
    category: "snacks",
    ingredients: `1 cup oats
1/2 cup peanut butter
1/3 cup honey
1 scoop vanilla protein powder
1/4 cup mini chocolate chips
2 tbsp chia seeds`,
    steps: `1. Mix all ingredients in a bowl
2. Refrigerate 30 minutes
3. Roll into 1-inch balls
4. Store in refrigerator
5. Keeps for 1 week`
  },
  {
    title: "Turkey and Cheese Roll-Ups",
    category: "snacks",
    ingredients: `8 slices deli turkey
4 slices Swiss cheese
Hummus or mustard
Pickle spears
Spinach leaves`,
    steps: `1. Lay out turkey slices
2. Place half slice cheese on each
3. Spread with hummus or mustard
4. Add spinach leaves
5. Place pickle spear at edge
6. Roll up tightly
7. Secure with toothpick if needed`
  },
  {
    title: "Almond Butter Apple Slices",
    category: "snacks",
    ingredients: `2 apples, sliced
4 tbsp almond butter
2 tbsp granola
1 tbsp honey
Cinnamon`,
    steps: `1. Core and slice apples
2. Spread almond butter on slices
3. Sprinkle with granola
4. Drizzle with honey
5. Dust with cinnamon`
  },

  // VEGETARIAN (8 recipes)
  {
    title: "Spinach and Ricotta Stuffed Shells",
    category: "vegetarian",
    ingredients: `20 jumbo pasta shells
2 cups ricotta cheese
2 cups spinach, chopped
1 egg
1 cup mozzarella, shredded
2 cups marinara sauce
Parmesan cheese
Fresh basil`,
    steps: `1. Cook shells al dente, drain
2. Preheat oven to 375°F
3. Mix ricotta, spinach, egg, half mozzarella
4. Spread marinara in baking dish
5. Fill shells with ricotta mixture
6. Arrange in dish
7. Top with remaining sauce and cheese
8. Bake 25-30 minutes`
  },
  {
    title: "Caprese Quinoa Salad",
    category: "vegetarian",
    ingredients: `2 cups cooked quinoa
2 cups cherry tomatoes, halved
8 oz fresh mozzarella, cubed
1/2 cup fresh basil, torn
3 tbsp olive oil
2 tbsp balsamic glaze
Salt and pepper`,
    steps: `1. Cook quinoa and let cool
2. Add tomatoes and mozzarella
3. Tear in fresh basil
4. Drizzle with olive oil
5. Season with salt and pepper
6. Drizzle balsamic glaze on top
7. Serve at room temperature`
  },
  {
    title: "Vegetable Pad Thai",
    category: "vegetarian",
    ingredients: `8 oz rice noodles
2 eggs, beaten
1 cup tofu, cubed
2 cups bean sprouts
1/2 cup peanuts, crushed
4 tbsp soy sauce
2 tbsp tamarind paste
1 tbsp brown sugar
Lime wedges
Green onions`,
    steps: `1. Soak noodles in hot water until soft
2. Press and cube tofu, pan-fry until crispy
3. Scramble eggs, set aside
4. Mix soy sauce, tamarind, sugar
5. Stir-fry noodles with sauce
6. Add tofu, eggs, bean sprouts
7. Top with peanuts and green onions
8. Serve with lime wedges`
  },
  {
    title: "Eggplant Parmesan",
    category: "vegetarian",
    ingredients: `2 large eggplants, sliced
2 cups breadcrumbs
1 cup parmesan, grated
2 eggs, beaten
3 cups marinara sauce
2 cups mozzarella, shredded
Fresh basil
Salt`,
    steps: `1. Salt eggplant slices, let sit 30 minutes
2. Pat dry
3. Dip in egg, then breadcrumbs with parmesan
4. Bake at 400°F for 20 minutes per side
5. Layer in dish: sauce, eggplant, cheese
6. Repeat layers
7. Bake 25 minutes until bubbly
8. Garnish with basil`
  },
  {
    title: "Greek Feta Bake",
    category: "vegetarian",
    ingredients: `1 block feta cheese
2 cups cherry tomatoes
4 cloves garlic
1/4 cup olive oil
1 tsp oregano
Red pepper flakes
Fresh basil
Crusty bread`,
    steps: `1. Preheat oven to 400°F
2. Place feta in center of baking dish
3. Surround with tomatoes and garlic
4. Drizzle with olive oil
5. Sprinkle oregano and pepper flakes
6. Bake 25-30 minutes
7. Mash together
8. Serve with crusty bread`
  },
  {
    title: "Mushroom and White Bean Soup",
    category: "vegetarian",
    ingredients: `1 lb mixed mushrooms, sliced
2 cans cannellini beans
4 cups vegetable broth
1 onion, diced
4 cloves garlic
1 cup heavy cream
Fresh thyme
Salt and pepper
Crusty bread`,
    steps: `1. Sauté mushrooms until golden
2. Add onion and garlic
3. Pour in broth
4. Add beans and thyme
5. Simmer 20 minutes
6. Blend half, return to pot
7. Stir in cream
8. Season and serve with bread`
  },
  {
    title: "Tempeh Tacos",
    category: "vegetarian",
    ingredients: `1 package tempeh, crumbled
2 tbsp soy sauce
1 tbsp maple syrup
1 tsp smoked paprika
1 tsp cumin
Corn tortillas
Cabbage slaw
Avocado crema
Lime`,
    steps: `1. Crumble tempeh into small pieces
2. Marinate with soy sauce, maple syrup, spices
3. Pan-fry until crispy
4. Warm tortillas
5. Fill with tempeh
6. Top with slaw and crema
7. Squeeze lime over top`
  },
  {
    title: "Palak Paneer",
    category: "vegetarian",
    ingredients: `14 oz paneer, cubed
4 cups spinach
1 onion, diced
3 cloves garlic
1 inch ginger
2 tomatoes, pureed
1/2 cup cream
Garam masala
Cumin seeds
Basmati rice`,
    steps: `1. Blanch spinach, blend to puree
2. Fry paneer until golden, set aside
3. Toast cumin seeds in oil
4. Sauté onion, garlic, ginger
5. Add tomato puree, cook 5 minutes
6. Add spinach puree and spices
7. Stir in cream and paneer
8. Serve over rice`
  },

  // QUICK MEALS (9 recipes)
  {
    title: "15-Minute Chicken Quesadillas",
    category: "quick-meals",
    ingredients: `2 cups rotisserie chicken, shredded
4 large flour tortillas
2 cups Mexican blend cheese
1/2 cup salsa
Sour cream
Guacamole
Hot sauce`,
    steps: `1. Heat large pan over medium heat
2. Place tortilla in pan
3. Add cheese and chicken to half
4. Fold tortilla over
5. Cook 2-3 minutes per side
6. Cut into wedges
7. Serve with salsa, sour cream, guacamole`
  },
  {
    title: "Greek Salad with Grilled Chicken",
    category: "quick-meals",
    ingredients: `2 pre-cooked chicken breasts
1 cucumber, chopped
2 cups cherry tomatoes
1/2 red onion, sliced
1/2 cup kalamata olives
1/2 cup feta cheese
Greek dressing
Pita chips`,
    steps: `1. Slice pre-cooked chicken
2. Chop vegetables
3. Combine in large bowl
4. Add olives and feta
5. Toss with Greek dressing
6. Serve with pita chips`
  },
  {
    title: "5-Minute Egg Fried Rice",
    category: "quick-meals",
    ingredients: `3 cups leftover rice, cold
3 eggs, beaten
1 cup frozen peas and carrots
3 tbsp soy sauce
2 tbsp sesame oil
3 green onions, sliced
Garlic powder`,
    steps: `1. Heat oil in wok over high heat
2. Add vegetables, cook 1 minute
3. Push aside, scramble eggs
4. Add cold rice, stir-fry 2 minutes
5. Add soy sauce and garlic powder
6. Toss everything together
7. Top with green onions`
  },
  {
    title: "Tuna Melt",
    category: "quick-meals",
    ingredients: `2 cans tuna, drained
3 tbsp mayonnaise
4 slices sourdough bread
4 slices cheddar cheese
Butter
Pickles`,
    steps: `1. Mix tuna with mayo
2. Butter bread slices on one side
3. Place cheese on unbuttered side
4. Add tuna mixture
5. Top with second slice, butter side out
6. Grill in pan until golden
7. Flip and cook other side
8. Serve with pickles`
  },
  {
    title: "Chickpea Salad Sandwich",
    category: "quick-meals",
    ingredients: `1 can chickpeas, drained
2 tbsp Greek yogurt
1 tbsp Dijon mustard
1/4 cup celery, diced
2 tbsp red onion, diced
Lettuce
4 slices whole grain bread`,
    steps: `1. Mash chickpeas with fork
2. Mix in yogurt and mustard
3. Add celery and onion
4. Season with salt and pepper
5. Toast bread if desired
6. Add lettuce
7. Spread chickpea mixture on bread`
  },
  {
    title: "Caprese Chicken",
    category: "quick-meals",
    ingredients: `4 thin chicken cutlets
4 slices fresh mozzarella
4 slices tomato
Fresh basil
Balsamic glaze
2 tbsp olive oil
Salt and pepper`,
    steps: `1. Season chicken with salt and pepper
2. Heat oil in pan over medium-high
3. Cook chicken 4 minutes per side
4. Top each with tomato and mozzarella
5. Cover to melt cheese
6. Add fresh basil
7. Drizzle with balsamic glaze`
  },
  {
    title: "Quick Shrimp Tacos",
    category: "quick-meals",
    ingredients: `1 lb shrimp, peeled and deveined
2 tsp taco seasoning
8 small corn tortillas
1 cup cabbage slaw
1/2 cup chipotle mayo
Lime wedges
Fresh cilantro`,
    steps: `1. Toss shrimp with taco seasoning
2. Cook shrimp 2-3 minutes per side
3. Warm tortillas
4. Divide shrimp among tortillas
5. Top with cabbage slaw
6. Drizzle with chipotle mayo
7. Add cilantro and lime`
  },
  {
    title: "Protein Power Bowl",
    category: "quick-meals",
    ingredients: `1 packet pre-cooked quinoa
1 can black beans, drained
1 avocado, sliced
2 hard-boiled eggs
1/2 cup corn
Cherry tomatoes
Lime-cilantro dressing`,
    steps: `1. Heat quinoa according to package
2. Add beans to warm through
3. Divide into bowls
4. Top with avocado and eggs
5. Add corn and tomatoes
6. Drizzle with dressing`
  },
  {
    title: "Cottage Cheese Veggie Bowl",
    category: "quick-meals",
    ingredients: `2 cups cottage cheese
1 cucumber, diced
1 cup cherry tomatoes, halved
1/4 cup red onion, diced
2 tbsp olive oil
Everything bagel seasoning
Fresh dill`,
    steps: `1. Divide cottage cheese into bowls
2. Top with cucumber and tomatoes
3. Add red onion
4. Drizzle with olive oil
5. Sprinkle everything seasoning
6. Garnish with fresh dill`
  }
];

export default libraryRecipes;
