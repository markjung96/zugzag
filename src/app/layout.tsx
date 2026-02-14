import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  metadataBase: new URL("https://zugzag.vercel.app"),
  title: {
    default: "ZUGZAG - 클라이밍 크루 일정관리",
    template: "%s | ZUGZAG",
  },
  description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요. 출석 관리, RSVP, 일정 공유를 한 곳에서.",
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
    description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요. 출석 관리, RSVP, 일정 공유를 한 곳에서.",
    url: "https://zugzag.vercel.app",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "ZUGZAG - 클라이밍 크루 일정관리",
    description: "클라이밍 크루 일정을 쉽고 간편하게 관리하세요. 출석 관리, RSVP, 일정 공유를 한 곳에서.",
  },
  alternates: {
    canonical: "https://zugzag.vercel.app",
  },
  keywords: ["클라이밍", "크루", "일정관리", "출석", "RSVP", "볼더링", "climbing"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
