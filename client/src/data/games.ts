export interface Game {
  id: number;
  bgClass: string;
  title: string;
  subtitle?: string;
  titleSize?: "sm" | "md" | "lg" | "xl";
  additionalText?: string;
  icon?: string;
  hasNumbers?: boolean;
  category?: string;
}

export const games: Game[] = [
  {
    id: 1,
    bgClass: "bg-gradient-to-b from-red-700 to-red-900",
    title: "777",
    subtitle: "5 LINES HOT",
    hasNumbers: true,
    category: "popular"
  },
  {
    id: 2,
    bgClass: "bg-gradient-to-b from-blue-900 to-indigo-900",
    title: "NIGHT",
    subtitle: "VAMPIRE",
    titleSize: "lg",
    category: "popular"
  },
  {
    id: 3,
    bgClass: "bg-gradient-to-b from-purple-800 to-purple-900",
    title: "ZODIAC",
    subtitle: "WHEEL",
    titleSize: "lg",
    category: "slots"
  },
  {
    id: 4,
    bgClass: "bg-gradient-to-b from-orange-700 to-orange-900",
    title: "GATES OF",
    subtitle: "OLYMPUS",
    titleSize: "lg",
    category: "popular"
  },
  {
    id: 5,
    bgClass: "bg-gradient-to-b from-pink-500 to-pink-700",
    title: "SWEET",
    subtitle: "BONANZA",
    additionalText: "1000",
    titleSize: "lg",
    category: "popular"
  },
  {
    id: 6,
    bgClass: "bg-gradient-to-b from-green-700 to-green-900",
    title: "DICE",
    icon: "fas fa-dice",
    titleSize: "sm",
    category: "table"
  }
];