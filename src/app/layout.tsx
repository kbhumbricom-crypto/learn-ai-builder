import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CursorGlow from "./CursorGlow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://learn-ai-landing.vercel.app'),
  title: "Learn.ai",
  description: "Learn any course, in your instructor's voice.",
  openGraph: {
    title: "Learn.ai - Personalized Learning",
    description: "Learn any course, in your instructor's voice.",
    url: 'https://learn-ai-landing.vercel.app',
    siteName: 'Learn.ai',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Learn.ai Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Learn.ai",
    description: "Learn any course, in your instructor's voice.",
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: "#07050A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
