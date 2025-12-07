"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.auth.login({ email, password })
      
      // Handle different response structures
      // 1. Standard: { bearerToken: "..." }
      // 2. Nested data: { data: { bearerToken: "..." } }
      // 3. New format: { token: "...", user: { ... } }
      const token = (response as any).token || response.bearerToken || (response as any).data?.bearerToken
      const refreshToken = (response as any).refreshToken || response.refreshToken || (response as any).data?.refreshToken
      
      if (token) {
        localStorage.setItem("token", token)
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken)
        }
        toast.success("Login realizado com sucesso!")
        router.push("/")
      } else {
        console.error("Resposta de login sem token:", response)
        toast.error("Erro no login: Token não encontrado na resposta.")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
      } else if (error.message === "Unauthorized") {
        toast.error("Email ou senha incorretos.")
      } else {
        toast.error("Falha no login. Tente novamente mais tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">BLASTER</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full font-bold" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="px-8 pb-8 text-center text-xs text-muted-foreground">
          <p>Ainda não tem uma conta? Entre em contato com o administrador.</p>
        </div>
      </Card>
    </div>
  )
}
