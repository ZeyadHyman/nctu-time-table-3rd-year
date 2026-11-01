import { create } from "zustand";

interface ToastState {
  message: string | null;
  variant: "success" | "error";
  show: (msg: string, variant?: "success" | "error") => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  variant: "success",
  show: (message, variant = "success") => {
    set({ message, variant });
    window.clearTimeout((useToast as unknown as { _t?: number })._t);
    (useToast as unknown as { _t?: number })._t = window.setTimeout(
      () => set({ message: null }),
      2800,
    );
  },
  hide: () => set({ message: null }),
}));

export function toast(msg: string, variant: "success" | "error" = "success") {
  useToast.getState().show(msg, variant);
}

export function ToastHost() {
  const message = useToast((s) => s.message);
  const variant = useToast((s) => s.variant);
  if (!message) return null;
  return (
    <div className={"toast" + (variant === "error" ? " error" : "")} role="status">
      {message}
    </div>
  );
}
