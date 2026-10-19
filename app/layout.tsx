import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 💡 브라우저 탭에 표시될 이름과 설명을 퀴즈 앱에 맞게 수정했습니다.
export const metadata: Metadata = {
  title: "니케 퀴즈",
  description: "승리의 여신: 니케 이름 맞추기 퀴즈",
};

// 💡 TypeScript 에러 방지를 위해 기본 제공되는 표준 타입으로 정리했습니다.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko" // 영어(en)에서 한국어(ko)로 변경
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* 💡 화면을 렌더링하는 body 안쪽 최하단에 Analytics 컴포넌트 추가 완료 */}
        <Analytics />
      </body>
    </html>
  );
}