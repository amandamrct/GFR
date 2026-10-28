import raw from "../data/lives.json";
import { DIA, fmt, fmt1, pct } from "./format.js";

export const HOJE = new Date(`${raw.generatedFor}T12:00:00`);
export const CHANNEL = raw.channel;
export const SUPPORTERS = raw.supporters;

export const GAMES = {
  Phasmophobia: { genre: "terror", color: "#8B5CF6" },
  "Outlast 2": { genre: "terror", color: "#F472B6" },
  "Hollow Knight": { genre: "indie", color: "#22D3EE" },
  Valorant: { genre: "tiro", color: "#FBBF24" },
  "Stardew Valley": { genre: "cozy", color: "#34D399" },
  "Só conversa": { genre: "conversa", color: "#A3A3C2" },
};

export const GENRE_TXT = {
  terror: "jogos de terror",
  indie: "jogos indie",
  tiro: "jogos de tiro",
  cozy: "jogos cozy",
  conversa: "lives de conversa",
};

// Converte o JSON em objetos prontos para a interface.
export const LIVES = raw.lives.map((l) => {
  const date = new Date(`${l.date}T12:00:00`);
  return {
    ...l,
    date,
    dow: date.getDay(),
    hour: Math.floor(l.startMin / 60),
    daysAgo: Math.round((HOJE - date) / 86400000),
  };
});

export const findLive = (id) => LIVES.find((l) => l.id === Number(id));

/** Lives de um período de `days` dias. offset 1 = o período anterior. */
export function livesInPeriod(days, offset = 0) {
  const start = offset * days;
  const end = start + days - 1;
  return LIVES.filter((l) => l.daysAgo >= start && l.daysAgo <= end);
}

export function summary(lives) {
  if (!lives.length) return { count: 0, avg: 0, peak: 0, hours: 0, followers: 0, revenue: 0, subs: 0 };
  const sum = (k) => lives.reduce((s, l) => s + l[k], 0);
  return {
    count: lives.length,
    avg: sum("avgViewers") / lives.length,
    peak: Math.max(...lives.map((l) => l.peakViewers)),
    hours: sum("durationMin") / 60,
    followers: sum("newFollowers"),
    revenue: sum("revenue"),
    subs: sum("newSubs"),
  };
}

/** Divide o período em `n` partes para as minilinhas dos cards. */
export function sparkSeries(lives, days, metric, n = 7) {
  const out = [];
  for (let k = n - 1; k >= 0; k--) {
    const a = (days * k) / n;
    const b = (days * (k + 1)) / n;
    const part = lives.filter((l) => l.daysAgo >= a && l.daysAgo < b);
    out.push(part.length ? summary(part)[metric] : out.at(-1) ?? 0);
  }
  return out;
}

export function byGame(lives) {
  const groups = {};
  for (const l of lives) (groups[l.game] ||= []).push(l);
  return Object.entries(groups).map(([game, ls]) => {
    const s = summary(ls);
    return {
      game,
      lives: ls.length,
      hours: s.hours,
      avg: s.avg,
      followersPerHour: s.followers / s.hours,
      retention: (ls.reduce((acc, l) => acc + l.avgViewers / l.peakViewers, 0) / ls.length) * 100,
    };
  });
}

export const HEAT_DAYS = [1, 2, 3, 4, 5, 6, 0];

/** Média de espectadores por dia da semana × faixa de 2 horas. */
export function heatMatrix(lives) {
  return HEAT_DAYS.map((dow) =>
    Array.from({ length: 12 }, (_, slot) => {
      const ls = lives.filter((l) => l.dow === dow && Math.floor(l.hour / 2) === slot);
      return ls.length ? Math.round(ls.reduce((a, l) => a + l.avgViewers, 0) / ls.length) : null;
    })
  );
}

export function followersPerDay() {
  const last30 = summary(livesInPeriod(30));
  return last30.followers / 30;
}

/** Frases de insight calculadas a partir das lives do período. */
export function insights(lives) {
  const out = [];
  if (lives.length < 3) return out;
  const s = summary(lives);

  const byDow = {};
  for (const l of lives) (byDow[l.dow] ||= []).push(l.avgViewers);
  const best = Object.entries(byDow)
    .filter(([, v]) => v.length >= 2)
    .map(([d, v]) => [Number(d), v.reduce((a, b) => a + b, 0) / v.length])
    .sort((a, b) => b[1] - a[1])[0];
  if (best) {
    const p = Math.round(pct(best[1], s.avg));
    if (p > 5) out.push({ lead: `Suas lives de ${DIA[best[0]]} têm `, strong: `${p}% mais audiência`, tail: " que a média do canal.", to: "/horarios", label: "Ver melhores horários" });
  }

  const byGenre = {};
  for (const l of lives) {
    const g = (byGenre[l.genre] ||= { f: 0, h: 0 });
    g.f += l.newFollowers;
    g.h += l.durationMin / 60;
  }
  const genres = Object.entries(byGenre)
    .filter(([, v]) => v.h >= 3)
    .map(([k, v]) => [k, v.f / v.h])
    .sort((a, b) => b[1] - a[1]);
  if (genres.length >= 2) {
    const [top, bottom] = [genres[0], genres.at(-1)];
    const t = GENRE_TXT[top[0]];
    out.push({ lead: `${t.charAt(0).toUpperCase() + t.slice(1)} trazem `, strong: `${fmt1(top[1] / bottom[1])}× mais seguidores`, tail: ` por hora que ${GENRE_TXT[bottom[0]]}.`, to: "/jogos", label: "Ver jogos" });
  }

  const missing = 10000 - CHANNEL.followers;
  const weeks = Math.ceil(missing / followersPerDay() / 7);
  out.push({ lead: "Faltam ", strong: `${fmt(missing)} seguidores`, tail: ` para os 10 mil. No ritmo atual, você chega em ${weeks} semanas.`, to: "/metas", label: "Ver metas" });
  return out;
}

/** Curva de espectadores a cada 2 minutos, gerada a partir da live. */
export function viewerCurve(live) {
  let seed = live.id * 97 + 13;
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const n = Math.max(20, Math.round(live.durationMin / 2));
  const peakIndex = Math.floor(n * (0.4 + r() * 0.3));
  const points = [];
  for (let i = 0; i < n; i++) {
    let base;
    if (i < 12) base = live.avgViewers * (0.3 + (0.6 * i) / 12);
    else if (i > n - 8) base = live.avgViewers * (0.9 - (i - (n - 8)) * 0.08);
    else base = live.avgViewers * (0.96 + Math.sin(i / 7) * 0.07);
    const dist = Math.abs(i - peakIndex);
    if (dist < 5) base += (live.peakViewers - live.avgViewers * 0.96) * (1 - dist / 5);
    points.push(Math.max(4, Math.round(base * (0.95 + r() * 0.1))));
  }
  points[peakIndex] = live.peakViewers;
  return { points, peakIndex };
}
