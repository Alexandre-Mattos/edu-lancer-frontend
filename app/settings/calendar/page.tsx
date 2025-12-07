"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CalendarCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get("success")
    if (success === "true") {
      router.push("/profile?success=true")
    } else {
      router.push("/profile?error=calendar_connection_failed")
    }
  }, [router, searchParams])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Finalizando conexão com Google Calendar...</p>
      </div>
    </div>
  )
}
