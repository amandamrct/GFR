import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect, useRef } from "react";
import Icon from "./Icon.jsx";

const NAV = [
  ["/", "grid", "Visão geral"],
  ["/lives", "play", "Lives"],
  ["/jogos", "pad", "Jogos"],
  ["/horarios", "clock", "Melhores horários"],
  ["/comunidade", "users", "Comunidade"],
  ["/metas", "trophy", "Metas e conquistas"],
  ["/telas", "screen", "Telas para sua live"],
  ["/configuracoes", "sliders", "Configurações"],
];

export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
    const label = NAV.find(([to]) => to === pathname)?.[2] ?? (pathname.startsWith("/lives/") ? "Live" : "GFR");
    document.title = `${label} | GFR`;
  }, [pathname]);

  return (
    <div className="app">
      <aside className="side" aria-label="Menu principal">
        <NavLink className="logo" to="/" aria-label="GFR, início">
          <span className="logo-mark" aria-hidden="true">
            <i style={{ height: 9 }} />
            <i style={{ height: 15 }} />
            <i style={{ height: 20 }} />
          </span>
          <span>
            <span className="logo-name">GFR</span>
            <span className="logo-sub" style={{ display: "block" }}>Games For Real Insights</span>
          </span>
        </NavLink>
        <nav className="nav">
          {NAV.map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <b>Quer telas novas para a sua live?</b>
          <p>Início, pausa, encerramento e overlay com a cara do seu canal.</p>
          <NavLink className="btn btn-s btn-sm" to="/telas">Ver pacotes</NavLink>
        </div>
        <p className="fict">Projeto de portfólio. O canal Pixel Noturno e todos os números são fictícios.</p>
      </aside>
      <main className="main" ref={main} tabIndex={-1}>
        <Suspense fallback={<div className="empty">Carregando…</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
