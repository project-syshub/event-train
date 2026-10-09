// 【役割】全ページ共通の外枠（ページタイトル・フォント・ブラウザのアドレスバーの色）。
//
// 【変更すると】
//  - metadata.title / description … ブラウザのタブや検索結果に出るサイト名と説明
//  - themeColor … スマホのアドレスバーの色。globals.css の --color-bg と同じ色にしておく（違うと境目が見える）
//  - Google Fonts のURL … 全ページのフォントが変わる（globals.css の font-family も合わせる）

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morigen",
  description: "札幌市電を舞台にした探偵風Webアプリ",
};

// スマホのブラウザ（Safari等）はアドレスバー部分をページの背景色に合わせて着色するため、
// テクスチャの基調色と明示的に一致させ、境目が目立たないようにする
export const viewport: Viewport = {
  themeColor: "#e2542a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- ルートレイアウトなので全ページに適用される */}
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
