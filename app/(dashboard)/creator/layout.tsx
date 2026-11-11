import { ProtectedArea } from "@/components/dashboard/protected-area";

export default function Layout({ children }: LayoutProps<"/creator">) {
  return <ProtectedArea pathname="/creator">{children}</ProtectedArea>;
}
