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
import { BookOpen, FileText, MoreHorizontal } from "lucide-react"
import { api, Lesson } from "@/lib/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LessonsListProps {
  level: string
}

export function LessonsList({ level }: LessonsListProps) {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true)
      try {
        const response = await api.lessons.list({
          level: level,
          pageSize: 100
        })

        const formattedLessons = response.data.map((lesson: Lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          materials: lesson.materials || [],
          lastUsed: lesson.createdAt ? format(new Date(lesson.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
        }))

        setLessons(formattedLessons)
      } catch (error) {
        console.error("Failed to fetch lessons:", error)
        // Fallback mock data
        const mockData = [
          {
            id: "1",
            title: "Class 1: Introductions",
            description: "Basic greetings and introductions",
            materials: ["Handout 1", "Vocabulary List"],
            lastUsed: "01/05/2025",
            level: "Beginner"
          },
          {
            id: "2",
            title: "Comparatives",
            description: "Using comparative adjectives",
            materials: ["Exercise Sheet", "Game Cards"],
            lastUsed: "07/05/2025",
            level: "Pre-Intermediate"
          }
        ]
        setLessons(mockData.filter(l => l.level === level))
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [level])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{level}</CardTitle>
        <CardDescription>Lições para nível {level}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center text-muted-foreground p-8">Nenhuma lição encontrada para este nível.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{lesson.title}</CardTitle>
                      <CardDescription className="mt-1">{lesson.description}</CardDescription>
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
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar lição</DropdownMenuItem>
                        <DropdownMenuItem>Usar em aula</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Remover lição</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xs text-muted-foreground">Criado em: {lesson.lastUsed}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {lesson.materials.map((material: string, index: number) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {material.includes("Exercise") || material.includes("Worksheet") ? (
                          <FileText className="h-3 w-3" />
                        ) : (
                          <BookOpen className="h-3 w-3" />
                        )}
                        {material}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
