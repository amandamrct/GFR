import TopBar from "../components/TopBar.jsx";
import Icon from "../components/Icon.jsx";
import { usePeriod } from "../hooks/usePeriod.jsx";
import { usePlatforms } from "../hooks/usePlatforms.jsx";
import { livesInPeriod } from "../lib/data.js";
import { CONTATO } from "../config.js";
import { downloadCsv } from "./Lives.jsx";

const PLATFORMS = [
  ["Twitch", "#A78BFA", "Conectada desde 12/03/2025"],
  ["YouTube", "#F472B6", "Conectada desde 02/08/2025"],
  ["Kick", "#34D399", "Conectada agora"],
];

export default function Settings({ theme, setTheme }) {
  const { period } = usePeriod();
  const { platforms, toggle } = usePlatforms();

  return (
    <>
      <TopBar title="Configurações" subtitle="Plataformas, aparência e dados do canal" showPeriod={false} />
      <div className="grid g2">
        <div className="card">
          <h3>Plataformas conectadas</h3>
          <div className="hint" style={{ marginBottom: 8 }}>Os dados das plataformas conectadas aparecem juntos no painel. Nesta demonstração a conexão é simulada.</div>
          {PLATFORMS.map(([name, color, since]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name="link" color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{platforms[name] ? since : "Desconectada"}</div>
              </div>
              <button className="toggle" role="switch" aria-checked={platforms[name]} aria-label={`Conectar ${name}`} onClick={() => toggle(name)} />
            </div>
          ))}
        </div>
        <div className="stack">
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Aparência</h3>
            <div className="grid g2" style={{ gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              {[["dark", "Escuro", "#0F1020"], ["light", "Claro", "#F4F4FA"]].map(([value, label, bg]) => (
                <button key={value} className="theme-opt" aria-pressed={theme === value} onClick={() => setTheme(value)}>
                  <i style={{ background: bg }} />
                  <b style={{ fontSize: 13.5 }}>{label}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 6 }}>Exportar dados</h3>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 14 }}>Baixe as lives dos últimos {period} dias em CSV para montar seu mídia kit ou abrir no Excel.</p>
            <button className="btn btn-s" onClick={() => downloadCsv(livesInPeriod(period), period)}>
              <Icon name="down" size={18} />
              Exportar lives em CSV
            </button>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 6 }}>Sobre este projeto</h3>
            <p className="muted" style={{ fontSize: 13.5 }}>GFR é um projeto de portfólio de UX/UI e front-end de {CONTATO.designer}. O canal Pixel Noturno, os apoiadores e todas as métricas são fictícios e gerados por script.</p>
          </div>
        </div>
      </div>
    </>
  );
}
