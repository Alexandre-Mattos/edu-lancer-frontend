"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarClock, MoreHorizontal, Phone, Mail } from "lucide-react"
import { api, Student } from "@/lib/api"

interface StudentsListProps {
  level?: string
}

export function StudentsList({ level }: StudentsListProps) {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const response = await api.students.list({ pageSize: 10, page: 1 })
        
        // Handle different response structures
        let fetchedStudents = Array.isArray(response) 
          ? response 
          : (response.data && Array.isArray(response.data) ? response.data : []);

        if (level) {
          fetchedStudents = fetchedStudents.filter((s: Student) => s.level === level)
        }

        const formattedStudents = fetchedStudents.map((s: Student) => ({
          id: s.id,
          name: s.person?.name || "Unknown",
          level: s.level || "N/A",
          email: s.person?.email || "N/A",
          phone: s.person?.phone || "N/A",
          nextClass: "TBD", // This would require another API call or backend field
          progress: s.totalLessons !== undefined 
            ? `${s.attendedLessons || 0}/${s.totalLessons}` 
            : (s.progress || "0/0")
        }))

        setStudents(formattedStudents)
      } catch (error) {
        console.error("Failed to fetch students:", error)
        // Fallback mock data
        const mockData = [
          { id: "1", name: "Gustavo", level: "Beginner", email: "gustavo@example.com", phone: "+55 11 98765-4321", nextClass: "14/05/2025", progress: "5/10" },
          { id: "2", name: "Eduardo", level: "Pre-Intermediate", email: "eduardo@example.com", phone: "+55 11 91234-5678", nextClass: "14/05/2025", progress: "2/20" },
        ]
        setStudents(level ? mockData.filter(s => s.level === level) : mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [level])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{level || "Todos os Alunos"}</CardTitle>
        <CardDescription>{level ? `Alunos de nível ${level}` : "Lista completa de alunos"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {loading ? (
             <div className="flex justify-center p-8">
               <span className="loading loading-dots loading-lg"></span>
             </div>
          ) : students.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">Nenhum aluno encontrado.</div>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <Badge variant={student.level === "Beginner" ? "default" : "secondary"}>{student.level}</Badge>
                  </div>
                </div>
                <div className="ml-auto flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    <span>Próxima: {student.nextClass}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="font-medium">Progresso: {student.progress}</span>
                  </div>
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
                      <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                      <DropdownMenuItem>Editar informações</DropdownMenuItem>
                      <DropdownMenuItem>Histórico de aulas</DropdownMenuItem>
                      <DropdownMenuItem>Agendar aula</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Remover aluno</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
