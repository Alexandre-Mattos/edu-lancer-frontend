"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentsList } from "@/components/students-list"
import { CreateStudentForm } from "@/components/create-student-form"
import { Plus, Search } from "lucide-react"

export default function StudentsPage() {
  const [view, setView] = useState<'list' | 'create'>('list')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
    setView('list')
  }

  if (view === 'create') {
    return (
      <div className="flex flex-col gap-4">
        <CreateStudentForm 
          onCancel={() => setView('list')} 
          onSuccess={handleSuccess} 
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
        <Button onClick={() => setView('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aluno
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar alunos..." className="pl-8" />
        </div>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="pre-intermediate">Pre-Intermediate</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <StudentsList key={`all-${refreshKey}`} />
        </TabsContent>
        <TabsContent value="beginner">
          <StudentsList key={`beginner-${refreshKey}`} level="Beginner" />
        </TabsContent>
        <TabsContent value="pre-intermediate">
          <StudentsList key={`pre-intermediate-${refreshKey}`} level="Pre-Intermediate" />
        </TabsContent>
        <TabsContent value="intermediate">
          <StudentsList key={`intermediate-${refreshKey}`} level="Intermediate" />
        </TabsContent>
        <TabsContent value="advanced">
          <StudentsList key={`advanced-${refreshKey}`} level="Advanced" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
