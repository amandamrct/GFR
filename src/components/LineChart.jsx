import { useId, useState } from "react";
import { fmt } from "../lib/format.js";
import { useTooltip } from "./Tooltip.jsx";
import { Empty } from "./Ui.jsx";

/** Escolhe um teto "redondo" para o eixo Y (ex.: 350 com 7 marcas de 50). */
function niceScale(raw) {
  for (const step of [10, 25, 50, 100, 200, 250, 500, 1000, 2000]) {
    const n = Math.ceil(raw / step);
    if (n <= 5) return { max: n * step, ticks: Math.max(2, n) };
  }
  return { max: raw, ticks: 4 };
}

/**
 * Gráfico de área em SVG, com marcação de pico opcional e balão ao passar o mouse.
 * values: números; tips: conteúdo do balão para cada ponto; xTicks: [[índice, texto]].
 */
export default function LineChart({ values, tips, xTicks = [], color = "var(--purple)", width = 800, height = 300, peak, offset = 0, padLeft = 44 }) {
  const id = useId().replace(/:/g, "");
  const tooltip = useTooltip();
  const [hover, setHover] = useState(null);

  if (values.length < 2) return <Empty title="Poucos dados neste período">Escolha um período maior para ver o gráfico.</Empty>;

  const pad = { l: padLeft, r: 16, t: 14, b: xTicks.length ? 28 : 8 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const { max, ticks } = niceScale(Math.max(...values));
  const x = (i) => pad.l + i * (iw / (values.length - 1));
  const y = (v) => pad.t + ih - (v / max) * ih;

  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(values.length - 1).toFixed(1)},${pad.t + ih}L${pad.l},${pad.t + ih}Z`;

  function onMove(e) {
    const box = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - box.left) / box.width) * width;
    const i = Math.max(0, Math.min(values.length - 1, Math.round((vx - pad.l) / (iw / (values.length - 1)))));
    setHover(i);
    tooltip.show(tips[i], e.clientX, e.clientY);
  }
  function onLeave() {
    setHover(null);
    tooltip.hide();
  }

  const peakLabel = peak && (() => {
    const [pi, text] = peak;
    const tw = text.length * 6.6 + 16;
    const left = x(pi) + 10 + tw > width;
    return (
      <g>
        <line x1={x(pi)} x2={x(pi)} y1={y(values[pi])} y2={pad.t + ih} style={{ stroke: "var(--cyan)" }} strokeDasharray="2 3" />
        <circle cx={x(pi)} cy={y(values[pi])} r="5" style={{ fill: "var(--cyan)", stroke: "var(--surface)" }} strokeWidth="2" />
        <g transform={`translate(${left ? x(pi) - 10 - tw : x(pi) + 10},${Math.max(2, y(values[pi]) - 10)})`}>
          <rect width={tw} height="24" rx="6" style={{ fill: "var(--surface-2)", stroke: "var(--cyan)" }} />
          <text x="8" y="16" fontSize="12" style={{ fill: "var(--text)" }}>{text}</text>
        </g>
      </g>
    );
  })();

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de linha" onPointerMove={onMove} onPointerLeave={onLeave}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" style={{ stopColor: color, stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {Array.from({ length: ticks + 1 }, (_, k) => {
        const v = (max / ticks) * k;
        return (
          <g key={k}>
            <line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} style={{ stroke: "var(--grid)" }} strokeDasharray={k ? "3 4" : undefined} />
            <text x={pad.l - 8} y={y(v) + 4} fontSize="11" textAnchor="end" style={{ fill: "var(--text-3)" }}>{fmt(v + offset)}</text>
          </g>
        );
      })}
      <path d={area} fill={`url(#${id}-g)`} />
      <path d={line} fill="none" style={{ stroke: color }} strokeWidth="2.2" strokeLinejoin="round" />
      {xTicks.map(([i, t]) => (
        <text key={i} x={x(i)} y={height - 6} fontSize="11" textAnchor={i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"} style={{ fill: "var(--text-3)" }}>{t}</text>
      ))}
      {peakLabel}
      {hover !== null && (
        <>
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} style={{ stroke: "var(--text-3)", opacity: 0.5 }} />
          <circle cx={x(hover)} cy={y(values[hover])} r="4.5" style={{ fill: color, stroke: "var(--surface)" }} strokeWidth="2" />
        </>
      )}
      <rect x={pad.l} y={pad.t} width={iw} height={ih} fill="transparent" />
    </svg>
  );
}
