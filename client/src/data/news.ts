export interface NewsItem {
  id: number;
  bgClass: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  extraClasses?: string;
  type: "vip" | "premium" | "mystery" | "fast-games" | "bonus";
}

export const newsItems: NewsItem[] = [
  {
    id: 1,
    bgClass: "bg-gradient-to-b from-[#FFD700] to-[#FFB100]",
    title: "VIP",
    type: "vip",
    extraClasses: ""
  },
  {
    id: 2,
    bgClass: "bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E]",
    title: "PREMIUM",
    type: "premium",
    extraClasses: "border border-[#FFD700]"
  },
  {
    id: 3,
    bgClass: "bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E]",
    title: "MYSTERY",
    badgeText: "WHEEL",
    type: "mystery"
  },
  {
    id: 4,
    bgClass: "bg-blue-900",
    title: "FAST",
    subtitle: "GAMES",
    type: "fast-games"
  },
  {
    id: 5,
    bgClass: "bg-[#1E1E1E]",
    title: "21",
    subtitle: "DAILY",
    badgeText: "BONUS",
    type: "bonus"
  }
];