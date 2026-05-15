import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { PwaRegister } from "@/components/providers/pwa-register";
import { AppShell } from "@/components/shell/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Iman's Music",
  description:
    "Spotify-inspired music streaming app powered by official YouTube APIs.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0f14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          <PwaRegister />
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
