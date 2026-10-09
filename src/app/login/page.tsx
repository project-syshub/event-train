"use client";

// 【役割】ログイン画面（/login）。IDとパスワードを /api/login に送り、成功したらホームへ移動する。
//
// 【変更すると】
//  - router.push("/home") … ログイン後に移動するページ
//  - 見出し・ラベルの文言 … 画面の表示が変わる
//  - イベントのロゴ … public/images/event-logo.png（ログイン欄の下、画面の下部に表示する。大きさは Image の style の width）
//  - アカウント自体は users.ts、エラー文言は api/login/route.ts で変える

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    // 画面の高さいっぱいを使い、ログイン欄を真ん中あたりに、イベントのロゴを下部に置く
    <main
      style={{
        width: "100%",
        maxWidth: 420,
        minHeight: "100dvh",
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ログイン欄（上下の余白を同じにして、画面の真ん中あたりに置く） */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          className="surface-panel"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: 28,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h1 style={{ marginBottom: 24, fontSize: 26, textAlign: "center" }}>ログイン</h1>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label htmlFor="loginId" style={{ display: "block", marginBottom: 8, fontSize: 15 }}>
                ID
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                autoComplete="username"
                // スマホが先頭を大文字にしたり、自動修正したりしないようにする
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: "block", marginBottom: 8, fontSize: 15 }}>
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>
            {error && (
              <p role="alert" style={{ color: "var(--color-danger)", fontSize: 15 }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>

      {/* イベントのロゴ（画面の下部） */}
      <Image
        src="/images/event-logo.png"
        alt="親子で挑戦！謎解きイベント かけだし市電探偵！ 2026年10月11日（日）12:30〜"
        width={1200}
        height={725}
        preload
        sizes="260px"
        // ロゴの大きさ（width を変えると大きさが変わる。画面の幅の 70% を超えないようにする）
        style={{ width: "min(260px, 70%)", height: "auto", margin: "24px auto 0" }}
      />
    </main>
  );
}
