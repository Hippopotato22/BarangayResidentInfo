'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function useAuthGuard(expectedRole: 'admin' | 'user') {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/auth/login')
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))

        if (!userDoc.exists()) {
          router.replace('/auth/login')
          return
        }

        const userRole = userDoc.data()?.role

        if (userRole !== expectedRole) {
          // Redirect based on role
          if (userRole === 'admin') {
            router.replace('/admin/dashboard')
          } else if (userRole === 'user') {
            router.replace('/user/dashboard')
          } else {
            router.replace('/auth/login') 
          }
        } else {
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        router.replace('/auth/login')
      }
    })

    return () => unsubscribe()
  }, [expectedRole, router])

  return loading
}
