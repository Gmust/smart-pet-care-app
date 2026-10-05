import { useCallback, useEffect, useRef, useState } from "react";

export const HISTORY_DEBOUNCE_MS = 500;
const MAX_HISTORY_ENTRIES = 50;

type HistoryState = {
  entries: string[];
  index: number;
};

// Checkpoints only on pauses in typing (debounced), so Undo steps back
// through edits rather than one character at a time.
export const useUndoRedoText = (initialValue: string) => {
  const [liveValue, setLiveValueState] = useState(initialValue);
  const [history, setHistory] = useState<HistoryState>({ entries: [initialValue], index: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveValueRef = useRef(initialValue);
  // Mirrors `history` so undo/redo can read it and move on in one event,
  // rather than from inside a setState updater, which must stay pure.
  const historyRef = useRef(history);

  useEffect(() => () => (debounceRef.current ? clearTimeout(debounceRef.current) : undefined), []);

  const setLiveValue = useCallback((next: string) => {
    liveValueRef.current = next;
    setLiveValueState(next);
  }, []);

  const commitHistory = useCallback((next: HistoryState) => {
    historyRef.current = next;
    setHistory(next);
  }, []);

  const checkpoint = useCallback(
    (next: string) => {
      const prev = historyRef.current;
      // Nothing actually changed since the last checkpoint (e.g. undo
      // followed by a pause with no typing) — don't add a no-op step.
      if (prev.entries[prev.index] === next) return;

      const entries = [...prev.entries.slice(0, prev.index + 1), next].slice(-MAX_HISTORY_ENTRIES);
      commitHistory({ entries, index: entries.length - 1 });
    },
    [commitHistory]
  );

  const setValue = useCallback(
    (next: string) => {
      setLiveValue(next);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        checkpoint(next);
      }, HISTORY_DEBOUNCE_MS);
    },
    [setLiveValue, checkpoint]
  );

  const step = useCallback(
    (offset: -1 | 1) => {
      // Otherwise the step runs from the last checkpoint and silently drops
      // whatever was typed since — commit the pending edit first.
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        checkpoint(liveValueRef.current);
      }

      const prev = historyRef.current;
      const index = prev.index + offset;
      if (index < 0 || index > prev.entries.length - 1) return;

      commitHistory({ ...prev, index });
      setLiveValue(prev.entries[index]);
    },
    [checkpoint, commitHistory, setLiveValue]
  );

  const undo = useCallback(() => step(-1), [step]);
  const redo = useCallback(() => step(1), [step]);

  return {
    value: liveValue,
    setValue,
    undo,
    redo,
    canUndo: history.index > 0,
    canRedo: history.index < history.entries.length - 1,
  };
};
