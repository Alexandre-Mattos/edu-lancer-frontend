import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentNotes } from "@/components/student-notes"
import { Plus } from "lucide-react"

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notas e Acompanhamento</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </Button>
      </div>
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Por Aluno</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <StudentNotes />
        </TabsContent>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Notas Recentes</CardTitle>
              <CardDescription>Últimas anotações e observações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Eduardo - 07/05/2025</CardTitle>
                        <CardDescription>Comparatives - continue</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      Eduardo está progredindo bem com os comparativos. Conseguiu completar todos os exercícios
                      corretamente. Precisa praticar mais a pronúncia de "than". Vocabulário de adjetivos está bom.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Vinícius - 07/05/2025</CardTitle>
                        <CardDescription>Morning, people!</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      Vinícius teve dificuldade com o vocabulário de rotina matinal. Precisa revisar os verbos: wake up,
                      get up, take a shower, brush teeth. Conseguiu formar frases simples, mas com alguns erros de
                      estrutura.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Natália - 07/05/2025</CardTitle>
                        <CardDescription>What is your earliest childhood memory?</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      Natália conseguiu contar uma história sobre sua infância com bom uso do past simple. Ainda
                      confunde alguns verbos irregulares (bring/brought, think/thought). Vocabulário sobre família e
                      infância está muito bom.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
