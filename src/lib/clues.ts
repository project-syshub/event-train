// 【役割】手がかりの一覧（QRコードの文字列 → 手がかりの対応表）と、その照合処理。
//
// 【手がかりを追加・変更するとき】下の mockClues に1件ずつ書く。
//  - qrCode      … QRコードに入れた文字列と同じにする。まだ決まっていなければ省略できる（読み取りでは見つからない）
//                  （1文字でも違うと「手がかりではない」になる。
//                  全角・半角の違い（「天文台１」と「天文台1」）は同じものとして扱う）
//  - caseId      … どの事件の手がかりか（cases.ts の stationKey と同じ値）。変えると表示される事件が変わる
//  - name        … カードと詳細に出る名前
//  - description … カードを押したときの詳細に出る説明文。{{文字|色}} と書くと、その文字に色が付く
//                  （色は 紫・オレンジ・黒・ピンク・赤・青・緑・黄 か、#ff0000 のような色の番号）
//  - image       … 画像を public/clues/ に置き、"/clues/ファイル名.jpg" と書く。省略するとパズルのアイコンになる
//  - references  … 参考文献（複数可）。{ title: "日本語の名前", url: "https://..." } と書く。
//                  詳細の一番下に title だけを表示する（URLは記録として残すだけで、画面には出さない）。省略すると表示しない
//  - slot        … 事件ページで表示する枠の番号（1=左上 2=右上 3=左下 4=右下）。見つける前はその枠に「？」が出る
//  - id          … 発見記録はこのidで保存している。一度公開したら変えない（変えるとその手がかりが未発見に戻る）
//
// 【注意】1つの事件の手がかりの数を増減したら、cases.ts の clueSlots（「？」の枠の数）も合わせる。
// 画像は public/ に置くため、URLを知っていれば発見前でも直接開ける。

import type { StationKey } from "./stations";

export type ClueItem = {
  id: string;
  caseId: StationKey;
  name: string;
  description: string;
  // 手がかりの写真（public/ からのパス）。ない場合はアイコンを表示する
  image?: string;
  // 参考文献。詳細ポップアップの一番下に、日本語の名前（title）だけを表示する
  references?: ClueReference[];
};

// 参考文献。title は画面に出す日本語の名前、url は元の資料の場所（画面には出さない。分からなければ省略できる）
export type ClueReference = { title: string; url?: string };

// QRコードの値はクライアントに渡さない（未発見の手がかりを推測できないようにする）
type ClueDefinition = ClueItem & {
  // 現地に貼るQRコードに埋め込む文字列そのもの。読み取った文字列と完全一致で照合する
  // （前後の空白と、全角・半角の違いは無視する。大文字・小文字は区別する）
  // まだQRが決まっていない手がかりは省略する（読み取りでは見つからず、ずっと「？」のまま）
  qrCode?: string;
  // 事件ページの何番目の枠に表示するか（1から数える。2列なので 1=左上 2=右上 3=左下 4=右下）
  slot: number;
};

// ループ事件（狸小路）の手がかり。QRではなく、ホームの線路を一周なぞる・手紙を読むことで手に入る
//  - LOOP_CLUE_ID … 一周なぞった直後に手に入る手がかり（これを見つけるとループ事件が現れる）
//  - LETTER_CLUE_ID … 一周したあとに届く報酬係からの手紙（手紙を閉じると手がかりに入る）
export const LOOP_CLUE_ID = "tanuki-1";
export const LETTER_CLUE_ID = "tanuki-2";
// 手紙の差出人と本文（手紙の画面と、狸小路の手がかり一覧の両方に使う）
//  - 1要素が1行、"" は空行。文（「。」「！」まで）は1行で書き、全角19文字を超えるときだけ、
//    意味の区切り（「、」の後など）で次の行に分ける。手紙の画面は自動では折り返さず、
//    一番長い行が便せんに収まるよう文字の大きさを自動で決める（長い行があるほど文字が小さくなる）
//  - **〜** で囲んだ部分は手紙の画面で太字になる（手がかりの説明文では ** は消して表示する）
export const LETTER_SENDER = "報酬係";
export const LETTER_BODY = [
  "見つけてくれてありがとうございます！",
  "",
  "札幌に来るのがずいぶん久しぶりで、",
  "私の知っている頃は、",
  "市電はまだループ化していなかったんです。",
  "",
  "まさか市電が",
  "こんなふうに変わっていたとは！",
  "",
  "私は**狸小路停留場の外回り側**にいます！",
  "報酬を持って待っています。",
].join("\n");

// 太字の目印（**）を外した本文
export const LETTER_PLAIN_BODY = LETTER_BODY.replaceAll("**", "");

// TODO: PostgreSQLのcluesテーブルに置き換える。現時点ではここに直接書く。
// 追加するときは、下の見本か既存の1件をコピーして、該当する事件の見出しの下に貼る。
//   {
//     id: "nakajima-5",                ← 他と重ならない値
//     qrCode: "天文台5",                ← QRに入れる文字列
//     slot: 5,                         ← 表示する枠の番号（1=左上 2=右上 3=左下 4=右下）
//     caseId: "nakajima-koen-dori",    ← 見出しの caseId をコピー
//     name: "古びた鍵",
//     description: "1行目\n2行目",     ← \n で改行
//     image: "/clues/nakajima-5.jpg",  ← 画像がなければこの行ごと消す
//     references: [{ title: "資料の名前", url: "https://..." }],  ← 参考文献（なければこの行ごと消す）
//   },
export const mockClues: ClueDefinition[] = [
  // ===== 白いもの盗難事件（電車事業所前） caseId: "densha-jigyosho-mae" =====
  // QRは「手がかり1」〜「手がかり8」。{{文字|色}} の部分は詳細で色付きの文字になる（ClueDetailPopup.tsx）
  {
    id: "densha-1",
    qrCode: "手がかり1",
    slot: 1,
    caseId: "densha-jigyosho-mae",
    name: "3300形",
    description: [
      "車両数：5",
      "定員：62人",
      "つくられた年：1998～2001年",
      "",
      "3300形は、車体の側窓を大きくした車両。",
      "窓が大きくなったことで、車内を広く感じられる開{{ほ|紫}}う感のある室内空間になっている。",
      "",
      "また、車体を新しくするときに、台車と動力装置には330形のものを再利用している。",
    ].join("\n"),
    image: "/clues/densha-3300.jpg",
  },
  {
    id: "densha-2",
    qrCode: "手がかり2",
    slot: 2,
    caseId: "densha-jigyosho-mae",
    name: "雪20形（ゆきにじゅうがた）",
    description: [
      "車両数：3",
      "定員：3人",
      "つくられた年：2019年",
      "",
      "雪20形は、2019年に完成した新型の除雪車。",
      "",
      "普通の雪だけでなく、湿った重い雪でも「ザザザ」と大きな音を立てて、{{し|オレンジ}}っかり除雪することができる。",
      "",
      "雪20形は、札幌の冬に活躍するササラ電車の一つでもある。",
      "車体には、細く切った竹を束ねたササラを装備。ササラを回転させ、線路に積もった雪をはね飛ばす仕組み。",
    ].join("\n"),
    image: "/clues/densha-yuki20.jpg",
  },
  {
    id: "densha-3",
    qrCode: "手がかり3",
    slot: 3,
    caseId: "densha-jigyosho-mae",
    name: "8500形",
    description: [
      "車両数：5",
      "定員：100人",
      "つくられた年：1985年・1987年・1988年",
      "",
      "8500形は、それまでの車両とは少し違い、車体は、従来の丸{{み|黒}}を持ったデザインから、直線を強調したシンプルなスタイルに変わった。",
      "",
      "また、形式の名前である「8500形」は、製造された年の1985年の末尾2桁を使って名づけられている。",
    ].join("\n"),
    image: "/clues/densha-8500.jpg",
  },
  {
    id: "densha-4",
    qrCode: "手がかり4",
    slot: 4,
    caseId: "densha-jigyosho-mae",
    name: "250形",
    description: [
      "車両数：3",
      "定員：110人",
      "つくられた年：1961年",
      "",
      "250形は、札幌で製造された道産車両。",
      "",
      "この車両には、札幌市電で初めて使われたボ{{ギ|ピンク}}ー台車を持つ500形の電気部品が、一部再利用されている。",
      "",
      "札幌の市電で長く活躍してきた車両の一つ。",
    ].join("\n"),
    image: "/clues/densha-250.jpg",
  },
  {
    id: "densha-5",
    qrCode: "手がかり5",
    slot: 5,
    caseId: "densha-jigyosho-mae",
    name: "ロードヒーティング",
    description: [
      "札幌では、雪が降ったときに道路に雪が積もったり、路面が凍ったりする。",
      "そこで、道路の中などに熱を出すしくみを入れて、道路をあたため、雪をその場でとかしたり、道路が凍るのを防いだりする。",
      "",
      "降雪センサー、水分センサー、路面温度センサーなどを利用し、道路の状態に合わせた運転も実施している。",
    ].join("\n"),
    image: "/clues/densha-road-heating.jpg",
  },
  {
    id: "densha-6",
    qrCode: "手がかり6",
    slot: 6,
    caseId: "densha-jigyosho-mae",
    name: "雪堆積場（ゆきたいせきじょう）",
    description: [
      "大雪が降ると、道路のわきにはたくさんの雪がたまる。",
      "その雪をトラックなどで運び出す「運搬排雪」が行われる。",
      "運ばれてきたたくさんの雪を、まとめて置いておく場所。",
      "そこには、市内のいろいろな場所から雪が運ばれてくる。",
      "",
      "令和4年度には、市内約80カ所を開設。",
    ].join("\n"),
    image: "/clues/densha-yuki-taisekijo.jpg",
  },
  {
    id: "densha-7",
    qrCode: "手がかり7",
    slot: 7,
    caseId: "densha-jigyosho-mae",
    name: "流雪溝",
    description: [
      "道路の下に水の通り道を作って、雪を処理するしくみ。",
      "道路にある投雪口から雪を入れ、水の流れを利用して雪を流していく。",
      "このしくみは、道路の下に作られています。",
      "",
      "管理は、地域の人たちによる管理運営協議会を中心として行われている。",
    ].join("\n"),
    image: "/clues/densha-ryusetsuko.jpg",
  },
  {
    id: "densha-8",
    qrCode: "手がかり8",
    slot: 8,
    caseId: "densha-jigyosho-mae",
    name: "融雪槽",
    description: [
      "融雪槽は、道路そのものをあたためるのではなく、雪を集めてからとかす仕組み。",
      "大きな「槽」に雪を入れ、下水処理水などの熱を利用して雪をとかす。",
    ].join("\n"),
  },


  // ===== 夜空から消えたシリウス事件（中島公園通） caseId: "nakajima-koen-dori" =====
  {
    id: "nakajima-1",
    qrCode: "天文台1",
    slot: 1,
    caseId: "nakajima-koen-dori",
    name: "上下分離の図",
    description:
      "市電の運行を安定して続けていくため、仕事を「上下」に分けています。“上”は市電を走らせる仕事、“下”は車両や線路などを支える仕事です。",
    image: "/clues/joge-bunri.jpg",
    references: [
      {
        title: "札幌市交通局「路面電車事業における上下分離について」",
        url: "https://www.city.sapporo.jp/st/shiden/jyougebunri.html",
      },
    ],
  },
  {
    id: "nakajima-2",
    qrCode: "天文台2",
    slot: 2,
    caseId: "nakajima-koen-dori",
    name: "A1200形のデータ",
    // \n の位置で改行して表示する
    description: "運行開始した年：2013年\n定員：71人\n座席数：27席\n低床車両\n愛称：ポラリス",
    image: "/clues/a1200-polaris.jpg",
    references: [
      {
        title: "一般財団法人 札幌市交通事業振興公社「A1200形」",
        url: "https://www.stsp.or.jp/museum/a1200%E5%BD%A2/",
      },
      {
        title: "札幌市歴史文化のまちづくり推進協議会「さっぽろ文化財散歩【札幌の路面電車編】」",
        url: "https://www.city.sapporo.jp/shimin/bunkazai/documents/bunkazaisanpo_romendensya.pdf",
      },
    ],
  },
  {
    id: "nakajima-3",
    qrCode: "天文台3",
    slot: 3,
    caseId: "nakajima-koen-dori",
    name: "A1210形のデータ",
    description: "運行開始した年：2025年\n定員：75人\n座席数：27席\n低床車両\n愛称：ポラリスⅡ",
    image: "/clues/a1210-polaris2.jpg",
    references: [
      {
        title: "一般財団法人 札幌市交通事業振興公社「A1210形」",
        url: "https://www.stsp.or.jp/museum/a1210%e5%bd%a2/",
      },
      {
        title: "札幌市歴史文化のまちづくり推進協議会「さっぽろ文化財散歩【札幌の路面電車編】」",
        url: "https://www.city.sapporo.jp/shimin/bunkazai/documents/bunkazaisanpo_romendensya.pdf",
      },
    ],
  },
  {
    id: "nakajima-4",
    qrCode: "天文台4",
    slot: 4,
    caseId: "nakajima-koen-dori",
    name: "1100形の愛称",
    description: "この車両の愛称は、太陽を除いて地球から最も明るく見える星の名前。\n来場者の投票で選ばれました。",
    image: "/clues/1100-sirius.jpg",
    references: [
      {
        title: "札幌市交通局 公式X（2018年10月23日投稿）",
        url: "https://x.com/sapporokotsu_PR/status/1054599031970615297",
      },
    ],
  },

  // ===== ループ事件（狸小路・隠し事件） caseId: "tanuki-koji" =====
  // QRではなく、ホームの線路を一周なぞる（tanuki-1）・届いた手紙を閉じる（tanuki-2）ことで手に入る
  {
    id: LOOP_CLUE_ID,
    slot: 1,
    caseId: "tanuki-koji",
    name: "狸小路",
    description: "市電のループ化によって、新しい停留場「狸小路」が誕生した。",
    image: "/clues/tanuki-loop-map.jpg",
    references: [{ title: "札幌市HP／札幌市路面電車ループ事業" }],
  },
  {
    id: LETTER_CLUE_ID,
    slot: 2,
    caseId: "tanuki-koji",
    name: `${LETTER_SENDER}からの手紙`,
    description: `${LETTER_PLAIN_BODY}\n\n― ${LETTER_SENDER}より`,
  },

  // ===== 恐怖！謎のびしょ濡れ事件（西15丁目・札幌市資料館） caseId: "nishi-15-choume" =====
  // 参考文献はまだ決まっていない
  {
    id: "nishi15-1",
    qrCode: "資料館1",
    slot: 1,
    caseId: "nishi-15-choume",
    name: "公園",
    description:
      "1871年（明治4年）、札幌で最初の公園がつくられました。\n現在の北海道大学の南側につくられた公園です。",
    image: "/clues/shiryokan-koen.jpg",
  },
  {
    id: "nishi15-2",
    qrCode: "資料館2",
    slot: 2,
    caseId: "nishi-15-choume",
    name: "創成川",
    description:
      "札幌の街を東西に分ける人工の川です。\n・1874年（明治7年）「創成川」と名づけられる\n・大友亀太郎が開いた人工の川",
    image: "/clues/shiryokan-soseigawa.jpg",
  },
  {
    id: "nishi15-3",
    qrCode: "資料館3",
    slot: 3,
    caseId: "nishi-15-choume",
    name: "鉄道",
    description:
      "石炭や石材を運ぶために、鉄道がつくられました。\n・1880年（明治13年）小樽（手宮）〜札幌で鉄道が開通\n・国内で3番目の鉄道",
    image: "/clues/shiryokan-tetsudo.jpg",
  },
  {
    id: "nishi15-4",
    qrCode: "資料館4",
    slot: 4,
    caseId: "nishi-15-choume",
    name: "石山通",
    description:
      "札幌軟石を運ぶ道として発展しました。\n・1909年（明治42年）石山通に馬車鉄道が通る\n・石材だけでなく、人も利用した",
    image: "/clues/shiryokan-ishiyama.jpg",
  },
  {
    id: "nishi15-5",
    qrCode: "資料館5",
    slot: 5,
    caseId: "nishi-15-choume",
    name: "市電",
    description:
      "札幌で電車の運転が始まり、まちの大切な交通手段になりました。\n・1918年（大正7年）電車の運転が始まる\n・1927年（昭和2年）市電事業が市営化",
    image: "/clues/shiryokan-shiden.jpg",
  },
];

// QRを作るときの入力の揺れで一致しなくならないよう、全角の英数字を半角にそろえ、前後の空白を除く
// （例：「天文台１」と「天文台1」を同じものとして扱う）
function normalizeQrText(text: string): string {
  return text.normalize("NFKC").trim();
}

function toClueItem({ id, caseId, name, description, image, references }: ClueDefinition): ClueItem {
  return { id, caseId, name, description, image, references };
}

export function findClueById(id: string): ClueItem | null {
  const clue = mockClues.find((c) => c.id === id);
  return clue ? toClueItem(clue) : null;
}

// 読み取ったQRコードの文字列から手がかりを引く。手がかり用でなければnull
export function findClueByQrText(text: string): ClueItem | null {
  const code = normalizeQrText(text);
  const clue = mockClues.find((c) => c.qrCode !== undefined && normalizeQrText(c.qrCode) === code);
  return clue ? toClueItem(clue) : null;
}

export type ClueSlot = { found: true; clue: ClueItem } | { found: false };

// 各手がかりを slot で決めた枠に置く。見つけた手がかりはその枠に中身を、まだのものや
// 手がかりが割り当てられていない枠には「？」を出す（見つけた順に詰めて並べることはしない）
export function getClueSlotsForCase(
  caseId: StationKey,
  slotCount: number,
  foundClueIds: string[]
): ClueSlot[] {
  const caseClues = mockClues.filter((clue) => clue.caseId === caseId);
  const count = Math.max(slotCount, ...caseClues.map((clue) => clue.slot));

  return Array.from({ length: count }, (_, index): ClueSlot => {
    const clue = caseClues.find((c) => c.slot === index + 1 && foundClueIds.includes(c.id));
    return clue ? { found: true, clue: toClueItem(clue) } : { found: false };
  });
}
