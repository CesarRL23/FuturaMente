import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
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
  title: {
    default: "MONLINE — Monitorías académicas",
    template: "%s · MONLINE",
  },
  description:
    "MONLINE conecta estudiantes que necesitan refuerzo académico con profesores que ofrecen monitorías.",
  applicationName: "MONLINE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
