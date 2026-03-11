import { useState, useEffect, type RefObject } from "react";
import { calcScale } from "../renderer/scale";

/**
 * Responsive canvas scale – uses ResizeObserver on the wrapper element
 * so scale reacts instantly to any layout change, not just window resize.
 * Returns px/mm scale value, capped at 0.055.
 */
export function useScale(wrapRef: RefObject<HTMLDivElement>): number {
  const [scale, setScale] = useState(0.04);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const cw = el.clientWidth  - 20;
      const ch = el.clientHeight - 20;
      setScale(calcScale(cw, ch));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wrapRef]);

  return scale;
}
