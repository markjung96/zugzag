import { ToastProvider } from "@/components/toast-provider";

export default function EntranceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}

