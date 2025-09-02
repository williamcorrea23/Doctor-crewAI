import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
            ENEM Prep
          </h1>
          <p className="mt-2 text-gray-600">Sua plataforma de estudos para o ENEM</p>
        </div>

        <RegisterForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
