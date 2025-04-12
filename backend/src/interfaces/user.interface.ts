export interface Challenge {
  id: string;
  title: string;
  points: number;
  category: {
    name: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  score: number;
  languageId: string;
  language: {
    name: string;
  };
  solves: Array<{
    challenge: {
      id: string;
      title: string;
      points: number;
      category: {
        name: string;
      };
    };
    solvedAt: Date;
  }>;
}

export interface UserUpdateData {
  username?: string;
  languageId?: string;
  avatar?: string;
} 