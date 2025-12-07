"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, Student, Lesson } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  
  const [formData, setFormData] = useState({
    studentId: "",
    lessonId: "",
    date: "",
    time: "",
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
      // Reset form when opening
      setFormData({
        studentId: "",
        lessonId: "",
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
      })
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      const [studentsRes, lessonsRes] = await Promise.all([
        api.students.list({ pageSize: 100 }),
        api.lessons.list({ pageSize: 100 })
      ])
      setStudents(studentsRes.data || [])
      setLessons(lessonsRes.data || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Erro ao carregar lista de alunos e lições.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.studentId || !formData.lessonId || !formData.date || !formData.time) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)
    try {
      // Get current user (teacher)
      const user = await api.auth.me()
      
      await api.classes.create({
        userId: user.id,
        studentId: formData.studentId,
        lessonId: formData.lessonId,
        companyId: user.companyId,
        date: new Date(formData.date),
        time: formData.time,
        status: "SCHEDULED"
      })

      toast.success("Aula agendada com sucesso!")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to create class:", error)
      toast.error("Erro ao agendar aula.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Aula</DialogTitle>
          <DialogDescription>
            Agende uma nova aula para um aluno.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">Aluno</Label>
              <Select 
                value={formData.studentId} 
                onValueChange={(value) => setFormData({...formData, studentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students?.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum aluno encontrado</SelectItem>
                  ) : (
                    students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.person?.name || "Aluno sem nome"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lesson">Lição</Label>
              <Select 
                value={formData.lessonId} 
                onValueChange={(value) => setFormData({...formData, lessonId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma lição" />
                </SelectTrigger>
                <SelectContent>
                  {lessons?.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhuma lição encontrada</SelectItem>
                  ) : (
                    lessons?.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title} ({lesson.level})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
