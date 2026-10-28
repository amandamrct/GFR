import { useLayoutEffect, useRef } from "react";

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function Stars({ seed }) {
  const r = seeded(seed);
  return Array.from({ length: 70 }, (_, i) => {
    const size = r() < 0.2 ? 4 : 2;
    return <div key={i} className="px" style={{ left: Math.round(r() * 1280), top: Math.round(r() * 540), width: size, height: size, opacity: +(0.25 + r() * 0.5).toFixed(2) }} />;
  });
}

const box = { background: "rgba(15,16,32,.86)", border: "1.5px solid #2E3050", borderRadius: 12 };
const center = (top) => ({ position: "absolute", left: 40, right: 40, top, textAlign: "center" });

function Brand({ color, name, logo }) {
  return (
    <div style={{ position: "absolute", left: 48, top: 40, display: "flex", alignItems: "center", gap: 12 }}>
      {logo ? (
        <img src={logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#ECEBFF", boxShadow: `inset -6px -2px 0 ${color}` }} />
        </div>
      )}
      <span style={{ font: "700 24px var(--display)" }}>{name}</span>
    </div>
  );
}

function Camera({ x, y, w, h, color, name }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 16, border: `4px solid ${color}`, background: "#23243B", display: "flex", alignItems: "center", justifyContent: "center", color: "#7A7BA0", font: "500 15px var(--body)" }}>
      Câmera
      <div style={{ position: "absolute", left: -4, bottom: -20, background: color, color: "#fff", font: "700 16px var(--display)", padding: "6px 14px", borderRadius: 8 }}>{name}</div>
    </div>
  );
}

/** Uma tela de stream em 1280 × 720, personalizada com cor, nome e logo do canal. */
export function StreamScreen({ type, color, name, logo }) {
  const channel = name || "Seu canal";
  const bg = { background: `radial-gradient(120% 90% at 80% 0%, color-mix(in srgb, ${color} 38%, #120F2B) 0%, #120F2B 45%, #08081A 100%)` };
  const gradient = `linear-gradient(90deg, ${color}, #22D3EE)`;

  let content;
  if (type === "inicio") {
    content = (
      <>
        <Stars seed={55} />
        <Brand color={color} name={channel} logo={logo} />
        <div style={{ ...center(220), font: "700 84px/1.05 var(--display)" }}>A live começa já já</div>
        <div style={{ ...center(330), font: "700 150px/1.05 var(--display)", color: "#22D3EE" }}>04:59</div>
        <div style={{ ...center(540), font: "500 26px/1.3 var(--body)" }}>Hoje no canal: terror até o amanhecer</div>
      </>
    );
  } else if (type === "pausa") {
    content = (
      <>
        <Stars seed={44} />
        <Brand color={color} name={channel} logo={logo} />
        <div style={{ position: "absolute", left: 560, top: 140, width: 160, height: 160, borderRadius: "50%", background: "#ECEBFF", boxShadow: `inset -46px -12px 0 color-mix(in srgb, ${color} 70%, #fff)` }} />
        <div style={{ ...center(350), font: "700 76px/1.05 var(--display)" }}>Volto em 5 minutinhos</div>
        <div style={{ ...center(452), font: "500 24px/1.3 var(--body)", color: "#B9B9D6" }}>Aproveita pra pegar uma água e esticar as pernas</div>
        <div style={{ position: "absolute", left: 440, top: 530, width: 400, height: 10, borderRadius: 10, background: "#23243B" }}>
          <div style={{ width: "62%", height: "100%", borderRadius: 10, background: gradient }} />
        </div>
      </>
    );
  } else if (type === "encerramento") {
    content = (
      <>
        <Stars seed={132} />
        <Brand color={color} name={channel} logo={logo} />
        <div style={{ ...center(160), font: "700 96px/1.05 var(--display)" }}>Valeu por hoje!</div>
        <div style={{ ...center(290), font: "500 28px/1.3 var(--body)" }}>Próxima live: sábado, às 20h</div>
        <div style={{ position: "absolute", left: 390, top: 370, width: 500, ...box, borderRadius: 18, padding: "22px 28px" }}>
          <div style={{ font: "600 19px var(--display)", color: "#22D3EE", marginBottom: 10 }}>Quem apoiou hoje</div>
          {["corujinha_77", "laisplays", "tio_dudu"].map((n) => (
            <div key={n} style={{ font: "500 19px/1.9 var(--body)" }}>{n}</div>
          ))}
        </div>
      </>
    );
  } else if (type === "aovivo") {
    content = (
      <>
        <div className="game">Área do jogo</div>
        <div style={{ position: "absolute", left: 24, top: 24, display: "flex", alignItems: "center", gap: 10, ...box, padding: "10px 16px", font: "600 16px var(--body)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F472B6" }} />
          Ao vivo
        </div>
        <div style={{ position: "absolute", left: 24, bottom: 24, width: 390, ...box, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", font: "600 15px var(--body)", marginBottom: 8 }}>
            <span>Meta de seguidores</span>
            <span>8.420 / 10.000</span>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: "#23243B" }}>
            <div style={{ width: "84%", height: "100%", borderRadius: 8, background: gradient }} />
          </div>
          <div style={{ font: "500 14px var(--body)", color: "#A3A3C2", marginTop: 10 }}>Último seguidor: corujinha_77</div>
        </div>
        <Camera x={944} y={400} w={312} h={212} color={color} name={channel} />
      </>
    );
  } else {
    content = (
      <>
        <div className="game">Área do jogo</div>
        <div style={{ position: "absolute", right: 24, top: 24, display: "flex", alignItems: "center", gap: 10, ...box, borderColor: "#F472B6", padding: "10px 16px", font: "600 16px var(--body)" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#F472B6" }} />
          Gravando
        </div>
        <Camera x={24} y={448} w={260} h={164} color={color} name={channel} />
        <div style={{ position: "absolute", right: 24, bottom: 24, font: "700 22px var(--display)", color: "rgba(236,235,255,.75)" }}>
          @{channel.toLowerCase().replace(/[^a-z0-9]/g, "")}
        </div>
      </>
    );
  }

  return <div className="st" style={bg}>{content}</div>;
}

/** Mostra a tela de 1280 × 720 reduzida para caber na largura disponível. */
export function Stage({ children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const apply = () => {
      const st = el.firstElementChild;
      if (st) st.style.transform = `scale(${el.clientWidth / 1280})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  });
  return <div className="stage" ref={ref}>{children}</div>;
}
