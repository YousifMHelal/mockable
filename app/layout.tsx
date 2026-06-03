import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mockable — AI Mock Interviews",
  description:
    "Practice mock interviews powered by AI voice. Get scored feedback instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${jakarta.variable} ${inter.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
