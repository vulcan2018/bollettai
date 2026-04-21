import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BollettAI - Analisi Intelligente delle Bollette Energia",
  description: "Carica la tua bolletta e scopri se stai pagando troppo. Analisi AI gratuita per PMI italiane.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
