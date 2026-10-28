import TopBar from "../components/TopBar.jsx";
import Icon from "../components/Icon.jsx";
import { ProgressBar } from "../components/Ui.jsx";
import { CHANNEL, HOJE, LIVES, livesInPeriod, summary } from "../lib/data.js";
import { fmt } from "../lib/format.js";

export default function Goals() {
  const last30 = summary(livesInPeriod(30));
  const monthHours = LIVES.filter((l) => l.date.getMonth() === HOJE.getMonth() && l.date.getFullYear() === HOJE.getFullYear()).reduce((s, l) => s + l.durationMin, 0) / 60;

  const goals = [
    ["10 mil seguidores", CHANNEL.followers, 10000, "até 31/12"],
    ["100 inscritos ativos", CHANNEL.activeSubs, 100, "até 30/11"],
    ["Média de 200 espectadores", Math.round(last30.avg), 200, "média dos últimos 30 dias"],
    ["60 horas de live no mês", Math.round(monthHours), 60, "outubro"],
  ];

  const maxDuration = Math.max(...LIVES.map((l) => l.durationMin));
  const maxPeak = Math.max(...LIVES.map((l) => l.peakViewers));
  const achievements = [
    ["Primeira live", "Fez a primeira transmissão", true, "#8B5CF6"],
    ["Maratona", "Live com mais de 6 horas", maxDuration >= 360, "#22D3EE"],
    ["Sábado lotado", "400 espectadores ao mesmo tempo", maxPeak >= 400, "#F472B6"],
    ["Comunidade fiel", "50 inscritos ativos", CHANNEL.activeSubs >= 50, "#34D399"],
    ["Raid recebida", "Recebeu uma raid com 50 pessoas", true, "#FBBF24"],
    ["Um ano de canal", "Faltam 47 dias", false],
    ["Dez mil", "10.000 seguidores", CHANNEL.followers >= 10000],
    ["Noite inteira", "Live das 21h às 6h", false],
  ];
  const unlocked = achievements.filter((a) => a[2]).length;

  return (
    <>
      <TopBar title="Metas e conquistas" subtitle="O que falta para o próximo nível do canal" showPeriod={false} />
      <section className="grid g2">
        {goals.map(([name, value, target, note]) => {
          const progress = (value / target) * 100;
          return (
            <div className="card" key={name}>
              <div className="card-h">
                <div>
                  <h3>{name}</h3>
                  <div className="hint">{note}</div>
                </div>
                <span className="tag">{Math.round(Math.min(100, progress))}%</span>
              </div>
              <ProgressBar value={progress} label={name} />
              <div className="muted" style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
                <span>{fmt(value)} de {fmt(target)}</span>
                <span>{value >= target ? "Meta batida" : `Faltam ${fmt(target - value)}`}</span>
              </div>
            </div>
          );
        })}
      </section>
      <div className="card">
        <div className="card-h">
          <div>
            <h3>Conquistas</h3>
            <div className="hint">{unlocked} de {achievements.length} desbloqueadas</div>
          </div>
        </div>
        <div className="grid g4" style={{ gap: 14 }}>
          {achievements.map(([name, desc, done, color]) => (
            <div key={name} className="ach" style={done ? { borderColor: `${color}66`, background: `${color}14` } : undefined}>
              <div className="ach-i" style={done ? { background: color } : undefined}>
                <Icon name={done ? "trophy" : "lock"} color={done ? "#0F1020" : "var(--text-3)"} size={24} />
              </div>
              <div>
                <b style={done ? undefined : { color: "var(--text-3)" }}>{name}</b>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
