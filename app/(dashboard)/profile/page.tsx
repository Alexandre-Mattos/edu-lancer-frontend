"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { api, User } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, User as UserIcon, Mail, Phone, Building, Calendar, MapPin, Edit2, Save, X, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    googleCalendarUrl: "",
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: ""
    }
  })

  useEffect(() => {
    fetchUser()
    
    // Check for success param from Google Auth redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      toast.success("Google Calendar conectado com sucesso!")
      // Clean up URL without reloading
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const userData = await api.auth.me()
      setUser(userData)
      
      // Initialize form data
      const person = userData.person
      const mainEmail = person?.contacts?.find(c => c.type === "EMAIL")?.value || userData.email
      const mainPhone = person?.contacts?.find(c => c.type === "PHONE" || c.type === "MOBILE" || c.type === "WHATSAPP")?.value || ""
      const mainAddress = person?.address?.[0] || {}

      setFormData({
        name: person?.name || "",
        document: person?.document || "",
        email: mainEmail,
        phone: mainPhone,
        googleCalendarUrl: userData.googleCalendarUrl || "",
        address: {
          street: mainAddress.street || "",
          number: mainAddress.number || "",
          neighborhood: mainAddress.neighborhood || "",
          city: mainAddress.city || "",
          state: mainAddress.state || "",
          zipCode: mainAddress.zipCode || ""
        }
      })
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      toast.error("Erro ao carregar perfil do usuário.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
        toast.error("Usuário não carregado.")
        return
    }

    setSaving(true)
    let hasError = false

    // 1. Update User Data (Account info)
    // Only send fields that belong to the User entity
    try {
      const userUpdates: any = {}
      if (formData.email !== user.email) userUpdates.email = formData.email
      // googleCalendarUrl is now handled via OAuth, so we don't update it manually here
      // hasGoogleCalendarIntegration is read-only from backend

      if (Object.keys(userUpdates).length > 0) {
        await api.users.update(user.id, userUpdates)
        // Update local state immediately to prevent UI reversion
        setUser(prev => prev ? ({ ...prev, ...userUpdates }) : null)
      }
    } catch (error: any) {
      console.error("Failed to update user account:", error)
      hasError = true
      if (error.message?.includes("403")) {
        toast.error("Sem permissão para alterar dados da conta (Email/Calendário).")
      } else {
        toast.error("Erro ao atualizar dados da conta.")
      }
    }

    // 2. Update Person Data (Personal info)
    // Only send fields that belong to the Person entity
    if (user.personId) {
      try {
        const personUpdateData: any = {
          name: formData.name,
          document: formData.document,
          contacts: [
              { type: "EMAIL", value: formData.email, isMain: true },
              { type: "WHATSAPP", value: formData.phone, isMain: true }
          ],
          address: [
              {
                  ...formData.address,
                  country: "Brasil",
                  isMain: true
              }
          ]
        }
        await api.persons.update(user.personId, personUpdateData)
      } catch (error) {
        console.error("Failed to update person details:", error)
        hasError = true
        toast.error("Erro ao atualizar dados pessoais.")
      }
    }

    if (!hasError) {
      toast.success("Perfil atualizado com sucesso!")
      setIsEditing(false)
      fetchUser() // Refresh data
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    fetchUser() // Reset form
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e da conta.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Dados de identificação e contato.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              {isEditing ? (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="pl-9"
                  />
                </div>
              ) : (
                <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>CPF/CNPJ</Label>
              {isEditing ? (
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.document} 
                    onChange={(e) => setFormData({...formData, document: e.target.value})} 
                    className="pl-9"
                  />
                </div>
              ) : (
                <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.document}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="pl-9"
                  />
                </div>
              ) : (
                <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.email}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className="pl-9"
                  />
                </div>
              ) : (
                <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.phone || "-"}</div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-2">
                <Label>Rua</Label>
                {isEditing ? (
                  <Input 
                    value={formData.address.street} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} 
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.address.street || "-"}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                {isEditing ? (
                  <Input 
                    value={formData.address.number} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, number: e.target.value}})} 
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.address.number || "-"}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                {isEditing ? (
                  <Input 
                    value={formData.address.neighborhood} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, neighborhood: e.target.value}})} 
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.address.neighborhood || "-"}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                {isEditing ? (
                  <Input 
                    value={formData.address.city} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} 
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.address.city || "-"}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Estado (UF)</Label>
                {isEditing ? (
                  <Input 
                    value={formData.address.state} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})} 
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.address.state || "-"}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                {isEditing ? (
                  <Input 
                    value={formData.address.zipCode} 
                    onChange={(e) => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})} 
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/20 font-medium">{formData.address.zipCode || "-"}</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Conecte-se com serviços externos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Google Calendar</Label>
              <div className="p-4 border rounded-md bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Integração com Google Calendar</span>
                    <span className="text-sm text-muted-foreground">
                      {user?.hasGoogleCalendarIntegration 
                        ? "Conectado" 
                        : "Sincronize suas aulas automaticamente"}
                    </span>
                  </div>
                </div>
                {user?.hasGoogleCalendarIntegration ? (
                  <Button variant="outline" size="sm" disabled>
                    Conectado
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => api.auth.connectGoogle()}>
                    Conectar Google Calendar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
