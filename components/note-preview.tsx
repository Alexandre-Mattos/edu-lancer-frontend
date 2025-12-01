"use client"

import { useState, useEffect } from "react"

interface NotePreviewProps {
  content: string
}

export function NotePreview({ content }: NotePreviewProps) {
  const [formattedContent, setFormattedContent] = useState("")

  useEffect(() => {
    // Simple Markdown parser (in a real app, use a proper Markdown library)
    const formatted = content
      // Headers
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Lists
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/<\/li>\n<li>/g, "</li><li>")
      .replace(/<li>(.+?)(?=\n<\/li>|$)/g, "<ul><li>$1</li></ul>")
      // Numbered lists
      .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
      .replace(/<\/li>\n<li>/g, "</li><li>")
      .replace(/<li>(.+?)(?=\n<\/li>|$)/g, "<ol><li>$1</li></ol>")
      // Checkboxes
      .replace(
        /- \[ \] (.*$)/gm,
        '<div class="flex items-center"><input type="checkbox" class="mr-2" /><span>$1</span></div>',
      )
      .replace(
        /- \[x\] (.*$)/gm,
        '<div class="flex items-center"><input type="checkbox" checked class="mr-2" /><span>$1</span></div>',
      )
      // Line breaks
      .replace(/\n/g, "<br />")

    setFormattedContent(formatted)
  }, [content])

  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  )
}
