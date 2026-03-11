import { useState, useEffect, type RefObject } from "react";
import { calcScale } from "../renderer/scale";

/**
 * Responsive canvas scale.
 * Returns px/mm scale value, capped at 0.055.
 * Re-calculates whenever the wrapper element resizes.
 */
export function useScale(wrapRef: RefObject<HTMLDivElement>): number {
  const [scale, setScale] = useState(0.04);

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const cw = wrapRef.current.clientWidth  - 20;
      const ch = window.innerHeight           - 150;
      setScale(calcScale(cw, ch));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [wrapRef]);

  return scale;
}
