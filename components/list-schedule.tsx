"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, MoreHorizontal, FileEdit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClassNotesModal } from "@/components/class-notes-modal"
import { api, Class, GoogleCalendarEvent } from "@/lib/api"
import { format, parseISO, addDays, startOfDay, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export function ListSchedule() {
  const [expandedDays, setExpandedDays] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [groupedClasses, setGroupedClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        const today = startOfDay(new Date())
        const nextWeek = addDays(today, 7)
        
        const response = await api.classes.list({
          dateFrom: today.toISOString(),
          dateTo: nextWeek.toISOString()
        })

        const classesList = response.classes || [];
        const googleEvents = response.googleCalendarEvents || [];

        // Group classes by date
        const grouped: Record<string, any[]> = {}
        
        classesList.forEach((cls: Class) => {
          const dateKey = format(parseISO(cls.date), "dd/MM/yyyy")
          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }
          grouped[dateKey].push({
            id: cls.id,
            time: cls.time,
            student: cls.student?.person?.name || "Aluno",
            level: cls.student?.level || "N/A",
            lesson: cls.lesson?.title || "TBD",
            fullDate: cls.date,
            isGoogleEvent: false
          })
        })

        googleEvents.forEach((evt: GoogleCalendarEvent) => {
          const dateKey = format(parseISO(evt.startDateTime), "dd/MM/yyyy")
          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }
          grouped[dateKey].push({
            id: evt.googleEventId,
            time: format(parseISO(evt.startDateTime), "HH:mm"),
            student: "Google Calendar",
            level: "Externo",
            lesson: evt.summary,
            fullDate: evt.startDateTime,
            isGoogleEvent: true
          })
        })

        const groupedArray = Object.entries(grouped).map(([date, classes]) => ({
          date,
          classes: classes.sort((a, b) => a.time.localeCompare(b.time))
        })).sort((a, b) => {
            // Sort by date string dd/MM/yyyy
            const [dayA, monthA, yearA] = a.date.split('/').map(Number)
            const [dayB, monthB, yearB] = b.date.split('/').map(Number)
            return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
        })

        setGroupedClasses(groupedArray)
        if (groupedArray.length > 0) {
            setExpandedDays([groupedArray[0].date])
        }

      } catch (error) {
        console.error("Failed to fetch schedule:", error)
        setGroupedClasses([])
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]))
  }

  const handleOpenNotes = (classItem: any, date: string) => {
    if (classItem.isGoogleEvent) return; // Disable notes for Google events
    setSelectedClass({ ...classItem, date })
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        {loading ? (
           <div className="flex justify-center p-8">
             <span className="loading loading-dots loading-lg"></span>
           </div>
        ) : groupedClasses.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">Nenhuma aula agendada para os próximos dias.</div>
        ) : (
          groupedClasses.map((day) => (
            <Card key={day.date}>
              <CardHeader className="py-3 cursor-pointer" onClick={() => toggleDay(day.date)}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{day.date}</CardTitle>
                    <CardDescription>{day.classes.length} aulas agendadas</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    {expandedDays.includes(day.date) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedDays.includes(day.date) && (
                <CardContent>
                  <div className="space-y-4">
                    {day.classes.map((classItem: any) => (
                      <div
                        key={classItem.id}
                        className={`grid grid-cols-12 items-center text-sm border-b pb-3 hover:bg-muted/50 rounded-md p-2 cursor-pointer transition-colors ${classItem.isGoogleEvent ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''}`}
                        onClick={() => handleOpenNotes(classItem, day.date)}
                      >
                        <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                          {!classItem.isGoogleEvent && <Checkbox id={`class-${classItem.id}`} />}
                        </div>
                        <div className="col-span-1 font-medium">{classItem.time}</div>
                        <div className="col-span-2 font-medium">{classItem.student}</div>
                        <div className="col-span-2">
                          <Badge variant={classItem.level === "Beginner" ? "default" : classItem.level === "Externo" ? "outline" : "secondary"}>
                            {classItem.level}
                          </Badge>
                        </div>
                        <div className="col-span-5 truncate" title={classItem.lesson}>
                          {classItem.lesson}
                        </div>
                        <div className="col-span-1 text-right" onClick={(e) => e.stopPropagation()}>
                          {!classItem.isGoogleEvent && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenNotes(classItem, day.date)}>
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  Anotações
                                </DropdownMenuItem>
                                <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                <DropdownMenuItem>Editar aula</DropdownMenuItem>
                                <DropdownMenuItem>Reagendar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Cancelar aula</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <ClassNotesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classData={
          selectedClass
            ? {
                id: selectedClass.id,
                student: selectedClass.student,
                level: selectedClass.level,
                lesson: selectedClass.lesson,
                date: `${selectedClass.date} ${selectedClass.time}`,
              }
            : null
        }
      />
    </>
  )
}
