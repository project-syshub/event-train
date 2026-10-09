// 手がかりの入手状況（admin 用の一覧）の型。画面とサーバーの両方から使う。
export type ParticipantProgress = {
  loginId: string;
  // 入手した順（古い順）
  clues: { clueName: string; caseTitle: string; foundAt: string }[];
};
