import { useCallback, useEffect, useRef, useState } from "react";

const HISTORY_DEBOUNCE_MS = 500;
const MAX_HISTORY_ENTRIES = 50;

type HistoryState = {
  entries: string[];
  index: number;
};

// Checkpoints only on pauses in typing (debounced), so Undo steps back
// through edits rather than one character at a time.
export const useUndoRedoText = (initialValue: string) => {
  const [liveValue, setLiveValue] = useState(initialValue);
  const [history, setHistory] = useState<HistoryState>({ entries: [initialValue], index: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => (debounceRef.current ? clearTimeout(debounceRef.current) : undefined), []);

  const setValue = useCallback((next: string) => {
    setLiveValue(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setHistory((prev) => {
        // Nothing actually changed since the last checkpoint (e.g. undo
        // followed by a pause with no typing) — don't add a no-op step.
        if (prev.entries[prev.index] === next) return prev;

        const entries = [...prev.entries.slice(0, prev.index + 1), next].slice(
          -MAX_HISTORY_ENTRIES
        );
        return { entries, index: entries.length - 1 };
      });
    }, HISTORY_DEBOUNCE_MS);
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.index === 0) return prev;
      const index = prev.index - 1;
      setLiveValue(prev.entries[index]);
      return { ...prev, index };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.index >= prev.entries.length - 1) return prev;
      const index = prev.index + 1;
      setLiveValue(prev.entries[index]);
      return { ...prev, index };
    });
  }, []);

  return {
    value: liveValue,
    setValue,
    undo,
    redo,
    canUndo: history.index > 0,
    canRedo: history.index < history.entries.length - 1,
  };
};
