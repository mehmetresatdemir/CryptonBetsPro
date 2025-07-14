export interface CasinoGame {
  id: number;
  bgClass: string;
  title: string;
  subtitle?: string;
  footerType?: "roulette" | "metrics" | "none";
  isSpecial?: boolean;
}

export const casinoGames: CasinoGame[] = [
  {
    id: 1,
    bgClass: "bg-gradient-to-b from-red-900 to-red-950",
    title: "IMMERSIVE",
    subtitle: "ROULETTE",
    footerType: "roulette"
  },
  {
    id: 2,
    bgClass: "bg-gradient-to-b from-yellow-700 to-yellow-900",
    title: "LIGHTNING",
    subtitle: "ROULETTE",
    footerType: "roulette"
  },
  {
    id: 3,
    bgClass: "bg-gradient-to-b from-[#121212] to-[#1E1E1E]",
    title: "BACCARAT",
    subtitle: "LIVE DEALER",
    footerType: "metrics"
  },
  {
    id: 4,
    bgClass: "bg-gradient-to-b from-green-800 to-green-950",
    title: "ROULETTE",
    isSpecial: true,
    footerType: "metrics"
  },
  {
    id: 5,
    bgClass: "bg-gradient-to-b from-blue-800 to-blue-950",
    title: "UFO",
    footerType: "none"
  },
  {
    id: 6,
    bgClass: "bg-gradient-to-b from-red-700 to-red-900",
    title: "Aviator",
    footerType: "none"
  }
];