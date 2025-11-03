import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrganizationSchema, WebsiteSchema } from "../components/structured-data";
import { Providers } from "../components/providers";
import { LayoutWrapper } from "../components/layout-wrapper";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://mindreaderbio.tech'),
  title: {
    default: "MindReaderBio - Bridging Science and Markets in Biotechnology",
    template: "%s | MindReaderBio"
  },
  description: "Biotech intelligence platform providing scientifically credible insights through cutting-edge analytics and market research for investors and industry professionals.",
  keywords: ["biotech", "biotechnology", "market analysis", "FDA clinical developments", "biotech insights", "scientific research", "pharmaceutical", "drug discovery", "clinical trials"],
  authors: [{ name: "MindReader Enterprises", url: "https://mindreaderbio.tech" }],
  creator: "MindReader Enterprises",
  publisher: "MindReader Enterprises",
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
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mindreaderbio.tech",
    siteName: "MindReaderBio",
    title: "MindReaderBio - Biotech Intelligence Platform",
    description: "Bridging Science and Markets in Biotechnology through advanced analytics and market research.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MindReaderBio - Biotech Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MindReaderBio - Biotech Intelligence Platform",
    description: "Bridging Science and Markets in Biotechnology",
    images: ["/og-image.png"],
    creator: "@mindreaderbio",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden relative`}
      >
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
        
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-500 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Structured Data */}
        <OrganizationSchema />
        <WebsiteSchema />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
