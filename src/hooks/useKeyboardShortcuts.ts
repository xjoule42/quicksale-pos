import { useEffect, useCallback, RefObject } from "react";

interface KeyboardShortcutsOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onF1?: () => void;
  onF2?: () => void;
  onF3?: () => void;
  onF4?: () => void;
  enabled?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
}

export const useKeyboardShortcuts = ({
  onEnter,
  onEscape,
  onF1,
  onF2,
  onF3,
  onF4,
  enabled = true,
  inputRef,
}: KeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger if user is typing in an input (except for specific shortcuts)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      switch (e.key) {
        case "Enter":
          if (onEnter) {
            // Only trigger if not in input, or if input is our specific barcode input
            if (!isInput || (inputRef?.current && target === inputRef.current)) {
              onEnter();
            }
          }
          break;
        case "Escape":
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        case "F1":
          if (onF1) {
            e.preventDefault();
            onF1();
          }
          break;
        case "F2":
          if (onF2) {
            e.preventDefault();
            onF2();
          }
          break;
        case "F3":
          if (onF3) {
            e.preventDefault();
            onF3();
          }
          break;
        case "F4":
          if (onF4) {
            e.preventDefault();
            onF4();
          }
          break;
      }
    },
    [enabled, onEnter, onEscape, onF1, onF2, onF3, onF4, inputRef]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

// Hook to focus an input after actions
export const useFocusInput = (inputRef: RefObject<HTMLInputElement>) => {
  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [inputRef]);

  return focusInput;
};
