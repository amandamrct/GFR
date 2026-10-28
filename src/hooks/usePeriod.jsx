import { createContext, useContext, useState } from "react";

const PeriodContext = createContext(null);

/** Guarda o período escolhido (7, 30 ou 90 dias) para todas as telas. */
export function PeriodProvider({ children }) {
  const [period, setPeriod] = useState(30);
  return <PeriodContext.Provider value={{ period, setPeriod }}>{children}</PeriodContext.Provider>;
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod precisa estar dentro de <PeriodProvider>");
  return ctx;
}
