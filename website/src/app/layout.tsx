import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Libertas | Freedom Tech Research & Publishing",
  description:
    "Automated, privacy-preserving research and publishing platform for Freedom Tech. Converting global signals about sovereignty, censorship resistance, and civil liberties into actionable insights.",
  keywords: [
    "freedom tech",
    "privacy",
    "censorship resistance",
    "bitcoin",
    "zero knowledge",
    "sovereignty",
  ],
  openGraph: {
    title: "Libertas | Freedom Tech Research & Publishing",
    description:
      "Automated, privacy-preserving research and publishing platform for Freedom Tech.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Libertas | Freedom Tech Research & Publishing",
    description:
      "Automated, privacy-preserving research and publishing platform for Freedom Tech.",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
