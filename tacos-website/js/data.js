/**
 * TACOS Restaurant — Menu Data
 * Update prices and items from the staff app via Firebase.
 * Local data is used as a fallback when Firebase is unavailable.
 */

const MENU_DATA = {

  categories: [
    { id: 'tacos',       name: 'Tacos',        emoji: '🌮' },
    { id: 'burritos',    name: 'Burritos',     emoji: '🌯' },
    { id: 'quesadillas', name: 'Quesadillas',  emoji: '🫓' },
    { id: 'sides',       name: 'Sides',        emoji: '🍟' },
    { id: 'drinks',      name: 'Drinks',       emoji: '🥤' },
    { id: 'desserts',    name: 'Desserts',     emoji: '🍮' },
  ],

  items: [

    // ─── TACOS ──────────────────────────────────────────────────────────────

    {
      id: 'classic-beef-taco',
      category: 'tacos',
      name: 'Classic Beef Taco',
      description: 'Seasoned ground beef, shredded lettuce, diced tomato, cheddar cheese, and sour cream in a crispy corn shell.',
      price: 180,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=700&q=80',
      popular: true,
      ingredients: ['Corn tortilla', 'Seasoned beef', 'Shredded lettuce', 'Diced tomato', 'Cheddar cheese', 'Sour cream'],
      customizations: [
        { id: 'extra-cheese',     label: 'Extra Cheese',      price: 30,  type: 'add'    },
        { id: 'extra-meat',       label: 'Extra Beef',        price: 50,  type: 'add'    },
        { id: 'add-jalapenos',    label: 'Add Jalapeños',     price: 20,  type: 'add'    },
        { id: 'extra-sour-cream', label: 'Extra Sour Cream',  price: 20,  type: 'add'    },
        { id: 'add-guacamole',    label: 'Add Guacamole',     price: 40,  type: 'add'    },
        { id: 'no-lettuce',       label: 'No Lettuce',        price: 0,   type: 'remove' },
        { id: 'no-tomato',        label: 'No Tomato',         price: 0,   type: 'remove' },
        { id: 'no-cheese',        label: 'No Cheese',         price: 0,   type: 'remove' },
        { id: 'no-sour-cream',    label: 'No Sour Cream',     price: 0,   type: 'remove' },
      ]
    },

    {
      id: 'grilled-chicken-taco',
      category: 'tacos',
      name: 'Grilled Chicken Taco',
      description: 'Juicy marinated chicken, fresh pico de gallo, cilantro, lime, and smoky chipotle sauce on a warm flour tortilla.',
      price: 200,
      image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=700&q=80',
      popular: true,
      ingredients: ['Flour tortilla', 'Grilled chicken', 'Pico de gallo', 'Fresh cilantro', 'Lime', 'Chipotle sauce'],
      customizations: [
        { id: 'extra-chicken',  label: 'Extra Chicken',          price: 60, type: 'add'    },
        { id: 'add-cheese',     label: 'Add Cheese',             price: 30, type: 'add'    },
        { id: 'extra-sauce',    label: 'Extra Chipotle Sauce',   price: 15, type: 'add'    },
        { id: 'add-jalapenos',  label: 'Add Jalapeños',          price: 20, type: 'add'    },
        { id: 'add-guacamole',  label: 'Add Guacamole',          price: 40, type: 'add'    },
        { id: 'no-cilantro',    label: 'No Cilantro',            price: 0,  type: 'remove' },
        { id: 'no-pico',        label: 'No Pico de Gallo',       price: 0,  type: 'remove' },
        { id: 'no-sauce',       label: 'No Chipotle Sauce',      price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'al-pastor-taco',
      category: 'tacos',
      name: 'Al Pastor Taco',
      description: 'Slow-roasted marinated pork with grilled pineapple, white onion, cilantro, and house salsa verde on a corn tortilla.',
      price: 220,
      image: 'https://images.unsplash.com/photo-1611250188496-e966043a0629?w=700&q=80',
      popular: false,
      ingredients: ['Corn tortilla', 'Marinated pork', 'Grilled pineapple', 'White onion', 'Fresh cilantro', 'Salsa verde'],
      customizations: [
        { id: 'extra-pork',      label: 'Extra Pork',       price: 60, type: 'add'    },
        { id: 'extra-pineapple', label: 'Extra Pineapple',  price: 20, type: 'add'    },
        { id: 'add-cheese',      label: 'Add Cheese',       price: 30, type: 'add'    },
        { id: 'add-jalapenos',   label: 'Add Jalapeños',    price: 20, type: 'add'    },
        { id: 'no-onion',        label: 'No Onion',         price: 0,  type: 'remove' },
        { id: 'no-cilantro',     label: 'No Cilantro',      price: 0,  type: 'remove' },
        { id: 'no-pineapple',    label: 'No Pineapple',     price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'crispy-fish-taco',
      category: 'tacos',
      name: 'Crispy Fish Taco',
      description: 'Beer-battered white fish, cabbage slaw, mango salsa, and lime crema in a flour tortilla.',
      price: 230,
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=700&q=80',
      popular: false,
      ingredients: ['Flour tortilla', 'Beer-battered fish', 'Cabbage slaw', 'Mango salsa', 'Lime crema'],
      customizations: [
        { id: 'extra-fish',       label: 'Extra Fish',        price: 70, type: 'add'    },
        { id: 'extra-crema',      label: 'Extra Lime Crema',  price: 20, type: 'add'    },
        { id: 'add-jalapenos',    label: 'Add Jalapeños',     price: 20, type: 'add'    },
        { id: 'add-guacamole',    label: 'Add Guacamole',     price: 40, type: 'add'    },
        { id: 'no-slaw',          label: 'No Cabbage Slaw',   price: 0,  type: 'remove' },
        { id: 'no-mango-salsa',   label: 'No Mango Salsa',    price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'veggie-taco',
      category: 'tacos',
      name: 'Veggie Supreme Taco',
      description: 'Roasted bell peppers, black beans, sweet corn, creamy avocado, and fresh salsa on a corn tortilla. 100% plant-based.',
      price: 170,
      image: 'https://images.unsplash.com/photo-1543565077-f5c5f78d1a09?w=700&q=80',
      popular: false,
      ingredients: ['Corn tortilla', 'Roasted peppers', 'Black beans', 'Sweet corn', 'Avocado', 'Fresh salsa'],
      customizations: [
        { id: 'add-cheese',      label: 'Add Cheese',       price: 30, type: 'add'    },
        { id: 'extra-avocado',   label: 'Extra Avocado',    price: 40, type: 'add'    },
        { id: 'add-jalapenos',   label: 'Add Jalapeños',    price: 20, type: 'add'    },
        { id: 'extra-beans',     label: 'Extra Beans',      price: 25, type: 'add'    },
        { id: 'no-corn',         label: 'No Corn',          price: 0,  type: 'remove' },
        { id: 'no-beans',        label: 'No Black Beans',   price: 0,  type: 'remove' },
      ]
    },

    // ─── BURRITOS ────────────────────────────────────────────────────────────

    {
      id: 'classic-beef-burrito',
      category: 'burritos',
      name: 'Classic Beef Burrito',
      description: 'A massive flour tortilla stuffed with seasoned beef, Spanish rice, black beans, cheddar cheese, and sour cream.',
      price: 320,
      image: 'https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?w=700&q=80',
      popular: true,
      ingredients: ['Large flour tortilla', 'Seasoned beef', 'Spanish rice', 'Black beans', 'Cheddar cheese', 'Sour cream', 'Salsa'],
      customizations: [
        { id: 'extra-meat',      label: 'Extra Beef',        price: 70, type: 'add'    },
        { id: 'extra-cheese',    label: 'Extra Cheese',      price: 30, type: 'add'    },
        { id: 'add-guacamole',   label: 'Add Guacamole',     price: 50, type: 'add'    },
        { id: 'add-jalapenos',   label: 'Add Jalapeños',     price: 20, type: 'add'    },
        { id: 'no-rice',         label: 'No Rice',           price: 0,  type: 'remove' },
        { id: 'no-beans',        label: 'No Beans',          price: 0,  type: 'remove' },
        { id: 'no-sour-cream',   label: 'No Sour Cream',     price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'chicken-burrito',
      category: 'burritos',
      name: 'Chicken Burrito',
      description: 'Grilled chicken, cilantro lime rice, pinto beans, roasted corn salsa, and chipotle crema wrapped tight.',
      price: 340,
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=700&q=80',
      popular: false,
      ingredients: ['Large flour tortilla', 'Grilled chicken', 'Cilantro lime rice', 'Pinto beans', 'Roasted corn', 'Chipotle crema'],
      customizations: [
        { id: 'extra-chicken',  label: 'Extra Chicken',        price: 70, type: 'add'    },
        { id: 'add-cheese',     label: 'Add Cheese',           price: 30, type: 'add'    },
        { id: 'add-guacamole',  label: 'Add Guacamole',        price: 50, type: 'add'    },
        { id: 'extra-sauce',    label: 'Extra Chipotle Crema', price: 20, type: 'add'    },
        { id: 'no-rice',        label: 'No Rice',              price: 0,  type: 'remove' },
        { id: 'no-beans',       label: 'No Beans',             price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'veggie-burrito',
      category: 'burritos',
      name: 'Veggie Burrito',
      description: 'Loaded with roasted seasonal vegetables, seasoned black beans, house guacamole, rice, and fresh pico de gallo.',
      price: 290,
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=700&q=80',
      popular: false,
      ingredients: ['Large flour tortilla', 'Roasted vegetables', 'Black beans', 'Guacamole', 'Cilantro rice', 'Pico de gallo'],
      customizations: [
        { id: 'add-cheese',      label: 'Add Cheese',       price: 30, type: 'add'    },
        { id: 'extra-guacamole', label: 'Extra Guacamole',  price: 50, type: 'add'    },
        { id: 'add-jalapenos',   label: 'Add Jalapeños',    price: 20, type: 'add'    },
        { id: 'extra-beans',     label: 'Extra Beans',      price: 30, type: 'add'    },
        { id: 'no-rice',         label: 'No Rice',          price: 0,  type: 'remove' },
      ]
    },

    // ─── QUESADILLAS ─────────────────────────────────────────────────────────

    {
      id: 'cheese-quesadilla',
      category: 'quesadillas',
      name: 'Classic Cheese Quesadilla',
      description: 'Crispy flour tortilla grilled to golden perfection with a melty blend of cheddar and Monterey Jack. Served with salsa and sour cream.',
      price: 220,
      image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=700&q=80',
      popular: false,
      ingredients: ['Flour tortilla', 'Cheddar cheese', 'Monterey Jack', 'Salsa', 'Sour cream'],
      customizations: [
        { id: 'add-chicken',    label: 'Add Chicken',   price: 70, type: 'add'    },
        { id: 'add-beef',       label: 'Add Beef',      price: 70, type: 'add'    },
        { id: 'add-jalapenos',  label: 'Add Jalapeños', price: 20, type: 'add'    },
        { id: 'add-guacamole',  label: 'Add Guacamole', price: 50, type: 'add'    },
        { id: 'no-sour-cream',  label: 'No Sour Cream', price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'chicken-quesadilla',
      category: 'quesadillas',
      name: 'Chicken Quesadilla',
      description: 'Seasoned grilled chicken and melted cheese with bell peppers and onions in a crispy toasted tortilla. Served with guacamole.',
      price: 280,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=80',
      popular: true,
      ingredients: ['Flour tortilla', 'Grilled chicken', 'Mixed cheese', 'Bell peppers', 'Onions', 'Guacamole'],
      customizations: [
        { id: 'extra-chicken',   label: 'Extra Chicken',   price: 70, type: 'add'    },
        { id: 'extra-cheese',    label: 'Extra Cheese',    price: 30, type: 'add'    },
        { id: 'add-jalapenos',   label: 'Add Jalapeños',   price: 20, type: 'add'    },
        { id: 'extra-guacamole', label: 'Extra Guacamole', price: 50, type: 'add'    },
        { id: 'no-peppers',      label: 'No Bell Peppers', price: 0,  type: 'remove' },
        { id: 'no-onions',       label: 'No Onions',       price: 0,  type: 'remove' },
      ]
    },

    // ─── SIDES ───────────────────────────────────────────────────────────────

    {
      id: 'loaded-nachos',
      category: 'sides',
      name: 'Loaded Nachos',
      description: 'Crispy tortilla chips loaded with melted cheese, jalapeños, pico de gallo, sour cream, and house guacamole.',
      price: 250,
      image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=700&q=80',
      popular: true,
      ingredients: ['Tortilla chips', 'Melted cheese', 'Jalapeños', 'Pico de gallo', 'Sour cream', 'Guacamole'],
      customizations: [
        { id: 'add-beef',        label: 'Add Seasoned Beef', price: 70, type: 'add'    },
        { id: 'add-chicken',     label: 'Add Chicken',       price: 70, type: 'add'    },
        { id: 'extra-cheese',    label: 'Extra Cheese',      price: 30, type: 'add'    },
        { id: 'extra-guacamole', label: 'Extra Guacamole',   price: 50, type: 'add'    },
        { id: 'no-jalapenos',    label: 'No Jalapeños',      price: 0,  type: 'remove' },
        { id: 'no-pico',         label: 'No Pico de Gallo',  price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'guacamole-chips',
      category: 'sides',
      name: 'Guacamole & Chips',
      description: 'Freshly made guacamole with ripe avocados, lime, cilantro, and tomato. Served with warm salted tortilla chips.',
      price: 180,
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=700&q=80',
      popular: false,
      ingredients: ['Fresh avocados', 'Lime juice', 'Cilantro', 'White onion', 'Tomato', 'Salt', 'Tortilla chips'],
      customizations: [
        { id: 'extra-portion',  label: 'Extra Large Portion', price: 80, type: 'add'    },
        { id: 'add-jalapenos',  label: 'Add Jalapeños',       price: 20, type: 'add'    },
        { id: 'no-cilantro',    label: 'No Cilantro',         price: 0,  type: 'remove' },
        { id: 'no-onion',       label: 'No Onion',            price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'rice-and-beans',
      category: 'sides',
      name: 'Rice & Beans',
      description: 'Fluffy cilantro lime rice served alongside seasoned black beans with a hint of cumin and garlic.',
      price: 130,
      image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=700&q=80',
      popular: false,
      ingredients: ['Cilantro lime rice', 'Black beans', 'Cumin', 'Garlic', 'Fresh cilantro'],
      customizations: [
        { id: 'extra-rice',   label: 'Extra Rice',   price: 40, type: 'add'    },
        { id: 'extra-beans',  label: 'Extra Beans',  price: 40, type: 'add'    },
        { id: 'add-cheese',   label: 'Add Cheese',   price: 30, type: 'add'    },
        { id: 'no-cilantro',  label: 'No Cilantro',  price: 0,  type: 'remove' },
      ]
    },

    // ─── DRINKS ──────────────────────────────────────────────────────────────

    {
      id: 'horchata',
      category: 'drinks',
      name: 'Horchata',
      description: 'Traditional sweet rice drink with cinnamon and vanilla. Chilled, creamy, and refreshing.',
      price: 100,
      image: 'https://images.unsplash.com/photo-1622920814218-0a0975498d58?w=700&q=80',
      popular: true,
      ingredients: ['Rice', 'Cinnamon', 'Vanilla', 'Sugar', 'Milk'],
      customizations: [
        { id: 'extra-cinnamon', label: 'Extra Cinnamon', price: 0, type: 'add'    },
        { id: 'no-ice',         label: 'No Ice',         price: 0, type: 'remove' },
      ]
    },

    {
      id: 'agua-jamaica',
      category: 'drinks',
      name: 'Agua de Jamaica',
      description: 'Refreshing hibiscus flower water, lightly sweetened with a beautiful deep ruby colour.',
      price: 90,
      image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=700&q=80',
      popular: false,
      ingredients: ['Hibiscus flowers', 'Water', 'Sugar', 'Lime'],
      customizations: [
        { id: 'less-sweet', label: 'Less Sweet', price: 0, type: 'remove' },
        { id: 'no-ice',     label: 'No Ice',     price: 0, type: 'remove' },
      ]
    },

    {
      id: 'soft-drink',
      category: 'drinks',
      name: 'Soft Drink',
      description: 'Choice of Coke, Fanta, or Sprite. Served cold with plenty of ice.',
      price: 70,
      image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=700&q=80',
      popular: false,
      ingredients: ['Your choice of cola / orange / lemon', 'Ice'],
      customizations: [
        { id: 'no-ice', label: 'No Ice', price: 0, type: 'remove' },
      ]
    },

    {
      id: 'still-water',
      category: 'drinks',
      name: 'Still Water',
      description: 'Cold mineral water — always crisp.',
      price: 50,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=700&q=80',
      popular: false,
      ingredients: ['Mineral water'],
      customizations: []
    },

    // ─── DESSERTS ─────────────────────────────────────────────────────────────

    {
      id: 'churros',
      category: 'desserts',
      name: 'Churros & Chocolate',
      description: 'Golden-fried cinnamon-sugar dusted churros served with a rich dark chocolate dipping sauce.',
      price: 160,
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=700&q=80',
      popular: true,
      ingredients: ['Fried dough', 'Cinnamon sugar', 'Dark chocolate sauce'],
      customizations: [
        { id: 'extra-chocolate', label: 'Extra Chocolate Sauce', price: 30, type: 'add'    },
        { id: 'add-caramel',     label: 'Add Caramel Sauce',     price: 30, type: 'add'    },
        { id: 'no-cinnamon',     label: 'No Cinnamon',           price: 0,  type: 'remove' },
      ]
    },

    {
      id: 'creamy-flan',
      category: 'desserts',
      name: 'Creamy Flan',
      description: 'Classic Mexican caramel custard flan — silky smooth with a rich golden caramel topping.',
      price: 140,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&q=80',
      popular: false,
      ingredients: ['Eggs', 'Milk', 'Sugar', 'Vanilla', 'Caramel'],
      customizations: [
        { id: 'extra-caramel', label: 'Extra Caramel',     price: 20, type: 'add' },
        { id: 'add-cream',     label: 'Add Whipped Cream', price: 25, type: 'add' },
      ]
    },

  ],

  // ─── DAILY SPECIALS ────────────────────────────────────────────────────────

  specials: [
    {
      id: 'taco-tuesday',
      name: 'Taco Tuesday Deal',
      description: 'Any 3 tacos of your choice + a soft drink. Mix and match freely!',
      originalPrice: 610,
      specialPrice: 420,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
      badge: "TODAY'S PICK",
      badgeColor: 'terracotta',
    },
    {
      id: 'family-fiesta',
      name: 'Family Fiesta Box',
      description: '6 tacos + 2 burritos + loaded nachos + 4 drinks. The ultimate sharing platter!',
      originalPrice: 1980,
      specialPrice: 1499,
      image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&q=80',
      badge: 'FAMILY DEAL',
      badgeColor: 'sage',
    },
    {
      id: 'lunch-express',
      name: 'Lunch Express',
      description: 'Any burrito + a side + a drink. Quick, satisfying, and great value.',
      originalPrice: 490,
      specialPrice: 370,
      image: 'https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?w=800&q=80',
      badge: 'LUNCH 11–15',
      badgeColor: 'wood',
    },
  ],

};
