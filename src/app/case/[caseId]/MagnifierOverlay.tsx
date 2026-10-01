"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import type { ClueItem } from "@/lib/clues";
import type { StationKey } from "@/lib/stations";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";
import CluePhoto from "./CluePhoto";

// 読み取りの間隔と、解析用に縮小する映像の最大辺（端末の負荷を抑えるため）
const SCAN_INTERVAL_MS = 250;
const SCAN_MAX_DIMENSION = 640;

type ScanState =
  | { kind: "scanning" }
  | { kind: "checking" }
  | { kind: "found"; clue: ClueItem; caseTitle: string; isNew: boolean }
  | { kind: "failed"; message: string };

// レンズ（丸）の寸法（6.0インチ程度のモバイル画面幅を想定したサイズ）
const LENS_LEFT = 16;
const LENS_TOP = 10;
const LENS_SIZE = 220;
const RIM_THICKNESS = 13; // 縁を少し細くし、ガラス部分を相対的に大きく見せる
const LENS_RADIUS = LENS_SIZE / 2;
const LENS_CENTER_X = LENS_LEFT + LENS_RADIUS;
const LENS_CENTER_Y = LENS_TOP + LENS_RADIUS;

// 持ち手（レンズの縁の1点を起点に、外向きに回転させる）
const HANDLE_ANGLE_DEG = 45;
const HANDLE_WIDTH = 20;
const COLLAR_LENGTH = 15; // 金の接続部
const WOOD_LENGTH = 100; // 木製の持ち手
const HANDLE_INSET = 6; // 縁の少し内側を起点にして継ぎ目の隙間をなくす

const angleRad = (HANDLE_ANGLE_DEG * Math.PI) / 180;
const HANDLE_ANCHOR_X = LENS_CENTER_X + (LENS_RADIUS - HANDLE_INSET) * Math.cos(angleRad);
const HANDLE_ANCHOR_Y = LENS_CENTER_Y + (LENS_RADIUS - HANDLE_INSET) * Math.sin(angleRad);

const ICON_WIDTH = 310;
const ICON_HEIGHT = 300;

export default function MagnifierOverlay({
  caseId,
  onClose,
}: {
  caseId: StationKey;
  onClose: () => void;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>({ kind: "scanning" });

  const onQrDetected = useEffectEvent(async (qrText: string) => {
    setScanState({ kind: "checking" });

    const response = await fetch("/api/clues/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrText }),
    }).catch(() => null);
    const data = await response?.json().catch(() => null);

    if (!response?.ok || !data?.clue) {
      setScanState({ kind: "failed", message: data?.error ?? "読み取りに失敗しました。もう一度試してください。" });
      return;
    }

    setScanState({ kind: "found", clue: data.clue, caseTitle: data.caseTitle, isNew: data.isNew });
    if (data.isNew) {
      // 背後の手がかり一覧を最新の発見状況で描画し直す
      router.refresh();
    }
  });

  // 映像のフレームを定期的に切り出してQRコードを探す
  useEffect(() => {
    if (scanState.kind !== "scanning" || error) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    const timer = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < video.HAVE_ENOUGH_DATA || !video.videoWidth) return;

      const scale = Math.min(1, SCAN_MAX_DIMENSION / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
      if (code?.data) {
        clearInterval(timer);
        onQrDetected(code.data);
      }
    }, SCAN_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [scanState.kind, error]);

  function resumeScanning() {
    setScanState({ kind: "scanning" });
  }

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) {
          setError("カメラを起動できませんでした。ブラウザのカメラ利用許可を確認してください。");
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <button className="icon-button" onClick={onClose} style={closeButtonStyle} aria-label="閉じる">
        <CloseIcon />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: ICON_WIDTH, height: ICON_HEIGHT }}
      >
        {/* 縁（銀色の金属リング） */}
        <div
          style={{
            position: "absolute",
            top: LENS_TOP,
            left: LENS_LEFT,
            width: LENS_SIZE,
            height: LENS_SIZE,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 32% 28%, #f5f5f5 0%, #cfcfcf 35%, #8c8c8c 65%, #4a4a4a 90%, #2c2c2c 100%)",
            boxShadow: "0 3px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* レンズ内側（丸くクリップしたカメラ映像） */}
          <div
            style={{
              position: "absolute",
              inset: RIM_THICKNESS,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#111",
            }}
          >
            {error ? (
              <p style={{ color: "white", fontSize: 14, padding: 12, textAlign: "center" }}>{error}</p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            {/* ガラスの光沢ハイライト */}
            <div
              style={{
                position: "absolute",
                top: "8%",
                left: "14%",
                width: "55%",
                height: "26%",
                background: "rgba(255, 255, 255, 0.35)",
                borderRadius: "50%",
                filter: "blur(6px)",
                transform: "rotate(-15deg)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/*
          持ち手（金の接続部 + 木製グリップ）。
          transform-originを回転の不動点にできるよう、要素の左上をあらかじめ
          「アンカー座標 - 幅の半分」に置いてから回転する（translateとの組み合わせによる
          回転方向のズレを避けるため）。CSSのrotate()は画面座標（x:右, y:下）で時計回りに
          角度を加算するため、真下（90°相当）から目的の角度(HANDLE_ANGLE_DEG)へ向けるには
          差分の (HANDLE_ANGLE_DEG - 90) 度だけ回転させる。
        */}
        <div
          style={{
            position: "absolute",
            left: HANDLE_ANCHOR_X - HANDLE_WIDTH / 2,
            top: HANDLE_ANCHOR_Y,
            width: HANDLE_WIDTH,
            transform: `rotate(${HANDLE_ANGLE_DEG - 90}deg)`,
            transformOrigin: "top center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: COLLAR_LENGTH,
              background: "linear-gradient(90deg, #9c7a1f, #f0d878 45%, #9c7a1f)",
            }}
          />
          <div
            style={{
              width: "100%",
              height: WOOD_LENGTH,
              background: "linear-gradient(90deg, #5c3818, #9c6b3e 45%, #5c3818 75%, #3f2611)",
              borderRadius: `0 0 ${HANDLE_WIDTH / 2}px ${HANDLE_WIDTH / 2}px`,
            }}
          />
        </div>
      </div>

      <ScanResult state={scanState} caseId={caseId} onResume={resumeScanning} />
    </div>
  );
}

function ScanResult({
  state,
  caseId,
  onResume,
}: {
  state: ScanState;
  caseId: StationKey;
  onResume: () => void;
}) {
  if (state.kind === "scanning" || state.kind === "checking") {
    return (
      <p style={{ color: "white", fontSize: 15, textAlign: "center", maxWidth: 280 }}>
        {state.kind === "scanning" ? "レンズの中に現地のQRコードを写してください" : "調べています..."}
      </p>
    );
  }

  let heading: string;
  if (state.kind === "failed") {
    heading = state.message;
  } else if (!state.isNew) {
    heading = "この手がかりはもう見つけている";
  } else if (state.clue.caseId !== caseId) {
    heading = `「${state.caseTitle}」の手がかりを発見！`;
  } else {
    heading = "手がかりを発見！";
  }

  return (
    <div
      className="surface-panel"
      onClick={(e) => e.stopPropagation()}
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: 16,
        width: "100%",
        maxWidth: 300,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 16, fontWeight: 700 }}>{heading}</p>
      {state.kind === "found" && (
        <>
          {state.clue.image && (
            <div style={{ background: "#ffffff", padding: 5, borderRadius: 2 }}>
              <CluePhoto clue={state.clue} iconSize={64} sizes="300px" />
            </div>
          )}
          <p style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: 16 }}>{state.clue.name}</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, textAlign: "left" }}>{state.clue.description}</p>
        </>
      )}
      <button className="button-secondary" onClick={onResume}>
        続けて調べる
      </button>
    </div>
  );
}
