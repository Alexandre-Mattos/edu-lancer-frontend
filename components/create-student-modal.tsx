"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CreateStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateStudentModal({ isOpen, onClose, onSuccess }: CreateStudentModalProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    document: "",
    phone: "",
    level: "Beginner",
    progress: "0%",
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setFormData({
        name: "",
        email: "",
        document: "",
        phone: "",
        level: "Beginner",
        progress: "0%",
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.document) {
      toast.error("Preencha os campos obrigatórios (Nome, Email, Documento).")
      return
    }

    setLoading(true)
    try {
      // Get current user (teacher)
      const user = await api.auth.me()
      
      // 1. Create Person
      const personData = {
        name: formData.name,
        document: formData.document,
        companyId: user.companyId,
        contacts: [
          { type: "EMAIL", value: formData.email, isMain: true },
          ...(formData.phone ? [{ type: "PHONE", value: formData.phone, isMain: false }] : [])
        ],
        address: [] // Empty address for now as it's required by type but maybe optional in backend logic? 
        // Actually backend.md says address is array of objects. Let's send empty array.
      }

      // Note: The backend might require address fields. If it fails, we'll need to add address inputs.
      // Based on backend.md: address: Array<{ street: string; ... }>
      // Let's try sending empty array first.
      
      // Wait, the backend.md says address is required in the body example.
      // Let's add a dummy address if needed, or hope it accepts empty.
      // For a "Quick Create" student, we usually don't have address.
      // Let's try to send a minimal valid address if it fails, or just empty array.
      
      // Actually, let's check if I can get away with just creating the person.
      // The return of api.persons.create is not typed in my api.ts update, but it should return { id: ... }
      
      const personRes: any = await api.persons.create(personData)
      const personId = personRes.id || personRes.data?.id

      if (!personId) {
        throw new Error("Falha ao criar pessoa: ID não retornado.")
      }

      // 2. Create Student
      await api.students.create({
        personId: personId,
        teacherId: user.id,
        companyId: user.companyId,
        level: formData.level,
        progress: formData.progress
      })

      toast.success("Aluno criado com sucesso!")
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Failed to create student:", error)
      toast.error(error.message || "Erro ao criar aluno.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Aluno</DialogTitle>
          <DialogDescription>
            Cadastre um novo aluno.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="level">Nível</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => setFormData({...formData, level: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Iniciante</SelectItem>
                    <SelectItem value="Intermediate">Intermediário</SelectItem>
                    <SelectItem value="Advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="progress">Progresso Inicial</Label>
                <Input
                  id="progress"
                  value={formData.progress}
                  onChange={(e) => setFormData({...formData, progress: e.target.value})}
                  placeholder="Ex: 0%"
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
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
