import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gallery.hanzo.ai'),
  title: {
    default: "Hanzo Templates Gallery - 75+ Premium UI/UX Templates",
    template: "%s | Hanzo Templates",
  },
  description: "Browse 75+ production-ready templates built with Next.js, React, and modern frameworks. Free, open-source templates for SaaS, portfolios, dashboards, blogs, and more. Deploy instantly to Hanzo Cloud.",
  keywords: [
    "Next.js templates",
    "React templates",
    "UI templates",
    "SaaS templates",
    "portfolio templates",
    "dashboard templates",
    "blog templates",
    "free templates",
    "open source templates",
    "Hanzo templates",
    "web templates",
    "modern UI",
    "responsive templates",
    "TypeScript templates",
  ],
  authors: [{ name: "Hanzo AI", url: "https://hanzo.ai" }],
  creator: "Hanzo AI",
  publisher: "Hanzo AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gallery.hanzo.ai",
    title: "Hanzo Templates Gallery - 75+ Premium UI/UX Templates",
    description: "Browse 75+ production-ready templates built with Next.js, React, and modern frameworks. Free, open-source templates for SaaS, portfolios, dashboards, blogs, and more.",
    siteName: "Hanzo Templates Gallery",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hanzo Templates Gallery - Premium Templates Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanzo Templates Gallery - 75+ Premium UI/UX Templates",
    description: "Browse 75+ production-ready templates built with Next.js, React, and modern frameworks. Deploy instantly to Hanzo Cloud.",
    images: ["/twitter-image.png"],
    creator: "@hanzoai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
