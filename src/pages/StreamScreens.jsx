import { useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Icon from "../components/Icon.jsx";
import { Stage, StreamScreen } from "../components/StreamScreen.jsx";
import { CONTATO } from "../config.js";

const TYPES = [["inicio", "Início"], ["aovivo", "Ao vivo (overlay)"], ["gravando", "Gravando"], ["pausa", "Pausa"], ["encerramento", "Encerramento"]];
const COLORS = ["#8B5CF6", "#22D3EE", "#F472B6", "#34D399", "#FBBF24", "#F97316"];
const PACKAGES = [
  ["Essencial", "Início e pausa", "2 telas estáticas e 2 rodadas de ajuste. Entrega em até 5 dias."],
  ["Completo", "Todas as telas", "5 telas, alertas de seguidor e apoio e painéis do perfil. Entrega em até 10 dias."],
];

export default function StreamScreens() {
  const [type, setType] = useState("inicio");
  const [form, setForm] = useState({ name: "Pixel Noturno", color: "#8B5CF6", logo: null, pack: "Completo", refs: "", deadline: "Sem pressa", contact: "" });
  const [tried, setTried] = useState(false);
  const [logoMsg, setLogoMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));

  function onLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3e6) return setLogoMsg("Arquivo grande demais: use até 3 MB");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, logo: reader.result }));
      setLogoMsg("");
    };
    reader.readAsDataURL(file);
  }

  const message = `Oi, ${CONTATO.designer.split(" ")[0]}! Vim pelo GFR e quero um orçamento de telas para live.

Canal: ${form.name}
Pacote: ${form.pack}
Cor principal: ${form.color}
Prazo: ${form.deadline}
Referências e jogos: ${form.refs || "(não informei)"}
Contato: ${form.contact}${form.logo ? "\n\nTenho logo e vou enviar por aqui." : ""}`;

  const ready = form.name.trim() && form.contact.trim();
  const whatsapp = `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(message)}`;
  const email = `mailto:${CONTATO.email}?subject=${encodeURIComponent(`Orçamento de telas para live: ${form.name}`)}&body=${encodeURIComponent(message)}`;
  const preview = { color: form.color, name: form.name, logo: form.logo };

  return (
    <>
      <TopBar title="Telas para sua live" subtitle="Telas de início, pausa, overlay e encerramento feitas para o seu canal" showPeriod={false} />
      <div className="grid split">
        <div className="stack">
          <div className="card">
            <div className="card-h">
              <div>
                <h3>Prévia com a cara do seu canal</h3>
                <div className="hint">Escolha a cor, envie o logo e veja como fica. Nada sai do seu navegador até você pedir.</div>
              </div>
            </div>
            <Stage><StreamScreen type={type} {...preview} /></Stage>
            <div className="grid thumbs-grid" style={{ gap: 10, marginTop: 14 }}>
              {TYPES.map(([t, label]) => (
                <button key={t} className="thumb" aria-pressed={type === t} onClick={() => setType(t)}>
                  <Stage><StreamScreen type={t} {...preview} /></Stage>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid g2">
            {PACKAGES.map(([name, sub, desc]) => (
              <button key={name} className="pack" aria-pressed={form.pack === name} onClick={() => setForm((f) => ({ ...f, pack: name }))}>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <b>{name}</b>
                  {name === "Completo" && <span className="tag" style={{ background: "var(--purple)", color: "#fff" }}>Mais pedido</span>}
                </span>
                <em>{sub}</em>
                <p>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14, alignSelf: "start" }}>
          <div>
            <h3>Pedir orçamento</h3>
            <div className="hint">O pedido chega direto para a designer, com resposta em até 2 dias úteis</div>
          </div>
          <div className="field">
            <label htmlFor="t-nome">Nome do canal</label>
            <span className="input"><input id="t-nome" value={form.name} onChange={set("name")} maxLength={28} autoComplete="off" /></span>
          </div>
          <div className="field">
            <span className="lbl" id="lbl-cor">Cor principal</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }} role="group" aria-labelledby="lbl-cor">
              {COLORS.map((c) => (
                <button key={c} className="swatch" style={{ background: c }} aria-pressed={form.color === c} aria-label={`Cor ${c}`} onClick={() => setForm((f) => ({ ...f, color: c }))} />
              ))}
              <label className="swatch" title="Outra cor" style={{ border: "1px dashed var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                +
                <input type="color" value={form.color} onChange={set("color")} aria-label="Escolher outra cor" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </label>
            </div>
          </div>
          <div className="field">
            <span className="lbl">Logo</span>
            <label className="input" style={{ justifyContent: "center", borderStyle: "dashed", cursor: "pointer", minHeight: 52 }}>
              <Icon name="upload" size={18} color="var(--text-2)" />
              <span className="muted">{logoMsg || (form.logo ? "Logo carregado, clique para trocar" : "Envie PNG, JPG ou SVG")}</span>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={onLogo} style={{ display: "none" }} />
            </label>
          </div>
          <div className="field">
            <label htmlFor="t-refs">Referências e jogos que você joga</label>
            <span className="input" style={{ alignItems: "flex-start" }}>
              <textarea id="t-refs" rows={3} style={{ resize: "vertical" }} placeholder="Links ou nomes de canais que você curte" value={form.refs} onChange={set("refs")} />
            </span>
          </div>
          <div className="field">
            <label htmlFor="t-prazo">Prazo</label>
            <span className="input">
              <select id="t-prazo" value={form.deadline} onChange={set("deadline")}>
                <option>Sem pressa</option>
                <option>Até 2 semanas</option>
                <option>Até 1 semana</option>
              </select>
              <Icon name="chev" size={16} color="var(--text-3)" />
            </span>
          </div>
          <div className="field">
            <label htmlFor="t-contato">Seu WhatsApp ou e-mail</label>
            <span className="input"><input id="t-contato" value={form.contact} onChange={set("contact")} placeholder="Para receber o orçamento" autoComplete="off" /></span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!ready ? (
              <>
                <button className="btn btn-p" style={{ width: "100%" }} onClick={() => setTried(true)}>Pedir orçamento</button>
                {tried && <p style={{ fontSize: 12.5, color: "var(--pink)" }}>Preencha o nome do canal e um contato para pedir o orçamento.</p>}
              </>
            ) : (
              <>
                <span className="lbl" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>Enviar o pedido por</span>
                <div style={{ display: "grid", gridTemplateColumns: CONTATO.whatsapp ? "repeat(2, minmax(0,1fr))" : "1fr", gap: 10 }}>
  {CONTATO.whatsapp && <a className="btn btn-p" href={whatsapp} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18} />WhatsApp</a>}
  <a className={`btn ${CONTATO.whatsapp ? "btn-s" : "btn-p"}`} href={email}><Icon name="mail" size={18} />E-mail</a>
</div>
                <details>
                  <summary style={{ fontSize: 12.5, color: "var(--text-3)", cursor: "pointer" }}>Ver a mensagem que será enviada</summary>
                  <div className="msg-box" style={{ marginTop: 8 }}>{message}</div>
                  <button
                    className="btn btn-s btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(message);
                        setCopied(true);
                      } catch {
                        setCopied(false);
                      }
                    }}
                  >
                    <Icon name="copy" size={16} />
                    {copied ? "Mensagem copiada" : "Copiar mensagem"}
                  </button>
                </details>
              </>
            )}
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-3)" }}>Serviço de design oferecido por {CONTATO.designer}. O GFR é um projeto fictício de portfólio; este pedido é real.</p>
        </div>
      </div>
    </>
  );
}
