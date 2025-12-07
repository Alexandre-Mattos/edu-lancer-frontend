"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

interface CreateStudentFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export function CreateStudentForm({ onCancel, onSuccess }: CreateStudentFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    phone: "",
    birthDate: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    level: "Beginner",
    packageSize: "10",
    startDate: "",
    startTime: "",
    recurrence: "WEEKLY",
    duration: "60"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.document) {
      toast.error("Preencha os campos obrigatórios (Nome, Email, Documento).")
      return
    }

    if (!formData.startDate || !formData.startTime) {
      toast.error("Preencha a data e hora da primeira aula.")
      return
    }

    setLoading(true)
    try {
      const user = await api.auth.me()
      
      const firstClassDate = new Date(`${formData.startDate}T${formData.startTime}:00`)

      const payload = {
        person: {
          name: formData.name,
          document: formData.document,
          birthDate: formData.birthDate || undefined,
          contacts: [
            formData.phone ? { type: "phone", value: formData.phone, isMain: true } : null,
            { type: "email", value: formData.email, isMain: !formData.phone }
          ].filter(Boolean),
          address: [
            {
              street: formData.street || "N/A",
              number: formData.number || "0",
              complement: formData.complement || undefined,
              neighborhood: formData.neighborhood || "Centro",
              city: formData.city || "N/A",
              state: formData.state || "N/A",
              country: "Brasil",
              zipCode: formData.zipCode || "00000-000",
              isMain: true
            }
          ]
        },
        teacherId: user.id,
        level: formData.level,
        totalLessons: Number(formData.packageSize),
        firstClassDate: firstClassDate.toISOString(),
        classDuration: Number(formData.duration),
        recurrence: formData.recurrence
      }

      await api.students.createWithPerson(payload)

      toast.success("Aluno cadastrado e aulas agendadas com sucesso!")
      onSuccess()
    } catch (error: any) {
      console.error("Failed to create student:", error)
      toast.error(error.message || "Erro ao criar aluno.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Novo Aluno</CardTitle>
            <CardDescription>
              Preencha as informações para cadastrar um novo aluno e seu pacote de aulas.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dados Pessoais</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="joao@exemplo.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="document">CPF/Documento *</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
            </div>

            <h4 className="text-xs font-medium text-muted-foreground mt-4 mb-2">Endereço (Opcional)</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  placeholder="Rua Exemplo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  placeholder="123"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => setFormData({...formData, complement: e.target.value})}
                  placeholder="Apto 45"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                  placeholder="Centro"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="São Paulo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  placeholder="01234-567"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dados do Curso</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="level">Nível de Inglês</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => setFormData({...formData, level: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Iniciante (A1-A2)</SelectItem>
                    <SelectItem value="Intermediate">Intermediário (B1-B2)</SelectItem>
                    <SelectItem value="Advanced">Avançado (C1-C2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="packageSize">Pacote de Aulas (Quantidade)</Label>
                <Input
                  id="packageSize"
                  type="number"
                  min="1"
                  value={formData.packageSize}
                  onChange={(e) => setFormData({...formData, packageSize: e.target.value})}
                  placeholder="Ex: 10"
                />
                <p className="text-xs text-muted-foreground">
                  Total de aulas contratadas pelo aluno.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Agendamento Inicial</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data da Primeira Aula *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Horário *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recurrence">Frequência</Label>
                <Select 
                  value={formData.recurrence} 
                  onValueChange={(value) => setFormData({...formData, recurrence: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="BIWEEKLY">Quinzenal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar Aluno
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
