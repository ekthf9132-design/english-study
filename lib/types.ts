export interface Word {
  id: string;
  english: string;
  meaning: string;
  example?: string;
  dateAdded: string; // ISO date string
  wrongCount: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  wordIds: string[];
  wrongWordIds: string[];
  correctWordIds: string[];
}
