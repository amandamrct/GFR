import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import Icon from "../components/Icon.jsx";
import { Empty, GameTag, PlatformTag } from "../components/Ui.jsx";
import { usePeriod } from "../hooks/usePeriod.jsx";
import { GAMES, livesInPeriod } from "../lib/data.js";
import { ddmm, durTxt, fmt, hhmm } from "../lib/format.js";

const PER_PAGE = 10;
const SORT_KEYS = { date: "id", title: "title", dur: "durationMin", avg: "avgViewers", peak: "peakViewers", fol: "newFollowers" };

/** Baixa as lives filtradas como CSV (abre no Excel com ; como separador). */
function downloadCsv(lives, period) {
  const header = ["data", "titulo", "jogo", "plataforma", "inicio", "duracao_min", "media_espectadores", "pico", "novos_seguidores", "novos_inscritos", "mensagens_chat", "receita_estimada_reais"];
  const rows = lives.map((l) => [
    `${ddmm(l.date)}/${l.date.getFullYear()}`, `"${l.title.replace(/"/g, '""')}"`, l.game, l.platform, hhmm(l.startMin),
    l.durationMin, l.avgViewers, l.peakViewers, l.newFollowers, l.newSubs, l.chatMessages, l.revenue,
  ]);
  const csv = "\ufeff" + [header, ...rows].map((r) => r.join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `gfr-lives-${period}-dias.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

export { downloadCsv };

export default function Lives() {
  const { period } = usePeriod();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [game, setGame] = useState("");
  const [platform, setPlatform] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: -1 });
  const [page, setPage] = useState(1);

  const all = livesInPeriod(period);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const key = SORT_KEYS[sort.key];
    return all
      .filter((l) => (!term || l.title.toLowerCase().includes(term) || l.game.toLowerCase().includes(term)) && (!game || l.game === game) && (!platform || l.platform === platform))
      .sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * sort.dir);
  }, [all, q, game, platform, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const resetPage = (fn) => (e) => {
    fn(e.target.value);
    setPage(1);
  };
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === "title" ? 1 : -1 }));

  const Th = ({ k, children, num }) => (
    <th className={num ? "num" : undefined} aria-sort={sort.key === k ? (sort.dir > 0 ? "ascending" : "descending") : undefined}>
      <button onClick={() => toggleSort(k)}>
        {children}
        {sort.key === k && (sort.dir > 0 ? " ▴" : " ▾")}
      </button>
    </th>
  );

  const open = (id) => navigate(`/lives/${id}`);

  return (
    <>
      <TopBar title="Lives" subtitle={`${all.length} lives nos últimos ${period} dias`} />
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label className="input" style={{ flex: "1 1 260px", maxWidth: 380 }}>
          <Icon name="search" size={18} color="var(--text-3)" />
          <input type="search" placeholder="Buscar pelo título ou jogo" value={q} onChange={resetPage(setQ)} aria-label="Buscar live" />
        </label>
        <label className="input" style={{ flex: "0 1 200px" }}>
          <select value={game} onChange={resetPage(setGame)} aria-label="Filtrar por jogo">
            <option value="">Todos os jogos</option>
            {Object.keys(GAMES).map((g) => <option key={g}>{g}</option>)}
          </select>
          <Icon name="chev" size={16} color="var(--text-3)" />
        </label>
        <label className="input" style={{ flex: "0 1 200px" }}>
          <select value={platform} onChange={resetPage(setPlatform)} aria-label="Filtrar por plataforma">
            <option value="">Todas as plataformas</option>
            <option>Twitch</option>
            <option>YouTube</option>
          </select>
          <Icon name="chev" size={16} color="var(--text-3)" />
        </label>
        <button className="btn btn-s" style={{ marginLeft: "auto" }} onClick={() => downloadCsv(filtered, period)} disabled={!filtered.length}>
          <Icon name="down" size={18} />
          Exportar CSV
        </button>
      </div>

      <div className="card" style={{ padding: "6px 8px 0" }}>
        {!filtered.length ? (
          <Empty title="Nenhuma live encontrada">Mude a busca ou os filtros, ou escolha um período maior.</Empty>
        ) : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <Th k="date">Data</Th>
                    <Th k="title">Título</Th>
                    <th>Jogo</th>
                    <th>Plataforma</th>
                    <Th k="dur" num>Duração</Th>
                    <Th k="avg" num>Média</Th>
                    <Th k="peak" num>Pico</Th>
                    <Th k="fol" num>Novos seguidores</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} className="click" tabIndex={0} onClick={() => open(l.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open(l.id))}>
                      <td className="muted">{ddmm(l.date)}</td>
                      <td style={{ fontWeight: 500 }}>{l.title}</td>
                      <td><GameTag game={l.game} /></td>
                      <td><PlatformTag platform={l.platform} /></td>
                      <td className="num muted">{durTxt(l.durationMin)}</td>
                      <td className="num">{fmt(l.avgViewers)}</td>
                      <td className="num">{fmt(l.peakViewers)}</td>
                      <td className="num" style={{ color: "var(--green)" }}>+{fmt(l.newFollowers)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pager">
              <span>Mostrando {(current - 1) * PER_PAGE + 1} a {Math.min(current * PER_PAGE, filtered.length)} de {filtered.length} lives</span>
              <div className="pg">
                <button onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Página anterior">‹</button>
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} aria-current={i + 1 === current ? "page" : undefined}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Próxima página">›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
