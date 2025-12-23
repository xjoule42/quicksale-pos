import { useState, useCallback } from "react";

interface UseConfirmDialogOptions {
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const useConfirmDialog = (options?: UseConfirmDialogOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    if (!isLoading) {
      setIsOpen(false);
      options?.onCancel?.();
    }
  }, [isLoading, options]);

  const confirm = useCallback(async () => {
    if (options?.onConfirm) {
      setIsLoading(true);
      try {
        await options.onConfirm();
      } finally {
        setIsLoading(false);
        setIsOpen(false);
      }
    }
  }, [options]);

  return {
    isOpen,
    isLoading,
    open,
    close,
    confirm,
    setIsOpen,
  };
};
