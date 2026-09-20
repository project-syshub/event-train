// 丸ボタンの中でずれないよう、左右上下対称なviewBoxのSVGアイコンとして定義する。
// 色はstroke="currentColor"で親要素の文字色を継承する。

export function GearIcon({ size = 20 }: { size?: number }) {
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
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.65 5.35l-1.56 1.56M6.91 17.09l-1.56 1.56M18.65 18.65l-1.56-1.56M6.91 6.91L5.35 5.35" />
    </svg>
  );
}

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
