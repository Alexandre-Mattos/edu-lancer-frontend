import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LessonsList } from "@/components/lessons-list"
import { Plus } from "lucide-react"

export default function LessonsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Planos de Aula</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Lição
        </Button>
      </div>
      <Tabs defaultValue="beginner" className="space-y-4">
        <TabsList>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="pre-intermediate">Pre-Intermediate</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="beginner">
          <LessonsList level="Beginner" />
        </TabsContent>
        <TabsContent value="pre-intermediate">
          <LessonsList level="Pre-Intermediate" />
        </TabsContent>
        <TabsContent value="intermediate">
          <Card>
            <CardHeader>
              <CardTitle>Intermediate</CardTitle>
              <CardDescription>Lições para nível intermediário</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Nenhuma lição encontrada para este nível.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced</CardTitle>
              <CardDescription>Lições para nível avançado</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Nenhuma lição encontrada para este nível.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
