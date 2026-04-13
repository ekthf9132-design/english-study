self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { word, meaning, example } = event.data;
    self.registration.showNotification("📚 영어 단어 퀴즈!", {
      body: `"${word}" 의 뜻은 무엇일까요?\n정답: ${meaning}${example ? `\n예문: ${example}` : ""}`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "vocab-quiz",
      renotify: true,
      requireInteraction: false,
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/");
      }
    })
  );
});
