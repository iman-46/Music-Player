"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Home,
  Library,
  Search,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlayerBar } from "@/components/player/player-bar";
import { KeyboardShortcuts } from "@/components/player/keyboard-shortcuts";
import { clsx } from "clsx";

const nav = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/liked", icon: Heart, label: "Liked" },
  { href: "/profile", icon: UserRound, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/admin", icon: Shield, label: "Admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen pb-32 text-foreground lg:pl-72">
      <KeyboardShortcuts />
      <aside className="glass fixed bottom-0 left-0 top-0 z-30 hidden w-72 flex-col gap-8 p-6 lg:flex">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-black tracking-normal"
        >
          <img src="/icon-192.png" alt="Iman's Music" className="h-11 w-11 rounded-xl shadow-lg" />
          Iman's Music
        </Link>
        <nav className="space-y-2">
          {nav.map((item) => (
            <NavItem
              key={item.href}
              active={pathname === item.href}
              {...item}
            />
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-muted">
          Legal playback mode uses YouTube embeds and official API metadata. No
          music files are hosted by this app.
        </div>
      </aside>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-8 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {children}
        </motion.div>
      </main>

      <nav className="glass fixed inset-x-3 bottom-24 z-40 grid grid-cols-5 gap-1 rounded-lg p-2 lg:hidden">
        {nav.slice(0, 5).map((item) => (
          <NavItem
            key={item.href}
            compact
            active={pathname === item.href}
            {...item}
          />
        ))}
      </nav>
      <PlayerBar />
    </div>
  );
}

function NavItem({
  active,
  compact,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  compact?: boolean;
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-muted transition hover:bg-white/10 hover:text-white",
        active && "bg-white/12 text-white",
        compact && "justify-center px-2",
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
      {!compact && <span>{label}</span>}
    </Link>
  );
}
