import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { buildChart, fromLocalInput, shiftShichen, toLocalInput, type PalaceView } from "@/lib/qimen/engine";
import { Plate } from "@/components/qimen/Plate";
import { NatalMonth } from "@/components/qimen/NatalMonth";
import { monthTrend } from "@/lib/qimen/natal";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [when, setWhen] = useState<Date | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [birth, setBirth] = useState<Date | null>(null);

  useEffect(() => {
    setWhen(new Date());
  }, []);

  const chart = useMemo(() => (when ? buildChart(when) : null), [when]);
  const trend = useMemo(() => (when && birth ? monthTrend(birth, when) : null), [when, birth]);
  const activeId = picked ?? trend?.nowPalaceId ?? chart?.shengMenId ?? null;
  const active = chart?.palaces.find((p) => p.id === activeId) ?? chart?.palaces[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 border-b border-gold/40 pb-4">
        <h1 className="text-3xl text-paper sm:text-4xl">天罡遁盘</h1>
        <p className="mt-2 max-w-2xl text-sm text-paper/70">
          自动对应当下时辰。可拨到下一时辰，或指定任意过去、未来的时刻。宫里的字，是这一时辰转到此处的气。
        </p>
      </header>

      {!chart || !when ? (
        <p className="text-paper/70">正在对时，排布当下令局…</p>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex flex-col gap-1 text-xs text-paper/70">
              时刻
              <input
                type="datetime-local"
                value={toLocalInput(when)}
                onChange={(e) => {
                  const next = fromLocalInput(e.target.value);
                  if (next) setWhen(next);
                }}
                className="ctrl w-full text-sm sm:w-56"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="ctrl ctrl-primary" onClick={() => setWhen(new Date())}>
                当下
              </button>
              <button type="button" className="ctrl" onClick={() => setWhen(shiftShichen(when, -1))}>
                上一时辰
              </button>
              <button type="button" className="ctrl" onClick={() => setWhen(shiftShichen(when, 1))}>
                下一时辰
              </button>
              <button type="button" className="ctrl" onClick={() => setWhen(shiftShichen(when, -12))}>
                前一日
              </button>
              <button type="button" className="ctrl" onClick={() => setWhen(shiftShichen(when, 12))}>
                后一日
              </button>
            </div>
          </div>

          <section className="mb-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="四柱" value={`${chart.pillars.year} ${chart.pillars.month} ${chart.pillars.day} ${chart.pillars.hour}`} />
            <Meta label="时辰" value={chart.shichenRange} />
            <Meta
              label="局"
              value={`${chart.term}${chart.qiStatus === "接气" ? " · 接气" : ""} · ${chart.yuan} · ${chart.dun}${chart.ju}局`}
            />
            <Meta label="值符 / 值使" value={`${chart.zhiFu} / ${chart.zhiShi}`} />
          </section>

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-paper/60">
                <span>南在上 · 点宫扇看取象</span>
                <span className="flex gap-2">
                  <button type="button" className="ctrl" onClick={() => setZoom((z) => Math.max(1, z - 0.25))}>
                    缩小
                  </button>
                  <button type="button" className="ctrl" onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}>
                    放大
                  </button>
                </span>
              </div>
              <div className="overflow-auto rounded-xl border border-gold/40 bg-ink">
                <div style={{ width: `${zoom * 100}%` }}>
                  <Plate chart={chart} activeId={activeId} markId={trend?.nowPalaceId} onPick={setPicked} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Chip label="天时" value={chart.shichenRange} />
                <Chip label="地利" value={active?.dir ?? ""} />
                <Chip label="人和" value={chart.palaces.find((p) => p.door === "生门")?.name ?? ""} />
                <Chip label="局势" value={`${chart.dun}${chart.ju}`} />
                <Chip label="门" value={active?.door ?? ""} />
                <Chip label="奇" value={["乙", "丙", "丁"].includes(active?.tianGan ?? "") ? active?.tianGan ?? "" : "—"} />
                <Chip label="神" value={active?.god ?? ""} />
              </div>
            </div>
            {active ? <Detail palace={active} sizheng={chart.sizheng} /> : null}
          </div>

          <p className="mt-4 text-sm text-gold">
            {chart.dun === "阳遁" ? "阳遁十神 · 官禄财斗业力刀兵世变" : "阴遁十二将 · 偏官业官禄力财斗世刀兵变偏禄"}
          </p>
          <section className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {chart.briefs.map((b) => (
              <article key={b.key} className={`rounded-xl border bg-paper/5 p-3 ${b.hot ? "border-cinnabar" : "border-gold/40"}`}>
                <h2 className="text-lg text-gold">
                  {b.title}
                  {b.hot ? <span className="ml-2 text-xs text-cinnabar">此时</span> : null}
                </h2>
                <p className="mt-1 text-sm text-paper/85">{b.body}</p>
              </article>
            ))}
          </section>

          <p className="mt-4 text-xs leading-relaxed text-paper/60">
            {chart.xiu}（{chart.xiuLuck}）为当日出宿，作定盘星的日标记。旬{chart.xun}，空{chart.kong}，驿马{chart.horse}。下一节气{chart.nextTermLabel}。节气一到即用上元，满六十时辰换中元，再满六十换下元；下元已满而新节气未至则接气。新节气已至则舍旧下元，直接进入新上元。
          </p>
          <NatalMonth birth={birth} trend={trend} onBirth={setBirth} onPickDay={setWhen} />
        </>
      )}
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/30 px-3 py-2">
      <div className="text-xs text-gold">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-gold/40 px-2 py-1 text-paper">
      <span className="text-gold">{label}</span> {value}
    </span>
  );
}

function Detail({ palace, sizheng }: { palace: PalaceView; sizheng: string }) {
  return (
    <aside className="rounded-xl border border-gold/40 bg-paper/5 p-4">
      <p className="border-b border-gold/30 pb-3 text-sm text-paper/90">{sizheng}</p>
      <h2 className="mt-3 text-xl">
        {palace.name}宫
        <span className="ml-2 text-sm font-sans text-paper/60">{palace.dir}</span>
      </h2>
      <ul className="mt-3 space-y-3">
        {palace.gloss.map((g) => (
          <li key={g.label}>
            <div className="text-xs text-gold">{g.label}</div>
            <p className="text-sm text-paper/90">{g.text}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
