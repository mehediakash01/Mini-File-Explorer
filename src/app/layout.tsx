import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "NexusDrive | High-Performance Cloud File Explorer",
  description: "A lightning-fast, client-side virtual file management workspace built with React, TypeScript, and flat-state data architectures.",
  keywords: ["File Explorer", "Virtual File System", "Next.js File Manager", "MERN Stack UI", "Tailwind CSS Layout"],
  openGraph: {
    title: "NexusDrive | High-Performance Cloud File Explorer",
    description: "A lightning-fast, client-side virtual file management workspace built with React, TypeScript, and flat-state data architectures.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2225%22 fill=%22%230F172A%22/><path d=%22M30 35h25l10 10h15v25H30z%22 fill=%22none%22 stroke=%22%236366F1%22 stroke-width=%226%22 stroke-linejoin=%22round%22/><circle cx=%2245%22 cy=%2255%22 r=%224%22 fill=%22%2322C55E%22/></svg>"/>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
