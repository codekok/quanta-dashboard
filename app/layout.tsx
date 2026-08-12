import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "廣達游於智教育影響力地圖",
  description: "呈現廣達《游於智》計畫與廣達游智盃的教育參與足跡與成果。",
  other: { "codex-preview": "development" },
  icons: { icon: "./favicon.svg", shortcut: "./favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
