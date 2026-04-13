"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "입력", icon: "✏️" },
  { href: "/flashcard", label: "플래시카드", icon: "🃏" },
  { href: "/stats", label: "통계", icon: "📊" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-2xl mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-t-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
