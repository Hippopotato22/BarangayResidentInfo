'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
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
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Resident>>({})
  const loadingAuth = useAuthGuard('admin')
 

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const docRef = doc(db, 'residents', String(id))
        const snapshot = await getDoc(docRef)
        if (snapshot.exists()) {
          const data = snapshot.data() as Resident
          setResident(data)
          setFormData(data)
        }
      } catch (error) {
        console.error('Error fetching resident:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResident()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async () => {
    if (!id || !formData) return
    try {
      const docRef = doc(db, 'residents', String(id))
      await updateDoc(docRef, {
        ...formData,
        updatedAt: new Date()
      })
      setResident({ ...resident!, ...formData } as Resident)
      setShowModal(false)
      alert('Resident updated successfully!')
    } catch (err) {
      console.error('Error updating resident:', err)
      alert('Error updating resident.')
    }
  }

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
    <main className="bg-gradient-to-r from-gray-800 to-black min-h-screen flex justify-center items-start py-25 relative">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg text-gray-800">
        <div className="relative">
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

          <div className="mb-6 text-3xl font-semibold text-gray-800 tracking-tight text-center">
            <h1>
              {resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}
            </h1>
          </div>

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

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
            >
              Edit Info
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-25 right-35 left-50">
        <Link href="/admin/dashboard">
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

      {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300">
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-xl p-6 w-full max-w-lg border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Edit Resident Info</h2>

      <div className="space-y-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  )
}
