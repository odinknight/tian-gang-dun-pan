import { Solar } from "lunar-javascript";
import { buildChart, ganXiang, palaceHolding, type Chart, type DoorTone, type PalaceView } from "./engine";

export interface Seat {
  role: "命" | "运" | "业" | "承";
  pillar: string;
  nayin: string;
  zhi: string;
  palace: string;
  door: string;
  xiang: string;
  tone: DoorTone;
}

export interface DayMark {
  date: Date;
  day: number;
  tone: DoorTone;
  door: string;
  palace: string;
  back: boolean;
}

export interface NatalPlate {
  label: string;
  palaceId: number | null;
  palace: string;
  door: string;
  tone: DoorTone;
}

export interface MonthTrend {
  dayMaster: string;
  dayXiang: string;
  natal: NatalPlate;
  nowPalaceId: number | null;
  seats: Seat[];
  days: DayMark[];
  summary: string;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function toneWord(tone: DoorTone): string {
  if (tone === "ji") return "吉";
  if (tone === "xiong") return "凶";
  return "平";
}

export function dayMasterAt(chart: Chart, gan: string): PalaceView | undefined {
  if (gan === "甲") {
    return chart.palaces.find((p) => p.id !== 5 && p.god === "值符") ?? chart.palaces.find((p) => p.god === "值符");
  }
  return (
    chart.palaces.find((p) => p.id !== 5 && (p.tianGan === gan || p.extraGan === gan)) ??
    chart.palaces.find((p) => p.tianGan === gan || p.extraGan === gan)
  );
}

function plateOf(chart: Chart, gan: string): NatalPlate {
  const palace = dayMasterAt(chart, gan);
  return {
    label: `${chart.term}${chart.yuan} ${chart.dun}${chart.ju}局`,
    palaceId: palace?.id ?? null,
    palace: palace ? `${palace.name}·${palace.dir}` : "未落宫",
    door: palace?.door ?? "中宫",
    tone: palace?.tone ?? "ping",
  };
}

export function monthTrend(birth: Date, when: Date): MonthTrend {
  const eight = Solar.fromDate(birth).getLunar().getEightChar();
  const dayGan = eight.getDayGan();
  const natalChart = buildChart(birth);
  const natal = plateOf(natalChart, dayGan);
  const now = buildChart(when);
  const nowSeat = dayMasterAt(now, dayGan);
  const pillars = [
    { role: "命" as const, pillar: eight.getYear(), nayin: eight.getYearNaYin(), zhi: eight.getYearZhi() },
    { role: "运" as const, pillar: eight.getMonth(), nayin: eight.getMonthNaYin(), zhi: eight.getMonthZhi() },
    { role: "业" as const, pillar: eight.getDay(), nayin: eight.getDayNaYin(), zhi: eight.getDayZhi() },
    { role: "承" as const, pillar: eight.getTime(), nayin: eight.getTimeNaYin(), zhi: eight.getTimeZhi() },
  ];
  const seats: Seat[] = pillars.map((item) => {
    const palace = palaceHolding(now, item.zhi);
    return {
      ...item,
      palace: palace ? `${palace.name}·${palace.dir}` : "未落宫",
      door: palace?.door ?? "中宫",
      xiang: ganXiang(palace?.tianGan ?? ""),
      tone: palace?.tone ?? "ping",
    };
  });

  const days: DayMark[] = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(when, i);
    const chart = buildChart(date);
    const palace = dayMasterAt(chart, dayGan);
    return {
      date,
      day: date.getDate(),
      tone: palace?.tone ?? "ping",
      door: palace?.door ?? "—",
      palace: palace?.name ?? "—",
      back: palace?.id != null && palace.id === natal.palaceId,
    };
  });

  const count = (tone: DoorTone, slice: DayMark[]) => slice.filter((d) => d.tone === tone).length;
  const chunks = [
    { name: "上旬", slice: days.slice(0, 10) },
    { name: "中旬", slice: days.slice(10, 20) },
    { name: "下旬", slice: days.slice(20, 30) },
  ];
  const lines = chunks.map(({ name, slice }) => {
    const ji = count("ji", slice);
    const xiong = count("xiong", slice);
    const ping = count("ping", slice);
    const back = slice.filter((d) => d.back).length;
    const lean = ji > xiong ? "偏吉" : xiong > ji ? "偏凶" : "两平";
    const span = `${ymd(slice[0].date)}至${ymd(slice[slice.length - 1].date)}`;
    return `${name}（${span}）${lean}，吉${ji}平${ping}凶${xiong}，返本命宫${back}日`;
  });
  const backAll = days.filter((d) => d.back).length;
  const better = days.filter((d) => d.tone === "ji" && natal.tone !== "ji").length;
  const worse = days.filter((d) => d.tone === "xiong" && natal.tone !== "xiong").length;
  const summary = `日主${dayGan}为${ganXiang(dayGan) || "官"}。生辰另有一局：${natal.label}，日主落${natal.palace}${natal.door}，门气${toneWord(natal.tone)}。此刻日主飞到${nowSeat?.name ?? "—"}${nowSeat?.door ?? ""}，门气${toneWord(nowSeat?.tone ?? "ping")}。向后三十日同一钟点，日主返本命宫${backAll}日，较生辰转吉${better}日，转凶${worse}日。${lines.join("。")}。`;

  return {
    dayMaster: dayGan,
    dayXiang: ganXiang(dayGan),
    natal,
    nowPalaceId: nowSeat?.id ?? null,
    seats,
    days,
    summary,
  };
}
