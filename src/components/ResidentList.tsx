'use client';

import { Resident } from '@/types/resident';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Add router for navigation
import ResidentPage from '@/app/admin/residents/[id]/page';
import { address } from 'framer-motion/client';

interface Props {
  residents: (Resident & { id: string })[];
  refreshResidents: () => void;
  onEdit: (resident: Resident & { id: string }) => void;
}

export default function ResidentList({ residents, refreshResidents, onEdit }: Props) {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResident, setSelectedResident] = useState<Resident & { id: string } | null>(null);
  const [deletedResidents, setDeletedResidents] = useState<string[]>([]);
  const [addedResidents, setAddedResidents] = useState<string[]>([]);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<string | null>(null);
  const itemsPerPage = 5;
  const [barangay, setBarangay] = useState('');

  const router = useRouter(); // ✅ For redirection



  const uniqueBarangays = Array.from(
    new Set(residents.map((res) => res.address.split(',')[0].trim()))
  ).sort();
  

  const handleDelete = async () => {
    if (!residentToDelete) return;

    try {
      setDeletedResidents((prev) => [...prev, residentToDelete]);
      await deleteDoc(doc(db, 'residents', residentToDelete));
      toast.success('Resident deleted successfully!');
      setTimeout(() => {
        refreshResidents();
        setDeletedResidents((prev) => prev.filter((deletedId) => deletedId !== residentToDelete));
        setDeleteConfirmModalOpen(false);
      }, 500);
    } catch (error) {
      toast.error('Error deleting resident');
    }
  };

  const handleEdit = (resident: Resident & { id: string }) => {
    setSelectedResident(resident);
    onEdit(resident);
    
  };

  const handleModalClose = () => {
    setSelectedResident(null);
  };

  const handleSaveEdit = async (updatedResident: Resident) => {
    if (selectedResident) {
      const docRef = doc(db, 'residents', selectedResident.id);
      await updateDoc(docRef, updatedResident as Record<string, any>);
      toast.success('Resident updated!');
      refreshResidents();
      handleModalClose();
    }
  };

  const filtered = useMemo(() => {
    return residents
      .filter((res) => {
        const searchLower = search.toLowerCase();
        const fullName = `${res.firstName} ${res.middleName} ${res.lastName}`.toLowerCase();
        const address = res.address?.toLowerCase() || '';
        const phone = res.phone?.toLowerCase() || '';
        const age = res.age?.toString() || '';
        const email = res.email?.toLowerCase() || '';
  
        return (
          (fullName.includes(searchLower) ||
           address.includes(searchLower) ||
           phone.includes(searchLower) ||
           email.includes(searchLower) ||
           age.includes(searchLower)) &&
          (!gender || res.gender === gender) &&
          (!status || res.civilStatus === status) &&
          (!barangay || address.startsWith(barangay.toLowerCase()))
        );
      })
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const aDate = new Date(a.createdAt.seconds * 1000);
          const bDate = new Date(b.createdAt.seconds * 1000);
          return sortOrder === 'desc'
            ? bDate.getTime() - aDate.getTime()
            : aDate.getTime() - bDate.getTime();
        }
        return 0;
      });
  }, [residents, search, gender, status, barangay, sortOrder]);
  

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="mt-6 max-w-4xl mx-auto">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4 text-center">Residents List</h2>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full sm:w-auto"
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="p-2 border rounded bg-dark-blue">
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded bg-dark-blue">
          <option value="">All Statuses</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')} className="p-2 border rounded bg-dark-blue">
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
        <select
          value={barangay}
          onChange={(e) => setBarangay(e.target.value)}
          className="p-2 border rounded bg-dark-blue"
        >
          <option value="">All Barangays</option>
        
          <option value="Barangay 1">Barangay 1</option>
          <option value="Barangay 2">Barangay 2</option>
          <option value="Barangay 3">Barangay 3</option>
          <option value="Barangay 4">Barangay 4</option>
          <option value="Barangay 5">Barangay 5</option>
          
        </select>

      </div>

      {/* List */}
      <ul className="space-y-3">
        {paginated.map((res) => (
          <li
            key={res.id}
            className={`p-3 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-500 ease-out ${
              deletedResidents.includes(res.id) ? 'opacity-0 scale-75' : ''
            }`}
          >
            <div className="flex gap-4 items-start">
              
              {res.profilePicture && (
                <img
                  src={res.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border" 
                />
              )}

              {/* Basic Info */}
              <div>
                <strong>{`${res.firstName} ${res.middleName} ${res.lastName} ${res.suffix || ''}`}</strong>
                <p>{res.age} years old, {res.gender}, {res.civilStatus}</p>
                <p>Address: {res.address}</p>
                {res.email && <p>Email: {res.email}</p>}
                {res.phone && <p>Phone: {res.phone}</p>}
                {res.createdAt && (
                  <p className="text-sm text-gray-500">
                    Created on: {new Date(res.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => router.push(`/admin/residents/${res.id}`)} // ✅ View Details
                className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105 transition"
              >
                View Details
              </button>
              <button
                onClick={() => handleEdit(res)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:scale-105 transition"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setResidentToDelete(res.id);
                  setDeleteConfirmModalOpen(true);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:scale-105 transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Confirm Delete Modal */}
      {deleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this resident?</p>
            <div className="flex justify-between gap-2">
              <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded w-full">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteConfirmModalOpen(false)} className="bg-gray-400 text-white p-2 rounded w-full">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
