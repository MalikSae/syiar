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
  title: "SyiarLink — Platform Manajemen Agen & Afiliasi Umroh",
  description: "SaaS multi-tenant untuk travel umroh mengelola jaringan agen, referral, dan komisi",
  icons: {
    icon: "/syiarlink-icon.png",
    shortcut: "/syiarlink-icon.png",
    apple: "/syiarlink-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
