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
  title: "AnalysisTrend — 경제·시사 트렌드 플랫폼",
  description: "경제·시사 유튜브 채널의 공식 통합 플랫폼. 커뮤니티, 쇼핑, 방송 일정, 트렌드 분석을 한 곳에서.",
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
