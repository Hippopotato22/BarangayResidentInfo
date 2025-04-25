'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Resident } from '@/types/resident';
import toast from 'react-hot-toast';

interface Props {
  selectedResident?: Resident & { id: string };
  onSave?: () => void;
  clearSelection?: () => void;
}

export default function ResidentForm({ selectedResident, onSave, clearSelection }: Props) {
  const [resident, setResident] = useState<Resident>({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    age: 0,
    gender: '',
    address: '',
    civilStatus: '',
    birthdate: '',
    phone: '',
    email: '',
    profilePicture: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const barangayOptions = ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4']; // Add the list of barangays here

  useEffect(() => {
    if (selectedResident) {
      setResident({
        firstName: selectedResident.firstName,
        middleName: selectedResident.middleName,
        lastName: selectedResident.lastName,
        suffix: selectedResident.suffix,
        age: selectedResident.age,
        gender: selectedResident.gender,
        address: selectedResident.address,
        civilStatus: selectedResident.civilStatus,
        birthdate: selectedResident.birthdate,
        phone: selectedResident.phone,
        email: selectedResident.email,
        profilePicture: selectedResident.profilePicture,
        createdAt: selectedResident.createdAt,
        updatedAt: selectedResident.updatedAt,
      });
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
    else if (resident.firstName.length > 10) newErrors.firstName = 'First name must be ≤ 15 characters';
    
    if (resident.middleName.length > 10) newErrors.middleName = 'Middle name must be ≤ 15 characters';
  
    if (!resident.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (resident.lastName.length > 10) newErrors.lastName = 'Last name must be ≤ 15 characters';
  
    if (!resident.birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!resident.address) newErrors.address = 'Address is required';
    if (!resident.gender) newErrors.gender = 'Gender is required';
    if (!resident.civilStatus) newErrors.civilStatus = 'Civil status is required';
  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
    if (name === 'birthdate') {
      const age = calculateAge(value);
      setResident((prev) => ({
        ...prev,
        [name]: value,
        age,
      }));
    } else if (name === 'profilePicture' && (e.target as HTMLInputElement).files?.[0]) {
      const file = (e.target as HTMLInputElement).files![0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setResident((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      let newValue = value;
  
      if (['firstName', 'middleName', 'lastName'].includes(name)) {
        newValue = capitalize(value.slice(0, 15)); // ✨ limit to 15 chars
      }
  
      if (name === 'phone') {
        let raw = value.replace(/\D/g, ''); // Remove non-digits
      
        if (raw.startsWith('63')) {
          raw = '+' + raw;
        } else if (raw.startsWith('9')) {
          raw = '0' + raw;
        } else if (raw.startsWith('0')) {
          // allow it
        } else {
          raw = '09' + raw; // Default to 0 if user starts wrong
        }
      
        // Limit to 11 digits if starting with 0 or +639 if starting with country code
        if (raw.startsWith('+63')) {
          raw = raw.slice(0, 13); // +63 + 10 digits
        } else {
          raw = raw.slice(0, 11); // 0 + 10 digits
        }
      
        setResident((prev) => ({
          ...prev,
          phone: raw,
        }));
      
        if (errors.phone) {
          setErrors((prev) => ({ ...prev, phone: '' }));
        }
      
        return;
      }
      
  
      setResident((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const timestamp = Timestamp.now();

    try {
      if (selectedResident) {
        await updateDoc(doc(db, 'residents', selectedResident.id), {
          ...resident,
          updatedAt: timestamp,
        });
        toast.success('Resident updated!');
      } else {
        await addDoc(collection(db, 'residents'), {
          ...resident,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        toast.success('Resident added!');
      }

      setResident({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        age: 0,
        gender: '',
        address: '',
        civilStatus: '',
        birthdate: '',
        phone: '',
        email: '',
        profilePicture: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      onSave?.();
      clearSelection?.();
    } catch (error) {
      toast.error('Error saving resident!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  

  return (

    <>
      {resident.profilePicture && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={resident.profilePicture}
              alt="Preview"
              className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
            />
            <button
              type="button"
              onClick={() => setResident((prev) => ({ ...prev, profilePicture: '' }))}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )} 
       
      

    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white shadow-xl rounded-lg p-6 text-gray-800 w-full max-w-lg mx-auto sm:mt-10"
    >
      <h2 className="text-xl font-bold text-gray-700">
        {selectedResident ? 'Edit Resident' : 'Add Resident'}
       

      </h2>

      {/* Full Name Fields */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={resident.firstName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        <div className="flex-1">
          <input
            type="text"
            name="middleName"
            placeholder="Middle Name"
            value={resident.middleName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={resident.lastName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
        <div className="flex-1">
        <select
          name="suffix"
          value={resident.suffix}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Suffix</option>
          <option value="Jr.">Jr.</option>
          <option value="Sr.">Sr.</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>

        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <input
          type="date"
          name="birthdate"
          value={resident.birthdate}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
      </div>

      {/* Age (auto-calculated from Birthdate) */}
      <div>
        <input
          type="text"
          name="age"
          value={resident.age}
          readOnly
          className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Gender */}
      <div>
        <select
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

      {/* Civil Status */}
      <div>
        <select
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

      {/* Address */}
      <div>
        <select
          name="address"
          value={resident.address}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Address (Barangay)</option>
          {barangayOptions.map((barangay, index) => (
            <option key={index} value={barangay}>
              {barangay}
            </option>
          ))}
        </select>
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

    {/* Phone */}
    <div>
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
      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}

    </div>


      {/* Email */}
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={resident.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Profile Picture */}
      <div>
        <input
          type="file"
          name="profilePicture"
          accept="image/*"
          onChange={(e) => handleChange(e as any)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {resident.profilePicture && (
  <p className="text-sm text-gray-600 mt-1">Image uploaded</p>
)}

      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-2 flex-wrap">
            <button
        type="button"
        onClick={() => {
          clearSelection?.();
          setResident({
            firstName: '',
            middleName: '',
            lastName: '',
            suffix: '',
            age: 0,
            gender: '',
            address: '',
            civilStatus: '',
            birthdate: '',
            phone: '',
            email: '',
            profilePicture: '',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          
          setErrors({});
        }}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
      >
        
        Cancel
      </button>

        <button
          type="submit"
          className={`px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded hover:bg-blue-700 transition`}
          disabled={loading}
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
          ) : (
            selectedResident ? 'Update' : 'Add'
          )}
        </button>
      </div>
      
    </form>
    </>
  );
}
