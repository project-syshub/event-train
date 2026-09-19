"use client";

import { useEffect, useRef, useState } from "react";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";

// レンズ（丸）の寸法
const LENS_LEFT = 20;
const LENS_TOP = 15;
const LENS_SIZE = 280;
const RIM_THICKNESS = 14; // 縁を少し細くし、ガラス部分を相対的に大きく見せる
const LENS_RADIUS = LENS_SIZE / 2;
const LENS_CENTER_X = LENS_LEFT + LENS_RADIUS;
const LENS_CENTER_Y = LENS_TOP + LENS_RADIUS;

// 持ち手（レンズの縁の1点を起点に、外向きに回転させる）
const HANDLE_ANGLE_DEG = 45;
const HANDLE_WIDTH = 26;
const COLLAR_LENGTH = 20; // 金の接続部
const WOOD_LENGTH = 140; // 木製の持ち手
const HANDLE_INSET = 6; // 縁の少し内側を起点にして継ぎ目の隙間をなくす

const angleRad = (HANDLE_ANGLE_DEG * Math.PI) / 180;
const HANDLE_ANCHOR_X = LENS_CENTER_X + (LENS_RADIUS - HANDLE_INSET) * Math.cos(angleRad);
const HANDLE_ANCHOR_Y = LENS_CENTER_Y + (LENS_RADIUS - HANDLE_INSET) * Math.sin(angleRad);

const ICON_WIDTH = 400;
const ICON_HEIGHT = 390;

export default function MagnifierOverlay({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div style={overlayStyle}>
      <button onClick={onClose} style={closeButtonStyle} aria-label="閉じる">
        ×
      </button>

      <div style={{ position: "relative", width: ICON_WIDTH, height: ICON_HEIGHT }}>
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

      <p style={{ color: "white", fontSize: 15, textAlign: "center", maxWidth: 280 }}>
        レンズの中に現地のQRコードを写してください（読み取り機能は今後実装予定）
      </p>
    </div>
  );
}
