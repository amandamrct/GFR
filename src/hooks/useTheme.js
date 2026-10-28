import { useEffect, useState } from "react";

const KEY = "gfr-tema";

function readTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* sem acesso ao localStorage: usa o padrão */
  }
  return "dark";
}

/** Tema claro ou escuro, salvo no navegador. O padrão é o escuro. */
export function useTheme() {
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignora */
    }
  }, [theme]);
  return [theme, setTheme];
}
