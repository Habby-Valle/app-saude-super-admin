"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { logout } from "@/lib/auth"

export async function signOut() {
  await logout()

  const cookieStore = await cookies()
  cookieStore.getAll().forEach((cookie) => {
    cookieStore.delete(cookie.name)
  })

  redirect("/login")
}
