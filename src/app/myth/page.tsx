import type { Metadata } from "next"
import { MythPage } from "@/components/MythPage"

export const metadata: Metadata = {
  title: "Unfold My Myth - Minh Tam",
  description: "A deeper bilingual introduction to Minh Tam and her creative practice.",
}

export default function Page() {
  return <MythPage />
}
