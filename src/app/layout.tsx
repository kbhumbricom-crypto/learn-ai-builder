import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CursorGlow from "./CursorGlow";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

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
  title: "LearnAI",
  description: "Turn any syllabus into a deeply personalized course taught in the style of your favorite expert.",
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#FF5A1F',
          colorBackground: '#0D0907',
          colorText: '#f5efe6',
        }
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <CursorGlow />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
