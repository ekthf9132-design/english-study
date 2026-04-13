"use client";

import { useState, useEffect } from "react";
import { getAllWords, getWrongWords, getTodayStats } from "@/lib/storage";
import { Word } from "@/lib/types";

const DAILY_GOAL = 30;

export default function StatsPage() {
  const [stats, setStats] = useState({
    todayCount: 0,
    wrongCount: 0,
    correctCount: 0,
    totalWords: 0,
  });
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setStats(getTodayStats());
    setWrongWords(getWrongWords());
    setAllWords(getAllWords());
  }, []);

  const accuracy =
    stats.correctCount + stats.wrongCount > 0
      ? Math.round((stats.correctCount / (stats.correctCount + stats.wrongCount)) * 100)
      : null;

  return (
    <div className="px-4 pt-4 space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">통계</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="오늘 입력"
          value={`${stats.todayCount} / ${DAILY_GOAL}`}
          sub={`목표 ${Math.round((stats.todayCount / DAILY_GOAL) * 100)}%`}
          color="blue"
          icon="✏️"
        />
        <StatCard
          label="누적 단어"
          value={`${stats.totalWords}개`}
          sub="전체 보유"
          color="purple"
          icon="📚"
        />
        <StatCard
          label="오늘 정답률"
          value={accuracy !== null ? `${accuracy}%` : "-"}
          sub={`${stats.correctCount}✅ ${stats.wrongCount}❌`}
          color="green"
          icon="🎯"
        />
        <StatCard
          label="틀린 단어"
          value={`${wrongWords.length}개`}
          sub="복습 필요"
          color="red"
          icon="📌"
        />
      </div>

      {/* Today progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <p className="text-sm font-semibold text-slate-600 mb-2">오늘 목표 달성</p>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{stats.todayCount}개 입력</span>
          <span>목표 {DAILY_GOAL}개</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-400 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
            style={{ width: `${Math.min((stats.todayCount / DAILY_GOAL) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Wrong words */}
      {wrongWords.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            틀린 단어 ({wrongWords.length}개)
          </h2>
          <div className="space-y-2">
            {wrongWords.map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800">{word.english}</p>
                  <p className="text-sm text-slate-500">{word.meaning}</p>
                  {word.example && (
                    <p className="text-xs text-slate-400 italic mt-0.5">{word.example}</p>
                  )}
                </div>
                <div className="shrink-0 ml-2">
                  <span className="bg-red-100 text-red-500 text-xs font-bold rounded-full px-2 py-0.5">
                    {word.wrongCount}회
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All words */}
      {allWords.length > 0 && (
        <div>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 text-left flex justify-between items-center"
          >
            <span className="text-sm font-semibold text-slate-600">
              전체 단어 목록 ({allWords.length}개)
            </span>
            <span className="text-slate-400 text-sm">{showAll ? "▲" : "▼"}</span>
          </button>
          {showAll && (
            <div className="space-y-2 mt-2">
              {allWords.map((word) => (
                <div
                  key={word.id}
                  className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{word.english}</p>
                      <p className="text-sm text-slate-500">{word.meaning}</p>
                      {word.example && (
                        <p className="text-xs text-slate-400 italic mt-0.5">{word.example}</p>
                      )}
                    </div>
                    {word.wrongCount > 0 && (
                      <span className="bg-red-100 text-red-500 text-xs font-bold rounded-full px-2 py-0.5 ml-2 shrink-0">
                        {word.wrongCount}회 틀림
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {allWords.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-sm">아직 단어가 없습니다</p>
          <p className="text-sm">단어를 입력하면 통계가 표시됩니다</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "purple" | "green" | "red";
  icon: string;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
  };

  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}
