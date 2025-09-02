"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"

export function RegisterForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const router = useRouter()

  const showMessage = (msg: string, type: "success" | "error" | "info") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await signUpWithEmail(email, password, firstName, lastName)

    if (result.success) {
      showMessage("Conta criada com sucesso!", "success")
      setTimeout(() => router.push("/"), 1500)
    } else {
      showMessage(result.error || "Erro ao criar conta", "error")
    }

    setLoading(false)
  }

  const handleGoogleRegister = async () => {
    setLoading(true)

    const result = await signInWithGoogle()

    if (result.success) {
      showMessage("Conta criada com Google!", "success")
      setTimeout(() => router.push("/"), 1500)
    } else {
      showMessage(result.error || "Erro ao criar conta com Google", "error")
    }

    setLoading(false)
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
          Criar Conta
        </CardTitle>
        <CardDescription>Crie sua conta para começar a estudar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              messageType === "success"
                ? "border border-green-200 bg-green-100 text-green-700"
                : messageType === "error"
                  ? "border border-red-200 bg-red-100 text-red-700"
                  : "border border-blue-200 bg-blue-100 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Sobrenome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 pl-10"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">Ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar com Google
        </Button>
      </CardContent>
    </Card>
  )
}
