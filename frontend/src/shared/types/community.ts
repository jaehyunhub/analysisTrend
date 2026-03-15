export interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  postCount?: number;
  icon?: string;
  color?: string;
}
