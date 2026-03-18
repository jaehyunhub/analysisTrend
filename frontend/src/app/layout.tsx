import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ModalProvider from "./ModalProvider";
import { ToastContainer } from "@/shared/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnalysisTrend - 트렌드 분석 플랫폼",
  description: "뉴스 키워드·YouTube 트렌딩·채팅 분석을 통한 실시간 트렌드 인사이트. 커뮤니티, 쇼핑, 방송 일정을 한 곳에서.",
  keywords: ["트렌드 분석", "유튜브 트렌딩", "뉴스 키워드", "채팅 분석", "경제", "시사"],
  openGraph: {
    title: "AnalysisTrend - 트렌드 분석 플랫폼",
    description: "실시간 트렌드 분석 플랫폼",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ModalProvider />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
