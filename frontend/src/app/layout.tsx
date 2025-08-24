import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaChat - Enterprise Chat Platform",
  description: "Modern chat platform built with Next.js and Laravel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark" style={{
      '--background': '222.2 84% 4.9%',
      '--foreground': '210 40% 98%',
      '--chat-bg': '222.2 84% 4.9%',
      '--chat-sidebar': '217.2 32.6% 17.5%',
      '--chat-text': '210 40% 98%'
    } as React.CSSProperties}>
      <body className={`${inter.className} h-full antialiased bg-[hsl(222.2_84%_4.9%)] text-[hsl(210_40%_98%)]`}>
        {children}
      </body>
    </html>
  );
}
