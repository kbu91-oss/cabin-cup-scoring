// ADK Corner Store menu — Friday lunch.
// Source: https://www.adkcornerstore.com/subs-sandwiches-and-deli-menu
// Prices subject to change; treat as guidance only.

export type SubSize = '6' | '12';

export type MenuCategoryId =
  | 'subs'
  | 'specialty'
  | 'hot-stuff'
  | 'salads'
  | 'sides';

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategoryId;
  // Subs (regular cold cut family) are customizable with bread/cheese/veggies/condiments.
  customizable: boolean;
  // Sized items show small/large price. Unsized show one price.
  sizes?: { id: SubSize; label: string; price: number }[];
  price?: number; // single-price items
  description?: string;
};

// Customization options — same lists Boar's Head offers at the counter.
export const BREADS = [
  'White',
  'Marble Rye',
  '12 Grain',
  'Whole Wheat',
  'White Sub Roll',
  'Sourdough',
  'Kaiser Roll',
] as const;

export const CHEESES = [
  'American',
  'Muenster',
  'Cheddar',
  'Swiss',
  'Provolone',
  '3 Pepper Colby Jack',
  'No Cheese',
] as const;

export const VEGETABLES = [
  'Lettuce',
  'Tomato',
  'Onion',
  'Banana Peppers',
  'Cucumber',
  'Roasted Red Peppers',
  'Pickles',
  'Hot Pepper Relish',
  'Black Olives',
  'Green Peppers',
] as const;

export const CONDIMENTS = [
  "Hellmann's Mayo",
  'Deli Mustard',
  'Yellow Mustard',
  'Honey Mustard',
  'Horseradish Sauce',
  'Bleu Cheese',
  'Ranch',
  'Italian Dressing',
  'Oil & Vinegar',
  'Chipotle Mayo',
  '1000 Island',
  'BBQ',
  'Balsamic Vinaigrette',
] as const;

export type Bread = (typeof BREADS)[number];
export type Cheese = (typeof CHEESES)[number];
export type Vegetable = (typeof VEGETABLES)[number];
export type Condiment = (typeof CONDIMENTS)[number];

export const MENU_CATEGORIES: { id: MenuCategoryId; label: string; blurb?: string }[] = [
  { id: 'subs',      label: 'Subs & Sandwiches', blurb: 'Pick your bread, cheese, veggies, condiments' },
  { id: 'specialty', label: 'Specialty Sandwiches', blurb: 'Pre-built — no customization' },
  { id: 'hot-stuff', label: 'Hot Stuff' },
  { id: 'salads',    label: 'Salads' },
  { id: 'sides',     label: 'Sides' },
];

// Regular subs — small/large pricing, full customization.
const REG_SIZES: NonNullable<MenuItem['sizes']> = [
  { id: '6',  label: '6"',  price: 6.99 },
  { id: '12', label: '12"', price: 8.99 },
];

const COLD_CUT_NAMES = [
  'Roast Beef',
  'Ham',
  'Honey Maple Ham',
  'Turkey',
  'Cajun Turkey',
  'Honey Maple Turkey',
  'Chicken Breast',
  'Buffalo Chicken Breast',
  'Pastrami',
  'Corned Beef',
  'Salami',
  'Pepperoni',
];

const SUBS: MenuItem[] = [
  ...COLD_CUT_NAMES.map((meat): MenuItem => ({
    id: `sub-${meat.toLowerCase().replace(/\s+/g, '-')}`,
    name: meat,
    category: 'subs',
    customizable: true,
    sizes: REG_SIZES,
  })),
  { id: 'sub-chicken-salad',      name: 'Chicken Salad',      category: 'subs', customizable: true, sizes: REG_SIZES },
  { id: 'sub-cranwalnut',         name: 'Cranberry Walnut Chicken Salad', category: 'subs', customizable: true, sizes: REG_SIZES },
  { id: 'sub-buffalo-salad',      name: 'Buffalo Chicken Salad', category: 'subs', customizable: true, sizes: REG_SIZES },
  { id: 'sub-tuna',               name: 'Tuna Salad',         category: 'subs', customizable: true, sizes: REG_SIZES },
  { id: 'sub-egg',                name: 'Egg Salad',          category: 'subs', customizable: true, sizes: [
    { id: '6', label: '6"', price: 5.99 }, { id: '12', label: '12"', price: 7.49 },
  ] },
  { id: 'sub-bologna',            name: 'Bologna',            category: 'subs', customizable: true, sizes: [
    { id: '6', label: '6"', price: 6.39 }, { id: '12', label: '12"', price: 7.89 },
  ] },
  { id: 'sub-cheese',             name: 'Cheese',             category: 'subs', customizable: true, sizes: [
    { id: '6', label: '6"', price: 6.39 }, { id: '12', label: '12"', price: 7.89 },
  ] },
  { id: 'sub-veggie',             name: 'Veggie',             category: 'subs', customizable: true, sizes: [
    { id: '6', label: '6"', price: 6.39 }, { id: '12', label: '12"', price: 7.89 },
  ] },
];

// Specialty sandwiches — fixed builds, no customization.
const SPECIALTY: MenuItem[] = [
  {
    id: 'spec-italian', name: 'Classic Italian Sub', category: 'specialty', customizable: false, price: 9.99,
    description: "Ham + hard salami, provolone, lettuce, tomato, onion, mayo, Italian dressing on a baked sub roll.",
  },
  {
    id: 'spec-chicken-cutlet', name: 'Chicken Cutlet Sub', category: 'specialty', customizable: false, price: 9.99,
    description: 'Breaded chicken cutlet, American cheese, lettuce, tomato, mayo on a baked sub roll.',
  },
  {
    id: 'spec-turkey-club', name: 'Classic Turkey Club', category: 'specialty', customizable: false, price: 9.99,
    description: 'Ovengold turkey, bacon, Swiss, lettuce, tomato, mayo on toasted double-decker white. Chips + pickle.',
  },
  {
    id: 'spec-cran-walnut-sandwich', name: 'Cranberry Walnut Chicken Salad Sandwich', category: 'specialty', customizable: false, price: 8.99,
    description: 'Chicken salad with dried cranberries and walnuts on 12 grain. Chips + pickle.',
  },
  {
    id: 'spec-buffalo-sandwich', name: 'Buffalo Chicken Salad Sandwich', category: 'specialty', customizable: false, price: 8.99,
    description: 'Buffalo chicken, celery, carrots, feta, chipotle mayo, 3-pepper Colby Jack on a Kaiser roll. Chips + pickle.',
  },
  {
    id: 'spec-reuben', name: 'Classic Reuben', category: 'specialty', customizable: false, price: 9.29,
    description: "Corned beef on marble rye, Swiss, sauerkraut, 1000 Island. Chips + pickle.",
  },
];

const HOT_STUFF: MenuItem[] = [
  { id: 'hot-mozz',       name: 'Mozzarella Sticks (6pc)', category: 'hot-stuff', customizable: false, price: 6.49 },
  { id: 'hot-tenders',    name: 'Chicken Tenders w/ Fries (6pc)', category: 'hot-stuff', customizable: false, price: 9.49 },
  { id: 'hot-wings-6',    name: 'Chicken Wings — 6pc',     category: 'hot-stuff', customizable: false, price: 9.99,  description: 'Naked, Sweet Chili, or Hot' },
  { id: 'hot-wings-12',   name: 'Chicken Wings — 12pc',    category: 'hot-stuff', customizable: false, price: 17.99, description: 'Naked, Sweet Chili, or Hot' },
  { id: 'hot-stuffed-6',  name: 'Stuffed Chicken Bites — 6pc',  category: 'hot-stuff', customizable: false, price: 5.99,  description: 'Cordon Bleu' },
  { id: 'hot-stuffed-12', name: 'Stuffed Chicken Bites — 12pc', category: 'hot-stuff', customizable: false, price: 9.49,  description: 'Cordon Bleu' },
  { id: 'hot-poppers',    name: 'Jalapeño Poppers (6pc)',  category: 'hot-stuff', customizable: false, price: 5.49 },
  { id: 'hot-mac-bites',  name: 'Mac & Cheese Bites (10pc)', category: 'hot-stuff', customizable: false, price: 5.49 },
  { id: 'hot-pickles',    name: 'Fried Pickle Chips (12pc)', category: 'hot-stuff', customizable: false, price: 3.99 },
];

const SALADS: MenuItem[] = [
  { id: 'salad-garden',  name: 'Garden Salad',         category: 'salads', customizable: false, price: 3.99 },
  { id: 'salad-chef',    name: 'Chef Salad',           category: 'salads', customizable: false, price: 8.49 },
  { id: 'salad-cobb',    name: 'Cobb Salad',           category: 'salads', customizable: false, price: 8.49 },
  { id: 'salad-caesar',  name: 'Chicken Caesar Salad', category: 'salads', customizable: false, price: 8.49 },
];

const SIDES: MenuItem[] = [
  { id: 'side-fries-sm', name: 'French Fries — Small', category: 'sides', customizable: false, price: 2.99 },
  { id: 'side-fries-lg', name: 'French Fries — Large', category: 'sides', customizable: false, price: 2.99 },
  { id: 'side-tots-sm',  name: 'Tater Tots — Small',   category: 'sides', customizable: false, price: 2.99 },
  { id: 'side-tots-lg',  name: 'Tater Tots — Large',   category: 'sides', customizable: false, price: 2.99 },
  { id: 'side-rings',    name: 'Battered Onion Rings', category: 'sides', customizable: false, price: 3.99 },
  { id: 'side-chili-sm', name: 'Chili — Small',        category: 'sides', customizable: false, price: 3.99 },
  { id: 'side-chili-lg', name: 'Chili — Large',        category: 'sides', customizable: false, price: 4.99 },
  { id: 'side-tomato-sm',name: 'Tomato Mac Soup — Small', category: 'sides', customizable: false, price: 3.99 },
  { id: 'side-tomato-lg',name: 'Tomato Mac Soup — Large', category: 'sides', customizable: false, price: 4.99 },
];

export const MENU: MenuItem[] = [...SUBS, ...SPECIALTY, ...HOT_STUFF, ...SALADS, ...SIDES];

export const MENU_BY_ID: Record<string, MenuItem> = MENU.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<string, MenuItem>);

export function itemsByCategory(category: MenuCategoryId): MenuItem[] {
  return MENU.filter(i => i.category === category);
}

export function priceFor(item: MenuItem, size?: SubSize): number {
  if (item.sizes) {
    return item.sizes.find(s => s.id === size)?.price ?? item.sizes[0].price;
  }
  return item.price ?? 0;
}
