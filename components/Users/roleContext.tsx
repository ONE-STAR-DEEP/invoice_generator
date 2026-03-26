"use client"

import { createContext, useContext } from "react"

type SessionUser = {
  id: number
  role: "admin" | "user" | "accounts"
}

const AuthContext = createContext<SessionUser | null>(null)

export const AuthProvider = ({
  user,
  children,
}: {
  user: SessionUser | null
  children: React.ReactNode
}) => {
  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}