import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AI-психолог — интерактивный прототип",
  description: "Кликабельный Telegram Mini App прототип психологического ИИ-сопровождения.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
