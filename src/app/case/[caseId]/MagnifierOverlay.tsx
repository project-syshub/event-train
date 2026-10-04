"use client";

// 【役割】虫眼鏡の画面。カメラ映像をレンズの中に映し、同じQRコードを3秒映し続けたら（縁のゲージが一周したら）
// /api/clues/discover で照合する。結果をレンズの中央に表示し、手がかりなら虫眼鏡を閉じる
// （別の事件の手がかりならその事件ページへ移動）。
//
// 【変更すると】
//  - HOLD_DURATION_MS … 読み取り確定までにQRを映し続ける時間（ゲージが一周する時間）
//  - LOST_GRACE_MS … QRが一瞬見えなくなってもゲージを戻さずに待つ時間。短くすると手ぶれでやり直しになりやすい
//  - GAUGE_COLOR … ゲージの色（太さは金属の縁 RIM_THICKNESS と同じ）
//  - SCAN_INTERVAL_MS … QRを探す間隔。短くすると反応が速くなるが、スマホの電池や発熱が増える
//  - SCAN_MAX_DIMENSION … 解析する映像の大きさ。大きくすると遠くの小さなQRも読めるが、処理が重くなる
//  - FOUND_CLOSE_DELAY_MS … 「手がかりを発見！」を表示してから閉じるまでの時間
//  - FAILED_RESUME_DELAY_MS … 対象外のQRのメッセージを表示してから読み取りを再開するまでの時間
//  - LENS_SIZE … レンズの大きさ（大きくしすぎても、画面に収まるよう全体が自動で縮む）
//  - HANDLE_ANGLE_DEG … 持ち手の角度（90で真下。大きいほど横に張り出さず、レンズを大きく見せられる）
//  - getLensMessage の文言 … レンズの中に出るメッセージ（「手がかりを発見！」など）
//  - 下の案内文（「レンズの中に現地のQRコードを写してください」）… 読み取り中の説明
//
// 【注意】カメラは https:// か localhost でしか起動しない（スマホから http://IPアドレス で開くと使えない）。

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareZXingModule, readBarcodes, type ReaderOptions } from "zxing-wasm/reader";
import type { ClueItem } from "@/lib/clues";
import type { StationKey } from "@/lib/stations";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";

// 読み取りの間隔と、解析用に縮小する映像の最大辺（端末の負荷を抑えるため）
const SCAN_INTERVAL_MS = 250;
const SCAN_MAX_DIMENSION = 640;

// QRの読み取りには ZXing（zxing-wasm）を使う。角の丸いデザインのQRや、
// 暗い背景に白で印刷したQR（色の反転したQR）も読めるようにしている。
//  - tryInvert … 色の反転したQRも探す（外すと、紺地に白のQRなどが読めなくなる）
//  - tryHarder / tryRotate … 時間をかけて、傾いたQRも探す（1回数ミリ秒程度で軽い）
const READER_OPTIONS: ReaderOptions = {
  formats: ["QRCode"],
  tryHarder: true,
  tryInvert: true,
  tryRotate: true,
  maxNumberOfSymbols: 1,
};

// 読み取り処理の本体（.wasm）は外部のCDNではなく、このアプリの /zxing/ から読み込む
// （scripts/copy-zxing-wasm.mjs が npm install 時に public/zxing/ へコピーする）
let zxingPrepared = false;
function prepareReader() {
  if (zxingPrepared) return;
  zxingPrepared = true;
  prepareZXingModule({
    overrides: {
      locateFile: (path: string, prefix: string) => (path.endsWith(".wasm") ? `/zxing/${path}` : prefix + path),
    },
    fireImmediately: true,
  }).catch(() => {
    // 読み込みに失敗したら、次に虫眼鏡を開いたときにもう一度試す
    zxingPrepared = false;
  });
}

// 同じQRをこの時間映し続けたら読み取り確定（狙っていないQRを一瞬映しただけで読まないようにする）
const HOLD_DURATION_MS = 3000;
// 手ぶれなどでQRが一瞬見えなくなっても、この時間以内に戻ればゲージを戻さずに続ける
const LOST_GRACE_MS = 600;
// レンズの縁を一周するゲージの色
const GAUGE_COLOR = "#f5c518";

// 読み取り結果をレンズに表示しておく時間（ミリ秒。1000で1秒）
const FOUND_CLOSE_DELAY_MS = 1500;
const FAILED_RESUME_DELAY_MS = 2000;

type ScanState =
  | { kind: "scanning" }
  | { kind: "checking" }
  | { kind: "found"; clue: ClueItem; caseTitle: string; casePath: string | null; isNew: boolean }
  | { kind: "failed"; message: string };

// レンズ（丸）の寸法（幅390px程度の画面で原寸。収まらない画面では全体を縮小して表示する）
const LENS_LEFT = 4; // 縁の影が切れないぶんだけ空ける
const LENS_TOP = 10;
const LENS_SIZE = 340;
const RIM_THICKNESS = 18; // 縁を少し細くし、ガラス部分を相対的に大きく見せる
const LENS_RADIUS = LENS_SIZE / 2;
const LENS_CENTER_X = LENS_LEFT + LENS_RADIUS;
const LENS_CENTER_Y = LENS_TOP + LENS_RADIUS;

// 持ち手（レンズの縁の1点を起点に、外向きに回転させる）。
// 角度を立てる（真下に近づける）ほど横への張り出しが減り、そのぶんレンズを大きくできる
const HANDLE_ANGLE_DEG = 60;
const HANDLE_WIDTH = 26;
const COLLAR_LENGTH = 20; // 金の接続部
const WOOD_LENGTH = 140; // 木製の持ち手
const HANDLE_INSET = 9; // 縁の少し内側を起点にして継ぎ目の隙間をなくす

const angleRad = (HANDLE_ANGLE_DEG * Math.PI) / 180;
const HANDLE_ANCHOR_X = LENS_CENTER_X + (LENS_RADIUS - HANDLE_INSET) * Math.cos(angleRad);
const HANDLE_ANCHOR_Y = LENS_CENTER_Y + (LENS_RADIUS - HANDLE_INSET) * Math.sin(angleRad);

// 持ち手の先端（幅のぶんも含む）まで収まるよう、虫眼鏡全体の大きさを寸法から求める
const HANDLE_LENGTH = COLLAR_LENGTH + WOOD_LENGTH;
const HANDLE_TIP_X =
  HANDLE_ANCHOR_X + HANDLE_LENGTH * Math.cos(angleRad) + (HANDLE_WIDTH / 2) * Math.sin(angleRad);
const HANDLE_TIP_Y =
  HANDLE_ANCHOR_Y + HANDLE_LENGTH * Math.sin(angleRad) + (HANDLE_WIDTH / 2) * Math.cos(angleRad);
const ICON_WIDTH = Math.ceil(Math.max(LENS_LEFT * 2 + LENS_SIZE, HANDLE_TIP_X + LENS_LEFT));
const ICON_HEIGHT = Math.ceil(HANDLE_TIP_Y + LENS_LEFT);

// 画面の左右に残す余白と、閉じるボタン・案内文などのために縦に確保する高さ
const SIDE_PADDING = 16;
const RESERVED_HEIGHT = 200;

// ゲージは金属の縁と同じ太さで、縁の太さの真ん中を通る円として描く（縁にぴったり重なる）
const GAUGE_WIDTH = RIM_THICKNESS;
const GAUGE_RADIUS = LENS_RADIUS - RIM_THICKNESS / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

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
  // QRを映し続けている最中か（案内文の切り替えに使う。ゲージ自体は毎フレーム直接書き換える）
  const [holding, setHolding] = useState(false);
  const gaugeRef = useRef<SVGCircleElement>(null);
  // 虫眼鏡は開いたときにだけ描画されるため、初期化時に画面サイズを参照できる
  const [iconScale] = useState(() =>
    Math.min(
      1,
      (window.innerWidth - SIDE_PADDING * 2) / ICON_WIDTH,
      (window.innerHeight - RESERVED_HEIGHT) / ICON_HEIGHT
    )
  );

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

    setScanState({
      kind: "found",
      clue: data.clue,
      caseTitle: data.caseTitle,
      casePath: data.casePath ?? null,
      isNew: data.isNew,
    });
    if (data.isNew && data.clue.caseId === caseId) {
      // 背後の手がかり一覧を最新の発見状況で描画し直す
      router.refresh();
    }
  });

  // 映像のフレームを定期的に切り出してQRコードを探し、同じQRを HOLD_DURATION_MS 映し続けたら確定する
  useEffect(() => {
    if (scanState.kind !== "scanning" || error) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    prepareReader();
    let stopped = false;
    // 前の読み取りが終わる前に次を始めないようにする（読み取りは非同期のため）
    let busy = false;
    // 映し続けているQRの文字列・映し始めた時刻・最後に見えた時刻
    let holdText: string | null = null;
    let holdStart = 0;
    let lastSeen = 0;

    const setGauge = (progress: number) => {
      gaugeRef.current?.setAttribute("stroke-dashoffset", String(GAUGE_CIRCUMFERENCE * (1 - progress)));
    };
    const resetHold = () => {
      holdText = null;
      setGauge(0);
      setHolding(false);
    };
    resetHold();

    const timer = setInterval(async () => {
      const video = videoRef.current;
      if (busy || !video || video.readyState < video.HAVE_ENOUGH_DATA || !video.videoWidth) return;

      // レンズに見えている範囲（映像の中央の正方形）だけを解析する。レンズの外に写り込んだQRは読まない
      const side = Math.min(video.videoWidth, video.videoHeight);
      const size = Math.min(side, SCAN_MAX_DIMENSION);
      canvas.width = size;
      canvas.height = size;
      context.drawImage(
        video,
        (video.videoWidth - side) / 2,
        (video.videoHeight - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size
      );
      const image = context.getImageData(0, 0, size, size);

      busy = true;
      const results = await readBarcodes(image, READER_OPTIONS).catch(() => []);
      busy = false;
      if (stopped) return;

      const now = performance.now();
      const text = results.find((result) => result.isValid)?.text;
      if (text) {
        // 別のQRに変わったら最初から数え直す
        if (text !== holdText) {
          holdText = text;
          holdStart = now;
          setHolding(true);
        }
        lastSeen = now;
      } else if (holdText && now - lastSeen > LOST_GRACE_MS) {
        resetHold();
      }
    }, SCAN_INTERVAL_MS);

    // ゲージは毎フレーム滑らかに進め、満タンになったら読み取りを確定する
    let frame = requestAnimationFrame(function tick() {
      if (stopped) return;
      if (holdText) {
        const progress = Math.min(1, (performance.now() - holdStart) / HOLD_DURATION_MS);
        setGauge(progress);
        if (progress >= 1) {
          stopped = true;
          clearInterval(timer);
          setHolding(false);
          onQrDetected(holdText);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    });

    return () => {
      stopped = true;
      clearInterval(timer);
      cancelAnimationFrame(frame);
    };
  }, [scanState.kind, error]);

  // 虫眼鏡を閉じ、別の事件の手がかりだったらその事件のページへ移動する
  const finishWithClue = useEffectEvent(() => {
    if (scanState.kind === "found" && scanState.clue.caseId !== caseId && scanState.casePath) {
      router.push(scanState.casePath);
    }
    onClose();
  });

  // 結果をレンズに少し表示したあと、手がかりなら虫眼鏡を閉じ、対象外なら読み取りを再開する
  useEffect(() => {
    if (scanState.kind === "found") {
      const timer = setTimeout(() => finishWithClue(), FOUND_CLOSE_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (scanState.kind === "failed") {
      const timer = setTimeout(() => setScanState({ kind: "scanning" }), FAILED_RESUME_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [scanState.kind]);

  const lensMessage = getLensMessage(scanState, caseId);

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
    <div style={{ ...overlayStyle, paddingLeft: SIDE_PADDING, paddingRight: SIDE_PADDING }} onClick={onClose}>
      <button className="icon-button" onClick={onClose} style={closeButtonStyle} aria-label="閉じる">
        <CloseIcon />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: ICON_WIDTH * iconScale, height: ICON_HEIGHT * iconScale, flexShrink: 0 }}
      >
        <div
          style={{
            position: "relative",
            width: ICON_WIDTH,
            height: ICON_HEIGHT,
            transform: `scale(${iconScale})`,
            transformOrigin: "top left",
          }}
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

              {/* 読み取り結果（レンズの中央に表示する） */}
              {lensMessage && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    background: "rgba(0, 0, 0, 0.55)",
                    color: "white",
                    fontSize: lensMessage.emphasis ? 22 : 15,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    textAlign: "center",
                    textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  {lensMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* 読み取りゲージ（レンズの縁の上を、真上から時計回りに一周する） */}
          <svg
            width={LENS_SIZE}
            height={LENS_SIZE}
            style={{ position: "absolute", top: LENS_TOP, left: LENS_LEFT, pointerEvents: "none" }}
            aria-hidden="true"
          >
            <circle
              ref={gaugeRef}
              cx={LENS_RADIUS}
              cy={LENS_RADIUS}
              r={GAUGE_RADIUS}
              fill="none"
              stroke={GAUGE_COLOR}
              strokeWidth={GAUGE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={GAUGE_CIRCUMFERENCE}
              strokeDashoffset={GAUGE_CIRCUMFERENCE}
              transform={`rotate(-90 ${LENS_RADIUS} ${LENS_RADIUS})`}
              style={{ filter: `drop-shadow(0 0 4px ${GAUGE_COLOR})` }}
            />
          </svg>

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
      </div>

      {/* 結果表示中も位置がずれないよう、案内文の場所は確保しておく */}
      <p
        style={{
          color: "white",
          fontSize: 15,
          textAlign: "center",
          maxWidth: 280,
          visibility: scanState.kind === "scanning" && !error ? "visible" : "hidden",
        }}
      >
        {holding ? "そのまま動かさないで…" : "レンズの中に現地のQRコードを写してください"}
      </p>
    </div>
  );
}

function getLensMessage(
  state: ScanState,
  caseId: StationKey
): { text: string; emphasis: boolean } | null {
  switch (state.kind) {
    case "scanning":
      return null;
    case "checking":
      return { text: "調べています...", emphasis: false };
    case "failed":
      return { text: state.message, emphasis: false };
    case "found":
      if (!state.isNew) return { text: "この手がかりはもう見つけている", emphasis: false };
      if (state.clue.caseId !== caseId) {
        return { text: `「${state.caseTitle}」の手がかりを発見！`, emphasis: false };
      }
      return { text: "手がかりを発見！", emphasis: true };
  }
}
