'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Resident } from '@/types/resident';
import toast from 'react-hot-toast';
import barangays from './barangays';



import { FiUser , FiPhone, FiMail, FiCalendar, FiUpload } from 'react-icons/fi';

interface Props {
  selectedResident?: Resident & { id: string };
  onSave?: () => void;
  clearSelection?: () => void;
  initialState?: Partial<Resident>; // Allow initial state to be passed in
  validate?: (resident: Resident) => { [key: string]: string }; // Custom validation function
}

export default function ResidentForm({ selectedResident, onSave, clearSelection, initialState }: Props) {
  const [resident, setResident] = useState<Resident>({
    id: selectedResident?.id || initialState?.id || "", // Default to empty string or generate ID
    firstName: selectedResident?.firstName || initialState?.firstName || "",
    middleName: selectedResident?.middleName || initialState?.middleName || "",
    lastName: selectedResident?.lastName || initialState?.lastName || "",
    suffix: selectedResident?.suffix || initialState?.suffix || "",
    age: selectedResident?.age || initialState?.age || 0,
    gender: selectedResident?.gender || initialState?.gender || "",
    address: selectedResident?.address || initialState?.address || "",

    purok: selectedResident?.purok || initialState?.purok || "",

    civilStatus: selectedResident?.civilStatus || initialState?.civilStatus || "",
    birthdate: selectedResident?.birthdate || initialState?.birthdate || "",
    phone: selectedResident?.phone || initialState?.phone || "",
    email: selectedResident?.email || initialState?.email || "",
    profilePicture: selectedResident?.profilePicture || initialState?.profilePicture || "",
    indigencyCertificate: selectedResident?.indigencyCertificate || initialState?.indigencyCertificate || "",
    residencyCertificate: selectedResident?.residencyCertificate || initialState?.residencyCertificate || "",
    barangayClearance: selectedResident?.barangayClearance || initialState?.barangayClearance || "",
    createdAt: selectedResident?.createdAt || initialState?.createdAt || Timestamp.now(),
    updatedAt: selectedResident?.updatedAt || initialState?.updatedAt || Timestamp.now(),
  });


  const [editedResident, setEditedResident] = useState<Resident>(resident);
  const [changesMade, setChangesMade] = useState(false);
  const [showChanges, setShowChanges] = useState(false); 

  const [showChangesModal, setShowChangesModal] = useState(false); // State to control the modal visibility

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [formData, setFormData] = useState({});
  
 



   useEffect(() => {
    if (selectedResident) {
      setResident({ ...selectedResident });
      setEditedResident({ ...selectedResident });
    }
  }, [selectedResident]);
  const calculateAge = (birthdate: string) => {
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth() - birthDateObj.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (resident.phone && !/^(\+63|0)9\d{9}$/.test(resident.phone)) {
      newErrors.phone = 'Enter a valid 11-digit PH mobile number (e.g., 09171234567 or +639171234567)';
    }
    if (resident.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(resident.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!resident.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!resident.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!resident.birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!resident.address) newErrors.address = 'Address is required';
    if (!resident.purok) newErrors.purok = 'Purok is required';
    if (!resident.gender) newErrors.gender = 'Gender is required';
    if (!resident.civilStatus) newErrors.civilStatus = 'Civil status is required';
    if (!resident.phone) newErrors.phone = 'Phone number is required';
    if (!resident.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  
  const handleFileChange = (name: string, file: File) => {
  const maxSizeInBytes = 1 * 1024 * 1024; // 1MB

  if (file.size > maxSizeInBytes) {
    alert("File is too large. Please upload a file smaller than 1MB.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setResident((prev) => ({
      ...prev,
      [name]: reader.result as string,
    }));
    setChangesMade(true);
  };
  reader.readAsDataURL(file);
};

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, files } = e.target as HTMLInputElement & HTMLSelectElement;

  // Handle file uploads
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/') || file.type.startsWith('application/pdf')) {
      handleFileChange(name, file);
    } else {
      setResident((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    return; // Exit early for file handling
  }

  let newValue = value;

  // Calculate age from birthdate
  if (name === 'birthdate') {
    const age = calculateAge(value);
    setResident((prev) => ({
      ...prev,
      [name]: value,
      age,
    }));
  } 
  // Capitalize names
  else if (['firstName', 'middleName', 'lastName'].includes(name)) {
    newValue = capitalize(value.slice(0, 15));
    setResident((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  } 
  // Format phone number
  else if (name === 'phone') {
    newValue = formatPhoneNumber(value);
    setResident((prev) => ({
      ...prev,
      phone: newValue,
    }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  } 
  // Handle Purok input
  else if (name === 'purok') {
    newValue = value; // Directly set the purok value
    setResident((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  } 
  // Handle other inputs
  else {
    setResident((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  // Clear any existing error for the current field
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  setChangesMade(true); // Mark changes as made
};


   // Format PH phone number helper
  const formatPhoneNumber = (value: string) => {
    let raw = value.replace(/\D/g, '');
    if (raw.startsWith('63')) {
      raw = '+' + raw;
    } else if (raw.startsWith('9')) {
      raw = '0' + raw;
    } else if (!raw.startsWith('0')) {
      raw = '09' + raw;
    }
    if (raw.startsWith('+63')) {
      return raw.slice(0, 13);
    } else {
      return raw.slice(0, 11);
    }
  };

  // Capitalize helper
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();



  const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes

// Helper to roughly estimate size from Base64 string
const base64FileSize = (base64String: string) => {
  // Remove Base64 prefix if any (e.g., data:image/png;base64,)
  const base64 = base64String.split(',')[1] || base64String;
  // Approximate size in bytes
  return (base64.length * 3) / 4;
};

  
 const handleSubmit = async () => {
   const isValid = validate(); // your validate() sets `errors` state
  if (!isValid) {
    const firstErrorField = Object.keys(errors)[0];
    const errorElement = fieldRefs.current[firstErrorField];
    errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    errorElement?.focus();
    return;
  }
  if (!validate()) return;
  
     // Check file sizes of resident's base64 strings
  const filesToCheck = [
    resident.profilePicture,
    resident.indigencyCertificate,
    resident.residencyCertificate,
    resident.barangayClearance,
  ];

  for (const fileStr of filesToCheck) {
    if (fileStr) {
      const size = base64FileSize(fileStr);
      if (size > maxFileSize) {
        alert('One or more files exceed the maximum size of 1MB. Please upload smaller files.');
        return; // Stop submission
      }
    }
  }

  setLoading(true);
  const timestamp = Timestamp.now();
  try {
    const finalResidentData = {
      ...resident,
      updatedAt: timestamp,
      indigencyCertificate: resident.indigencyCertificate || null,
      residencyCertificate: resident.residencyCertificate || null,
      barangayClearance: resident.barangayClearance || null,
    };

    if (selectedResident) {
      // Update existing resident
      await updateDoc(doc(db, 'residents', selectedResident.id), finalResidentData);
      toast.success('Resident updated!');
      //alert('Resident updated successfully!');
    } else {
      // Add new resident
      await addDoc(collection(db, 'residents'), {
        ...finalResidentData,
        createdAt: timestamp,
      });
      toast.success('Resident added!');
     // alert('Resident added successfully!');
    }

    // Reset form after submission
    setResident({
      id: selectedResident?.id || initialState?.id || "",
      firstName: selectedResident?.firstName || initialState?.firstName || "",
      middleName: selectedResident?.middleName || initialState?.middleName || "",
      lastName: selectedResident?.lastName || initialState?.lastName || "",
      suffix: selectedResident?.suffix || initialState?.suffix || "",
      age: selectedResident?.age || initialState?.age || 0,
      gender: selectedResident?.gender || initialState?.gender || "",
      address: selectedResident?.address || initialState?.address || "",
      purok: selectedResident?.purok || initialState?.purok || "",
      civilStatus: selectedResident?.civilStatus || initialState?.civilStatus || "",
      birthdate: selectedResident?.birthdate || initialState?.birthdate || "",
      phone: selectedResident?.phone || initialState?.phone || "",
      email: selectedResident?.email || initialState?.email || "",
      profilePicture: selectedResident?.profilePicture || initialState?.profilePicture || "",
      indigencyCertificate: selectedResident?.indigencyCertificate || initialState?.indigencyCertificate || "",
      residencyCertificate: selectedResident?.residencyCertificate || initialState?.residencyCertificate || "",
      barangayClearance: selectedResident?.barangayClearance || initialState?.barangayClearance || "",
      createdAt: selectedResident?.createdAt || initialState?.createdAt || Timestamp.now(),
      updatedAt: selectedResident?.updatedAt || initialState?.updatedAt || Timestamp.now(),
    });
    setEditedResident(resident);
    setChangesMade(false);
    setErrors({});
    onSave?.();
    clearSelection?.();
  } catch (error) {
    toast.error('Error saving resident!');
    alert('Failed to save resident. Please try again.');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const handleCancel = () => {
    setEditedResident({ ...resident });
    setChangesMade(false);
    setShowChangesModal(false); // Hide changes when canceling
  };

const handleUpdateClick = () => {
  if (selectedResident) {
    setShowChangesModal(true); // Show changes modal only if editing an existing resident
  } else {
    handleSubmit(); // Directly submit if adding a new resident
  }
};

 const handleConfirmChanges = () => {
    handleSubmit(); // Call handleSubmit to confirm changes
    setShowChangesModal(false); // Hide the modal after confirming
  };

  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});





  return (
    <div className="max-h-screen overflow-y-auto p-4 space-y-4">
  {resident.profilePicture && (
  <div className="mt-2 flex items-center gap-4">
    <button
      type="button"
      onClick={() => setPreviewImage(resident.profilePicture!)}
      className="focus:outline-none"
      aria-label="View profile picture preview"
    >
      <img
        src={resident.profilePicture}
        alt="Profile Preview"
        className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-lg cursor-pointer"
      />
    </button>
    <button
      type="button"
      onClick={() => setShowRemoveWarning(true)} // Show warning dialog
       className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:underline font-medium transition-colors duration-200"
       aria-label="Remove profile picture"
    >
      Remove
    </button>
  </div>
)}


{showRemoveWarning && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={() => setShowRemoveWarning(false)} // Close modal on background click
  >
    <div
      className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
    >
      <h2 className="text-lg font-bold mb-4">Confirm Removal</h2>
      <p className="mb-4">Are you sure you want to remove the profile picture? This action cannot be undone.</p>
      <div className="flex justify-end">
        <button
          onClick={() => setShowRemoveWarning(false)} // Close without removing
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 mr-2"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setResident((prev) => ({ ...prev, profilePicture: '' })); // Remove profile picture
            setShowRemoveWarning(false); // Close the warning modal
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
)}

  {previewImage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
    <div className="relative group p-4 bg-white/10 rounded-xl shadow-lg border border-white/20 backdrop-blur-lg transition-all duration-300">
      
      {/* Close Button */}
      <button
        onClick={() => setPreviewImage(null)}
        className="absolute top-2 right-2 bg-white/70 text-gray-800 hover:bg-red-500 hover:text-white border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Close preview"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Tooltip */}
      <span className="absolute -top-8 right-0 text-xs text-white bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        Close Preview
      </span>

      {/* Image or PDF Preview */}
      {previewImage.endsWith('.pdf') ? (
        <iframe
          src={previewImage}
          className="w-[80vw] h-[80vh] rounded-xl border border-white/20 shadow-inner"
        />
      ) : (
        <img
          src={previewImage}
          alt="Preview"
          className="max-w-full max-h-[80vh] rounded-xl shadow-md"
        />
      )}
    </div>
  </div>
)}




      <form
        onSubmit={(e) => { e.preventDefault(); handleUpdateClick(); }}

        className="space-y-6 bg-white shadow-xl rounded-lg p-6 text-gray-800 max-w-lg mx-auto sm:mt-10"
      >
        <h2 className="text-2xl font-bold text-gray-700">
          {selectedResident ? 'Edit Resident' : 'Add Resident'}
        </h2>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
         <input
          ref={(el) => {
  fieldRefs.current.firstName = el;
}}
          type="text"
          name="firstName"
          placeholder="First Name"
          value={resident.firstName}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

          {errors.firstName && <p className="text-red-500 text-sm mt-1 col-span-4">{errors.firstName}</p>}

          <input
            type="text"
            name="middleName"
            placeholder="Middle Name"
            value={resident.middleName}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
                 ref={(el) => {
  fieldRefs.current.lastName = el;
}}
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={resident.lastName}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1 col-span-4">{errors.lastName}</p>}

          <select
            name="suffix"
            value={resident.suffix}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Suffix</option>
            <option value="Jr.">Jr.</option>
            <option value="Sr.">Sr.</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>

        {/* Birthdate and Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="birthdate" className="block mb-1 font-medium text-gray-700">
              Birthdate
            </label>
            <input
              id="birthdate"
              type="date"
              name="birthdate"
              value={resident.birthdate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
          </div>
          <div>
            <label htmlFor="age" className="block mb-1 font-medium text-gray-700">
              Age
            </label>
            <input
              id="age"
              type="number"
              name="age"
              value={resident.age}
              readOnly
              disabled
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Gender and Civil Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="block mb-1 font-medium text-gray-700">
              Gender
            </label>
            <select
              ref={(el) => {
  fieldRefs.current.gender = el;
}}
              id="gender"
              name="gender"
              value={resident.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label htmlFor="civilStatus" className="block mb-1 font-medium text-gray-700">
              Civil Status
            </label>
            <select
                 ref={(el) => {
  fieldRefs.current.civilStatus = el;
}}
              id="civilStatus"
              name="civilStatus"
              value={resident.civilStatus}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
            {errors.civilStatus && <p className="text-red-500 text-sm mt-1">{errors.civilStatus}</p>}
          </div>
        </div>

        {/* Address (Barangay) */}
      <div>
      <label htmlFor="address" className="block mb-1 font-medium text-gray-700">
        Address (Barangay)
      </label>
      <select
           ref={(el) => {
  fieldRefs.current.address = el;
}}
        id="address"
        name="address"
        value={resident.address}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Address</option>
        {barangays.map((barangay, index) => (
          <option key={index} value={barangay}>
            {barangay}
          </option>
        ))}
      </select>
      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
       

    </div>
<div>
  <label htmlFor="purok" className="block mb-1 font-medium text-gray-700">
        Purok
      </label>
  <input
      type="text"
      id="purok"
      name="purok"
      value={resident.purok}
      onChange={handleChange}
      placeholder="Enter Purok"
      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
     {errors.purok && <p className="text-red-500 text-sm mt-1">{errors.purok}</p>}
</div>
    

   

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">
            Phone Number
          </label>
          <input
               ref={(el) => {
  fieldRefs.current.phone = el;
}}
            id="phone"
            type="tel"
            name="phone"
            placeholder="e.g. 09171234567"
            value={resident.phone}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={13}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
            Email Address
          </label>
          <input
               ref={(el) => {
  fieldRefs.current.email = el;
}}
            id="email"
            type="email"
            name="email"
            placeholder="Email Address"
            value={resident.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* File Uploads */}
       {[
  { name: 'profilePicture', label: 'Profile Picture', accept: 'image/*' },
  { name: 'barangayClearance', label: 'Barangay Clearance', accept: 'image/*, .pdf' },
  { name: 'residencyCertificate', label: 'Residency Certificate', accept: 'image/*, .pdf' },
  { name: 'indigencyCertificate', label: 'Indigency Certificate', accept: 'image/*, .pdf' },
].map(({ name, label, accept }) => (
  <div key={name} className="mb-6 p-4 border rounded-lg bg-white shadow-md">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-800 mb-1">
    {label}
  </label>
  <input
  type="file"
  name={name}
  id={name}
  accept={accept}
  onChange={(e) => handleChange(e as any)}
  className="block w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 text-sm text-gray-700 focus:border-teal-500 focus:ring focus:ring-teal-200/50"
/>

   {resident[name as keyof Resident] && (
  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
    <div className="relative group">
      <img
        src={resident[name as keyof Resident] as string}
        alt={`${label} preview`}
        className="w-full h-32 object-cover rounded-lg border shadow hover:scale-105 transition-transform duration-300"
        onClick={() => setPreviewImage(resident[name as keyof Resident] as string)}
      />
      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
        {label}
      </div>
    </div>
  </div>
)}


    <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF</p>
  </div>
))}





        {/* Buttons */}
        <div className="flex justify-end gap-3 flex-wrap pt-2">
      <button
        type="button"
        onClick={() => {
          clearSelection?.();
          setResident({
            id: selectedResident?.id || initialState?.id || "", // Default to empty string or generate ID
    firstName: selectedResident?.firstName || initialState?.firstName || "",
    middleName: selectedResident?.middleName || initialState?.middleName || "",
    lastName: selectedResident?.lastName || initialState?.lastName || "",
    suffix: selectedResident?.suffix || initialState?.suffix || "",
    age: selectedResident?.age || initialState?.age || 0,
    gender: selectedResident?.gender || initialState?.gender || "",
    address: selectedResident?.address || initialState?.address || "",
    civilStatus: selectedResident?.civilStatus || initialState?.civilStatus || "",
    birthdate: selectedResident?.birthdate || initialState?.birthdate || "",
    phone: selectedResident?.phone || initialState?.phone || "",
    email: selectedResident?.email || initialState?.email || "",
    profilePicture: selectedResident?.profilePicture || initialState?.profilePicture || "",
    indigencyCertificate: selectedResident?.indigencyCertificate || initialState?.indigencyCertificate || "",
    residencyCertificate: selectedResident?.residencyCertificate || initialState?.residencyCertificate || "",
    barangayClearance: selectedResident?.barangayClearance || initialState?.barangayClearance || "",
    createdAt: selectedResident?.createdAt || initialState?.createdAt || Timestamp.now(),
    updatedAt: selectedResident?.updatedAt || initialState?.updatedAt || Timestamp.now(), 
          });
          setErrors({});
        }}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
      >
        Cancel
      </button>
      <button
  type="submit"
  className={`px-4 py-2 ${
    loading || (selectedResident && !changesMade)
      ? 'bg-gray-400 pointer-events-none'
      : 'bg-blue-600 hover:bg-blue-700'
  } text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed`}
  disabled={loading || (selectedResident && !changesMade)}
>
  {loading ? (
    <span className="flex justify-center items-center">
      <svg
        className="animate-spin h-5 w-5 mr-3 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0116 0 8 8 0 01-16 0z"
        />
      </svg>
      Loading...
    </span>
  ) : selectedResident ? (
    'Update'
  ) : (
    'Add'
  )}
</button>

    </div>

{/* Show Changes Modal */}
{showChangesModal && changesMade && selectedResident && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-semibold text-gray-800">Review Changes</h3>
        <button
          onClick={() => setShowChangesModal(false)}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Change List */}
      <ul className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {Object.entries(editedResident).map(([key, newValue]) => {
          const oldValue = resident[key as keyof Resident];
          if (newValue !== oldValue) {
            return (
              <li key={key} className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm text-gray-600 font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500 line-through">{String(newValue)}</span>
                  <span className="text-blue-600 font-semibold ml-2">→ {String(oldValue)}</span>
                </p>
              </li>
            );
          }
          return null;
        })}
      </ul>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmChanges}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}




  </form>

 
</div>
  );
}
