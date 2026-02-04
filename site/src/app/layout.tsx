import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Losey.Co — Engineering Excellence",
  description: "Technical services spanning motorsport engineering, medical systems, and software development. From proton therapy installations to IndyCar trackside support.",
  keywords: ["engineering", "motorsport", "IndyCar", "software development", "Losey.Co", "GridPass"],
  authors: [{ name: "Patrick Losey" }],
  openGraph: {
    title: "Losey.Co — Engineering Excellence",
    description: "Technical services spanning motorsport engineering, medical systems, and software development.",
    url: "https://losey.co",
    siteName: "Losey.Co",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@loseyco",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
