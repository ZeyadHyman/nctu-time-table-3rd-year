import { create } from "zustand";

interface ToastState {
  message: string | null;
  show: (msg: string) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    window.clearTimeout((useToast as unknown as { _t?: number })._t);
    (useToast as unknown as { _t?: number })._t = window.setTimeout(
      () => set({ message: null }),
      2600,
    );
  },
  hide: () => set({ message: null }),
}));

export function ToastHost() {
  const message = useToast((s) => s.message);
  if (!message) return null;
  return <div className="toast" role="status">{message}</div>;
}
