import type { Metadata } from "next";
import { Unbounded, Inter } from "next/font/google";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "AI-психолог — прототип",
  description: "Кликабельный прототип Telegram Mini App",
};

export default function PrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${unbounded.variable} ${inter.variable} min-h-screen w-full tracking-normal text-[#111111]`}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {children}
    </div>
  );
}
