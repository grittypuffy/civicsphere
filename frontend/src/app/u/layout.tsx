"use client"
import AppContainer from "@/components/AppContainer";

export default function ULayout({ children }: { children: React.ReactNode }) {
  return (
    <AppContainer>
      {children}
    </AppContainer>
  )
}
