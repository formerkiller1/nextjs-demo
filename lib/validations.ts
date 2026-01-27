import { z } from "zod"

// 注册表单验证
export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少需要8位字符"),
  confirmPassword: z.string(),
  name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
}).refine((data) => {
  const hasUpperCase = /[A-Z]/.test(data.password)
  const hasLowerCase = /[a-z]/.test(data.password)
  const hasNumber = /[0-9]/.test(data.password)
  return hasUpperCase && hasLowerCase && hasNumber
}, {
  message: "密码必须包含至少一个大写字母、一个小写字母和一个数字",
  path: ["password"],
})

// 登录表单验证
export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
  rememberMe: z.boolean().optional(),
})

// 忘记密码表单验证
export const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
})

// 重置密码表单验证
export const resetPasswordSchema = z.object({
  password: z.string().min(8, "密码至少需要8位字符"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
}).refine((data) => {
  const hasUpperCase = /[A-Z]/.test(data.password)
  const hasLowerCase = /[a-z]/.test(data.password)
  const hasNumber = /[0-9]/.test(data.password)
  return hasUpperCase && hasLowerCase && hasNumber
}, {
  message: "密码必须包含至少一个大写字母、一个小写字母和一个数字",
  path: ["password"],
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

