"use client";

import { AuthPanel } from "@/components/auth/auth-panel";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileView() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return <AuthPanel />;

  return (
    <div>
      <PageHeader eyebrow="Profile" title={user.displayName}>
        <button
          className="rounded-full bg-white px-5 py-3 font-black text-background"
          onClick={logout}
        >
          Log out
        </button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Email" value={user.email} />
        <Stat label="Role" value={user.role} />
        <Stat label="Theme" value={user.theme} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}
