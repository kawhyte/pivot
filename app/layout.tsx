import type { Metadata } from "next";
import { Bungee, Quicksand, Alegreya } from "next/font/google"; // New festive fonts
import "./globals.css";
import { QuestHydration } from "@/components/QuestHydration";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

// Headline font
const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
});

// Rounded UI font
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

// Hand-drawn accent font
const alegreya = Alegreya({
  subsets: ["latin"],
  variable: "--font-alegreya",
});

export const metadata: Metadata = {
  title: "Birthday Quest | The Vault",
  description: "A special birthday puzzle adventure",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bungee.variable} ${quicksand.variable} ${alegreya.variable} font-sans antialiased`}
      >
        <Suspense fallback={null}>
          <QuestHydration />
        </Suspense>
        {children}
        <Toaster />
      </body>
    </html>
  );
}