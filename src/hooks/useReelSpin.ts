import { useEffect, useRef, useState } from 'react';

const SEQUENCE_LENGTH = 10;

interface ReelSpinState<T> {
  spinning: boolean;
  sequence: T[]; // while spinning: settled value first, then scrolling candidates; while idle: [settled value]
  duration: number; // ms, only meaningful while spinning
}

// The settled value sits at the top of the column (index 0) and the reel
// animates from the bottom of the column up to translateY(0), so the visible
// motion reads as scrolling downward — candidates fall in from the top and
// the final value settles in from above, rather than flying up and out.
function buildSpinningState<T>(finalValue: T, pool: T[]): ReelSpinState<T> {
  const duration = 1200 + Math.random() * 1800;
  const candidates: T[] = Array.from(
    { length: SEQUENCE_LENGTH - 1 },
    () => pool[Math.floor(Math.random() * pool.length)],
  );
  return { spinning: true, sequence: [finalValue, ...candidates], duration };
}

/** Drives a real scrolling slot-reel: while spinning, a column of random pool
 * values scrolls past and eases to a stop exactly on finalValue. Every mount
 * starts spinning immediately (so a fresh round animates all six boxes, not
 * just respins), and each hook instance randomizes its own duration
 * (1.2s-3s), so reels triggered together land at different, non-
 * deterministic times relative to one another — call `settle()` from the
 * scroll animation's end event. */
export function useReelSpin<T>(finalValue: T, spinToken: string, pool: T[]) {
  const [state, setState] = useState<ReelSpinState<T>>(() => buildSpinningState(finalValue, pool));
  const prevToken = useRef(spinToken);

  useEffect(() => {
    if (prevToken.current === spinToken) return;
    prevToken.current = spinToken;
    setState(buildSpinningState(finalValue, pool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken]);

  function settle() {
    setState({ spinning: false, sequence: [finalValue], duration: 0 });
  }

  return { ...state, settle };
}
