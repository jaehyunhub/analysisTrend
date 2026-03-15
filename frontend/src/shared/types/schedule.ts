export interface Schedule {
  id: number;
  day: string;
  title: string;
  time: string;
  isLive?: boolean;
}

export interface BroadcastNews {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
}
