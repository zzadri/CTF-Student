export interface Challenge {
  id: string;
  name: string;
  category: string;
  points: number;
  solvedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar: string;
  score: number;
  language: string;
  rank: number;
  solvedChallenges: {
    total: number;
    recent: Challenge[];
  };
} 