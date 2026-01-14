import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://libertas.fgu.tech";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Libertas | Freedom Tech Research & Publishing",
    template: "%s | Libertas",
  },
  description:
    "Automated, privacy-preserving research and publishing platform for Freedom Tech. Converting global signals about sovereignty, censorship resistance, and civil liberties into actionable insights.",
  keywords: [
    "freedom tech",
    "privacy",
    "censorship resistance",
    "bitcoin",
    "zero knowledge",
    "sovereignty",
    "civil liberties",
    "decentralization",
  ],
  authors: [{ name: "Freedom Go Up", url: "https://github.com/FGUTech" }],
  creator: "Freedom Go Up",
  publisher: "Libertas",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Libertas",
    title: "Libertas | Freedom Tech Research & Publishing",
    description:
      "Automated, privacy-preserving research and publishing platform for Freedom Tech.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Libertas - Freedom Tech Research Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Libertas | Freedom Tech Research & Publishing",
    description:
      "Automated, privacy-preserving research and publishing platform for Freedom Tech.",
    images: ["/og-image.png"],
    creator: "@FGUTech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/insights-rss.xml`,
      "application/json": `${siteUrl}/insights-feed.json`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash by setting theme before render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('libertas-theme');
                  if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Additional feed links for digest feeds */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Libertas Weekly Digests (RSS)"
          href="/digests-rss.xml"
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title="Libertas Weekly Digests (JSON)"
          href="/digests-feed.json"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Header />
        <main className="min-h-[calc(100vh-16rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
