import { useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Icon from "../components/Icon.jsx";
import { Empty, GameTag, HBars } from "../components/Ui.jsx";
import { usePeriod } from "../hooks/usePeriod.jsx";
import { GAMES, GENRE_TXT, byGame, livesInPeriod } from "../lib/data.js";
import { fmt, fmt1 } from "../lib/format.js";

const COLUMNS = [["lives", "Lives"], ["hours", "Horas"], ["avg", "Média"], ["followersPerHour", "Seguidores/h"], ["retention", "Retenção"]];

export default function Games() {
  const { period } = usePeriod();
  const [sort, setSort] = useState({ key: "avg", dir: -1 });
  const games = byGame(livesInPeriod(period));

  if (!games.length) {
    return (
      <>
        <TopBar title="Jogos" subtitle="Como cada jogo se saiu no período" />
        <div className="card"><Empty title="Sem lives neste período">Escolha 30 ou 90 dias para comparar os jogos.</Empty></div>
      </>
    );
  }

  const top = (k) => [...games].sort((a, b) => b[k] - a[k])[0];
  const highlights = [
    ["Mais audiência", top("avg"), (g) => `${fmt(g.avg)} espectadores em média`],
    ["Mais seguidores por hora", top("followersPerHour"), (g) => `${fmt1(g.followersPerHour)} por hora de live`],
    ["Mais tempo jogado", top("hours"), (g) => `${fmt(g.hours)} horas no período`],
  ];
  const byAvg = [...games].sort((a, b) => b.avg - a.avg);
  const topGenre = GAMES[byAvg[0].game].genre;
  const sameGenre = byAvg.length > 1 && GAMES[byAvg[1].game].genre === topGenre;
  const genreName = GENRE_TXT[topGenre].replace("jogos de ", "").replace("jogos ", "");
  const sorted = [...games].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : -1) * sort.dir);
  const format = { lives: (v) => v, hours: (v) => `${fmt(v)} h`, avg: fmt, followersPerHour: fmt1, retention: (v) => `${fmt(v)}%` };

  return (
    <>
      <TopBar title="Jogos" subtitle={`Como cada jogo se saiu nos últimos ${period} dias`} />
      <section className="grid g3">
        {highlights.map(([label, g, text]) => (
          <div className="card" key={label} style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${GAMES[g.game].color}22`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon name="pad" color={GAMES[g.game].color} size={26} />
            </div>
            <div>
              <div className="hint" style={{ margin: "0 0 4px" }}>{label}</div>
              <div style={{ font: "600 20px var(--display)" }}>{g.game}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{text(g)}</div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid split-r">
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Média de espectadores por jogo</h3>
              <div className="hint">Média das lives de cada jogo</div>
            </div>
          </div>
          <HBars items={byAvg.map((g) => ({ label: g.game, value: g.avg, color: GAMES[g.game].color }))} />
          <p style={{ marginTop: 22, padding: "14px 16px", borderRadius: 12, background: "rgba(139,92,246,.12)", border: "1px solid rgba(139,92,246,.35)", fontSize: 13.5, display: "flex", gap: 10 }}>
            <Icon name="spark" color="var(--purple-2)" size={18} />
            <span>{sameGenre ? `O gênero ${genreName} é o seu forte: as duas primeiras posições são dele.` : `${byAvg[0].game} lidera a audiência no período.`}</span>
          </p>
        </div>
        <div className="card" style={{ padding: "6px 8px 0" }}>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jogo</th>
                  {COLUMNS.map(([k, label]) => (
                    <th key={k} className="num" aria-sort={sort.key === k ? (sort.dir > 0 ? "ascending" : "descending") : undefined}>
                      <button onClick={() => setSort((s) => (s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: -1 }))}>
                        {label}
                        {sort.key === k && (sort.dir > 0 ? " ▴" : " ▾")}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((g) => (
                  <tr key={g.game}>
                    <td><GameTag game={g.game} /></td>
                    {COLUMNS.map(([k]) => <td key={k} className={`num${k === "lives" || k === "hours" ? " muted" : ""}`}>{format[k](g[k])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ padding: 12 }}>Retenção é a média de espectadores dividida pelo pico: quanto maior, mais gente fica até o fim.</p>
        </div>
      </div>
    </>
  );
}
