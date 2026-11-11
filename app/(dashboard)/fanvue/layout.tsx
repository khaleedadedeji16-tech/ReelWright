import { ProtectedArea } from "@/components/dashboard/protected-area";

export default function Layout({ children }: LayoutProps<"/fanvue">) {
  return <ProtectedArea pathname="/fanvue">{children}</ProtectedArea>;
}
