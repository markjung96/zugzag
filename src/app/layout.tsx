import { Geist, Geist_Mono } from "next/font/google";

import { QueryProvider } from "@/providers/query-provider";

import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZUGZAG - 클라이밍 크루 관리",
  description: "함께 오르는 즐거움, ZUGZAG 클라이밍 크루",
  openGraph: {
    title: "ZUGZAG - 클라이밍 크루 관리",
    description: "함께 오르는 즐거움, ZUGZAG 클라이밍 크루",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZUGZAG 클라이밍 크루 관리 어플",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZUGZAG - 클라이밍 크루 관리",
    description: "함께 오르는 즐거움, ZUGZAG 클라이밍 크루",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
