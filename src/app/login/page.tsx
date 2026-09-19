"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId, password }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "ログインに失敗しました");
      return;
    }

    router.push("/home");
  }

  return (
    <main style={{ maxWidth: 320, margin: "80px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: 32,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        }}
      >
        <h1 style={{ marginBottom: 28, textAlign: "center" }}>ログイン</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label htmlFor="loginId" style={{ display: "block", marginBottom: 8 }}>
              ID
            </label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              style={{ display: "block", width: "100%", boxSizing: "border-box" }}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: 8 }}>
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ display: "block", width: "100%", boxSizing: "border-box" }}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p role="alert" style={{ color: "var(--color-danger)" }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
