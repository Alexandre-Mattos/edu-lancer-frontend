"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, FileEdit } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClassNotesModal } from "@/components/class-notes-modal"

// Sample class data
const classesData = [
  {
    id: 1,
    date: "2025-05-06",
    time: "07:00",
    student: "Gustavo",
    level: "Beginner",
    lesson: "A1 Business - Class: 18",
  },
  {
    id: 2,
    date: "2025-05-06",
    time: "09:00",
    student: "Fernanda",
    level: "Beginner",
    lesson: "Class 15: A Day in the Life",
  },
  { id: 3, date: "2025-05-06", time: "12:00", student: "Eduardo", level: "Pre-Intermediate", lesson: "Comparatives" },
  {
    id: 4,
    date: "2025-05-07",
    time: "10:00",
    student: "Vinícius",
    level: "Beginner",
    lesson: "Class 12: Morning, people!",
  },
  { id: 5, date: "2025-05-07", time: "15:00", student: "Cristiane", level: "Pre-Intermediate", lesson: "Superlatives" },
  {
    id: 6,
    date: "2025-05-08",
    time: "08:00",
    student: "Natália",
    level: "Pre-Intermediate",
    lesson: "Where in the world?",
  },
  {
    id: 7,
    date: "2025-05-08",
    time: "17:00",
    student: "Andressa",
    level: "Beginner",
    lesson: "Class 31: My last vacations",
  },
  {
    id: 8,
    date: "2025-05-09",
    time: "12:00",
    student: "Eduardo",
    level: "Pre-Intermediate",
    lesson: "Comparatives - continue",
  },
  {
    id: 9,
    date: "2025-05-09",
    time: "18:00",
    student: "Maurício",
    level: "Pre-Intermediate",
    lesson: "Elementary - Picanha: the best!",
  },
  {
    id: 10,
    date: "2025-05-10",
    time: "09:00",
    student: "Fernanda",
    level: "Beginner",
    lesson: "Class 15: A Day in the Life",
  },
  {
    id: 11,
    date: "2025-05-10",
    time: "16:00",
    student: "Vinícius",
    level: "Beginner",
    lesson: "Class 12: Morning, people!",
  },
  {
    id: 12,
    date: "2025-05-11",
    time: "10:00",
    student: "Caroline",
    level: "Pre-Intermediate",
    lesson: "Where in the world?",
  },
  {
    id: 13,
    date: "2025-05-13",
    time: "14:00",
    student: "Mariane",
    level: "Pre-Intermediate",
    lesson: "Modal Verbs - May / might",
  },
  {
    id: 14,
    date: "2025-05-14",
    time: "07:00",
    student: "Gustavo",
    level: "Beginner",
    lesson: "Class 13 - A day in the life of a CEO",
  },
  {
    id: 15,
    date: "2025-05-14",
    time: "12:00",
    student: "Eduardo",
    level: "Pre-Intermediate",
    lesson: "Comparatives - continue",
  },
]

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)) // May 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any | null>(null)

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
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // Next month
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
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
          {classes.slice(0, 3).map((c) => (
            <div key={c.id} className="text-xs p-1 rounded bg-primary/10 truncate">
              {c.time} - {c.student}
            </div>
          ))}
          {classes.length > 3 && <div className="text-xs text-center">+{classes.length - 3} mais</div>}
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
              <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{classItem.student}</div>
                  <div className="text-sm text-muted-foreground">{classItem.time}</div>
                  <div className="text-sm mt-1">{classItem.lesson}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={classItem.level === "Beginner" ? "default" : "secondary"}>{classItem.level}</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleOpenNotes(classItem)}>
                    <FileEdit className="h-3 w-3 mr-1" />
                    Anotações
                  </Button>
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
