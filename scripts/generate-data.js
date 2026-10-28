// Gera os dados fictícios do canal "Pixel Noturno" em src/data/lives.json.
// Os números são aleatórios, mas com tendências plantadas de propósito
// (sábado à noite e jogos de terror rendem mais) para que os insights
// do painel tenham algo real a dizer. A semente fixa deixa o resultado
// igual a cada execução.
//
// Uso: npm run data

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/lives.json");
const HOJE = "2026-10-27";
const DIAS = 180;

function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GAMES = {
  Phasmophobia: { genre: "terror", base: 188, fph: 36 },
  "Outlast 2": { genre: "terror", base: 170, fph: 34 },
  "Hollow Knight": { genre: "indie", base: 120, fph: 13 },
  Valorant: { genre: "tiro", base: 104, fph: 9 },
  "Stardew Valley": { genre: "cozy", base: 95, fph: 11 },
  "Só conversa": { genre: "conversa", base: 76, fph: 6 },
};

const TITLES = {
  Phasmophobia: ["Caçando fantasmas com os inscritos", "Phasmo no nível pesadelo", "Sábado de Phasmo", "Phasmo com as luzes apagadas", "Investigação paranormal"],
  "Outlast 2": ["Terror até o amanhecer", "Outlast 2, parte {n}", "Não olhe pra trás", "Sobrevivendo ao Outlast 2"],
  "Hollow Knight": ["Tentando zerar sem morrer", "Hollow Knight: chefe novo", "Explorando Hallownest", "Morrendo com estilo"],
  Valorant: ["Ranqueada com a galera", "Subindo de elo", "Valorant com os inscritos"],
  "Stardew Valley": ["Fazendinha e conversa", "Fazendinha, dia {n}", "Colheita de domingo"],
  "Só conversa": ["Café e conversa", "Bate-papo e planos do canal", "Respondendo perguntas do chat"],
};

// Chance de ter live em cada dia da semana (0 = domingo) e peso de audiência.
const PROB = [0.5, 0.6, 0.3, 0.6, 0.35, 0.75, 0.9];
const DAY_MULT = [1, 0.82, 0.8, 0.85, 0.85, 1.12, 1.38];

const R = rng(2026);
const pick = (pairs) => {
  const r = R();
  let acc = 0;
  for (const [value, weight] of pairs) {
    acc += weight;
    if (r < acc) return value;
  }
  return pairs[pairs.length - 1][0];
};

function pickGame(dow) {
  if (dow === 6) return pick([["Phasmophobia", 0.55], ["Outlast 2", 0.3], ["Hollow Knight", 0.15]]);
  if (dow === 5) return pick([["Phasmophobia", 0.4], ["Outlast 2", 0.25], ["Valorant", 0.2], ["Hollow Knight", 0.15]]);
  if (dow === 0) return pick([["Stardew Valley", 0.5], ["Só conversa", 0.3], ["Hollow Knight", 0.2]]);
  return pick([["Valorant", 0.25], ["Stardew Valley", 0.2], ["Hollow Knight", 0.2], ["Outlast 2", 0.15], ["Phasmophobia", 0.12], ["Só conversa", 0.08]]);
}

function pickHour(dow) {
  if (dow === 6) return pick([[20, 0.6], [22, 0.25], [18, 0.15]]);
  if (dow === 5) return pick([[20, 0.5], [22, 0.2], [18, 0.3]]);
  if (dow === 0) return pick([[16, 0.5], [18, 0.5]]);
  return pick([[20, 0.45], [18, 0.3], [14, 0.15], [22, 0.1]]);
}

const hoje = new Date(`${HOJE}T12:00:00`);
const lives = [];
const count = {};

for (let d = DIAS - 1; d >= 0; d--) {
  const date = new Date(hoje);
  date.setDate(hoje.getDate() - d);
  const dow = date.getDay();
  if (d !== 0 && R() > PROB[dow]) continue;

  let game = pickGame(dow);
  let hour = pickHour(dow);
  if (d === 0) {
    game = "Outlast 2";
    hour = 20;
  }
  const g = GAMES[game];
  const hourMult = hour >= 20 ? 1.15 : hour === 18 ? 0.9 : hour === 16 ? 0.8 : 0.6;
  const trend = 0.8 + 0.25 * ((DIAS - 1 - d) / (DIAS - 1));
  const avg = Math.round(g.base * DAY_MULT[dow] * hourMult * trend * (0.88 + R() * 0.24));
  const dur = game === "Só conversa" ? 80 + Math.floor(R() * 50) : 100 + Math.floor(R() * 150);
  const peak = Math.round(avg * (1.55 + R() * 0.6));
  const followers = Math.round(g.fph * (dur / 60) * DAY_MULT[dow] * trend * (0.8 + R() * 0.4));

  count[game] = (count[game] || 0) + 1;
  const pool = TITLES[game];
  const title = d === 0 ? "Terror até o amanhecer" : pool[Math.floor(R() * pool.length)].replace("{n}", count[game]);
  const platform = game === "Só conversa" ? (R() < 0.6 ? "YouTube" : "Twitch") : R() < 0.92 ? "Twitch" : "YouTube";

  lives.push({
    id: lives.length + 1,
    date: date.toISOString().slice(0, 10),
    startMin: hour * 60 + Math.floor(R() * 6),
    game,
    genre: g.genre,
    platform,
    title,
    durationMin: dur,
    avgViewers: avg,
    peakViewers: peak,
    newFollowers: followers,
    newSubs: Math.max(0, Math.round(followers * 0.055 + R() * 2)),
    chatMessages: Math.round(avg * dur * 0.22 * (0.85 + R() * 0.3)),
  });
}

// Uma maratona de 6 horas, para a conquista "Maratona".
const marathon = lives
  .filter((l) => {
    const daysAgo = (hoje - new Date(`${l.date}T12:00:00`)) / 86400000;
    return daysAgo > 30 && daysAgo < 60 && l.genre === "terror";
  })
  .sort((a, b) => b.avgViewers - a.avgViewers)[0];
if (marathon) {
  marathon.durationMin = 385;
  marathon.title = "Maratona de terror: 6 horas de live";
  marathon.newFollowers = Math.round(marathon.newFollowers * 2.2);
}

for (const l of lives) l.revenue = Math.round(l.avgViewers * (l.durationMin / 60) * 0.32);

const data = {
  generatedFor: HOJE,
  channel: { name: "Pixel Noturno", followers: 8420, activeSubs: 73 },
  supporters: [
    { name: "corujinha_77", total: 412, note: "14 meses inscrita" },
    { name: "laisplays", total: 298, note: "9 meses inscrita" },
    { name: "tio_dudu", total: 240, note: "11 meses inscrito" },
    { name: "mafs.exe", total: 186, note: "5 meses inscrito" },
    { name: "nerdzinha", total: 150, note: "3 meses inscrita" },
    { name: "bruno.pixel", total: 122, note: "7 meses inscrito" },
  ],
  lives,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(`Gerado ${OUT} com ${lives.length} lives.`);
