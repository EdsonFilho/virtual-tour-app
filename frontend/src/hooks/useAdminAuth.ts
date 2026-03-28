import { useEffect, useState } from 'react'
import { adminGetMe } from '@/admin/api'
import type { AdminUser } from '@/admin/types'

interface SwaUser {
  userId: string
  userDetails: string
  identityProvider: string
}

interface AuthState {
  user: SwaUser | null
  adminUser: AdminUser | null
  isAdmin: boolean
  isLoading: boolean
}

export function useAdminAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    adminUser: null,
    isAdmin: false,
    isLoading: true,
  })

  useEffect(() => {
    async function load() {
      try {
        // SWA built-in endpoint
        const meRes = await fetch('/.auth/me')
        const meJson = await meRes.json() as { clientPrincipal: SwaUser | null }
        const user = meJson.clientPrincipal

        if (!user) {
          setState({ user: null, adminUser: null, isAdmin: false, isLoading: false })
          return
        }

        // Verify admin status via backend
        try {
          const adminUser = await adminGetMe()
          setState({ user, adminUser, isAdmin: true, isLoading: false })
        } catch {
          setState({ user, adminUser: null, isAdmin: false, isLoading: false })
        }
      } catch {
        setState({ user: null, adminUser: null, isAdmin: false, isLoading: false })
      }
    }
    load()
  }, [])

  return state
}
