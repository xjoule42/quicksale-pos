import { create } from "zustand";

interface SessionState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
}

// Simple store for session/connection state (mock for now, ready for backend integration)
export const useSessionStore = create<SessionState>((set) => ({
  isOnline: navigator.onLine,
  setOnline: (online) => set({ isOnline: online }),
}));

// Listen for online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    useSessionStore.getState().setOnline(true);
  });
  window.addEventListener("offline", () => {
    useSessionStore.getState().setOnline(false);
  });
}
