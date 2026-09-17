import { RefObject, useEffect } from "react";

export default function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void
) {
  useEffect(() => {
    const handleClick = (e: PointerEvent) => {
      const target = e.target as Node;

      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    };
    document.addEventListener("pointerdown", handleClick);

    return () => {
      document.removeEventListener("pointerdown", handleClick);
    };
  }, [ref, callback]);
}
