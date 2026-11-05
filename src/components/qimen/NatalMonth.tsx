import { fromLocalInput, toLocalInput, type DoorTone } from "@/lib/qimen/engine";
import type { MonthTrend } from "@/lib/qimen/natal";

const ROLE: Record<string, string> = {
  命: "年柱",
  运: "月柱",
  业: "日柱",
  承: "时柱，承接命、运、业",
};

const TONE: Record<DoorTone, string> = { ji: "吉", ping: "平", xiong: "凶" };

const CHUNKS = [
  { name: "上旬", from: 0, to: 10 },
  { name: "中旬", from: 10, to: 20 },
  { name: "下旬", from: 20, to: 30 },
];

function ymd(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function NatalMonth({
  birth,
  trend,
  onBirth,
  onPickDay,
}: {
  birth: Date | null;
  trend: MonthTrend | null;
  onBirth: (next: Date | null) => void;
  onPickDay: (next: Date) => void;
}) {
  return (
    <section className="mt-6 border-t border-gold/30 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl text-gold">生辰入盘</h2>
          <p className="mt-1 max-w-2xl text-sm text-paper/70">
            日主是日干，飞在天盘上，盘面用朱色高亮。生辰当天另起一局，作为本命落宫。往后三十日看日主落到哪道门，是否回到生辰那一宫。
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-paper/70">
          生辰
          <input
            type="datetime-local"
            value={birth ? toLocalInput(birth) : ""}
            onChange={(e) => onBirth(fromLocalInput(e.target.value))}
            className="ctrl w-full text-sm sm:w-56"
          />
        </label>
      </div>

      {trend ? (
        <>
          <article className="mt-3 rounded-xl border border-cinnabar/70 bg-paper/5 p-3">
            <h3 className="text-lg text-cinnabar">
              日主 {trend.dayMaster}
              {trend.dayXiang}
            </h3>
            <p className="mt-1 text-sm text-paper/85">
              本命盘 {trend.natal.label} · 日主落{trend.natal.palace} · {trend.natal.door} · {TONE[trend.natal.tone]}
            </p>
          </article>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {trend.seats.map((seat) => (
              <article key={seat.role} className="rounded-xl border border-gold/40 bg-paper/5 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg text-gold">{seat.role}</h3>
                  <span className={seat.tone === "xiong" ? "text-cinnabar" : "text-gold"}>{TONE[seat.tone]}</span>
                </div>
                <p className="text-xs text-paper/60">{ROLE[seat.role]}</p>
                <p className="mt-1 text-sm">
                  {seat.pillar} · {seat.nayin}
                </p>
                <p className="text-sm text-paper/80">
                  {seat.palace} · {seat.door} · {seat.xiang || "—"}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-paper/85">{trend.summary}</p>
          <div className="mt-3 flex flex-col gap-3">
            {CHUNKS.map((chunk) => (
              <div key={chunk.name}>
                <h3 className="mb-1 text-sm text-gold">{chunk.name}</h3>
                <div className="flex flex-col gap-1">
                  {trend.days.slice(chunk.from, chunk.to).map((day) => (
                    <button key={day.date.toISOString()} type="button" className="day-cell" data-tone={day.tone} onClick={() => onPickDay(day.date)}>
                      <span className="text-sm">{ymd(day.date)}</span>
                      <span className="text-sm">
                        {day.door} · {TONE[day.tone]}
                        {day.back ? " · 返" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-paper/60">格内是那天日主所临的门。标「返」表示飞回生辰那一宫。点一格，总盘拨到那一日，日主宫保持高亮。</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-paper/70">先填生辰。日干会在总盘上高亮，并另开你出生那天的局。</p>
      )}
    </section>
  );
}
