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

export interface LifeLine {
  title: string;
  body: string;
}

export interface MonthTrend {
  dayMaster: string;
  dayXiang: string;
  natal: NatalPlate;
  life: LifeLine[];
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

function spot(p?: PalaceView): string {
  if (!p) return "盘上未见";
  const star = p.star === "—" ? "无星" : `${p.star}${p.extraStar ? "带禽" : ""}`;
  const gan = p.extraGan ? `${p.tianGan}/${p.extraGan}` : p.tianGan;
  return `${p.name}·${p.dir}，${star}，${p.door ?? "无门"}，${p.god ?? "无神"}，天盘${gan}（${ganXiang(p.tianGan) || "—"}）`;
}

function byDoor(chart: Chart, door: string): PalaceView | undefined {
  return chart.palaces.find((p) => p.door === door);
}

function byGod(chart: Chart, god: string): PalaceView | undefined {
  return chart.palaces.find((p) => p.god === god);
}

function byGan(chart: Chart, gan: string): PalaceView | undefined {
  return chart.palaces.find((p) => p.id !== 5 && (p.tianGan === gan || p.extraGan === gan));
}

function lightOf(star: string, door: string): string {
  const starLine: Record<string, string> = {
    天蓬: "光在暗处，先隐后显，不宜一上来就求人看见。",
    天芮: "光带滞，先把身上的浊气清掉，光才露得出来。",
    天冲: "光走得快，冲出来就亮，也容易冲过了头。",
    天辅: "光在文书与辅佐里，不靠喧哗。",
    天禽: "光守中，不偏不倚，亮在自己能定得住。",
    天心: "光在判断，亮的是心，不是排场。",
    天柱: "光在口与名，说得出、立得住才算亮。",
    天任: "光在做事里，做成一件，亮一寸。",
    天英: "光在外面，人看得到，也最耗神。",
  };
  const doorLine: Record<string, string> = {
    开门: "开门把这道光放到名分上，一生容易被看见。",
    生门: "生门把光养在生机里，不炫，但能续。",
    休门: "休门的光往回收，贵在能歇，不在能闹。",
    景门: "景门就是光本身，显则荣，过则燥。",
    杜门: "杜门把光遮住，能守，也容易被埋没。",
    伤门: "伤门折光，亮一下就受伤，宜收不宜逞。",
    死门: "死门压光，不是没有，是要靠四正自己拨开。",
    惊门: "惊门扰光，心里一慌，亮就散。",
  };
  return `${starLine[star] ?? "星不主光，光看门。"}${doorLine[door] ?? ""}`;
}

export function readLife(chart: Chart, dayGan: string, yearZhi: string): LifeLine[] {
  const self = dayMasterAt(chart, dayGan);
  const sheng = byDoor(chart, "生门");
  const kai = byDoor(chart, "开门");
  const xiu = byDoor(chart, "休门");
  const he = byGod(chart, "六合");
  const jiu = byGod(chart, "九天");
  const yin = byGod(chart, "太阴");
  const cai = byGan(chart, "丙");
  const ye = byGan(chart, "戊");
  const zhen = chart.palaces.find((p) => p.id === 3);
  const dui = chart.palaces.find((p) => p.id === 7);
  const ming = palaceHolding(chart, yearZhi);
  const xiang = ganXiang(dayGan) || "官";
  const sameKai = self && kai && self.id === kai.id;
  const god = self?.god ?? "";
  const friendGod =
    god === "玄武"
      ? "日主身边先遇到的是玄武，朋友里有不能托底的人，话到嘴边要留一层。"
      : god === "白虎"
        ? "日主身边是白虎，交情带刃，能共事，不能放肆。"
        : god === "六合"
          ? "日主身边是六合，朋友来得自然，也容易把关系看成自己人。"
          : god === "九天"
            ? "日主身边是九天，朋友多从外面来，来得高，也走得快。"
            : god === "太阴"
              ? "日主身边是太阴，真朋友在暗处，不在热闹里。"
              : god === "值符"
                ? "日主身边是值符，能交的人少，但有一个就能定局。"
                : god
                  ? `日主身边是${god}，朋友的气质跟这尊神走。`
                  : "日主未带八神。";

  return [
    {
      title: "生辰盘",
      body: `日主${dayGan}为${xiang}，生在${chart.term}${chart.yuan}${chart.dun}${chart.ju}局。人落在${spot(self)}。这一宫是一生的座位，不是某一天的运气。${chart.dun === "阳遁" ? "阳遁，气往外走，光亮和事业都容易显在面上。" : "阴遁，气往里收，光亮和事业多在暗中长成。"}`,
    },
    {
      title: "光亮",
      body: `${lightOf(self?.star ?? "", self?.door ?? "")}${self?.marks.includes("值符") || self?.god === "值符" ? "值符同宫，这一生的光有主心骨，不靠别人点。" : "值符不在日主宫，光要自己找主，不能等别人来照。"}${self?.tone === "xiong" ? "门气偏压，光亮不是没有，是先苦后明。" : self?.tone === "ji" ? "门气为吉，光来得顺，仍要正心才守得住。" : "门气平，光不夺人，也不被人夺。"}`,
    },
    {
      title: "事业",
      body: `事业看开门：${spot(kai)}。${sameKai ? "日主就坐在开门上，事业与自己是同一个位子，名分来得直接，也躲不开。" : "日主不在开门，事业是另一宫的事，要走过去，不是坐着等。"}${kai?.tone === "ji" ? "开门为吉，名分上的路是开的。" : kai?.tone === "xiong" ? "开门受压，硬求官名容易碰壁，宜先用生门把活路做出来。" : "开门平，事业能做，不成在一朝。"}年柱为命，落${spot(ming)}，这是事业底下的那一层底盘。`,
    },
    {
      title: "财富",
      body: `财看生门与丙。生门在${spot(sheng)}。${cai && sheng && cai.id === sheng.id ? "丙为财，就在这道生门上，财和生机是一处。" : `丙为财，落${spot(cai)}。`}${sheng?.tone === "ji" ? "生门吉，财跟着生机来，宜做能长的，不宜一次掏空。" : sheng?.tone === "xiong" ? "生门受压，钱来得吃力，先养门再谈财。" : "生门平，财是流水，留得住才算有。"}${cai?.tone === "xiong" ? "丙落凶门，钱有耗，进账旁边常跟着一笔支出。" : "丙不落凶门，财本身不破。"}${ye ? `戊为业，落${spot(ye)}，产业比手里的现金更要紧。` : ""}`,
    },
    {
      title: "子女",
      body: `子女先看六合：${spot(he)}。${he?.tone === "ji" ? "六合临吉门，子女缘和，来得不算拗。" : he?.tone === "xiong" ? "六合临凶门，子女事重，或晚，或要自己多担。" : "六合门气平，子女缘在，不惊不宠。"}震三为长子一脉，${spot(zhen)}。兑七为少女一脉，${spot(dui)}。两宫门气吉则这一脉顺，凶则这一脉要早教、晚成。`,
    },
    {
      title: "朋友",
      body: `朋友看休门与外来之神。休门在${spot(xiu)}，这是能坐下来的人。九天在${spot(jiu)}，是外面来的交情。太阴在${spot(yin)}，是暗里帮得上的人。${friendGod}${xiu?.tone === "xiong" ? "休门若凶，热闹的场合少去，朋友宜少宜久。" : "休门不凶，可以有常来往的人。"}`,
    },
  ];
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
  const life = readLife(natalChart, dayGan, eight.getYearZhi());
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
    life,
    nowPalaceId: nowSeat?.id ?? null,
    seats,
    days,
    summary,
  };
}
