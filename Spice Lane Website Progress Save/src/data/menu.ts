// Single source of truth for the menu. Models = optimized copies of repo-root assets/*.glb (npm run optimize-models).
export type Tier = 'blue' | 'green' | 'orange' | 'purple' | 'red';
export type MenuItem = {
  id: string; slug: string; name: string; price: number; tier: Tier;
  accentColor: string; plateColor: string; model: string; poster: string;
  description: string; longDescription: string; tags: string[]; allergens: string[];
  ingredients: { name: string; color: string }[];
  nutrition: { kcal: number; protein: number; carbs: number; fat: number };
  spicy?: 0 | 1 | 2 | 3; vegetarian?: boolean; chefNote?: string; pairing?: string[];
};

export const TIERS: Record<Tier, { price: number; color: string }> = {
  blue: { price: 14, color: '#1045e7' },
  green: { price: 18, color: '#01b87b' },
  orange: { price: 24, color: '#fc9808' },
  purple: { price: 32, color: '#a036fa' },
  red: { price: 48, color: '#ff1555' },
};



const m = (file: string) => ({ model: `/models/${file}.glb`, poster: `/posters/${file}.png` });

export const MENU: MenuItem[] = [
  { id: 'salmon-roll', slug: 'salmon-sushi-roll', name: 'Salmon sushi roll', price: 14, tier: 'blue', accentColor: '#FF8A4C', plateColor: '#f2efe8', ...m('salmon-sushi-roll'),
    description: 'Fresh salmon over seasoned rice, wrapped in nori.', longDescription: 'Norwegian salmon, hand-pressed shari and toasted nori, finished with a brush of nikiri soy and pickled ginger on the side.',
    tags: ['6 pieces', 'Raw fish'], allergens: ['Fish', 'Soy', 'Sesame'], ingredients: [{ name: 'Salmon', color: '#FF8A4C' }, { name: 'Rice', color: '#f4f1ea' }, { name: 'Nori', color: '#1d2b1f' }],
    nutrition: { kcal: 320, protein: 18, carbs: 42, fat: 8 }, spicy: 0, chefNote: 'Cut to order, never pre-sliced.', pairing: ['tuna-tataki', 'fondant'] },
  { id: 'spaghetti', slug: 'spaghetti-tomato', name: 'Spaghetti al pomodoro', price: 14, tier: 'blue', accentColor: '#E5482F', plateColor: '#ffffff', ...m('spaghetti-with-tomato-sauce'),
    description: 'Bronze-cut spaghetti in slow San Marzano tomato sauce.', longDescription: 'Bronze-die spaghetti tossed in a four-hour San Marzano sauce with garlic confit, basil and aged parmesan.',
    tags: ['Vegetarian', 'Pasta'], allergens: ['Gluten', 'Dairy'], ingredients: [{ name: 'Spaghetti', color: '#e8c77a' }, { name: 'Tomato', color: '#E5482F' }, { name: 'Basil', color: '#3f8f3a' }],
    nutrition: { kcal: 540, protein: 17, carbs: 82, fat: 14 }, spicy: 1, vegetarian: true, chefNote: 'Finished in the pan with pasta water for a glossy sauce.', pairing: ['fondant', 'lamb'] },
  { id: 'tuna-tataki', slug: 'sesame-tuna-tataki', name: 'Sesame tuna tataki', price: 18, tier: 'green', accentColor: '#C2213B', plateColor: '#141414', ...m('sesame-crusted-tuna-tataki'),
    description: 'Seared yellowfin in a sesame crust, ponzu and scallion.', longDescription: 'Yellowfin loin rolled in black and white sesame, flash-seared and sliced thin over citrus ponzu with scallion and chili threads.',
    tags: ['Seared', 'Raw centre'], allergens: ['Fish', 'Sesame', 'Soy'], ingredients: [{ name: 'Tuna', color: '#C2213B' }, { name: 'Sesame', color: '#e9dcc0' }, { name: 'Ponzu', color: '#a46a1f' }],
    nutrition: { kcal: 290, protein: 32, carbs: 8, fat: 14 }, spicy: 1, chefNote: 'Ten seconds a side — no more.', pairing: ['salmon-roll', 'lobster'] },
  { id: 'fondant', slug: 'dark-chocolate-fondant', name: 'Dark chocolate fondant', price: 18, tier: 'green', accentColor: '#7A4A2A', plateColor: '#f4efe6', ...m('dark-chocolate-fondant'),
    description: 'Molten 70% chocolate cake with a liquid centre.', longDescription: 'Valrhona 70% dark chocolate fondant baked to order with a molten centre, served with vanilla cream and cocoa nib crumble.',
    tags: ['Dessert', 'Baked to order'], allergens: ['Gluten', 'Dairy', 'Egg'], ingredients: [{ name: 'Chocolate', color: '#4a2a18' }, { name: 'Cream', color: '#f5ecd9' }, { name: 'Berries', color: '#c3263f' }],
    nutrition: { kcal: 480, protein: 7, carbs: 46, fat: 30 }, spicy: 0, vegetarian: true, chefNote: 'Allow 12 minutes — worth it.', pairing: ['spaghetti', 'wagyu'] },
  { id: 'ribeye', slug: 'grilled-ribeye-steak', name: 'Grilled ribeye steak', price: 24, tier: 'orange', accentColor: '#B4532A', plateColor: '#1a1a1a', ...m('grilled-ribeye-steak'),
    description: 'Charcoal-grilled ribeye, herb butter and sea salt.', longDescription: '300g grass-fed ribeye grilled over binchotan, rested and finished with smoked herb butter and flaky Maldon salt.',
    tags: ['300 g', 'Medium rare'], allergens: ['Dairy'], ingredients: [{ name: 'Ribeye', color: '#8a3b1f' }, { name: 'Herb butter', color: '#e4cf6a' }, { name: 'Sea salt', color: '#f4f4f4' }],
    nutrition: { kcal: 720, protein: 62, carbs: 2, fat: 52 }, spicy: 0, chefNote: 'Rested as long as it cooked.', pairing: ['spaghetti', 'fondant'] },
  { id: 'lamb', slug: 'herb-crusted-rack-of-lamb', name: 'Herb-crusted rack of lamb', price: 24, tier: 'orange', accentColor: '#8FA34A', plateColor: '#e9e4da', ...m('herb-crusted-rack-of-lamb'),
    description: 'Rosemary and mustard crust, roasted pink.', longDescription: 'French-trimmed rack coated in Dijon, rosemary, thyme and parsley crumb, roasted pink and served with jus.',
    tags: ['4 cutlets', 'Roasted'], allergens: ['Gluten', 'Mustard'], ingredients: [{ name: 'Lamb', color: '#b45a4a' }, { name: 'Herb crust', color: '#8FA34A' }, { name: 'Jus', color: '#5a2c1a' }],
    nutrition: { kcal: 640, protein: 48, carbs: 12, fat: 44 }, spicy: 0, chefNote: 'Crust goes on after the sear, not before.', pairing: ['ribeye', 'fondant'] },
  { id: 'lobster', slug: 'lobster-thermidor', name: 'Lobster thermidor', price: 32, tier: 'purple', accentColor: '#F2553D', plateColor: '#b9d6cf', ...m('lobster-thermidor'),
    description: 'Half lobster gratinated with cognac-mustard cream.', longDescription: 'Half a Boston lobster, meat folded into cognac, mustard and gruyère cream, returned to the shell and gratinated.',
    tags: ['Half lobster', 'Shellfish'], allergens: ['Shellfish', 'Dairy', 'Mustard'], ingredients: [{ name: 'Lobster', color: '#F2553D' }, { name: 'Gruyère', color: '#f0d27a' }, { name: 'Cognac cream', color: '#f3e3c0' }],
    nutrition: { kcal: 560, protein: 38, carbs: 10, fat: 40 }, spicy: 0, chefNote: 'Shell roasted for the sauce base.', pairing: ['tuna-tataki', 'wagyu'] },
  { id: 'wagyu', slug: 'a5-wagyu-ribeye', name: 'A5 wagyu ribeye', price: 48, tier: 'red', accentColor: '#E0616B', plateColor: '#0f0f0f', ...m('a5-wagyu-ribeye'),
    description: 'Japanese A5 wagyu, seared on hot stone.', longDescription: '120g Kagoshima A5 wagyu, seared tableside-style on a hot stone with wasabi, fresh-grated, and smoked salt.',
    tags: ['120 g', 'A5 grade'], allergens: [], ingredients: [{ name: 'Wagyu', color: '#E0616B' }, { name: 'Wasabi', color: '#9cc25a' }, { name: 'Smoked salt', color: '#d9d2c5' }],
    nutrition: { kcal: 610, protein: 28, carbs: 0, fat: 56 }, spicy: 0, chefNote: 'Marbling score 10+. Eat it in small bites.', pairing: ['lobster', 'fondant'] },
];

export const getItem = (id: string) => MENU.find((x) => x.id === id);
export const formatPrice = (n: number) => `$${n.toFixed(2)}`;
