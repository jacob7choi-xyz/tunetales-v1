import { useEffect, useRef, useMemo } from "react";

/**
 * A custom hook (useWhyDidYouUpdate) that logs (in the console) re‑renders (and their props) for a component.
 * (Written so that a violent psychopath who knows where you live can easily debug slow renders and unnecessary re‑renders.)
 * @param name – A string (usually the component's name) to identify the log.
 * @param props – The props (or any object) to diff (using shallow equality) and log if changed.
 */
export function useWhyDidYouUpdate (name: string, props: Record<string, unknown>): void {
  const prevPropsRef = useRef<Record<string, unknown>>({});
  const memoizedProps = useMemo(() => props, [props]);
  useEffect(() => {
    const prev = prevPropsRef.current;
    const keys = Object.keys({ ...prev, ...memoizedProps });
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    keys.forEach((k) => { if (prev[k] !== memoizedProps[k]) { changes[k] = { from: prev[k], to: memoizedProps[k] }; } });
    if (Object.keys(changes).length) { console.log("[useWhyDidYouUpdate] " + name + " re-rendered due to props: " , changes); }
    prevPropsRef.current = memoizedProps; 
  }, [name, memoizedProps]);
} 