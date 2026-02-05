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
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Losey.Co — Engineering Excellence",
    description: "Technical services spanning motorsport engineering, medical systems, and software development.",
    url: "https://losey.co",
    siteName: "Losey.Co",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Losey.Co - Engineering Excellence",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@loseyco",
    title: "Losey.Co — Engineering Excellence",
    description: "Technical services spanning motorsport engineering, medical systems, and software development.",
    images: ["/og-image.png"],
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
