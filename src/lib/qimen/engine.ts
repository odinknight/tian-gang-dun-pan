import { Solar } from "lunar-javascript";

export type Yuan = "上元" | "中元" | "下元";
export type Dun = "阳遁" | "阴遁";
export type DoorTone = "ji" | "xiong" | "ping";

export interface Gloss {
  label: string;
  text: string;
}

export interface PalaceView {
  id: number;
  name: string;
  dir: string;
  element: string;
  diGan: string;
  tianGan: string;
  extraGan?: string;
  star: string;
  extraStar?: string;
  door?: string;
  god?: string;
  marks: string[];
  tone: DoorTone;
  gloss: Gloss[];
}

export interface Brief {
  key: string;
  title: string;
  body: string;
  hot?: boolean;
}

export interface Chart {
  pillars: { year: string; month: string; day: string; hour: string };
  shichenName: string;
  shichenRange: string;
  term: string;
  nextTerm: string;
  nextTermLabel: string;
  yuan: Yuan;
  qiStatus: "常" | "接气";
  dun: Dun;
  ju: number;
  zhiFu: string;
  zhiShi: string;
  xun: string;
  kong: string;
  horse: string;
  xiu: string;
  xiuLuck: string;
  palaces: PalaceView[];
  shengMenId: number;
  briefs: Brief[];
  sizheng: string;
}

const GANS = "甲乙丙丁戊己庚辛壬癸";
const ZHIS = "子丑寅卯辰巳午未申酉戌亥";
const RING = [4, 9, 2, 7, 6, 1, 8, 3];
const YANG_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const YIN_ORDER = [9, 8, 7, 6, 5, 4, 3, 2, 1];
const STEM_FLY = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];
const DOOR_SEQ = ["休门", "生门", "伤门", "杜门", "景门", "死门", "惊门", "开门"];
const GODS = ["值符", "螣蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];

const DISPLAY = [
  { id: 4, name: "巽四", dir: "东南", element: "木" },
  { id: 9, name: "离九", dir: "正南", element: "火" },
  { id: 2, name: "坤二", dir: "西南", element: "土" },
  { id: 3, name: "震三", dir: "正东", element: "木" },
  { id: 5, name: "中五", dir: "中央", element: "土" },
  { id: 7, name: "兑七", dir: "正西", element: "金" },
  { id: 8, name: "艮八", dir: "东北", element: "土" },
  { id: 1, name: "坎一", dir: "正北", element: "水" },
  { id: 6, name: "乾六", dir: "西北", element: "金" },
];

const STAR_OF: Record<number, string> = {
  1: "天蓬",
  2: "天芮",
  3: "天冲",
  4: "天辅",
  5: "天禽",
  6: "天心",
  7: "天柱",
  8: "天任",
  9: "天英",
};

const DOOR_OF: Record<number, string> = {
  1: "休门",
  2: "死门",
  3: "伤门",
  4: "杜门",
  6: "开门",
  7: "惊门",
  8: "生门",
  9: "景门",
};

const YANG_JU: Record<string, [number, number, number]> = {
  冬至: [1, 7, 4],
  小寒: [2, 8, 5],
  大寒: [3, 9, 6],
  立春: [8, 5, 2],
  雨水: [9, 6, 3],
  惊蛰: [1, 7, 4],
  春分: [3, 9, 6],
  清明: [4, 1, 7],
  谷雨: [5, 2, 8],
  立夏: [4, 1, 7],
  小满: [5, 2, 8],
  芒种: [6, 3, 9],
};

const YIN_JU: Record<string, [number, number, number]> = {
  夏至: [9, 3, 6],
  小暑: [8, 2, 5],
  大暑: [7, 1, 4],
  立秋: [2, 5, 8],
  处暑: [1, 4, 7],
  白露: [9, 3, 6],
  秋分: [7, 1, 4],
  寒露: [6, 9, 3],
  霜降: [5, 8, 2],
  立冬: [6, 9, 3],
  小雪: [5, 8, 2],
  大雪: [4, 7, 1],
};

const PALACE_ZHIS: Record<number, string[]> = {
  1: ["子"],
  8: ["丑", "寅"],
  3: ["卯"],
  4: ["辰", "巳"],
  9: ["午"],
  2: ["未", "申"],
  7: ["酉"],
  6: ["戌", "亥"],
  5: [],
};

const XUN_YI: Record<string, string> = {
  甲子: "戊",
  甲戌: "己",
  甲申: "庚",
  甲午: "辛",
  甲辰: "壬",
  甲寅: "癸",
};

const XUN_KONG: Record<string, string[]> = {
  甲子: ["戌", "亥"],
  甲戌: ["申", "酉"],
  甲申: ["午", "未"],
  甲午: ["辰", "巳"],
  甲辰: ["寅", "卯"],
  甲寅: ["子", "丑"],
};

const SHEN: Record<string, { name: string; xiang: string; deg: string; note: string }> = {
  甲: { name: "阏逢", xiang: "官", deg: "114°", note: "正官与偏官。领导、父亲、老师，以及不愿明说的约束关系。" },
  乙: { name: "旃蒙", xiang: "禄", deg: "174°", note: "才华、学业、技艺、俸禄。盘落则为偏禄、第二职业。" },
  丙: { name: "柔兆", xiang: "财", deg: "204°", note: "收入、资产、可兑现之物。盘落则为偏财、见不得人的财。" },
  丁: { name: "强围", xiang: "斗", deg: "午 282°", note: "装财的斗：身体、家业、公司。有财无斗，仍是流水。" },
  戊: { name: "著雍", xiang: "业", deg: "264°", note: "家业、产业、房子，也包括自己作下的业。" },
  己: { name: "屠维", xiang: "力", deg: "330°", note: "贵人、助力、扶持。盘落则为不公开的力量。" },
  庚: { name: "上章", xiang: "刀", deg: "198°", note: "伤害、手术、公检法、辖制自己的刃。也可是能用的刀。" },
  辛: { name: "重光", xiang: "兵", deg: "48°", note: "下属与可动用的力量。兵能用，也能反伤。" },
  壬: { name: "元黓", xiang: "世", deg: "72°", note: "家室、婚姻、生活环境。出了问题就是事。" },
  癸: { name: "昭阳", xiang: "变", deg: "24°", note: "变化与变故。好可变差，差也可变好。" },
};

const DOOR_TEXT: Record<string, { tone: DoorTone; note: string }> = {
  休门: { tone: "ji", note: "休养生息、积蓄、和谐。宜静守、调养、缓和，不宜妄动。" },
  生门: { tone: "ji", note: "生长、求财、营建、求职。生门是生机与财路之门，顺则事有着落。" },
  开门: { tone: "ji", note: "开创、公开、官运、贵人。宜求名、开业、见人、把事情摊开。" },
  伤门: { tone: "xiong", note: "损伤、争斗、手术、竞争。只宜捕捉、讨债、竞技，吉事忌入。" },
  杜门: { tone: "ping", note: "闭塞、隐藏、保密。宜遁藏、堵塞漏洞，不宜开张张扬。" },
  景门: { tone: "ping", note: "文书、文化、名声，也主虚幻与假象。利文事，不利实财落地。" },
  死门: { tone: "xiong", note: "终结、阻滞、死气。不宜兴作。旧事可了，新事难生。" },
  惊门: { tone: "xiong", note: "惊吓、口舌、官非、惊扰。宜防言语与突发，不宜托大事。" },
};

const STAR_TEXT: Record<string, string> = {
  天蓬: "智谋与险，主盗、冒险、暗中行动。",
  天芮: "问题与学问，主病、迟滞、需要化解的结。",
  天冲: "冲击与武，来得快，也容易撞。",
  天辅: "辅佐与文化，主文书、帮助、文曲一路。",
  天禽: "中正。诚实、居中、不偏不倚的一股气。",
  天心: "心机与医药，主谋略、领导、可治可断。",
  天柱: "口舌与破坏，主争、破、说破。",
  天任: "责任与田土，主稳、承受、慢慢做成。",
  天英: "文明与火光，主名声、血光、急躁。",
};

const GOD_TEXT: Record<string, string> = {
  值符: "贵气与主导。此宫是当下时辰的首领。",
  螣蛇: "虚惊、缠绕、梦魇般的反复。",
  太阴: "阴私、谋划、隐密之事。",
  六合: "和合、合作、婚约与成交。",
  白虎: "凶伤、血光、刚猛的压力。",
  玄武: "盗失、暧昧、说不清的流动。",
  九地: "隐伏、稳定、宜守不宜扬。",
  九天: "扬名、主动、气往上走。",
};

const SHICHEN = [
  { name: "子", from: 23, to: "01:00" },
  { name: "丑", from: 1, to: "03:00" },
  { name: "寅", from: 3, to: "05:00" },
  { name: "卯", from: 5, to: "07:00" },
  { name: "辰", from: 7, to: "09:00" },
  { name: "巳", from: 9, to: "11:00" },
  { name: "午", from: 11, to: "13:00" },
  { name: "未", from: 13, to: "15:00" },
  { name: "申", from: 15, to: "17:00" },
  { name: "酉", from: 17, to: "19:00" },
  { name: "戌", from: 19, to: "21:00" },
  { name: "亥", from: 21, to: "23:00" },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function shichenStart(d: Date): Date {
  const x = new Date(d);
  const h = x.getHours();
  if (h === 23) {
    x.setMinutes(0, 0, 0);
    return x;
  }
  if (h === 0) {
    x.setDate(x.getDate() - 1);
    x.setHours(23, 0, 0, 0);
    return x;
  }
  x.setHours(h % 2 === 1 ? h : h - 1, 0, 0, 0);
  return x;
}

export function palaceHolding(chart: Chart, zhi: string): PalaceView | undefined {
  const found = Object.entries(PALACE_ZHIS).find(([, zhis]) => zhis.includes(zhi));
  if (!found) return undefined;
  return chart.palaces.find((p) => p.id === Number(found[0]));
}

export function ganXiang(gan: string): string {
  return SHEN[gan]?.xiang ?? "";
}

export function shiftShichen(d: Date, steps: number): Date {
  const start = shichenStart(d);
  return new Date(start.getTime() + steps * 2 * 60 * 60 * 1000);
}

export function toLocalInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, m, day, h, mi] = match;
  return new Date(Number(y), Number(m) - 1, Number(day), Number(h), Number(mi), 0, 0);
}

function solarToDate(solar: { getYear: () => number; getMonth: () => number; getDay: () => number; getHour: () => number; getMinute: () => number; getSecond: () => number }): Date {
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond());
}

function shichenOf(d: Date): { name: string; range: string } {
  const h = d.getHours();
  const item = h === 23 || h === 0 ? SHICHEN[0] : SHICHEN.find((s) => s.from === (h % 2 === 1 ? h : h - 1));
  const found = item ?? SHICHEN[0];
  if (found.name === "子") return { name: "子", range: "子时 23:00–00:59" };
  return { name: found.name, range: `${found.name}时 ${pad(found.from)}:00–${pad(found.from + 1)}:59` };
}

function placeStems(ju: number, yang: boolean): Record<number, string> {
  const order = yang ? YANG_ORDER : YIN_ORDER;
  const start = order.indexOf(ju);
  const map: Record<number, string> = {};
  for (let i = 0; i < 9; i += 1) {
    map[order[(start + i) % 9]] = STEM_FLY[i];
  }
  return map;
}

function xunOf(hourGz: string): { head: string; yi: string; kong: string[]; index: number } {
  const gan = hourGz[0] ?? "甲";
  const zhi = hourGz[1] ?? "子";
  const gi = Math.max(0, GANS.indexOf(gan));
  const zi = Math.max(0, ZHIS.indexOf(zhi));
  const head = `甲${ZHIS[(zi - gi + 12) % 12]}`;
  return { head, yi: XUN_YI[head] ?? "戊", kong: XUN_KONG[head] ?? [], index: gi };
}

function walk(start: number, steps: number, yang: boolean): number {
  const order = yang ? YANG_ORDER : YIN_ORDER;
  const i = order.indexOf(start);
  return order[(i + steps) % 9];
}

function ringIndex(palace: number): number {
  return RING.indexOf(palace);
}

function horsePalace(zhi: string): number {
  if ("申子辰".includes(zhi)) return 8;
  if ("寅午戌".includes(zhi)) return 2;
  if ("巳酉丑".includes(zhi)) return 6;
  return 4;
}

function doorTone(door?: string): DoorTone {
  return door ? (DOOR_TEXT[door]?.tone ?? "ping") : "ping";
}

function ganLine(gan: string): string {
  const s = SHEN[gan];
  if (!s) return gan;
  return `${gan} · ${s.name} · ${s.xiang}（${s.deg}）`;
}

function palaceGloss(input: {
  meta: (typeof DISPLAY)[number];
  diGan: string;
  tianGan: string;
  extraGan?: string;
  star: string;
  extraStar?: string;
  door?: string;
  god?: string;
  marks: string[];
}): Gloss[] {
  const { meta, diGan, tianGan, extraGan, star, extraStar, door, god, marks } = input;
  const gloss: Gloss[] = [
    { label: "宫位", text: `${meta.name}宫，${meta.dir}，五行属${meta.element}。` },
  ];
  if (star !== "—") {
    gloss.push({
      label: "九星",
      text: `${star}${extraStar ? `，同宫${extraStar}` : ""}。${STAR_TEXT[star] ?? ""}${extraStar ? STAR_TEXT[extraStar] ?? "" : ""}`,
    });
    gloss.push({
      label: "天盘干",
      text: `${ganLine(tianGan)}。${SHEN[tianGan]?.note ?? ""}这是本时辰转到此宫的活气。`,
    });
    if (extraGan) gloss.push({ label: "天禽所带", text: `${ganLine(extraGan)}。天禽从中宫带出这一干。` });
  } else {
    gloss.push({ label: "中宫", text: "中五无门无神。天禽随天芮出走，中宫地盘干寄坤二参看。" });
  }
  gloss.push({
    label: "地盘干",
    text: `${ganLine(diGan)}。${SHEN[diGan]?.note ?? ""}这是本局落定的底。`,
  });
  if (door) gloss.push({ label: "八门", text: `${door}。${DOOR_TEXT[door]?.note ?? ""}` });
  if (god) gloss.push({ label: "八神", text: `${god}。${GOD_TEXT[god] ?? ""}` });
  if (marks.length) gloss.push({ label: "标记", text: marks.join("、") + "。" });
  return gloss;
}

function locate(palaces: PalaceView[], pred: (p: PalaceView) => boolean): PalaceView | undefined {
  return palaces.find(pred);
}

function where(p: PalaceView | undefined): string {
  if (!p) return "未入八宫";
  return `${p.name}宫${p.door ? p.door : "中宫"}`;
}

const JIANG: Array<{ zhi: string; name: string; xiang: string; note: string }> = [
  { zhi: "子", name: "困敦", xiang: "偏官", note: "暗中的管束、不能明说的上司与压力。" },
  { zhi: "丑", name: "赤奋若", xiang: "业", note: "家业、产业、房子，也包括自己作下的业。" },
  { zhi: "寅", name: "摄提格", xiang: "官", note: "正官。领导、父亲、老师，以及名分上的约束。" },
  { zhi: "卯", name: "单阏", xiang: "禄", note: "才华、学业、技艺、俸禄。" },
  { zhi: "辰", name: "执徐", xiang: "力", note: "贵人、助力、扶持。" },
  { zhi: "巳", name: "大荒落", xiang: "财", note: "收入、资产、可兑现之物。" },
  { zhi: "午", name: "敦牂", xiang: "斗", note: "装财的斗：身体、家业、公司。有财无斗，仍是流水。" },
  { zhi: "未", name: "协洽", xiang: "世", note: "家室、婚姻、生活环境。事久则看协洽。" },
  { zhi: "申", name: "涒滩", xiang: "刀", note: "伤害、手术、公检法、辖制自己的刃。也可是能用的刀。" },
  { zhi: "酉", name: "作噩", xiang: "兵", note: "下属与可动用的力量。兵能用，也能反伤。" },
  { zhi: "戌", name: "淹茂", xiang: "变", note: "变化与隐伏。戌合淹茂，宜寻隐物。" },
  { zhi: "亥", name: "大渊献", xiang: "偏禄", note: "不公开的俸禄、第二技艺。亥看后世。" },
];

function doorWord(p?: PalaceView): string {
  if (!p?.door) return "寄中";
  if (p.tone === "ji") return "落吉门";
  if (p.tone === "xiong") return "落凶门";
  return "落平门";
}

function palaceOfZhi(palaces: PalaceView[], zhi: string): PalaceView | undefined {
  return palaces.find((p) => (PALACE_ZHIS[p.id] ?? []).includes(zhi));
}

function buildBriefs(palaces: PalaceView[], yang: boolean, hourZhi: string): Brief[] {
  if (!yang) {
    return JIANG.map((row) => {
      const palace = palaceOfZhi(palaces, row.zhi);
      return {
        key: row.zhi,
        title: row.xiang,
        hot: row.zhi === hourZhi,
        body: `${row.zhi}（${row.name}，${row.xiang}）在${where(palace)}，同宫${palace?.star ?? "—"}、天盘${palace?.tianGan ?? "—"}。${doorWord(palace)}。${row.note}`,
      };
    });
  }

  const order = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  return order.map((gan) => {
    const meta = SHEN[gan];
    if (gan === "甲") {
      const fu = locate(palaces, (p) => p.god === "值符");
      return {
        key: "jia",
        title: "官",
        hot: false,
        body: fu
          ? `甲（阏逢，官）遁而不现，值符在${where(fu)}，同宫${fu.star}、天盘${fu.tianGan}。官是名分与约束，看这里。`
          : "此局未见值符，官无落点。",
      };
    }
    const tian = locate(palaces, (p) => p.tianGan === gan || p.extraGan === gan);
    const di = locate(palaces, (p) => p.diGan === gan);
    const body = [
      tian ? `天盘${gan}（${meta.name}，${meta.xiang}）在${where(tian)}，同宫${tian.star}。${doorWord(tian)}。${meta.note}` : `天盘未见${gan}。`,
      di && di.id !== tian?.id ? `地盘${gan}在${where(di)}。` : "",
    ]
      .filter(Boolean)
      .join("");
    return { key: gan, title: meta.xiang, hot: (PALACE_ZHIS[tian?.id ?? -1] ?? []).includes(hourZhi), body };
  });
}

export function buildChart(when: Date): Chart {
  const lunar = Solar.fromDate(when).getLunar();
  const termQi = lunar.getPrevJieQi(false);
  const nextQi = lunar.getNextJieQi(false);
  const termDate = solarToDate(termQi.getSolar());
  const elapsed = Math.max(0, when.getTime() - termDate.getTime());
  const shichenElapsed = Math.floor(elapsed / (2 * 60 * 60 * 1000));
  const yuanIndex: 0 | 1 | 2 = shichenElapsed < 60 ? 0 : shichenElapsed < 120 ? 1 : 2;
  const term = termQi.getName();
  const yang = term in YANG_JU;
  const table = (yang ? YANG_JU[term] : YIN_JU[term]) ?? [1, 1, 1];
  const ju = table[yuanIndex];
  const dun: Dun = yang ? "阳遁" : "阴遁";
  const yuan: Yuan = (["上元", "中元", "下元"] as const)[yuanIndex];
  const qiStatus = shichenElapsed >= 180 ? "接气" : "常";

  const pillars = {
    year: lunar.getYearInGanZhiExact(),
    month: lunar.getMonthInGanZhiExact(),
    day: lunar.getDayInGanZhiExact(),
    hour: lunar.getTimeInGanZhi(),
  };
  const xun = xunOf(pillars.hour);
  const di = placeStems(ju, yang);
  const xunPalace = Number(Object.entries(di).find(([, g]) => g === xun.yi)?.[0] ?? 1);
  const zhiFu = STAR_OF[xunPalace] ?? "天禽";
  const zhiShi = xunPalace === 5 ? "死门" : (DOOR_OF[xunPalace] ?? "死门");

  const hourGan = pillars.hour[0] === "甲" ? xun.yi : pillars.hour[0];
  let target = Number(Object.entries(di).find(([, g]) => g === hourGan)?.[0] ?? 1);
  if (target === 5) target = 2;

  const origin = zhiFu === "天禽" ? 2 : Number(Object.entries(STAR_OF).find(([, s]) => s === zhiFu)?.[0] ?? 2);
  const steps = (ringIndex(target) - ringIndex(origin) + 8) % 8;

  const starAt: Record<number, string> = {};
  const tianAt: Record<number, string> = {};
  for (const palace of RING) {
    const from = RING[(ringIndex(palace) - steps + 8) % 8];
    starAt[palace] = STAR_OF[from] ?? "天蓬";
    tianAt[palace] = di[from] ?? "戊";
  }
  const ruiDest = RING[(ringIndex(2) + steps) % 8];
  const extraStarAt: Record<number, string | undefined> = { [ruiDest]: "天禽" };
  const extraGanAt: Record<number, string | undefined> = { [ruiDest]: di[5] };

  const doorLand = walk(xunPalace, xun.index, yang);
  const doorVisual = doorLand === 5 ? 2 : doorLand;
  const doorIdx = DOOR_SEQ.indexOf(zhiShi);
  const landIdx = ringIndex(doorVisual);
  const doorAt: Record<number, string> = {};
  for (let k = 0; k < 8; k += 1) {
    doorAt[RING[(landIdx + (k - doorIdx) + 80) % 8]] = DOOR_SEQ[k];
  }

  const zhiFuPalace = zhiFu === "天禽" ? ruiDest : RING[(ringIndex(origin) + steps) % 8];
  const godAt: Record<number, string> = {};
  const godStart = ringIndex(zhiFuPalace);
  for (let i = 0; i < 8; i += 1) {
    const idx = yang ? (godStart + i) % 8 : (godStart - i + 80) % 8;
    godAt[RING[idx]] = GODS[i];
  }

  const hourZhi = pillars.hour[1] ?? "子";
  const horse = horsePalace(hourZhi);
  const horseName = DISPLAY.find((p) => p.id === horse)?.name ?? "";

  const shichen = shichenOf(when);
  const nextDate = solarToDate(nextQi.getSolar());

  const palaces: PalaceView[] = DISPLAY.map((meta) => {
    const isCenter = meta.id === 5;
    const marks: string[] = [];
    if (!isCenter && doorAt[meta.id] === zhiShi && meta.id === doorVisual) marks.push("值使");
    if (xun.kong.some((z) => (PALACE_ZHIS[meta.id] ?? []).includes(z))) marks.push("旬空");
    if (meta.id === horse) marks.push("驿马");
    const star = isCenter ? "—" : (starAt[meta.id] ?? "—");
    const door = isCenter ? undefined : doorAt[meta.id];
    const god = isCenter ? undefined : godAt[meta.id];
    const view: PalaceView = {
      id: meta.id,
      name: meta.name,
      dir: meta.dir,
      element: meta.element,
      diGan: di[meta.id] ?? "",
      tianGan: isCenter ? di[meta.id] ?? "" : (tianAt[meta.id] ?? ""),
      extraGan: extraGanAt[meta.id],
      star,
      extraStar: extraStarAt[meta.id],
      door,
      god,
      marks,
      tone: doorTone(door),
      gloss: [],
    };
    view.gloss = palaceGloss({ ...view, meta });
    return view;
  });

  const sheng = palaces.find((p) => p.door === "生门");

  return {
    pillars,
    shichenName: shichen.name,
    shichenRange: shichen.range,
    term,
    nextTerm: nextQi.getName(),
    nextTermLabel: `${nextQi.getName()} ${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())} ${pad(nextDate.getHours())}:${pad(nextDate.getMinutes())}`,
    yuan,
    qiStatus,
    dun,
    ju,
    zhiFu,
    zhiShi,
    xun: `${xun.head}旬（${xun.yi}）`,
    kong: xun.kong.join(""),
    horse: `${ZHIS[horse === 8 ? 2 : horse === 2 ? 8 : horse === 6 ? 11 : 5]} · ${horseName}`,
    xiu: `${lunar.getXiu()}宿`,
    xiuLuck: lunar.getXiuLuck(),
    palaces,
    shengMenId: sheng?.id ?? 1,
    briefs: buildBriefs(palaces, yang, pillars.hour[1] ?? "子"),
    sizheng:
      "阳遁十神：甲官、乙禄、丙财、丁斗、戊业、己力、庚刀、辛兵、壬世、癸变。阴遁十二将：子偏官、丑业、寅官、卯禄、辰力、巳财、午斗、未世、申刀、酉兵、戌变、亥偏禄。盘下随本局阴阳列出。吉门入死地则不吉，凶门入死地则气平。用盘之前，先问这一步是不是正言、正行、正心。",
  };
}
