import { Link, useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import LineChart from "../components/LineChart.jsx";
import Icon from "../components/Icon.jsx";
import { Empty, KpiCard } from "../components/Ui.jsx";
import { useTooltip } from "../components/Tooltip.jsx";
import { LIVES, findLive, livesInPeriod, summary, viewerCurve } from "../lib/data.js";
import { DIA, dataLonga, durTxt, fmt, fmt1, hhmm, pct } from "../lib/format.js";

export default function LiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tooltip = useTooltip();
  const live = findLive(id);

  if (!live) {
    return (
      <div className="card">
        <Empty title="Live não encontrada">
          <Link to="/lives">Voltar para a lista de lives</Link>
        </Empty>
      </div>
    );
  }

  const channel = summary(livesInPeriod(90));
  const { points, peakIndex } = viewerCurve(live);
  const time = (i) => live.startMin + i * 2;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const i = Math.round(f * (points.length - 1));
    return [i, hhmm(time(i))];
  });

  // Atividade do chat acompanha a curva de audiência, com um salto no pico.
  const BINS = 40;
  const chat = Array.from({ length: BINS }, (_, i) => {
    const ci = Math.floor((i / BINS) * points.length);
    return Math.round(points[ci] * (0.15 + ((i * 37) % 11) / 90));
  });
  const peakBin = Math.floor((peakIndex / points.length) * BINS);
  const chatMax = Math.max(...chat);

  const moments = [[time(peakIndex), `Pico de ${fmt(live.peakViewers)} espectadores`, "var(--cyan)"]];
  if (live.peakViewers > 300) moments.push([time(peakIndex) + 7, `Raid de @laisplays com ${Math.round(live.peakViewers * 0.15)} pessoas`, "var(--purple)"]);
  if (live.newSubs >= 8) moments.push([time(Math.floor(points.length * 0.8)), "Meta de inscritos do dia batida", "var(--green)"]);
  else moments.push([time(Math.floor(points.length * 0.3)), `${fmt(live.newFollowers)} novos seguidores ao longo da live`, "var(--green)"]);
  moments.sort((a, b) => a[0] - b[0]);

  const index = LIVES.indexOf(live);
  const prev = LIVES[index - 1];
  const next = LIVES[index + 1];
  const vsChannel = Math.round(pct(live.avgViewers, channel.avg));

  return (
    <>
      <TopBar
        title={live.title}
        subtitle={`${live.game} na ${live.platform}, ${DIA[live.dow]}, ${dataLonga(live.date)}, das ${hhmm(live.startMin)} às ${hhmm(live.startMin + live.durationMin)}`}
        showPeriod={false}
      >
        <nav className="crumb" aria-label="Caminho">
          <Link to="/lives">Lives</Link>
          <Icon name="chev" size={14} color="var(--text-3)" />
          <span>{live.title}</span>
        </nav>
      </TopBar>

      <section className="grid g5 kpis">
        <KpiCard label="Média de espectadores" value={fmt(live.avgViewers)} foot={`${Math.abs(vsChannel)}% ${vsChannel >= 0 ? "acima" : "abaixo"} da média do canal`} />
        <KpiCard label="Pico" value={fmt(live.peakViewers)} foot={`às ${hhmm(time(peakIndex))}`} />
        <KpiCard label="Duração" value={durTxt(live.durationMin)} foot={`${points.length * 2} minutos no ar`} />
        <KpiCard label="Novos seguidores" value={`+${fmt(live.newFollowers)}`} foot={`${fmt1(live.newFollowers / (live.durationMin / 60))} por hora`} />
        <KpiCard label="Mensagens no chat" value={fmt(live.chatMessages)} foot={`${fmt(live.chatMessages / live.durationMin)} por minuto`} />
      </section>

      <div className="card">
        <div className="card-h">
          <div>
            <h3>Espectadores minuto a minuto</h3>
            <div className="hint">Medido a cada 2 minutos; passe o mouse para ver os valores</div>
          </div>
          <div className="legend">
            <span><span className="dot" style={{ background: "var(--purple)" }} />Espectadores</span>
            <span><span className="dot" style={{ background: "var(--cyan)" }} />Pico</span>
          </div>
        </div>
        <LineChart
          width={1100}
          height={260}
          values={points}
          tips={points.map((v, i) => (<><b>{fmt(v)}</b> espectadores às {hhmm(time(i))}</>))}
          xTicks={ticks}
          peak={[peakIndex, `${fmt(live.peakViewers)} espectadores às ${hhmm(time(peakIndex))}`]}
        />
      </div>

      <div className="grid split">
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Atividade do chat</h3>
              <div className="hint">Mensagens ao longo da live</div>
            </div>
          </div>
          <svg className="chart" viewBox={`0 0 ${BINS * 15} 110`} role="img" aria-label="Barras de atividade do chat">
            {chat.map((v, i) => {
              const h = Math.max(3, (v / chatMax) * 104);
              return (
                <rect
                  key={i}
                  x={i * 15}
                  y={110 - h}
                  width="10"
                  height={h}
                  rx="2"
                  style={{ fill: Math.abs(i - peakBin) <= 2 ? "var(--cyan)" : "var(--heat-0)" }}
                  onPointerMove={(e) => tooltip.show(<>{fmt(v * 6)} mensagens perto das {hhmm(time(Math.floor((i / BINS) * points.length)))}</>, e.clientX, e.clientY)}
                  onPointerLeave={tooltip.hide}
                />
              );
            })}
          </svg>
        </div>
        <div className="card">
          <div className="card-h"><h3>Momentos marcantes</h3></div>
          {moments.map(([t, text, color]) => (
            <div key={text} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
              <span className="dot" style={{ background: color }} />
              <b style={{ width: 48, fontWeight: 600 }}>{hhmm(t)}</b>
              <span className="muted">{text}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {prev && <button className="btn btn-s btn-sm" onClick={() => navigate(`/lives/${prev.id}`)}>Live anterior</button>}
            {next && <button className="btn btn-s btn-sm" onClick={() => navigate(`/lives/${next.id}`)}>Próxima live</button>}
          </div>
        </div>
      </div>
    </>
  );
}
