import { useEffect, useState } from "react";
import type { Chart, PalaceView } from "@/lib/qimen/engine";

const CX = 50;
const CY = 50;

const PALACE_AT: Record<number, number> = {
  9: 0,
  2: 45,
  7: 90,
  6: 135,
  1: 180,
  8: 225,
  3: 270,
  4: 315,
};

const BRANCHES = ["午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯", "辰", "巳"];
const XIU = "角亢氐房心尾箕斗牛女虚危室壁奎娄胃昴毕觜参井鬼柳星张翼轸".split("");
const TERMS = ["冬至", "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪"];
const GUA: Record<number, string> = { 9: "离", 2: "坤", 7: "兑", 6: "乾", 1: "坎", 8: "艮", 3: "震", 4: "巽" };

function pt(r: number, deg: number): { x: number; y: number } {
  const t = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(t), y: CY - r * Math.cos(t) };
}

function sector(r0: number, r1: number, a0: number, a1: number): string {
  const p = (r: number, a: number) => {
    const t = (a * Math.PI) / 180;
    return [CX + r * Math.sin(t), CY - r * Math.cos(t)];
  };
  const [x0, y0] = p(r1, a0);
  const [x1, y1] = p(r1, a1);
  const [x2, y2] = p(r0, a1);
  const [x3, y3] = p(r0, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

function byId(chart: Chart, id: number): PalaceView | undefined {
  return chart.palaces.find((p) => p.id === id);
}

export function Plate({
  chart,
  activeId,
  markId,
  onPick,
}: {
  chart: Chart;
  activeId: number | null;
  markId?: number | null;
  onPick: (id: number) => void;
}) {
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    setTurn((n) => n + 1);
  }, [chart.shichenRange]);

  const termIndex = TERMS.indexOf(chart.term);
  const xiuName = chart.xiu.replace("宿", "");

  return (
    <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label="天罡遁总盘" style={{ fontFamily: "var(--font-sans)" }}>
      <circle cx={CX} cy={CY} r="49" fill="var(--color-ink)" stroke="var(--color-gold)" strokeWidth="0.4" />
      <circle cx={CX} cy={CY} r="46.2" fill="none" stroke="var(--color-gold)" strokeWidth="0.15" />
      <circle cx={CX} cy={CY} r="40.6" fill="none" stroke="var(--color-gold)" strokeWidth="0.15" />
      <circle cx={CX} cy={CY} r="34.2" fill="none" stroke="var(--color-gold)" strokeWidth="0.2" />
      <circle cx={CX} cy={CY} r="22" fill="none" stroke="var(--color-gold)" strokeWidth="0.2" />
      <circle cx={CX} cy={CY} r="14.5" fill="none" stroke="var(--color-gold)" strokeWidth="0.15" />

      {BRANCHES.map((z, i) => {
        const a = i * 30;
        const here = z === chart.shichenName;
        const pos = pt(43.4, a);
        return (
          <text key={z} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={here ? "var(--color-cinnabar)" : "var(--color-paper)"} fontSize={here ? 3.1 : 2.5}>
            {z}
          </text>
        );
      })}

      {XIU.map((name, i) => {
        const a = 315 - (i + 0.5) * (360 / 28);
        const on = name === xiuName;
        const pos = pt(37.4, a);
        return (
          <text key={name} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={on ? "var(--color-cinnabar)" : "var(--color-paper)"} fontSize={on ? 2.5 : 1.7} opacity={on ? 1 : 0.72}>
            {name}
          </text>
        );
      })}

      {termIndex >= 0 ? <circle cx={pt(46.6, 180 + termIndex * 15).x} cy={pt(46.6, 180 + termIndex * 15).y} r="0.7" fill="var(--color-cinnabar)" /> : null}

      <g key={turn} className={turn > 1 ? "plate-turn" : undefined}>
        {Object.entries(PALACE_AT).map(([id, mid]) => {
          const palace = byId(chart, Number(id));
          if (!palace) return null;
          const on = palace.id === activeId;
          const a0 = mid - 22.5;
          const a1 = mid + 22.5;
          const label = pt(27.6, mid);
          const door = (palace.door ?? "").replace("门", "");
          const mine = palace.id === markId;
          return (
            <g key={id} onClick={() => onPick(palace.id)} className="cursor-pointer">
              <path
                d={sector(22, 34.2, a0, a1)}
                fill={mine ? "color-mix(in srgb, var(--color-cinnabar) 38%, var(--color-ink))" : on ? "color-mix(in srgb, var(--color-gold) 24%, var(--color-ink))" : "color-mix(in srgb, var(--color-paper) 5%, var(--color-ink))"}
                stroke={mine ? "var(--color-cinnabar)" : palace.tone === "xiong" ? "var(--color-cinnabar)" : "var(--color-gold)"}
                strokeWidth={mine ? 0.9 : on || palace.door === "生门" ? 0.45 : 0.15}
              />
              <text x={label.x} y={label.y - 1.6} textAnchor="middle" fill={mine ? "var(--color-paper)" : "var(--color-gold)"} fontSize="2.3">
                {mine ? "日主" : ""}
                {palace.star === "—" ? "" : palace.star.replace("天", "")}
                {palace.extraStar ? "禽" : ""}
              </text>
              <text x={label.x} y={label.y + 1.1} textAnchor="middle" fill={palace.tone === "ji" ? "var(--color-gold)" : palace.tone === "xiong" ? "var(--color-cinnabar)" : "var(--color-paper)"} fontSize="2.7">
                {door} · {palace.tianGan}
                {palace.extraGan ? `/${palace.extraGan}` : ""}
              </text>
              <text x={label.x} y={label.y + 3.5} textAnchor="middle" fill="var(--color-paper)" fontSize="1.8" opacity="0.8">
                {palace.god ?? ""} {palace.marks.includes("值使") ? "值使" : ""}
              </text>
            </g>
          );
        })}
      </g>

      {Object.entries(PALACE_AT).map(([id, mid]) => {
        const palace = byId(chart, Number(id));
        if (!palace) return null;
        const pos = pt(18.2, mid);
        return (
          <text key={`di-${id}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="var(--color-paper)" fontSize="2.4">
            {GUA[Number(id)]}
            {palace.diGan}
          </text>
        );
      })}

      <circle cx={CX} cy={CY} r="12.2" fill="color-mix(in srgb, var(--color-gold) 18%, var(--color-ink))" stroke="var(--color-gold)" strokeWidth="0.35" />
      <circle cx={CX} cy={CY} r="4.2" fill="none" stroke="var(--color-paper)" strokeWidth="0.35" />
      <path d={`M ${CX} ${CY - 4.2} A 2.1 2.1 0 1 1 ${CX} ${CY} A 2.1 2.1 0 1 0 ${CX} ${CY + 4.2} A 4.2 4.2 0 1 1 ${CX} ${CY - 4.2}`} fill="var(--color-paper)" />
      <text x={CX} y={41.5} textAnchor="middle" fill="var(--color-gold)" fontSize="2.6">
        {chart.dun}
        {chart.ju}局
      </text>
      <text x={CX} y={59} textAnchor="middle" fill="var(--color-paper)" fontSize="2.2">
        {chart.term} · {chart.yuan}
      </text>
      {(["南", "西", "北", "东"] as const).map((name, i) => {
        const pos = pt(47.6, i * 90);
        return (
          <text key={name} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="var(--color-gold)" fontSize="2.6">
            {name}
          </text>
        );
      })}
    </svg>
  );
}
