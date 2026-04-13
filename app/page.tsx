"use client";

import { useState, useEffect, useCallback } from "react";
import { addWord, getTodayWords, getDailyRecord } from "@/lib/storage";
import { Word } from "@/lib/types";

const DAILY_GOAL = 30;

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function InputPage() {
  const [english, setEnglish] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [todayWords, setTodayWords] = useState<Word[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  const loadTodayWords = useCallback(() => {
    setTodayWords(getTodayWords());
  }, []);

  useEffect(() => {
    loadTodayWords();
  }, [loadTodayWords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !meaning.trim()) return;

    addWord({
      english: english.trim(),
      meaning: meaning.trim(),
      example: example.trim() || undefined,
      dateAdded: new Date().toISOString(),
    });

    setEnglish("");
    setMeaning("");
    setExample("");
    loadTodayWords();
    setSuccessMsg("단어가 추가되었습니다!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const progress = Math.min((todayWords.length / DAILY_GOAL) * 100, 100);
  const record = typeof window !== "undefined" ? getDailyRecord(today()) : null;

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">단어 입력</h1>
        <p className="text-sm text-slate-500 mt-0.5">오늘의 목표: {DAILY_GOAL}개</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">오늘 진행률</span>
          <span className="text-sm font-bold text-blue-600">
            {todayWords.length} / {DAILY_GOAL}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {todayWords.length >= DAILY_GOAL && (
          <p className="text-green-600 text-sm font-medium mt-2 text-center">
            🎉 오늘 목표 달성!
          </p>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            영어 단어 *
          </label>
          <input
            type="text"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="예: ephemeral"
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            뜻 *
          </label>
          <input
            type="text"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="예: 덧없는, 단명하는"
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            예문 (선택)
          </label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="예: Beauty is ephemeral."
            rows={2}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          />
        </div>
        {successMsg && (
          <p className="text-green-600 text-sm font-medium text-center">{successMsg}</p>
        )}
        <button
          type="submit"
          disabled={!english.trim() || !meaning.trim()}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
        >
          단어 추가하기
        </button>
      </form>

      {/* Today's word list */}
      {todayWords.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            오늘 입력한 단어 ({todayWords.length}개)
          </h2>
          <div className="space-y-2">
            {[...todayWords].reverse().map((word) => {
              const isWrong = record?.wrongWordIds.includes(word.id);
              const isCorrect = record?.correctWordIds.includes(word.id);
              return (
                <div
                  key={word.id}
                  className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{word.english}</p>
                    <p className="text-sm text-slate-500 truncate">{word.meaning}</p>
                    {word.example && (
                      <p className="text-xs text-slate-400 mt-0.5 italic truncate">{word.example}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-lg">
                    {isWrong && !isCorrect ? "❌" : isCorrect ? "✅" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todayWords.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <p className="text-4xl mb-2">📝</p>
          <p className="text-sm">아직 오늘 입력한 단어가 없습니다</p>
          <p className="text-sm">첫 번째 단어를 추가해보세요!</p>
        </div>
      )}
    </div>
  );
}
