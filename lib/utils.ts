import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 密码强度验证
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "密码至少需要8位字符" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "密码必须包含至少一个大写字母" }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "密码必须包含至少一个小写字母" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "密码必须包含至少一个数字" }
  }
  return { valid: true }
}

