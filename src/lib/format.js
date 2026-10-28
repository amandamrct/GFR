const nf = new Intl.NumberFormat("pt-BR");

export const fmt = (n) => nf.format(Math.round(n));
export const fmt1 = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
export const brl = (n) => `R$ ${fmt(n)}`;
export const pad2 = (n) => String(n).padStart(2, "0");
export const ddmm = (d) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
export const durTxt = (min) => `${Math.floor(min / 60)}h${pad2(min % 60)}`;
export const hhmm = (min) => `${pad2(Math.floor(min / 60) % 24)}h${pad2(min % 60)}`;

export const DIA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const DIA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const dataLonga = (d) => `${d.getDate()} de ${MES[d.getMonth()]}`;
export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const pct = (a, b) => (b ? ((a - b) / b) * 100 : null);
