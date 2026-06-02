import type { Metadata } from "next"
import { MythPage } from "@/components/MythPage"

export const metadata: Metadata = {
  title: "Unfold My Truth - Minh Tam",
  description: "A deeper introduction to Minh Tam and the many versions of her creative journey.",
}

export default function Page() {
  return <MythPage />
}
