import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";

const TooltipContext = createContext(null);

/** Um único balão flutuante, compartilhado pelos gráficos e pelo mapa de calor. */
export function TooltipProvider({ children }) {
  const [tip, setTip] = useState(null);
  const ref = useRef(null);
  const show = useCallback((content, x, y) => setTip({ content, x, y }), []);
  const hide = useCallback(() => setTip(null), []);

  useLayoutEffect(() => {
    if (!tip || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let left = tip.x + 14;
    let top = tip.y - r.height - 12;
    if (left + r.width > window.innerWidth - 8) left = tip.x - r.width - 14;
    if (top < 8) top = tip.y + 16;
    ref.current.style.left = `${left}px`;
    ref.current.style.top = `${top}px`;
  }, [tip]);

  return (
    <TooltipContext.Provider value={{ show, hide }}>
      {children}
      <div id="tip" ref={ref} role="tooltip" className={tip ? "on" : ""}>
        {tip?.content}
      </div>
    </TooltipContext.Provider>
  );
}

export const useTooltip = () => useContext(TooltipContext);
