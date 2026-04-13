"use client";

import { useEffect, useRef, useState } from "react";
import { requestNotificationPermission, getRandomWordForNotification } from "@/lib/storage";

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export default function NotificationManager() {
  const [permitted, setPermitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        swRef.current = reg;
      })
      .catch(console.error);

    const perm = localStorage.getItem("notif_permitted");
    if (perm === "true") setPermitted(true);
  }, []);

  useEffect(() => {
    if (!permitted) return;

    const sendNotification = () => {
      const word = getRandomWordForNotification();
      if (!word || !swRef.current) return;
      swRef.current.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        word: word.english,
        meaning: word.meaning,
        example: word.example,
      });
    };

    timerRef.current = setInterval(sendNotification, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [permitted]);

  const handleEnable = async () => {
    const ok = await requestNotificationPermission();
    if (ok) {
      setPermitted(true);
      localStorage.setItem("notif_permitted", "true");
    } else {
      alert("알림 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.");
    }
  };

  if (permitted) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between text-sm">
      <span className="text-xs">🔔 30분마다 단어 알림 받기</span>
      <button
        onClick={handleEnable}
        className="bg-white text-blue-600 rounded-full px-3 py-1 text-xs font-semibold shrink-0 ml-2"
      >
        허용
      </button>
    </div>
  );
}
