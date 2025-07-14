// Slotegrator API'den gelen oyun tipi
export interface SlotegratorGame {
  uuid: string;
  name: string;
  image: string;
  type: string;
  provider: string;
  technology: string;
  has_lobby: number;
  is_mobile: number;
  has_freespins?: number;
  has_tables?: number;
  freespin_valid_until_full_day?: number;
  featured?: boolean;
  popularity?: number;
  rtp?: number;
  min_bet?: number;
  max_bet?: number;
  live_dealer?: boolean;
  game_type?: string;
  table_limits?: {
    min: number;
    max: number;
    vip_max: number;
  };
  tags?: Array<{ code: string, label: string }>;
  parameters?: {
    rtp?: number;
    volatility?: string;
    reels_count?: string;
    lines_count?: number | string;
  };
  images?: Array<{
    name: string;
    file: string;
    url: string;
    type: string;
  }>;
  related_games?: Array<{
    uuid: string;
    is_mobile: number;
  }>;
}

// Slotegrator API'den gelen oyun listesi
export interface SlotegratorGamesList {
  games?: SlotegratorGame[];
  items?: SlotegratorGame[];
  total?: number;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  perPage?: number;
  _meta?: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}

// Oyun başlatma yanıtı
export interface GameInitResponse {
  url: string;
}

// Oyun lobisi yanıtı
export interface GameLobbyResponse {
  url: string;
}