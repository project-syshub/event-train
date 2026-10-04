// 【役割】トップページ（/）。ログイン中ならホームへ、未ログインならログイン画面へ自動で移動する。

import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";

export default async function RootPage() {
  const userId = await getSessionUserId();
  redirect(userId ? "/home" : "/login");
}
