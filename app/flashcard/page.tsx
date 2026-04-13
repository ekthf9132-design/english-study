"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllWords, getTodayWords, recordAnswer } from "@/lib/storage";
import { Word } from "@/lib/types";

type Mode = "today" | "all" | "wrong";
type CardState = "question" | "revealed";

export default function FlashcardPage() {
  const [mode, setMode] = useState<Mode>("today");
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<CardState>("question");
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);

  const buildDeck = useCallback(() => {
    let words: Word[] = [];
    if (mode === "today") {
      words = getTodayWords();
    } else if (mode === "all") {
      words = getAllWords();
    } else {
      words = getAllWords().filter((w) => w.wrongCount > 0);
    }
    // Shuffle
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setCardState("question");
    setSessionCorrect(0);
    setSessionWrong(0);
    setFinished(false);
    setWrongWords([]);
  }, [mode]);

  useEffect(() => {
    buildDeck();
  }, [buildDeck]);

  const currentWord = deck[currentIndex];

  const handleReveal = () => setCardState("revealed");

  const handleAnswer = (correct: boolean) => {
    if (!currentWord) return;
    recordAnswer(currentWord.id, correct);
    if (correct) {
      setSessionCorrect((n) => n + 1);
    } else {
      setSessionWrong((n) => n + 1);
      setWrongWords((prev) => [...prev, currentWord]);
    }
    const next = currentIndex + 1;
    if (next >= deck.length) {
      setFinished(true);
    } else {
      setCurrentIndex(next);
      setCardState("question");
    }
  };

  if (deck.length === 0) {
    return (
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">플래시카드</h1>
        <ModeSelector mode={mode} setMode={setMode} />
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-3">🃏</p>
          <p className="font-medium text-slate-500">단어가 없습니다</p>
          <p className="text-sm mt-1">
            {mode === "today"
              ? "오늘 입력한 단어가 없어요. 먼저 단어를 추가해보세요!"
              : mode === "wrong"
              ? "틀린 단어가 없습니다. 훌륭해요!"
              : "단어를 먼저 추가해주세요."}
          </p>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">플래시카드</h1>
        <ModeSelector mode={mode} setMode={setMode} />
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          <p className="text-5xl mb-3">🎯</p>
          <h2 className="text-xl font-bold text-slate-800 mb-1">세션 완료!</h2>
          <p className="text-slate-500 text-sm mb-5">총 {deck.length}개 학습</p>
          <div className="flex gap-3 justify-center mb-6">
            <div className="bg-green-50 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold text-green-600">{sessionCorrect}</p>
              <p className="text-xs text-green-500 mt-0.5">알았어</p>
            </div>
            <div className="bg-red-50 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold text-red-500">{sessionWrong}</p>
              <p className="text-xs text-red-400 mt-0.5">몰랐어</p>
            </div>
          </div>
          {wrongWords.length > 0 && (
            <div className="text-left mb-5">
              <p className="text-sm font-semibold text-slate-600 mb-2">
                다시 확인할 단어 ({wrongWords.length}개)
              </p>
              <div className="space-y-2">
                {wrongWords.map((w) => (
                  <div key={w.id} className="bg-red-50 rounded-xl px-3 py-2">
                    <p className="font-semibold text-slate-800 text-sm">{w.english}</p>
                    <p className="text-xs text-slate-500">{w.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={buildDeck}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl active:scale-95 transition-transform"
          >
            다시 학습하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">플래시카드</h1>
      <ModeSelector mode={mode} setMode={setMode} />

      {/* Progress bar */}
      <div className="flex items-center gap-2 mt-4 mb-4">
        <div className="flex-1 bg-slate-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(currentIndex / deck.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 shrink-0">
          {currentIndex + 1} / {deck.length}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Question side */}
        <div className="p-8 text-center border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            English
          </p>
          <p className="text-4xl font-bold text-slate-800">{currentWord.english}</p>
        </div>

        {/* Answer side */}
        {cardState === "question" ? (
          <div className="p-5">
            <button
              onClick={handleReveal}
              className="w-full py-3.5 bg-slate-100 text-slate-600 font-semibold rounded-xl active:scale-95 transition-transform text-sm"
            >
              뜻 보기
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="text-center mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                뜻
              </p>
              <p className="text-xl font-semibold text-slate-700">{currentWord.meaning}</p>
              {currentWord.example && (
                <p className="mt-3 text-sm text-slate-400 italic leading-relaxed">
                  &ldquo;{currentWord.example}&rdquo;
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-3.5 bg-red-50 text-red-500 font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span className="text-xl">❌</span>
                <span>몰라</span>
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-3.5 bg-green-50 text-green-600 font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span className="text-xl">✅</span>
                <span>알아</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mini stats */}
      <div className="flex gap-3 mt-3">
        <div className="flex-1 bg-green-50 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-600">{sessionCorrect}</p>
          <p className="text-xs text-green-400">알았어</p>
        </div>
        <div className="flex-1 bg-red-50 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-bold text-red-500">{sessionWrong}</p>
          <p className="text-xs text-red-400">몰랐어</p>
        </div>
      </div>
    </div>
  );
}

function ModeSelector({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const modes: { key: Mode; label: string }[] = [
    { key: "today", label: "오늘" },
    { key: "all", label: "전체" },
    { key: "wrong", label: "틀린 것" },
  ];
  return (
    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === m.key
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
