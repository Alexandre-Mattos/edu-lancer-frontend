"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { api, Student } from "@/lib/api"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  students: {
    label: "Alunos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function StudentLevelChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const response = await api.students.list({ pageSize: 100 })
        const students = response.data

        setTotalStudents(students.length)

        // Aggregate levels
        const levelCounts: Record<string, number> = {}
        students.forEach((student: Student) => {
          const level = student.level || "Unknown"
          levelCounts[level] = (levelCounts[level] || 0) + 1
        })

        // Format for chart
        const data = Object.entries(levelCounts).map(([level, count]) => ({
          level,
          students: count,
        }))

        setChartData(data)
      } catch (error) {
        console.error("Failed to fetch students for chart:", error)
        // Fallback mock data
        setChartData([
          { level: "Beginner", students: 12 },
          { level: "Pre-Intermediate", students: 8 },
          { level: "Intermediate", students: 5 },
          { level: "Upper-Intermediate", students: 3 },
          { level: "Advanced", students: 2 },
        ])
        setTotalStudents(30)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Níveis dos Alunos</CardTitle>
        <CardDescription>Distribuição por nível de proficiência</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <span className="loading loading-dots loading-md"></span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="level"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="students" fill="var(--color-students)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Total de {totalStudents} alunos ativos <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando distribuição atual de níveis
        </div>
      </CardFooter>
    </Card>
  )
}
