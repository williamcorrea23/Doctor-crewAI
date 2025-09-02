import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ENEM Prep
          </h1>
          <p className="text-gray-600 mt-2">Sua plataforma de estudos para o ENEM</p>
        </div>

        <RegisterForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
