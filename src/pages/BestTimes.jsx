import TopBar from "../components/TopBar.jsx";
import Icon from "../components/Icon.jsx";
import { useTooltip } from "../components/Tooltip.jsx";
import { usePeriod } from "../hooks/usePeriod.jsx";
import { HEAT_DAYS, heatMatrix, livesInPeriod, summary } from "../lib/data.js";
import { DIA, DIA_CURTO, capitalize, fmt, pct } from "../lib/format.js";

function heatColor(v, max) {
  if (v === null) return "var(--heat-empty)";
  const t = Math.min(1, v / max);
  const a = [59, 61, 99], b = [139, 92, 246], c = [34, 211, 238];
  const mix = t < 0.6 ? a.map((x, i) => Math.round(x + ((b[i] - x) * t) / 0.6)) : b.map((x, i) => Math.round(x + ((c[i] - x) * (t - 0.6)) / 0.4));
  return `rgb(${mix})`;
}

export default function BestTimes() {
  const { period } = usePeriod();
  const tooltip = useTooltip();
  const lives = livesInPeriod(Math.max(period, 30));
  const matrix = heatMatrix(lives);

  const cells = matrix.flatMap((row, r) => row.map((v, slot) => ({ v, dow: HEAT_DAYS[r], slot }))).filter((c) => c.v !== null).sort((a, b) => b.v - a.v);
  if (!cells.length) return <TopBar title="Melhores horários" subtitle="Sem dados" />;

  const best = cells[0];
  const second = cells.find((c) => c.dow !== best.dow) ?? cells[1];
  const avg = summary(lives).avg;
  const early = cells.filter((c) => c.slot * 2 < 18);
  const tips = [
    `Mantenha a live de ${DIA[best.dow]} às ${best.slot * 2}h fixa na agenda.`,
    `Teste mais lives de ${DIA[second.dow]} às ${second.slot * 2}h: é seu segundo melhor horário.`,
  ];
  if (early.length) tips.push(`Lives antes das 18h têm média de ${fmt(early.reduce((a, c) => a + c.v, 0) / early.length)} espectadores; use esses horários para gravar conteúdo.`);

  return (
    <>
      <TopBar title="Melhores horários" subtitle="Média de espectadores por dia da semana e horário de início" />
      <div className="grid split">
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Mapa de calor da audiência</h3>
              <div className="hint">Células vazias são horários em que você não fez live</div>
            </div>
            <div className="legend">
              Menos <span style={{ display: "inline-block", width: 110, height: 10, borderRadius: 9, background: "linear-gradient(90deg,#3B3D63,#8B5CF6,#22D3EE)" }} /> Mais
            </div>
          </div>
          <div className="tbl-wrap">
            <div className="heat" role="table" aria-label="Média de espectadores por dia e horário">
              <span />
              {Array.from({ length: 12 }, (_, s) => <span key={s} className="hl">{s * 2}h</span>)}
              {matrix.map((row, r) => [
                <span key={`d${r}`} className="dl">{DIA_CURTO[HEAT_DAYS[r]]}</span>,
                ...row.map((v, slot) => (
                  <div
                    key={`${r}-${slot}`}
                    className={`hc${best.dow === HEAT_DAYS[r] && best.slot === slot ? " best" : ""}`}
                    style={{ background: heatColor(v, best.v), color: v !== null && v / best.v > 0.62 ? "#0F1020" : "#ECEBFF" }}
                    onPointerMove={v === null ? undefined : (e) => tooltip.show(<>{DIA[HEAT_DAYS[r]]}, {slot * 2}h: <b>{fmt(v)}</b> espectadores em média</>, e.clientX, e.clientY)}
                    onPointerLeave={tooltip.hide}
                  >
                    {v === null ? "" : fmt(v)}
                  </div>
                )),
              ])}
            </div>
          </div>
          {period === 7 && <p className="hint" style={{ marginTop: 12 }}>Com 7 dias há poucas lives, então o mapa usa os últimos 30 dias.</p>}
        </div>
        <div className="stack">
          <div className="card" style={{ borderColor: "rgba(34,211,238,.5)" }}>
            <div className="hint" style={{ margin: "0 0 6px" }}>Seu melhor horário</div>
            <div style={{ font: "600 24px/1.2 var(--display)" }}>{capitalize(DIA[best.dow])}, das {best.slot * 2}h às {best.slot * 2 + 2}h</div>
            <p className="muted" style={{ fontSize: 13.5, marginTop: 10 }}>{fmt(best.v)} espectadores em média, {Math.round(pct(best.v, avg))}% acima da média do canal.</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Recomendações</h3>
            {tips.map((t) => (
              <div key={t} style={{ display: "flex", gap: 10, fontSize: 13.5, padding: "7px 0" }}>
                <Icon name="check" color="var(--green)" size={18} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
