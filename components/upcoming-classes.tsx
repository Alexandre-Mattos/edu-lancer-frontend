"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClassNotesModal } from "@/components/class-notes-modal"
import { api, Class } from "@/lib/api"
import { format, isToday, isTomorrow, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export function UpcomingClasses() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.classes.list({ 
          status: "SCHEDULED",
          pageSize: 5,
          // Sort by date ascending would be ideal, assuming backend supports it or returns sorted
        })
        
        // Transform API data to component format
        const formattedClasses = response.data.map((cls: Class) => {
          const date = parseISO(cls.date)
          let dateDisplay = format(date, "dd/MM", { locale: ptBR })
          
          if (isToday(date)) dateDisplay = "Hoje"
          else if (isTomorrow(date)) dateDisplay = "Amanhã"

          return {
            id: cls.id,
            student: cls.student?.person?.name || "Aluno",
            level: cls.student?.level || "N/A",
            date: dateDisplay,
            time: cls.time,
            lesson: cls.lesson?.title || "Sem lição definida",
            status: cls.status.toLowerCase(),
            originalDate: cls.date
          }
        })

        setClasses(formattedClasses)
      } catch (error) {
        console.error("Failed to fetch classes:", error)
        // Fallback to mock data if API fails (for demo purposes)
        setClasses([
          {
            id: "1",
            student: "Gustavo",
            level: "Beginner",
            date: "Hoje",
            time: "07:00",
            lesson: "A1 Business - Class: 18 - Roles and Responsibilities",
            status: "confirmed"
          },
          {
            id: "2",
            student: "Fernanda",
            level: "Beginner",
            date: "Hoje",
            time: "09:00",
            lesson: "Class 15: A Day in the Life",
            status: "confirmed"
          },
          {
            id: "3",
            student: "Eduardo",
            level: "Pre-Intermediate",
            date: "Hoje",
            time: "12:00",
            lesson: '"Stronger" by Kelly Clarkson + Comparatives',
            status: "pending"
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const handleOpenNotes = (classItem: any) => {
    setSelectedClass(classItem)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Próximas Aulas</CardTitle>
              <CardDescription>Sua agenda para os próximos dias</CardDescription>
            </div>
            <Button variant="outline" size="sm">Ver Agenda Completa</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando aulas...</div>
            ) : classes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhuma aula agendada.</div>
            ) : (
              classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleOpenNotes(classItem)}
                >
                  <div className="flex-shrink-0 mr-4">
                     <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted text-muted-foreground border border-border">
                        <span className="text-xs font-bold uppercase">{classItem.date}</span>
                        <span className="text-sm font-bold">{classItem.time}</span>
                     </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center mb-1">
                      <h4 className="text-sm font-semibold truncate mr-2">{classItem.student}</h4>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                        {classItem.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate flex items-center">
                      <span className="w-2 h-2 rounded-full bg-primary mr-2 inline-block"></span>
                      {classItem.lesson}
                    </p>
                  </div>

                  <div className="flex items-center">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenNotes(classItem)}>
                          Anotações
                        </DropdownMenuItem>
                        <DropdownMenuItem>Reagendar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
                date: `${selectedClass.date} às ${selectedClass.time}`,
              }
            : null
        }
      />
    </>
  )
}
