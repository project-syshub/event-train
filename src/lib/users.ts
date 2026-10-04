// 【役割】ログインできるアカウントの一覧と、IDとパスワードの照合。
//
// 【変更すると】
//  - mockUsers に1件追加 … ログインできるアカウントが増える（id と loginId は他と重ならない値にする）
//  - passwordHash … パスワードそのものではなく、暗号化した値（ハッシュ）を書く。
//    `npm run hash-password -- <パスワード>` で作れる
//  - normalizePassword … 入力の揺れをどこまで許すか（今は大文字・小文字、o と 0、l と 1 を同じものとして扱う）
//
// 【注意】normalizePassword を変えたら、全員の passwordHash を作り直す必要がある（照合できなくなるため）。

import bcrypt from "bcryptjs";

export type User = {
  id: string;
  loginId: string;
  passwordHash: string;
};

// 参加者が紙のカードを見て入力するときに間違えやすい違いをそろえる
//  - 全角・半角、前後の空白、大文字・小文字（スマホが先頭を自動で大文字にすることがある）
//  - o（オー）と 0（ゼロ）、l（エル）と 1（イチ）
export function normalizePassword(password: string): string {
  return password.normalize("NFKC").trim().toLowerCase().replace(/o/g, "0").replace(/l/g, "1");
}

// IDは全角の数字や前後の空白、大文字・小文字の違いを無視する
export function normalizeLoginId(loginId: string): string {
  return loginId.normalize("NFKC").trim().toLowerCase();
}

// ID 1〜50 は参加者用（パスワードは配布したカードの英数字6文字）。admin は運営の確認用
const PARTICIPANT_PASSWORD_HASHES: string[] = [
  "$2b$10$VcuCU8a22VYNWpPvRm5XX.4GIE53y7P0cqVa0KXZr4BK/ob5YlXVq", // 1
  "$2b$10$L5g5In1MpxpPCq7Iq123pOVprTxyVF7K35pfIMMv4iwNk0YxDFq6e", // 2
  "$2b$10$16hOVRLvPT2dLVkHKmlCtuJUg9ZhOFaoTWk3gfNXXt6JxVeY2OvzK", // 3
  "$2b$10$IFLv5xF.z8qP79fO2JRuIutDx.NCun79h8p97a/4uoHTH.tAGeE..", // 4
  "$2b$10$LMdSFb6Tw47MPfvSPTwcu.tovD36xyLznStsjkFlA8nxUUgyx9hjO", // 5
  "$2b$10$7c1puDGTELyQrQtNf4SSeuvdFE6qUMn4vK/Hao0nuU95JpmnpIcmO", // 6
  "$2b$10$6cfKRQJdz3Cs2KbQclkfhOVPfOizeXMcsr5.fBCVKHJs/s0vjwmu2", // 7
  "$2b$10$IL6/amdHZKXcvELqWgKB5.j2RLuRmrs9oP75k4/DG/91jN7lJ/rrG", // 8
  "$2b$10$WD1unFK1kTbo5dJn4biUSeE3YDmexpjvojh/k9XUjK4nRBOh8uyd6", // 9
  "$2b$10$84Orv8XYr2jFEEi1kjM5XOiTTf9PpuiNlUjQJhPwh6PgP05KpxNAW", // 10
  "$2b$10$JOBg0UBoUpqybyy6Hmvg2ucC9uEVsTYGYw5WAHPl8/kcQ2jLb7jRe", // 11
  "$2b$10$BAeWV1QkfFlGCxjjGlbeUO9PjnHnWo2L9EX6N77FPMVauWjogAdti", // 12
  "$2b$10$64GRq3kNHhZkbRa1tAtDLeqMIScoouAhL5pwZQOca7B1e65TNujrO", // 13
  "$2b$10$EHNQo4DSzWLq8nMeBKkdROedSfYgoYjlwoSXJOagO/.fgjyfpKyx.", // 14
  "$2b$10$e/e8lkLPf4CDnveRFR3KH.G/1wh0LO6FKg7ew.UHvy/E46vd.Eqti", // 15
  "$2b$10$mxbk6wlPdlXpEKIsOfZQPeLNy6hysvmp295Sjshi2MyMWImY5BVWK", // 16
  "$2b$10$Cpfj2GQG90B3SkIJtfu5u.nzmY7ap5/x2LSrtulynxlqoEXemz.nS", // 17
  "$2b$10$QTebrKCPV1xp2x6dYXgj8.Nbb/Yl/FJpfn0lh0kcAEm25CvBdE7T6", // 18
  "$2b$10$KdKYzehcgkDYtNRQAMjnWe2xm.KUURQ163hPYAWnhpJi8OT.Rn8Ja", // 19
  "$2b$10$0BhHrT3pjaKdQqWTrlgVJeJ9nB7if9nLkD00oGCDqcEIT.T5.XWkm", // 20
  "$2b$10$ClY/fvvHbmOgmqDjSaKKmekrcJPlLsNgsvsDvcg0xSLolR6wG6sua", // 21
  "$2b$10$WCZmHk0wiRUKGcOGiJVbOe9MTH/nfFee4nm5j0Bd63rwcQVCqi9Rq", // 22
  "$2b$10$M1bsQ22Sn/YMYd2ogzxpIuGlw24RxQ/dhdtpg.dPNFR3/PzDefhzu", // 23
  "$2b$10$Mcbazbkk4AID1HS/Zq7Gw.CmTU79u1FngiZWZBamw9OjNX5fZIqC2", // 24
  "$2b$10$J/3FazjCPx.gZfgPHbdMtuLmz/UU4nb5XSnptWIb6yo6QePiKkMOi", // 25
  "$2b$10$O1OXsHICWTi2G1yr4r1Wj.TLsSqJb/gfpJ8TZM4aKDCUTCChsj5Fm", // 26
  "$2b$10$hjK4PxCkc4MTu4WM8.1P5.MiYgAYdVr6YSLQ/SlJAZpiNylcDOY5O", // 27
  "$2b$10$neSvlGcD75wvhNywL9FE9.hASAy/bzIDXuxHsfEYIxHudnzUdwiee", // 28
  "$2b$10$RnKiaTPiA/L/m.ddsMWTB.jko26dOOY7GvL6X8DWWULo/F1jW4usq", // 29
  "$2b$10$u7HINuZn114EVkxY5w0zR.6nZnB0.zW5A0DU9vxTgfbtWVcdmFF1W", // 30
  "$2b$10$mY4bXQzrQcHu1C9VogqTweHIAV16D4YYyoA9sGT5bW4j3aggunOXm", // 31
  "$2b$10$5zJeXM17UUM/qYV7OCCW3eNvoX6V59zPVNgspgkx1liKZ7dgU6X36", // 32
  "$2b$10$6VrqD9JSIiCgDZIQW4SX5ObBt156PkFc0lhIt2JeG5CQtGIfo01YO", // 33
  "$2b$10$8Fk22ppzFjNaE3Pd7I5Tv.aIhulG04HalI2Se6yr.L3lFK09rwJ0W", // 34
  "$2b$10$zPsF2JfHoRqaYyYbdX43dOs6U8xu/Dcts2iZrAgqT.b.Va4pgEemS", // 35
  "$2b$10$ZrYwKO01tWGPHlhAtN6AvOWtTtCELn39rkgFonHQyAnTGZV3gxnlO", // 36
  "$2b$10$0xyosHv7xdxrUSVNfAODLeO1T8zd4frd85xc1.3u4j4cb1.ZxpIiC", // 37
  "$2b$10$GaT974zJGDbNNdi67QWLwO.gok4/UKU6J21iilhFLe8RTa7gbm2RG", // 38
  "$2b$10$Bl4Ea6nQROeg0sllaX/SnelblMxUK6rLvtfalh2bjNYGKbjdOgBVC", // 39
  "$2b$10$5l9hdfr55fDBF2W7NSZERubYF135qYUaSnYEQjcODYMZAGjnwGIoO", // 40
  "$2b$10$nPV96euDyEwPLFLygWLSAubtGTEi5EZHySUGP4m4U5JajyMUDDlj.", // 41
  "$2b$10$l95OI4Pv1lqvbkU.OlRe7e2MwHX9SirQSdAeuv7gjHZ76MH1VQ99m", // 42
  "$2b$10$H.NzdgknjLiOeFyi/QaBc.CbflJ99Gb8stNfdhwvQq3L0wSrNQa4O", // 43
  "$2b$10$O5tR99TUn9CjQdJuWU9V9.f53icClyCxi/hOyqtN7xB5Q/64Nbspa", // 44
  "$2b$10$WDiBIeNe5Pfn2DuQ9oBMlecCjnBH5dfmJ3koSqTuDOCoMFHSDqkvu", // 45
  "$2b$10$HaYJg6/MwFwpuFBiH95GFe6Rxx2OkPEoCGJ5FCU6g6G2VWT.nT1Ga", // 46
  "$2b$10$mWYPLqAB1/4zND0NtjKmCugXrtRxLERlV6CfXZ/GeT4YKVmcuYIwq", // 47
  "$2b$10$uZMN8NAYT.SPJxekzn4Ao.gsY6N.nH3NWATWV22XC0fLQ2rRfj1Pu", // 48
  "$2b$10$hzxh.bY1hcjeGYXdkPjctO0hzK7hZZV5QJmlBvFLk8q2AXX8hKN8O", // 49
  "$2b$10$fkQvn33/Wnu4hmnHrbA8VuETkwlqZ5dsGokcz9HAeMla8iNSMiQ1W", // 50
];

// TODO: PostgreSQLのusersテーブルに置き換える。現時点ではここに直接書く。
export const mockUsers: User[] = [
  {
    id: "user-1",
    loginId: "admin",
    passwordHash: "$2b$10$KPiW4Ls7biKDJ3Dz9Hk4E.lbT8S9mPv6niIK4iWkogD8PBQVyWF0S",
  },
  ...PARTICIPANT_PASSWORD_HASHES.map((passwordHash, index) => ({
    id: `participant-${index + 1}`,
    loginId: String(index + 1),
    passwordHash,
  })),
];

export function findUserByLoginId(loginId: string): User | undefined {
  const normalized = normalizeLoginId(loginId);
  return mockUsers.find((user) => user.loginId === normalized);
}

export function findUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

export function verifyPassword(user: User, password: string): boolean {
  return bcrypt.compareSync(normalizePassword(password), user.passwordHash);
}
