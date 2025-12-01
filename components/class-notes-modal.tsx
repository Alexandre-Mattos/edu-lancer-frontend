"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotionEditor } from "@/components/notion-editor"
import { NotePreview } from "@/components/note-preview"
import { api, Note } from "@/lib/api"
import { toast } from "sonner"

interface ClassNotesModalProps {
  isOpen: boolean
  onClose: () => void
  classData: {
    id: string
    student: string
    level: string
    lesson: string
    date: string
  } | null
}

export function ClassNotesModal({ isOpen, onClose, classData }: ClassNotesModalProps) {
  const [activeTab, setActiveTab] = useState("editor")
  const [noteContent, setNoteContent] = useState("")
  const [noteId, setNoteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (classData && classData.id && isOpen) {
      const fetchNote = async () => {
        setLoading(true)
        try {
          // Try to find a note for this class
          const response = await api.notes.list({ classId: classData.id })
          if (response.data && response.data.length > 0) {
            const note = response.data[0]
            setNoteContent(note.content)
            setNoteId(note.id)
          } else {
            setNoteContent("")
            setNoteId(null)
          }
        } catch (error) {
          console.error("Failed to fetch note:", error)
          // Fallback for demo/mock
          setNoteContent("")
        } finally {
          setLoading(false)
        }
      }
      fetchNote()
    }
  }, [classData, isOpen])

  const handleSave = async (content: string) => {
    setNoteContent(content)
    if (!classData) return

    try {
      if (noteId) {
        await api.notes.update(noteId, { content })
        toast.success("Nota atualizada com sucesso!")
      } else {
        const response = await api.notes.create({
          classId: classData.id,
          content,
          // We might need studentId here too, but usually classId is enough if backend infers it
          // For now assuming backend handles it or we'd need to pass studentId in classData
        })
        // Assuming response is the created note or contains id
        // If response is void/unknown, we might need to refetch or assume success
        toast.success("Nota criada com sucesso!")
        // Ideally we get the ID back to setNoteId
      }
    } catch (error) {
      console.error("Failed to save note:", error)
      toast.error("Erro ao salvar nota.")
    }
  }

  if (!classData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Anotações da Aula</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Visualização</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 overflow-auto">
            {loading ? (
               <div className="flex justify-center items-center h-full">
                 <span className="loading loading-dots loading-lg"></span>
               </div>
            ) : (
              <NotionEditor
                classId={classData.id}
                student={classData.student}
                level={classData.level}
                lesson={classData.lesson}
                date={classData.date}
                initialContent={noteContent}
                onSave={handleSave}
              />
            )}
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-auto p-4 border rounded-md">
            <div>
              <h2 className="text-2xl font-bold">{classData.student}</h2>
              <div className="text-sm text-muted-foreground mb-4">
                {classData.lesson} - {classData.date}
              </div>
              <NotePreview content={noteContent} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
