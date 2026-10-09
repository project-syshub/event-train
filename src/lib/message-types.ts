// 一斉メッセージの型と上限。画面（ブラウザ側）とサーバーの両方から使うので、データベースの処理とは分けて置く。
export const MAX_MESSAGE_LENGTH = 500; // 1通の最大文字数

export type Message = { id: number; body: string; createdAt: string };
