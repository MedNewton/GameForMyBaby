/* ─── Single source of truth for all game content ─── */

// ── Asset URLs ──
export const ASSETS = {
  player: "/assets/character/SpriteSheet.png",
  monster: "/assets/monster/Undead Monsters Color B8.png",
  speechBubble: "/assets/speech/SpeechBubble1.png",
  framePinkGreen: "/assets/frames/Floral Flourish - PinkGreen.png",
  valentineIcons: "/assets/love/ValentineIcons.png",
  foodIcons: "/assets/food/free 18 icons.png",
  introBg: "/assets/images/introBG2.webp",
  chest: "/assets/newtiles/Object Animation/Chest.png",

  tileset: {
    ground: "/assets/newtiles/Autotile_Grass_and_Dirt_Path_Tileset.png",
    nature: "/assets/newtiles/Nature_Tileset.png",
    house: "/assets/newtiles/House_Tileset.png",
    exterior: "/assets/newtiles/Exterior_Tileset.png",
    floor: "/assets/newtiles/Tileset_Floor_Detail.png",
    crops: "/assets/newtiles/Crops_Tileset.png",
  },

  trees: {
    emerald1: "/assets/treesandbushes/Tree_Emerald_1.png",
    emerald2: "/assets/treesandbushes/Tree_Emerald_2.png",
    emerald3: "/assets/treesandbushes/Tree_Emerald_3.png",
    emerald4: "/assets/treesandbushes/Tree_Emerald_4.png",
  },

  bushes: {
    emerald1: "/assets/treesandbushes/Bush_Emerald_1.png",
    emerald2: "/assets/treesandbushes/Bush_Emerald_2.png",
    emerald3: "/assets/treesandbushes/Bush_Emerald_3.png",
    emerald5: "/assets/treesandbushes/Bush_Emerald_5.png",
  },

  sounds: {
    collect: "/assets/sounds/coinpickup.wav",
    heart: "/assets/sounds/twinkle.mp3",
    kiss: "/assets/sounds/kiss.wav",
    open: "/assets/sounds/chime1.ogg",
    pop: "/assets/sounds/popping.wav",
    bgm: "/assets/sounds/bgm.flac",
  },

  photos: {
    eat_shawarma: "/assets/images/firstEat.webp",
    first_kiss: "/assets/images/firstKiss.webp",
    visited_tetouan: "/assets/images/firstVisit.webp",
    first_sleep_rabat: "/assets/images/firstSleep.webp",
  },

  keys: "/assets/keys/UI_buttons16x16.png",
  choppedTree: "/assets/newsprites/Chopped_Tree.png",
  arrows: "/assets/arrows/Pixelart arrow icon pack 1.0.png",

  heart: "/assets/emojis/heart.png",

  emojis: {
    heartEyes: "/assets/emojis/E11.png",
    kiss: "/assets/emojis/E48.png",
    love: "/assets/emojis/E70.png",
    angry: "/assets/emojis/E71.png",
    skull: "/assets/emojis/E55.png",
    starEyes: "/assets/emojis/E58.png",
    warning: "/assets/emojis/E56.png",
    happy: "/assets/emojis/E59.png",
    cry: "/assets/emojis/E7.png",
  },
} as const;

// ── Item IDs ──
export type ItemId =
  | "heart_big"
  | "kiss_bus_station"
  | "millefeuille"
  | "tshirt_kisses"
  | "baby_ending";

export type SfxName = "collect" | "heart" | "kiss" | "open" | "pop";

export type IconDef =
  | { type: "emoji"; emoji: string }
  | { type: "sheet"; sheet: "valentine" | "food"; col: number; row: number; size: number };

export interface ItemDef {
  label: string;
  icon: IconDef;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  heart_big: {
    label: "Big Heart",
    icon: { type: "sheet", sheet: "valentine", col: 3, row: 0, size: 32 },
  },
  kiss_bus_station: {
    label: "Bus Station Kiss",
    icon: { type: "sheet", sheet: "valentine", col: 0, row: 0, size: 32 },
  },
  millefeuille: {
    label: "Millefeuille",
    icon: { type: "sheet", sheet: "food", col: 5, row: 0, size: 32 },
  },
  tshirt_kisses: {
    label: "T-shirt with Kisses",
    icon: { type: "emoji", emoji: "\u{1F455}\u{1F48B}" },
  },
  baby_ending: {
    label: "Baby",
    icon: { type: "emoji", emoji: "\u{1F476}\u{1F497}" },
  },
};

// ── Trigger IDs (ordered by date) ──
export type TriggerId =
  | "eat_shawarma"
  | "first_kiss"
  | "visited_tetouan"
  | "first_sleep_rabat"
  | "final_house";

// Step order: triggers ordered by date for progressive reveal
export const STEP_ORDER: TriggerId[] = [
  "eat_shawarma",
  "first_kiss",
  "visited_tetouan",
  "first_sleep_rabat",
  "final_house",
];

export interface PlaceDef {
  id: TriggerId;
  title: string;
  date?: string;
  location: string;
  body: string;
  rewardItemId: ItemId;
  sfx: SfxName;
  photo?: string;
}

export const PLACES: PlaceDef[] = [
  {
    id: "eat_shawarma",
    title: "First Time We Meet",
    date: "26 Feb 2024",
    location: "Chef Sham, Tangier",
    body: "Our first meal together... I knew right then that you were special. The shawarma was good, but your smile was better.",
    rewardItemId: "heart_big",
    sfx: "heart",
    photo: ASSETS.photos.eat_shawarma,
  },
  {
    id: "first_kiss",
    title: "Bus Station Kiss",
    date: "26 Feb 2024",
    location: "Makondo Caf\u00e9, Tangier",
    body: "That first kiss at the stair case ... my heart still skips a beat every time I think about it.",
    rewardItemId: "kiss_bus_station",
    sfx: "kiss",
    photo: ASSETS.photos.first_kiss,
  },
  {
    id: "visited_tetouan",
    title: "First Time in T\u00e9touan",
    date: "26 Apr 2024",
    location: "Riad Am\u00e9lia, Tetouan",
    body: "You visited me in Tetouan for the first time! We shared Ajanef's millefeuille and made the sweetest memories.",
    rewardItemId: "millefeuille",
    sfx: "collect",
    photo: ASSETS.photos.visited_tetouan,
  },
  {
    id: "first_sleep_rabat",
    title: "First Sleepover",
    date: "25 May 2025",
    location: "Rabat",
    body: "Our first night together in Rabat. You painted my white t-shirt with love and left kisses all over it.",
    rewardItemId: "tshirt_kisses",
    sfx: "heart",
    photo: ASSETS.photos.first_sleep_rabat,
  },
  {
    id: "final_house",
    title: "Happily Ever After",
    location: "Our Home",
    body: "This is where our story really begins. A home filled with love, laughter, and a little baby on the way...",
    rewardItemId: "baby_ending",
    sfx: "open",
  },
];

// ── Mom NPC ──
export const MOM_NPC = {
  id: "mom_calling" as const,
  name: "Mom",
  lines: [
    "SafSaf! Come home early okay? \u{1F624}\u{1F497}",
    "Where are you two? Don't be late! \u{1F4DE}",
    "Eat well! And be careful! \u{1F633}",
  ],
  sfx: "pop" as SfxName,
};

// ── Ending ──
export const ENDING = {
  title: "Happily Ever After \u{1F495}",
  body: "SafSaf & Meedo found their home together.\nA place filled with love, warmth, and a beautiful future.\n\nThis is just the beginning of forever. \u{1F497}\u{1F476}",
};
