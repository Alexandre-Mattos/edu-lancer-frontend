"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { api, Student, Note } from "@/lib/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function StudentNotes() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true)
      try {
        const response = await api.students.list({ pageSize: 100 })
        const formattedStudents = response.data.map((s: Student) => ({
          id: s.id,
          name: s.person?.name || "Unknown",
          level: s.level || "N/A",
          notesCount: 0 // Ideally this comes from backend or we fetch counts
        }))
        setStudents(formattedStudents)
      } catch (error) {
        console.error("Failed to fetch students:", error)
        // Fallback mock data
        setStudents([
          { id: "1", name: "Gustavo", level: "Beginner", notesCount: 2 },
          { id: "2", name: "Eduardo", level: "Pre-Intermediate", notesCount: 2 },
        ])
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [])

  useEffect(() => {
    if (!selectedStudentId) return

    const fetchNotes = async () => {
      setLoadingNotes(true)
      try {
        const response = await api.notes.list({ studentId: selectedStudentId })
        const formattedNotes = response.data.map((note: Note) => ({
          id: note.id,
          date: format(new Date(note.createdAt), "dd/MM/yyyy", { locale: ptBR }),
          lesson: "Aula", // Note might not have lesson title directly populated, depends on backend expansion
          content: note.content
        }))
        setNotes(formattedNotes)
      } catch (error) {
        console.error("Failed to fetch notes:", error)
        // Fallback mock data
        if (selectedStudentId === "1") {
             setNotes([
              {
                id: "1",
                date: "07/05/2025",
                lesson: "Class 13 - A day in the life of a CEO",
                content: "Gustavo teve dificuldade com o vocabulário de negócios.",
              }
            ])
        } else {
            setNotes([])
        }
      } finally {
        setLoadingNotes(false)
      }
    }

    fetchNotes()
  }, [selectedStudentId])

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedStudentData = selectedStudentId ? students.find((s) => s.id === selectedStudentId) : null

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Alunos</CardTitle>
          <CardDescription>Selecione um aluno para ver suas notas</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar alunos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {loadingStudents ? (
               <div className="flex justify-center p-4">
                 <span className="loading loading-dots loading-sm"></span>
               </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Nenhum aluno encontrado</div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    selectedStudentId === student.id ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <Badge variant={student.level === "Beginner" ? "default" : "secondary"} className="mt-1">
                      {student.level}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{selectedStudentData ? `Notas de ${selectedStudentData.name}` : "Notas"}</CardTitle>
          <CardDescription>
            {selectedStudentData
              ? `Histórico de acompanhamento e observações`
              : "Selecione um aluno para ver suas notas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedStudentData ? (
            <div className="space-y-4">
              {loadingNotes ? (
                 <div className="flex justify-center p-8">
                   <span className="loading loading-dots loading-lg"></span>
                 </div>
              ) : notes.length > 0 ? (
                notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{note.date}</CardTitle>
                          <CardDescription>{note.lesson}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm whitespace-pre-line">{note.content}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhuma nota encontrada para este aluno
                </div>
              )}
              <div className="flex justify-center mt-4">
                <Button>Adicionar Nova Nota</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-sm text-muted-foreground">
              Selecione um aluno para ver suas notas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
