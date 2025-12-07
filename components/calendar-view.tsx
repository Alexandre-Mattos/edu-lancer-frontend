"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, FileEdit } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClassNotesModal } from "@/components/class-notes-modal"
import { api, Class, GoogleCalendarEvent } from "@/lib/api"
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [classesData, setClassesData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)
        
        const response = await api.classes.list({
          dateFrom: start.toISOString(),
          dateTo: end.toISOString()
        })

        const classesList = response.classes || [];
        const googleEvents = response.googleCalendarEvents || [];

        const formattedClasses = classesList.map((cls: Class) => ({
          id: cls.id,
          date: format(parseISO(cls.date), "yyyy-MM-dd"),
          time: cls.time,
          student: cls.student?.person?.name || "Aluno",
          level: cls.student?.level || "N/A",
          lesson: cls.lesson?.title || "Sem lição definida",
          fullDate: cls.date,
          isGoogleEvent: false
        }))

        const formattedGoogleEvents = googleEvents.map((evt: GoogleCalendarEvent) => ({
          id: evt.googleEventId,
          date: format(parseISO(evt.startDateTime), "yyyy-MM-dd"),
          time: format(parseISO(evt.startDateTime), "HH:mm"),
          student: "Google Calendar",
          level: "Externo",
          lesson: evt.summary,
          fullDate: evt.startDateTime,
          isGoogleEvent: true,
          summary: evt.summary
        }))

        setClassesData([...formattedClasses, ...formattedGoogleEvents])
      } catch (error) {
        console.error("Failed to fetch calendar classes:", error)
        setClassesData([])
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [currentDate])

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  // Previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Handle date click
  const handleDateClick = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(dateString)

    // Filter classes for selected date
    const classes = classesData.filter((c) => c.date === dateString)
    setSelectedClasses(classes)
    setIsDialogOpen(true)
  }

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedDate(null)
    setSelectedClasses([])
  }

  // Open notes modal
  const handleOpenNotes = (classItem: any) => {
    if (classItem.isGoogleEvent) return;
    setSelectedClass(classItem)
    setIsNotesModalOpen(true)
    setIsDialogOpen(false)
  }

  // Get classes for a specific day
  const getClassesForDay = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return classesData.filter((c) => c.date === dateString)
  }

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-2 border bg-muted/20"></div>)
  }

  // Add cells for days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const classes = getClassesForDay(day)
    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

    calendarDays.push(
      <div
        key={day}
        className={`p-2 border min-h-24 hover:bg-muted/20 cursor-pointer ${isToday ? "bg-primary/10" : ""}`}
        onClick={() => handleDateClick(day)}
      >
        <div className={`text-right font-medium ${isToday ? "text-primary" : ""}`}>{day}</div>
        <div className="mt-1 space-y-1">
          {loading ? (
             <div className="h-4 w-4 rounded-full bg-muted animate-pulse mx-auto"></div>
          ) : (
            <>
              {classes.slice(0, 3).map((c) => (
                <div key={c.id} className={`text-xs p-1 rounded truncate ${c.isGoogleEvent ? "bg-blue-100 dark:bg-blue-900/30" : "bg-primary/10"}`}>
                  {c.time} - {c.isGoogleEvent ? c.summary : c.student}
                </div>
              ))}
              {classes.length > 3 && <div className="text-xs text-center">+{classes.length - 3} mais</div>}
            </>
          )}
        </div>
      </div>,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center font-medium">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aulas do dia {selectedDate?.split("-").reverse().join("/")}</DialogTitle>
            <DialogDescription>
              {selectedClasses.length === 0
                ? "Não há aulas agendadas para este dia."
                : `${selectedClasses.length} aula(s) agendada(s)`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedClasses.map((classItem) => (
              <div key={classItem.id} className={`flex items-center justify-between p-3 border rounded-md ${classItem.isGoogleEvent ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}>
                <div>
                  <div className="font-medium">{classItem.isGoogleEvent ? classItem.summary : classItem.student}</div>
                  <div className="text-sm text-muted-foreground">{classItem.time}</div>
                  <div className="text-sm mt-1">{classItem.lesson}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={classItem.level === "Beginner" ? "default" : classItem.level === "Externo" ? "outline" : "secondary"}>
                    {classItem.level}
                  </Badge>
                  {!classItem.isGoogleEvent && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenNotes(classItem)}>
                      <FileEdit className="h-3 w-3 mr-1" />
                      Anotações
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ClassNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        classData={
          selectedClass
            ? {
                id: selectedClass.id,
                student: selectedClass.student,
                level: selectedClass.level,
                lesson: selectedClass.lesson,
                date: `${selectedClass.date.split("-").reverse().join("/")} ${selectedClass.time}`,
              }
            : null
        }
      />
    </div>
  )
}
