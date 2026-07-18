"use server"

import { cookies } from "next/headers"
import { verifyAdminToken } from "@/firebase/server"

const TOKEN_COOKIE = "admin_token"

export async function setAuthCookie(token: string): Promise<void> {
  cookies().set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/"
  })
}

export async function clearAuthCookie(): Promise<void> {
  cookies().delete(TOKEN_COOKIE)
}

export async function verifyAdminSession(): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = cookies().get(TOKEN_COOKIE)?.value
  if (!token) {
    return { ok: false, error: "Missing admin token" }
  }
  return verifyAdminTokenAction(token)
}

export async function verifyAdminTokenAction(
  token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await verifyAdminToken(token)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
