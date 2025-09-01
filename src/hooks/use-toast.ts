import { ReactNode } from "react";
import { ExternalToast, toast } from "sonner";

interface ToastOptions extends ExternalToast {
  desc?: string;
}

export const useToast = () => {
  const add = (title: ReactNode, options?: ToastOptions) => {
    toast(title, options);
  };

  return {
    toast: { add },
  };
};
