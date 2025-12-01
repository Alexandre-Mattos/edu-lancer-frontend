"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, LayoutDashboard, Menu, Users, FileText, BookMarked, Zap} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"


const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-foreground",
  },
  {
    label: "Alunos",
    icon: Users,
    href: "/students",
    color: "text-foreground",
  },
  {
    label: "Agenda",
    icon: Calendar,
    href: "/schedule",
    color: "text-foreground",
  },
  {
    label: "Planos de Aula",
    icon: BookMarked,
    href: "/lessons",
    color: "text-foreground",
  },
  {
    label: "Notas e Acompanhamento",
    icon: FileText,
    href: "/notes",
    color: "text-foreground",
  },
  {
    label: "Materiais",
    icon: BookMarked,
    href: "/materials",
    color: "text-foreground",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pt-10 w-64">
          <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r">
            <div className="px-3 py-2 flex-1">
              <Link href="/" className="flex items-center pl-3 mb-14">
                <h1 className="text-2xl font-bold tracking-tight text-primary">BLASTER</h1>
              </Link>
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                      pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                      {route.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-30">
        <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r">
          <div className="px-3 py-2 flex-1">
            <Link href="/" className="flex items-center pl-3 mb-14">
              <h1 className="text-2xl font-bold tracking-tight text-primary">BLASTER</h1>
            </Link>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                    pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground",
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
