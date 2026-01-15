import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ultimate Tiebreak - Tennis Tournament Manager",
  description: "Random pairings, live updates, and elimination tracking for tennis tournaments",
  icons: {
    icon: [
      { url: "/padel39.png", sizes: "39x39", type: "image/png" },
      { url: "/padel39.png", sizes: "any", type: "image/png" }
    ],
    shortcut: "/padel39.png",
    apple: [
      { url: "/padel39.png", sizes: "39x39", type: "image/png" }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </Providers>
  );
}
