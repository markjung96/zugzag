import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: "ZUGZAG - 클라이밍 크루 일정관리",
  description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZUGZAG",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "ZUGZAG",
    title: "ZUGZAG - 클라이밍 크루 일정관리",
    description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요",
  },
  twitter: {
    card: "summary",
    title: "ZUGZAG - 클라이밍 크루 일정관리",
    description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
