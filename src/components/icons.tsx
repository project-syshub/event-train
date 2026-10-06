// 【役割】アプリ内で使うアイコン（虫眼鏡・パズル・戻る矢印・閉じる×・手紙の封筒）。
//
// 【変更すると】
//  - 各アイコンの size の初期値 … 大きさを指定せずに使った場所のアイコンの大きさ
//  - PuzzleIcon … 画像のない手がかりのカードに出るアイコン
//  - EnvelopeIcon … ループ事件の手紙（届いたときの画面と、狸小路の手がかり一覧のカード）に出る封筒の絵
//
// 丸ボタンの中でずれないよう、左右上下対称なviewBoxのSVGアイコンとして定義する。
// 色はstroke="currentColor"で親要素の文字色を継承する。

export function MagnifierIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 21 21" />
    </svg>
  );
}

export function PuzzleIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9.9 4.6a2.1 2.1 0 0 1 4.2 0c0 .5-.17.96-.46 1.32h3.26c.8 0 1.45.65 1.45 1.45v3.26c.36-.29.82-.46 1.32-.46a2.1 2.1 0 0 1 0 4.2c-.5 0-.96-.17-1.32-.46v3.26c0 .8-.65 1.45-1.45 1.45H6.65c-.8 0-1.45-.65-1.45-1.45V7.37c0-.8.65-1.45 1.45-1.45h3.71a2.09 2.09 0 0 1-.46-1.32Z" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// 封筒の絵（クリーム色の封筒に赤い封蝋）。width に合わせて縦横比を保ったまま大きさが変わる
export function EnvelopeIcon({ width = 180 }: { width?: number }) {
  return (
    <svg width={width} height={(width * 130) / 180} viewBox="0 0 180 130" aria-hidden="true" focusable="false">
      <rect x={4} y={10} width={172} height={114} rx={6} fill="#fbf4e4" stroke="#c9a97a" strokeWidth={3} />
      <path d="M6 14 L90 76 L174 14" fill="none" stroke="#c9a97a" strokeWidth={3} strokeLinejoin="round" />
      <path d="M6 120 L70 64 M174 120 L110 64" stroke="#e3d2b0" strokeWidth={2} />
      <circle cx={90} cy={76} r={15} fill="#b3261e" stroke="#7d1a14" strokeWidth={2} />
      <path d="M84 76 h12 M90 70 v12" stroke="#f3c7c2" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
