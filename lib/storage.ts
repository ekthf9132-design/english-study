import { Word, DailyRecord } from "./types";

const WORDS_KEY = "vocab_words";
const DAILY_KEY = "vocab_daily";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

// Words
export function getAllWords(): Word[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(WORDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveAllWords(words: Word[]): void {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

export function addWord(word: Omit<Word, "id" | "wrongCount">): Word {
  const words = getAllWords();
  const newWord: Word = {
    ...word,
    id: crypto.randomUUID(),
    wrongCount: 0,
  };
  words.push(newWord);
  saveAllWords(words);
  addWordToDaily(newWord.id);
  return newWord;
}

export function getTodayWords(): Word[] {
  const all = getAllWords();
  const record = getDailyRecord(today());
  return all.filter((w) => record.wordIds.includes(w.id));
}

export function incrementWrongCount(wordId: string): void {
  const words = getAllWords();
  const word = words.find((w) => w.id === wordId);
  if (word) {
    word.wrongCount += 1;
    saveAllWords(words);
  }
}

// Daily records
function getAllDailyRecords(): DailyRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DAILY_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAllDailyRecords(records: DailyRecord[]): void {
  localStorage.setItem(DAILY_KEY, JSON.stringify(records));
}

export function getDailyRecord(date: string): DailyRecord {
  const records = getAllDailyRecords();
  const existing = records.find((r) => r.date === date);
  if (existing) return existing;
  return { date, wordIds: [], wrongWordIds: [], correctWordIds: [] };
}

function addWordToDaily(wordId: string): void {
  const records = getAllDailyRecords();
  const date = today();
  const idx = records.findIndex((r) => r.date === date);
  if (idx >= 0) {
    if (!records[idx].wordIds.includes(wordId)) {
      records[idx].wordIds.push(wordId);
    }
  } else {
    records.push({ date, wordIds: [wordId], wrongWordIds: [], correctWordIds: [] });
  }
  saveAllDailyRecords(records);
}

export function recordAnswer(wordId: string, correct: boolean): void {
  const records = getAllDailyRecords();
  const date = today();
  const idx = records.findIndex((r) => r.date === date);
  if (idx < 0) return;

  if (correct) {
    if (!records[idx].correctWordIds.includes(wordId)) {
      records[idx].correctWordIds.push(wordId);
    }
    records[idx].wrongWordIds = records[idx].wrongWordIds.filter((id) => id !== wordId);
  } else {
    if (!records[idx].wrongWordIds.includes(wordId)) {
      records[idx].wrongWordIds.push(wordId);
    }
    incrementWrongCount(wordId);
  }
  saveAllDailyRecords(records);
}

export function getWrongWords(): Word[] {
  const all = getAllWords();
  return all.filter((w) => w.wrongCount > 0).sort((a, b) => b.wrongCount - a.wrongCount);
}

export function getTodayStats() {
  const record = getDailyRecord(today());
  return {
    todayCount: record.wordIds.length,
    wrongCount: record.wrongWordIds.length,
    correctCount: record.correctWordIds.length,
    totalWords: getAllWords().length,
  };
}

// Notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getRandomWordForNotification(): Word | null {
  const all = getAllWords();
  if (all.length === 0) return null;
  return all[Math.floor(Math.random() * all.length)];
}
