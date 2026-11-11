import { CenteredPage } from "@/components/ui/centered-page";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <CenteredPage>{children}</CenteredPage>;
}
