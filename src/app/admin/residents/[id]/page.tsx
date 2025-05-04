'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Resident } from '@/types/resident'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Timestamp } from 'firebase/firestore';

import useAuthGuard from '@/utils/authGuard' 

export default function ResidentPage() {
  const { id } = useParams()
  const [resident, setResident] = useState<Resident | null>(null)
  const [loading, setLoading] = useState(true) 
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Resident>>({})
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false); 
  const [showResidentCertPreview, setshowResidentCertPreview] = useState(false);
  const [showBarangayPreview, setShowBarangayPreview] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    // Check if the input is a file input
    const inputElement = e.target as HTMLInputElement;
    
    if (inputElement.type === 'file' && inputElement.files?.[0]) {
      const file = inputElement.files![0]; // Safely access the first file
  
      // Optionally validate file type (e.g., only image files allowed)
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Customize based on your needs
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a valid image or PDF.');
        return; // Return early if the file type is not allowed
      }
  
      // Optionally validate file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size exceeds the limit of 5MB.');
        return; // Return early if the file is too large
      }
  
      const reader = new FileReader();
  
      reader.onloadend = () => {
        // Update the form data with the base64 string from the uploaded file
        setFormData((prev) => ({
          ...prev,
          [name]: reader.result as string,
        }));
      };
  
      reader.readAsDataURL(file);
    } else {
      // For other fields (e.g., text fields or selects), directly update the value
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  


  const handleImageClick = () => {
    setShowPreview(true);
  };
  const handleClosePreview = () => {
    setShowPreview(false);
  };



  const handleResidentCertImageClick = () => {
    setshowResidentCertPreview(true);  
  };
  const handleCloseResidentCertImageClick= () => {
    setshowResidentCertPreview(false); 
  };



  const handleBarangayImageClick = () => {
    setShowBarangayPreview(true);  // Set the barangay clearance preview modal to open
  };
  const handleCloseBarangayClick = () => {
    setShowBarangayPreview(false);  // Close the barangay clearance preview modal
  };

  const handleUpdate = async () => {
    if (!id || !formData || !resident) return;  // Check if resident is null
  
    setLoadingUpdate(true);
    const timestamp = Timestamp.now();  // Use Firestore Timestamp
  
    // Construct the updated form data, ensuring certificates are either null or base64 data
    const updatedFormData = {
      ...resident,
      ...formData,
      updatedAt: timestamp,
      indigencyCertificate: formData.indigencyCertificate || resident.indigencyCertificate || null,
      residencyCertificate: formData.residencyCertificate || resident.residencyCertificate || null,
      barangayClearance: formData.barangayClearance || resident.barangayClearance || null,
    };
    
  
    try {
      // Get document reference and update it in Firestore
      const docRef = doc(db, 'residents', String(id));
      await updateDoc(docRef, updatedFormData);
  
      // Update the resident in state with the updated form data
      setResident({ ...resident, ...updatedFormData } as Resident);
  
      // Close modal and display success message
      setShowModal(false);
      setSuccessMessage('Resident updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);  // Hide success message after 3 seconds
    } catch (err) {
      console.error('Error updating resident:', err);
      setSuccessMessage('Error updating resident.');
      setTimeout(() => setSuccessMessage(null), 3000);  // Hide error message after 3 seconds
    } finally {
      setLoadingUpdate(false);  // Reset loading state
    }
  };
  


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  
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
      {successMessage && (
      <div className="absolute top-10 w-full text-center text-white bg-green-500 py-2 rounded">
        {successMessage}
      </div>
    )}
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg text-gray-800">
        <div className="relative">
          {resident.profilePicture?.startsWith('data:image') ?  (
            <div className="mb-6 flex justify-center">
              <Image
                src={resident.profilePicture}
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

      <div className="absolute top-25 right-35 left-40">
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


      {showModal && (
 <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
    <div className="bg-gradient-to-tl from-gray-800 via-gray-900 to-black bg-opacity-80 p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-white/10 ring-1 ring-white/10 hover:ring-blue-500/30 transition-all transform scale-95 opacity-0 animate-modal max-h-[90vh] overflow-y-auto">
      <h1 className="text-xl font-semibold mb-4 text-center text-white">Edit Resident Info</h1>
      {formData.profilePicture && (
            <div className="mt-2 flex items-center gap-2 ">
              <img
                src={formData.profilePicture || resident.profilePicture}
                alt="Preview"
                className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
              />
            </div>
          )}
      <div className="space-y-6">
        {/* Profile Picture nga way buot */}
        <div className="mb-4">
  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
    Profile Picture
  </label>
  <input
    type="file"
    name="profilePicture"
    accept="image/*"
    onChange={(e) => handleChange(e as any)}
    onClick={handleImageClick}
    id="profilePicture"
    className="w-full p-2 mt-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {resident.profilePicture && (
    <div className="mt-2 flex items-center space-x-2">
      <img
        src={resident.profilePicture}
        alt="Profile preview"
        className="w-12 h-12 object-cover rounded-full"
      />
      <p className="text-sm text-gray-600">Image uploaded</p>
    </div>
  )}
</div>


        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block font-medium text-white">First Name</label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-gray-900 via-blue-900 to-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Middle Name */}
        <div>
          <label htmlFor="middleName" className="block font-medium text-white">Middle Name</label>
          <input
            type="text"
            name="middleName"
            placeholder="Middle Name"
            value={formData.middleName || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-gray-900 via-blue-900 to-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block font-medium text-white">Last Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-gray-900 via-blue-900 to-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Suffix */}
        <div>
          <label htmlFor="suffix" className="block font-medium text-white">Suffix</label>
          <select
            name="suffix"
            value={formData.suffix || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-gray-900 via-blue-900 to-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Suffix</option>
            <option value="Jr.">Jr.</option>
            <option value="Sr.">Sr.</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>

        {/* Birthdate */}
        <div>
          <label htmlFor="birthdate" className="block font-medium text-white">Birthdate</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-gray-900 via-teal-800 to-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gender Dropdown */}
        <div>
          <label htmlFor="gender" className="block font-medium text-white">Gender</label>
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-gray-800 via-gray-900 to-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Civil Status Dropdown */}
        <div>
          <label htmlFor="civilStatus" className="block font-medium text-white">Civil Status</label>
          <select
            name="civilStatus"
            value={formData.civilStatus || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-gray-900 via-purple-900 to-black text-dark-purple focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Divorced">Divorced</option>
            <option value="Separated">Separated</option>
          </select>
        </div>
      </div>

       {/* Phone Number */}
       <div>
          <label htmlFor="phoneNumber" className="block font-medium text-white">Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="e.g. 09171234567"
            value={resident.phone}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={13}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

     {/* Indigency Certificate */}
     <div className="mb-4">
      <label htmlFor="indigencyCertificate" className="block text-sm font-medium text-gray-700">
        Indigency Certificate
      </label>
      <input
        type="file"
        name="indigencyCertificate"
        accept="image/*, .pdf"
        onChange={handleChange}
        id="indigencyCertificate"
        className="w-full p-2 mt-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {resident.indigencyCertificate && (
       <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm">
       <div
         className="flex flex-col items-center justify-center cursor-pointer group"
         onClick={handleImageClick}
         title="Click to preview"
       >
         <img
           src={resident.indigencyCertificate}
           alt="Indigency Certificate Preview"
           className="w-16 h-16 object-cover rounded-lg border border-gray-300 group-hover:opacity-80 transition"
         />
         <span className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
           View Image
         </span>
       </div>
     
       <div>
         <p className="text-sm font-medium text-gray-700">Indigency Certificate Uploaded</p>
         <p className="text-xs text-gray-500">Click the preview to see full image</p>
       </div>
     </div>
     
      )}
      <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF</p>
      </div>




   {/* Residency Certificate */}
   <div className="mb-4">
          <label htmlFor="residencyCertificate" className="block text-sm font-medium text-gray-700">
            Residency Certificate
          </label>
          <input
            type="file"
            name="residencyCertificate"
            accept="image/*, .pdf"
            onChange={handleChange}
            id="residencyCertificate"
            className="w-full p-2 mt-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {resident.residencyCertificate && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm">
          <div
            className="flex flex-col items-center justify-center cursor-pointer group"
            onClick={handleResidentCertImageClick}
            title="Click to preview"
          >
            <img
              src={resident.residencyCertificate}
              alt="Residency Certificate Preview"
              className="w-16 h-16 object-cover rounded-lg border border-gray-300 group-hover:opacity-80 transition"
            />
            <span className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
              View Image
            </span>
          </div>
        
          <div>
            <p className="text-sm font-medium text-gray-700">Residency Certificate Uploaded</p>
            <p className="text-xs text-gray-500">Click the preview to see full image</p>
          </div>
        </div>
        
        )}
          <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF</p>
        </div>




         {/* Barangay Clearance */}
         <div className="mb-4">
          <label htmlFor="barangayClearance" className="block text-sm font-medium text-gray-700">
            Barangay Clearance
          </label>
          <input
            type="file"
            name="barangayClearance"
            accept="image/*, .pdf"
            onChange={handleChange}
            
            id="barangayClearance"
            className="w-full p-2 mt-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {resident.barangayClearance && (
           <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm">
           <div
             className="flex flex-col items-center justify-center cursor-pointer group"
             onClick={handleBarangayImageClick}
             title="Click to preview"
           >
             <img
               src={resident.barangayClearance}
               alt="Barangay Clearance Preview"
               className="w-16 h-16 object-cover rounded-lg border border-gray-300 group-hover:opacity-80 transition"
             />
             <span className="mt-2 text-xs text-blue-600 font-medium group-hover:underline">
               View Image
             </span>
           </div>
         
           <div>
             <p className="text-sm font-medium text-gray-700">Barangay Clearance Uploaded</p>
             <p className="text-xs text-gray-500">Click the preview to see full image</p>
           </div>
         </div>
         
          )}
          <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF</p>
        </div>

  
      {/* Modal Actions */}
      <div className="flex justify-end mt-6 space-x-4">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={loadingUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loadingUpdate ? (
                  <div className="animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
                ) : (
          'Save Changes'
        )}
        </button>
      </div>
    </div>
  </div>

  
)}

{/* indigency Preview Modal */}
{showPreview && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="relative bg-white rounded-lg shadow-lg p-4 w-[400px] h-[400px] flex flex-col justify-center items-center">
      <button
        onClick={handleClosePreview}
        className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600"
        title="Close preview"
      >
        &times;
      </button>
      <img
        src={resident.indigencyCertificate}
        alt="Barangay Clearance Preview"
        className="object-contain w-full h-full rounded"
      />
    </div>
  </div>
)}



{/* residency Preview Modal */}
{showResidentCertPreview && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="relative bg-white rounded-lg shadow-lg p-4 w-[400px] h-[400px] flex flex-col justify-center items-center">
      <button
        onClick={handleCloseResidentCertImageClick}
        className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600"
        title="Close preview"
      >
        &times;
      </button>
      <img
        src={resident.residencyCertificate}
        alt="Barangay Clearance Preview"
        className="object-contain w-full h-full rounded"
      />
    </div>
  </div>

)}



{/* barangay Preview Modal */}
{showBarangayPreview && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="relative bg-white rounded-lg shadow-lg p-4 w-[400px] h-[400px] flex flex-col justify-center items-center">
      <button
        onClick={handleCloseBarangayClick}
        className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600"
        title="Close preview"
      >
        &times;
      </button>
      <img
        src={resident.barangayClearance}
        alt="Barangay Clearance Preview"
        className="object-contain w-full h-full rounded"
      />
    </div>
  </div>

)}

</main>
   
  )
};
       
  

       
     
