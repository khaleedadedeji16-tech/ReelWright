import { ProtectedArea } from "@/components/dashboard/protected-area";

export default function Layout({ children }: LayoutProps<"/author">) {
  return <ProtectedArea pathname="/author">{children}</ProtectedArea>;
}
