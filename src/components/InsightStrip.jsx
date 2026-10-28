import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

/** Faixa de insights: o elemento de destaque da Visão geral. */
export default function InsightStrip({ items }) {
  if (!items.length) return null;
  return (
    <section className="insights" aria-label="Insights do período">
      <div className="ins-h">
        <span className="badge"><Icon name="spark" color="#fff" size={22} /></span>
        <div>
          <b>Insights do período</b>
          <small>Calculados a partir das suas lives</small>
        </div>
      </div>
      {items.map((it) => (
        <div className="ins" key={it.to}>
          <p>{it.lead}<strong>{it.strong}</strong>{it.tail}</p>
          <Link to={it.to}>{it.label}</Link>
        </div>
      ))}
    </section>
  );
}
