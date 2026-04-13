import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import NotificationManager from "@/components/NotificationManager";

export const metadata: Metadata = {
  title: "영어 단어 암기",
  description: "매일 영어 단어를 입력하고 플래시카드로 복습하세요",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto">
          <NotificationManager />
        </div>
        <main className="max-w-md mx-auto pb-20 pt-2 min-h-screen">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
