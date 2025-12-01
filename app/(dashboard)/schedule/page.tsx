import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "@/components/calendar-view"
import { ListSchedule } from "@/components/list-schedule"
import { CalendarDays, List, Plus } from "lucide-react"

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>
      <Tabs defaultValue="calendar" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <CalendarView />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <ListSchedule />
        </TabsContent>
      </Tabs>
    </div>
  )
}
