import type React from "react";
import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { AppProviders } from "@/components/providers/app-providers";
import { BRAND } from "@/lib/constants";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  icons: {
    icon: [{ url: "/vortyx-mark.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
