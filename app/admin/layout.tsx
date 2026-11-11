import { ProtectedArea } from "@/components/dashboard/protected-area";

// Everything under /admin needs is_admin. Everyone else gets "not found".
export default function Layout({ children }: LayoutProps<"/admin">) {
  return <ProtectedArea pathname="/admin">{children}</ProtectedArea>;
}
