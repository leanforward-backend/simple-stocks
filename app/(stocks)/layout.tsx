// app/(stocks)/layout.tsx
import { DataStreamProvider } from "@/components/data-stream-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DataStreamProvider>{children}</DataStreamProvider>;
}
