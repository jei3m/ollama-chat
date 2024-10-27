import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const encodeSans = localFont({
  src: "./fonts/EncodeSans.woff",
  variable: "--font-encode-sans",
  weight: "100 900",
});

const encodeSansBold = localFont({
  src: "./fonts/EncodeSansBold.woff",
  variable: "--font-encode-sansbold",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Ollama Chat",
  description: "AI Chat UI for Ollama Models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${encodeSans.variable} ${encodeSansBold.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
