"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response =
        mode === "login"
          ? await authApi.login(email, password)
          : await authApi.register(
              displayName || email.split("@")[0],
              email,
              password,
            );
      setAuth(response.token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <form onSubmit={submit} className="glass mx-auto max-w-md rounded-lg p-6">
      <h2 className="text-2xl font-black">
        {mode === "login" ? "Welcome back" : "Create account"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Persistent JWT sessions are stored locally for this demo build.
      </p>
      <div className="mt-5 space-y-3">
        {mode === "register" && (
          <Input
            label="Display name"
            value={displayName}
            onChange={setDisplayName}
          />
        )}
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />
      </div>
      {error && (
        <p className="mt-3 rounded-md bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      )}
      <button className="mt-5 w-full rounded-full bg-primary px-5 py-3 font-black text-background transition hover:brightness-110">
        {mode === "login" ? "Log in" : "Sign up"}
      </button>
      <button
        className="mt-4 w-full text-sm font-semibold text-muted hover:text-white"
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Need an account?" : "Already have an account?"}
      </button>
    </form>
  );
}

function Input({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold text-muted">
      <span>{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-primary"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
