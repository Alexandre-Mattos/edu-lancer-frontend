"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, Class, GoogleCalendarEvent } from "@/lib/api"
import { startOfWeek, endOfWeek, format, addDays, isSameDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export function ClassesOverview() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

  // Generate week days
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i)
    weekDays.push({
      dayName: format(date, "EEE", { locale: ptBR }),
      date: format(date, "dd"),
      fullDate: date,
      isToday: isSameDay(date, new Date()),
    })
  }

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        const response = await api.classes.list({
          dateFrom: weekStart.toISOString(),
          dateTo: weekEnd.toISOString()
        })

        const classesList = response.classes || [];
        const googleEvents = response.googleCalendarEvents || [];

        const formattedClasses = classesList.map((cls: Class) => ({
          id: cls.id,
          date: parseISO(cls.date),
          time: cls.time,
          student: cls.student?.person?.name || "Aluno",
          level: cls.student?.level || "N/A",
          isGoogleEvent: false
        }))

        const formattedGoogleEvents = googleEvents.map((evt: GoogleCalendarEvent) => ({
          id: evt.googleEventId,
          date: parseISO(evt.startDateTime),
          time: format(parseISO(evt.startDateTime), "HH:mm"),
          student: "Google Calendar",
          level: "Externo",
          isGoogleEvent: true,
          summary: evt.summary
        }))

        setClasses([...formattedClasses, ...formattedGoogleEvents])
      } catch (error) {
        console.error("Failed to fetch classes:", error)
        // Fallback mock data
        setClasses([
          { id: "1", date: addDays(weekStart, 1), time: "07:00", student: "Gustavo", level: "Beginner" },
          { id: "2", date: addDays(weekStart, 1), time: "09:00", student: "Fernanda", level: "Beginner" },
          { id: "3", date: addDays(weekStart, 1), time: "12:00", student: "Eduardo", level: "Pre-Intermediate" },
          { id: "4", date: addDays(weekStart, 2), time: "10:00", student: "Vinícius", level: "Beginner" },
          { id: "5", date: addDays(weekStart, 2), time: "15:00", student: "Cristiane", level: "Pre-Intermediate" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [currentDate]) // Refetch when week changes

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7))
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7))

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Visão Geral da Semana</CardTitle>
          <CardDescription>Sua carga horária semanal</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium mx-2 capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 h-full">
          {weekDays.map((day, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className={cn(
                "text-center p-2 rounded-lg transition-colors",
                day.isToday ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}>
                <div className="text-xs font-medium uppercase tracking-wider">{day.dayName}</div>
                <div className={cn("text-lg font-bold", day.isToday && "text-primary")}>{day.date}</div>
              </div>
              <div className="space-y-2 flex-1 min-h-[200px] rounded-lg bg-muted/20 p-1">
                {loading ? (
                   <div className="h-full flex items-center justify-center">
                     <span className="loading loading-dots loading-xs"></span>
                   </div>
                ) : classes
                  .filter((c) => isSameDay(c.date, day.fullDate))
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((classItem) => (
                    <div key={classItem.id} className={cn(
                      "p-2 rounded-md border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group",
                      classItem.isGoogleEvent ? "bg-blue-50 dark:bg-blue-950/20" : "bg-card"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{classItem.time}</span>
                      </div>
                      <div className="font-semibold text-xs truncate">
                        {classItem.isGoogleEvent ? classItem.summary : classItem.student}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}