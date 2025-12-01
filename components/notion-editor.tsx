"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, CheckSquare, Save, Clock } from "lucide-react"

interface NotionEditorProps {
  classId: string
  student: string
  level: string
  lesson: string
  date: string
  initialContent?: string
  onSave?: (content: string) => void
}

export function NotionEditor({
  classId,
  student,
  level,
  lesson,
  date,
  initialContent = "",
  onSave,
}: NotionEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  // Update content when initialContent changes (e.g. after fetch)
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return

    const timer = setTimeout(() => {
      // Only auto-save if content is different from initial (to avoid saving empty on load)
      // But here we just trigger handleSave which calls onSave
      // We might want to debounce this better or check if dirty
      if (content !== initialContent) {
          handleSave()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [content, autoSaveEnabled])

  const handleSave = () => {
    if (onSave) {
      onSave(content)
    }
    setLastSaved(new Date().toLocaleTimeString())
  }

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById("notion-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "h1":
        formattedText = `# ${selectedText}`
        break
      case "h2":
        formattedText = `## ${selectedText}`
        break
      case "ul":
        formattedText = `- ${selectedText}`
        break
      case "ol":
        formattedText = `1. ${selectedText}`
        break
      case "checkbox":
        formattedText = `- [ ] ${selectedText}`
        break
      default:
        formattedText = selectedText
    }

    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)
    setContent(newContent)

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + formattedText.length
      textarea.selectionEnd = start + formattedText.length
    }, 0)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{student}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={level === "Beginner" ? "default" : "secondary"}>{level}</Badge>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          <p className="text-sm mt-1">{lesson}</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Salvo às {lastSaved}
            </div>
          )}
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Card className="mb-4 p-2 flex flex-wrap gap-2 bg-muted/50">
        <Button variant="ghost" size="sm" onClick={() => insertFormatting("bold")} title="Negrito">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertFormatting("italic")} title="Itálico">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertFormatting("h1")} title="Título 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertFormatting("h2")} title="Título 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertFormatting("ul")} title="Lista com marcadores">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertFormatting("ol")} title="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertFormatting("checkbox")} title="Lista de verificação">
          <CheckSquare className="h-4 w-4" />
        </Button>
      </Card>

      <div className="flex-1 flex flex-col">
        <textarea
          id="notion-editor"
          className="flex-1 p-4 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[300px]"
          placeholder="Comece a escrever suas anotações aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autosave"
            checked={autoSaveEnabled}
            onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className="mr-2"
          />
          <label htmlFor="autosave" className="text-sm text-muted-foreground">
            Salvar automaticamente
          </label>
        </div>
        <div className="text-xs text-muted-foreground">Dica: Use Markdown para formatação</div>
      </div>
    </div>
  )
}
