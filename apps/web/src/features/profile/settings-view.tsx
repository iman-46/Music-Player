"use client";

import { Moon, Timer, Volume2 } from "lucide-react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth-store";
import { usePlayerStore } from "@/stores/player-store";

export function SettingsView() {
  const user = useAuthStore((state) => state.user);
  const player = usePlayerStore();

  if (!user) return <AuthPanel />;

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Playback and theme" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Control
          icon={Volume2}
          label="Crossfade"
          value={`${player.crossfadeSeconds}s`}
        >
          <input
            className="w-full accent-primary"
            min={0}
            max={12}
            type="range"
            value={player.crossfadeSeconds}
            onChange={(event) =>
              player.setCrossfade(Number(event.target.value))
            }
          />
        </Control>
        <Control
          icon={Timer}
          label="Sleep timer"
          value={
            player.sleepTimerMinutes ? `${player.sleepTimerMinutes}m` : "Off"
          }
        >
          <select
            className="w-full rounded-lg bg-black/30 p-3"
            value={player.sleepTimerMinutes ?? ""}
            onChange={(event) =>
              player.setSleepTimer(
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          >
            <option value="">Off</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">60 min</option>
          </select>
        </Control>
        <Control icon={Moon} label="Theme" value={user.theme}>
          <div className="grid grid-cols-3 gap-2">
            {["spotify", "midnight", "contrast"].map((theme) => (
              <span
                key={theme}
                className="rounded-md bg-white/10 px-3 py-2 text-center text-sm capitalize"
              >
                {theme}
              </span>
            ))}
          </div>
        </Control>
      </div>
    </div>
  );
}

function Control({
  children,
  icon: Icon,
  label,
  value,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="font-black">{label}</h2>
        </div>
        <span className="text-sm text-muted">{value}</span>
      </div>
      {children}
    </section>
  );
}
