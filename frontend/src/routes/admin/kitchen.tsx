import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { KitchenLayout } from '@/components/kitchen/KitchenLayout'
import type { User } from '@/types'

export const Route = createFileRoute('/admin/kitchen')({
  component: AdminKitchenPage,
})

function AdminKitchenPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('pos_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
      }
    }
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return <KitchenLayout user={user} />
}