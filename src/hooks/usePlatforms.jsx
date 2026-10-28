import { createContext, useContext, useState } from "react";

const PlatformsContext = createContext(null);

/** Plataformas "conectadas" (simulado). */
export function PlatformsProvider({ children }) {
  const [platforms, setPlatforms] = useState({ Twitch: true, YouTube: true, Kick: false });
  const toggle = (name) => setPlatforms((p) => ({ ...p, [name]: !p[name] }));
  return <PlatformsContext.Provider value={{ platforms, toggle }}>{children}</PlatformsContext.Provider>;
}

export const usePlatforms = () => useContext(PlatformsContext);
