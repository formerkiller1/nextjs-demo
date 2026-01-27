import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            创建新账户
          </h2>
        </div>
        <div className="mt-8 rounded-lg bg-white px-8 py-8 shadow">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

