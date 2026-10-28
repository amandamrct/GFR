import { Link } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import InsightStrip from "../components/InsightStrip.jsx";
import LineChart from "../components/LineChart.jsx";
import { HBars, KpiCard, ProgressBar } from "../components/Ui.jsx";
import { usePeriod } from "../hooks/usePeriod.jsx";
import { CHANNEL, GAMES, HOJE, byGame, insights, livesInPeriod, sparkSeries, summary } from "../lib/data.js";
import { brl, dataLonga, ddmm, fmt, fmt1, pct } from "../lib/format.js";

export function periodSubtitle(period) {
  const start = new Date(HOJE);
  start.setDate(HOJE.getDate() - period + 1);
  return `De ${dataLonga(start)} a ${dataLonga(HOJE)}`;
}

export default function Overview() {
  const { period } = usePeriod();
  const cur = livesInPeriod(period);
  const prev = livesInPeriod(period, 1);
  const s = summary(cur);
  const p = summary(prev);

  const kpis = [
    ["Média de espectadores", fmt(s.avg), pct(s.avg, p.avg), "avg"],
    ["Pico de espectadores", fmt(s.peak), pct(s.peak, p.peak), "peak"],
    ["Horas transmitidas", `${fmt(s.hours)} h`, pct(s.hours, p.hours), "hours"],
    ["Novos seguidores", fmt(s.followers), pct(s.followers, p.followers), "followers"],
    ["Receita estimada", brl(s.revenue), pct(s.revenue, p.revenue), "revenue"],
  ];

  const mid = Math.floor((cur.length - 1) / 2);
  const ticks = cur.length ? [[0, ddmm(cur[0].date)], [mid, ddmm(cur[mid].date)], [cur.length - 1, ddmm(cur.at(-1).date)]] : [];
  const games = byGame(cur).sort((a, b) => b.followersPerHour - a.followersPerHour).slice(0, 5);
  const goal = (CHANNEL.followers / 10000) * 100;

  return (
    <>
      <TopBar title="Visão geral" subtitle={periodSubtitle(period)} />
      <InsightStrip items={insights(cur)} />

      <section className="grid g5 kpis" aria-label="Indicadores">
        {kpis.map(([label, value, delta, metric]) => (
          <KpiCard key={label} label={label} value={value} delta={delta} foot={`vs. ${period} dias anteriores`} spark={sparkSeries(cur, period, metric)} />
        ))}
      </section>

      <div className="grid split">
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Média de espectadores por live</h3>
              <div className="hint">{cur.length} lives no período; passe o mouse para ver cada uma</div>
            </div>
            <div className="legend"><span><span className="dot" style={{ background: "var(--purple)" }} />Média da live</span></div>
          </div>
          <LineChart
            width={760}
            height={320}
            values={cur.map((l) => l.avgViewers)}
            tips={cur.map((l) => (<><b>{fmt(l.avgViewers)}</b> espectadores<br />{ddmm(l.date)}, {l.title}</>))}
            xTicks={ticks}
          />
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-h">
              <div>
                <h3>Seguidores por hora de live</h3>
                <div className="hint">Por jogo, no período</div>
              </div>
            </div>
            {games.length ? (
              <HBars items={games.map((g) => ({ label: g.game, value: g.followersPerHour, color: GAMES[g.game].color }))} format={fmt1} />
            ) : (
              <p className="muted">Sem lives no período.</p>
            )}
          </div>
          <Link className="card" to="/metas" style={{ textDecoration: "none" }}>
            <div className="card-h">
              <div>
                <h3>Próxima meta</h3>
                <div className="hint">10 mil seguidores</div>
              </div>
              <span className="tag">{Math.round(goal)}%</span>
            </div>
            <ProgressBar value={goal} label="Meta de 10 mil seguidores" />
            <div className="muted" style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
              <span>{fmt(CHANNEL.followers)} seguidores</span>
              <span>10.000</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
