import type { Metadata } from "next";
import { Manrope, Wix_Madefor_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const wixDisplay = Wix_Madefor_Display({
  variable: "--font-wix-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI-психолог — интерактивный прототип",
  description: "Кликабельный Telegram Mini App прототип психологического AI-сопровождения.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} ${wixDisplay.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
