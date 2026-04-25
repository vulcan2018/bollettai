import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BollettAI - Intelligenza Energetica per PMI Italiane",
  description: "Analizziamo le bollette della tua azienda con AI per identificare errori di fatturazione, costi nascosti e opportunità di risparmio. Per PMI con spesa energetica da €2.000 a €15.000/mese.",
  openGraph: {
    title: "BollettAI - Intelligenza Energetica per PMI Italiane",
    description: "Analisi AI delle bollette aziendali. Identifichiamo errori, costi nascosti e opportunità di risparmio.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${dmSans.variable} ${dmSerif.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
