import TopBar from "../components/TopBar.jsx";
import LineChart from "../components/LineChart.jsx";
import { KpiCard } from "../components/Ui.jsx";
import { usePeriod } from "../hooks/usePeriod.jsx";
import { CHANNEL, HOJE, LIVES, SUPPORTERS, livesInPeriod, summary } from "../lib/data.js";
import { brl, ddmm, fmt, pct } from "../lib/format.js";

const AVATAR_COLORS = ["#8B5CF6", "#22D3EE", "#F472B6", "#34D399", "#FBBF24", "#A78BFA"];

export default function Community() {
  const { period } = usePeriod();
  const s = summary(livesInPeriod(period));
  const p = summary(livesInPeriod(period, 1));

  // Total de seguidores ao fim de cada dia, contando para trás a partir de hoje.
  const series = [];
  for (let d = period - 1; d >= 0; d--) {
    const after = LIVES.filter((l) => l.daysAgo < d).reduce((acc, l) => acc + l.newFollowers, 0);
    series.push({ d, v: CHANNEL.followers - after });
  }
  const day = (d) => {
    const x = new Date(HOJE);
    x.setDate(HOJE.getDate() - d);
    return ddmm(x);
  };
  const base = Math.floor(Math.min(...series.map((x) => x.v)) / 100) * 100;
  const mid = Math.floor(series.length / 2);

  return (
    <>
      <TopBar title="Comunidade" subtitle="Quem acompanha e apoia o canal" />
      <section className="grid g4 kpis">
        <KpiCard label="Seguidores" value={fmt(CHANNEL.followers)} delta={pct(CHANNEL.followers, CHANNEL.followers - s.followers)} foot="vs. início do período" />
        <KpiCard label="Novos inscritos" value={fmt(s.subs)} delta={pct(s.subs, p.subs)} foot="vs. período anterior" />
        <KpiCard label="Inscritos ativos" value={fmt(CHANNEL.activeSubs)} foot="Meta: 100 inscritos" />
        <KpiCard label="Lives no período" value={fmt(s.count)} delta={pct(s.count, p.count)} foot="vs. período anterior" />
      </section>
      <div className="grid split">
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Crescimento de seguidores</h3>
              <div className="hint">Total acumulado por dia</div>
            </div>
          </div>
          <LineChart
            width={760}
            height={320}
            padLeft={56}
            color="var(--cyan)"
            offset={base}
            values={series.map((x) => x.v - base)}
            tips={series.map((x) => (<><b>{fmt(x.v)}</b> seguidores em {day(x.d)}</>))}
            xTicks={[[0, day(series[0].d)], [mid, day(series[mid].d)], [series.length - 1, day(0)]]}
          />
        </div>
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Maiores apoiadores</h3>
              <div className="hint">Inscrições e apoios no mês</div>
            </div>
          </div>
          {SUPPORTERS.map((sp, i) => (
            <div key={sp.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ width: 18, color: "var(--text-3)", fontSize: 13 }}>{i + 1}</span>
              <span className="avatar" style={{ width: 34, height: 34, background: AVATAR_COLORS[i] }}>{sp.name[0].toUpperCase()}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500 }}>{sp.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{sp.note}</div>
              </div>
              <b className="num" style={{ fontWeight: 600 }}>{brl(sp.total)}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
