import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const sourceSans = localFont({
  src: [
    { path: "../../public/fonts/source_regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/source_regular_italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/source_medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/source_medium_italic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/source_bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/source_bold_italic.ttf", weight: "700", style: "italic" },
    { path: "../../public/fonts/source_extrabold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/source_extrabold_italic.ttf", weight: "800", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const ttTrailers = localFont({
  src: [
    { path: "../../public/fonts/trailers_regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/trailers_medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/trailers_demibold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/trailers_bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/trailers_extrabold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/trailers_black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KAMEN!CE — Harmonogram 2026",
  description: "Osobní harmonogram pro festival KAMEN!CE 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={cn("h-full antialiased", sourceSans.variable, ttTrailers.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
