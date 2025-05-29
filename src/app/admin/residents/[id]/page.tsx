'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resident } from '@/types/resident';
import Image from 'next/image';
import Link from 'next/link';
import ResidentForm from '@/components/ResidentForm';
import useAuthGuard from '@/utils/authGuard';
import ColorPicker from '@/app/ColorPicker';

import { PencilIcon, DocumentTextIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function ResidentPage() {
  const { id } = useParams<{ id: string }>();
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const loadingAuth = useAuthGuard('admin');
   const [backgroundColor, setBackgroundColor] = useState<string>('linear-gradient(to right, #ff7e5f, #feb47b)'); // Default gradient

  const [showBarangayModal, setShowBarangayModal] = useState(false);
  const [showResidencyModal, setShowResidencyModal] = useState(false);
  const [showIndigencyModal, setShowIndigencyModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch resident data
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErrorMessage('No resident ID provided.');
      return;
    }

    setLoading(true);
    const residentRef = doc(db, 'residents', String(id));
    const unsubscribe = onSnapshot(
      residentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Resident;
          // Omit 'id' from data to prevent overwrite
          const { id: _, ...restData } = data;
          setResident({ id: snapshot.id, ...restData });
        } else {
          setResident(null);
          setErrorMessage('Resident not found.');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching resident:', error);
        setErrorMessage('Failed to load resident data. Please check your network or try again.');
        setResident(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  // Handle save action (called by ResidentForm)
  const handleSave = () => {
    setSuccessMessage('Resident details saved successfully!');
    setIsEditing(false); // Close the modal
    setTimeout(() => {
      setSuccessMessage(''); // Clear the success message
    }, 3000); // Navigate after 3 seconds
  };

  // Clear form selection and close the modal
  const clearFormSelection = () => {
    setIsEditing(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (loading || loadingAuth) {
    return (
      <main className="max-w-3xl mx-auto p-6 mt-10 text-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>
      </main>
    );
  }

  if (!resident) {
    return (
      <main className="bg-gradient-to-r from-gray-800 to-black min-h-screen flex justify-center items-start py-25">
        <div className="text-center text-red-500 mt-10">{errorMessage || 'Resident not found.'}</div>
        <div className="absolute top-25 right-35">
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
      </main>
    );
  }

  return (
    //bg-gradient-to-r from-gray-800 to-black 
    <main className="min-h-screen flex justify-center items-start py-25 relative" style={{ background: backgroundColor }}>
       <div className="absolute top-14 right-13 z-50">
      <ColorPicker onChange={setBackgroundColor} selectedColor={backgroundColor} />
    </div>
      {successMessage && (
        <div className="absolute top-10 w-full text-center text-white bg-green-500 py-2 rounded">
          {successMessage}
        </div>
      )}
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg text-gray-800">
        <div className="relative">
          {resident.profilePicture?.startsWith('data:image') ? (
            <div className="mb-6 flex justify-center">
              <Image
                src={resident.profilePicture}
                onClick={() => setPreviewImage(resident.profilePicture!)}
                alt="Profile Picture"
                width={200}
                height={200}
                className="rounded-full object-cover border-4 border-gray-300 shadow-lg"
              />
            </div>
          ) : (
            <div className="mb-6 text-sm text-gray-500 italic text-center">No profile picture uploaded.</div>
          )}

          <div className="mb-6 text-4xl font-semibold text-gray-800 tracking-tight text-center" style={{ fontFamily: 'Deligh-Extrabold' }}>
            <h1>
              {resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
            <div><strong>Birthdate:</strong> {resident.birthdate || 'N/A'}</div>
            <div><strong>Age:</strong> {resident.age || 'N/A'}</div>
            <div><strong>Gender:</strong> {resident.gender || 'N/A'}</div>
            <div><strong>Civil Status:</strong> {resident.civilStatus || 'N/A'}</div>
            <div><strong>Address:</strong> {resident.address}{resident.purok ? `, Purok ${resident.purok}` : '' }</div>
            <div><strong>Phone:</strong> {resident.phone || 'N/A'}</div>
            <div><strong>Email:</strong> {resident.email || 'N/A'}</div>
            <div><strong>Created At:</strong> {resident.createdAt?.toDate().toLocaleString() || 'N/A'}</div>
            <div><strong>Last Updated:</strong> {resident.updatedAt?.toDate().toLocaleString() || 'N/A'}</div>
          </div>

           {/* Edit Button */}
{!isEditing && (
  <div className="mt-6 flex justify-center mb-4">
    <div className="relative group">
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-3 bg-gradient-to-r from-gray-700 via-purple-700 to-blue-700 bg-[length:400%_100%] text-white px-6 py-3 rounded-xl hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-base font-semibold w-full sm:w-auto animate-gradient"
        aria-label="Edit resident details"
        style={{ fontFamily: 'qurovaBOLD', letterSpacing: '0.1em' }}
      >
        <PencilIcon className="w-6 h-6" />
        Edit Resident
      </button>
      <span className="absolute bottom-full mb-2 hidden group-hover:block text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Edit resident details
      </span>
    </div>
  </div>
)}




        {/* Document Buttons */}
<div className="mt-6 flex flex-wrap justify-center gap-4">
  <div className="relative group">
    <button
      onClick={() => setShowBarangayModal(true)}
      className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 hover:-translate-y-0.5 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
      aria-label="View Barangay Clearance"
    >
      <DocumentTextIcon className="w-4 h-4" />
      Barangay Clearance
    </button>
    <span className="absolute bottom-full mb-2 hidden group-hover:block text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      View Barangay Clearance
    </span>
    {/* Pending Message */}
    {!resident.barangayClearance && (
      <p className="text-xs text-red-500 mt-1">Pending</p>
    )}
  </div>
  <div className="relative group">
    <button
      onClick={() => setShowResidencyModal(true)}
      className="flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
      aria-label="View Residency Certificate"
    >
      <HomeIcon className="w-4 h-4" />
      Residency Certificate
    </button>
    <span className="absolute bottom-full mb-2 hidden group-hover:block text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      View Residency Certificate
    </span>
    {/* Pending Message */}
    {!resident.residencyCertificate && (
      <p className="text-xs text-red-500 mt-1">Pending</p>
    )}
  </div>
  <div className="relative group">
    <button
      onClick={() => setShowIndigencyModal(true)}
      className="flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 hover:-translate-y-0.5 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
      aria-label="View Indigency Certificate"
    >
      <CurrencyDollarIcon className="w-4 h-4" />
      Indigency Certificate
    </button>
    <span className="absolute bottom-full mb-2 hidden group-hover:block text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      View Indigency Certificate
    </span>
    {/* Pending Message */}
    {!resident.indigencyCertificate && (
      <p className="text-xs text-red-500 mt-1">Pending</p>
    )}
  </div>
</div>


          {/* Modal for Barangay Clearance */}
          {showBarangayModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowBarangayModal(false)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Barangay Clearance</h2>
                {resident.barangayClearance ? (
                  resident.barangayClearance.startsWith('data:image') ? (
                    <img
                      src={resident.barangayClearance}
                      alt="Barangay Clearance"
                      className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                    />
                  ) : resident.barangayClearance.startsWith('data:application/pdf') ? (
                    <embed
                      src={resident.barangayClearance}
                      type="application/pdf"
                      className="w-full max-w-sm h-96 mx-auto rounded-lg"
                    />
                  ) : (
                    <p className="text-center text-gray-500">Unsupported document format.</p>
                  )
                ) : (
                  <p className="text-center text-gray-500 italic">Pending</p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowBarangayModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Residency Certificate */}
          {showResidencyModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowResidencyModal(false)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Residency Certificate</h2>
                {resident.residencyCertificate ? (
                  resident.residencyCertificate.startsWith('data:image') ? (
                    <img
                      src={resident.residencyCertificate}
                      alt="Residency Certificate"
                      className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                    />
                  ) : resident.residencyCertificate.startsWith('data:application/pdf') ? (
                    <embed
                      src={resident.residencyCertificate}
                      type="application/pdf"
                      className="w-full max-w-sm h-96 mx-auto rounded-lg"
                    />
                  ) : (
                    <p className="text-center text-gray-500">Unsupported document format.</p>
                  )
                ) : (
                  <p className="text-center text-gray-500 italic">Pending</p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowResidencyModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Indigency Certificate */}
          {showIndigencyModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowIndigencyModal(false)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Indigency Certificate</h2>
                {resident.indigencyCertificate ? (
                  resident.indigencyCertificate.startsWith('data:image') ? (
                    <img
                      src={resident.indigencyCertificate}
                      alt="Indigency Certificate"
                      className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                    />
                  ) : resident.indigencyCertificate.startsWith('data:application/pdf') ? (
                    <embed
                      src={resident.indigencyCertificate}
                      type="application/pdf"
                      className="w-full max-w-sm h-96 mx-auto rounded-lg"
                    />
                  ) : (
                    <p className="text-center text-gray-500">Unsupported document format.</p>
                  )
                ) : (
                  <p className="text-center text-gray-500 italic">Pending</p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowIndigencyModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Modal for ResidentForm */}
          {isEditing && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={clearFormSelection}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Edit Resident</h2>
                <ResidentForm
                  selectedResident={resident}
                  onSave={handleSave}
                  clearSelection={clearFormSelection}
                />
              </div>
            </div>
          )}
        </div>
      </div>

              
      <div className="absolute top-25 right-35">
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

      
    </main>
  );
}