import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";

/**
 * Fonts are loaded with next/font, which self-hosts them at build time (faster,
 * no layout shift) and exposes each as a CSS variable our tokens reference.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
});
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});
const voice = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-voice",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  // Absolute base for Open Graph URLs. Set NEXT_PUBLIC_SITE_URL to the
  // deployed domain (e.g. https://beanthere.example.com) in production.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Bean There — Manchester coffee, rated",
  description:
    "Two people drinking their way round Manchester's cafés and scoring them so you don't have to gamble your flat white money.",
  openGraph: {
    siteName: "Bean There",
    type: "website",
    title: "Bean There — Manchester coffee, rated",
    description:
      "Two people drinking their way round Manchester's cafés and scoring them so you don't have to gamble your flat white money.",
  },
  twitter: { card: "summary_large_image" },
};

// Ensures mobile browsers render at device width instead of a zoomed-out
// desktop width. Without this the whole page looks shrunk on phones.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${voice.variable}`}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
