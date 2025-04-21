'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Resident } from '@/types/resident'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useAuthGuard from '@/utils/authGuard'


export default function ResidentPage() {
    
    
  const { id } = useParams()
  const [resident, setResident] = useState<Resident | null>(null)
  const [loading, setLoading] = useState(true)
  const useloading = useAuthGuard('user')


  useEffect(() => {
    const fetchResident = async () => {
      try {
        const docRef = doc(db, 'residents', String(id))
        const snapshot = await getDoc(docRef)
        if (snapshot.exists()) {
          setResident(snapshot.data() as Resident)
        }
      } catch (error) {
        console.error('Error fetching resident:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResident()
  }, [id])

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6 mt-10 text-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>
      </main>
    )
  }

  if (!resident) return <div className="text-center text-red-500 mt-10">Resident not found.</div>

  return (
    <main className="bg-gradient-to-r from-gray-800 to-black min-h-screen flex justify-center items-start py-25"> {/* Dark Gradient */}
      {/* Resident Details Container */}
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg text-gray-800">
        {/* Resident Profile and Details */}
        <div className="relative">
          {/* Profile Picture */}
          {resident.profilePicture ? (
            <div className="mb-6 flex justify-center">
              <Image
                src={`/uploads/${resident.profilePicture}`}
                alt="Profile Picture"
                width={200}
                height={200}
                className="rounded-full object-cover border-4 border-gray-300 shadow-lg"
              />
            </div>
          ) : (
            <div className="mb-6 text-sm text-gray-500 italic text-center">No profile picture uploaded.</div>
          )}

          {/* Resident Name */}
          <div className="mb-6 text-3xl font-semibold text-gray-800 tracking-tight text-center">
            <h1>
              {resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}
            </h1>
          </div>

          {/* Resident Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
            <div><strong>Birthdate:</strong> {resident.birthdate}</div>
            <div><strong>Age:</strong> {resident.age}</div>
            <div><strong>Gender:</strong> {resident.gender}</div>
            <div><strong>Civil Status:</strong> {resident.civilStatus}</div>
            <div><strong>Address:</strong> {resident.address}</div>
            <div><strong>Phone:</strong> {resident.phone}</div>
            <div><strong>Email:</strong> {resident.email}</div>
            <div><strong>Created At:</strong> {resident.createdAt.toDate().toLocaleString()}</div>
            <div><strong>Last Updated:</strong> {resident.updatedAt.toDate().toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Back Button - Positioned outside the resident detail box */}
      <div className="absolute bottom-5 right-5">
        <Link href="/user/dashboard">
          <button className="group flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-medium shadow hover:from-gray-400 hover:to-gray-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </Link>
      </div>
    </main>
  )
}
