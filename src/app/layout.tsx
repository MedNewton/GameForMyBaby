import type { Metadata } from "next";
import { Pixelify_Sans, Quicksand } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const pixelFont = Pixelify_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-pixel",
});

const bodyFont = Quicksand({
  subsets: ["latin"],
  variable: "--font-body",
});

const blumFont = localFont({
  src: [
    { path: "../../public/assets/fonts/Blum-Normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/Blum-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-blum",
});

export const metadata: Metadata = {
  title: "SafSaf Love Journey",
  description: "A cute love story adventure for SafSaf & Meedo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} ${bodyFont.variable} ${blumFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
