import type { Metadata } from "next";
import { Onest } from "next/font/google";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${onest.variable} min-h-screen w-full text-[#111111] antialiased`}
      style={{ fontFamily: "var(--font-onest), sans-serif" }}
    >
      {children}
    </div>
  );
}
