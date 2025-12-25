import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CutBack - Video Feedback & Approval Tool",
  description: "The go-to video feedback and approval tool for solo editors and small creative teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

