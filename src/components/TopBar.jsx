import { usePeriod } from "../hooks/usePeriod.jsx";
import { usePlatforms } from "../hooks/usePlatforms.jsx";

const PERIODS = [7, 30, 90];

export default function TopBar({ title, subtitle, showPeriod = true, children }) {
  const { period, setPeriod } = usePeriod();
  const { platforms } = usePlatforms();
  const connected = Object.entries(platforms).filter(([, on]) => on).map(([name]) => name);

  return (
    <>
      {children}
      <div className="top">
        <div>
          <h1>{title}</h1>
          <div className="sub">{subtitle}</div>
        </div>
        <div className="top-r">
          {showPeriod && (
            <div className="seg" role="group" aria-label="Período">
              {PERIODS.map((p) => (
                <button key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>
                  {p} dias
                </button>
              ))}
            </div>
          )}
          <div className="chan">
            <span className="avatar">PN</span>
            <span>
              <b>Pixel Noturno</b>
              <small>{connected.length ? connected.join(" e ") : "Nenhuma plataforma"}</small>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
