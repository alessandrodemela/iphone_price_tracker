import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iPhone Price Tracker",
  description: "Monitoraggio prezzi iPhone 16 Pro e Pro Max",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
