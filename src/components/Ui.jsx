import { GAMES } from "../lib/data.js";
import { fmt } from "../lib/format.js";

/** Variação percentual com seta e sinal (nunca só cor). */
export function Delta({ value, inverse = false }) {
  if (value === null || !Number.isFinite(value)) return <span className="delta flat">sem base</span>;
  const r = Math.round(value);
  if (r === 0) return <span className="delta flat">= 0%</span>;
  const good = inverse ? r < 0 : r > 0;
  return <span className={`delta ${good ? "up" : "down"}`}>{r > 0 ? `▲ +${r}%` : `▼ −${Math.abs(r)}%`}</span>;
}

export function Sparkline({ data, color }) {
  const w = 90;
  const h = 26;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const d = data
    .map((v, i) => `${i ? "L" : "M"}${((i * w) / (data.length - 1)).toFixed(1)},${(h - 2 - ((v - min) / (max - min || 1)) * (h - 4)).toFixed(1)}`)
    .join("");
  return (
    <svg width={w} height={h} aria-hidden="true">
      <path d={d} fill="none" style={{ stroke: color }} strokeWidth="1.8" />
    </svg>
  );
}

export function KpiCard({ label, value, delta, foot, spark }) {
  return (
    <div className="card kpi">
      <span className="k-l">{label}</span>
      <span className="k-v">{value}</span>
      <div className="k-f">
        {delta !== undefined && <Delta value={delta} />}
        {foot && <span>{foot}</span>}
      </div>
      {spark && <Sparkline data={spark} color={delta >= 0 ? "var(--green)" : "var(--pink)"} />}
    </div>
  );
}

export function HBars({ items, format = fmt }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "grid", gridTemplateColumns: "minmax(90px,140px) 1fr 52px", alignItems: "center", gap: 12, fontSize: 13 }}>
          <span className="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
          <div className="bar" style={{ height: 12 }}>
            <i style={{ width: `${(it.value / max) * 100}%`, background: it.color }} />
          </div>
          <b className="num" style={{ fontWeight: 600 }}>{format(it.value)}</b>
        </div>
      ))}
    </div>
  );
}

export function GameTag({ game }) {
  return (
    <span className="tag">
      <span className="dot" style={{ background: GAMES[game].color }} />
      {game}
    </span>
  );
}

export function PlatformTag({ platform }) {
  return <span className="tag" style={{ color: platform === "YouTube" ? "var(--pink)" : "var(--purple-2)" }}>{platform}</span>;
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <b>{title}</b>
      {children}
    </div>
  );
}

export function ProgressBar({ value, label }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="bar" style={{ height: 12 }} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <i style={{ width: `${v}%` }} />
    </div>
  );
}
