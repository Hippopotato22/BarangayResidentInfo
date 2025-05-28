'use client';

import { Resident } from '@/types/resident';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ResidentCard from './ResidentCard';
import barangays from './barangays';

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
  const [deletedResidents, setDeletedResidents] = useState<string[]>([]);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<string | null>(null);
   const [isChecked, setIsChecked] = useState(false); // State to track checkbox
  const itemsPerPage = 5;
  const [barangay, setBarangay] = useState<string>(''); // State for barangay filter

  

  const router = useRouter();

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
          className="p-2 border rounded w-full sm:w-auto bg-dark-blue"
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
         <select value={barangay} onChange={(e) => setBarangay(e.target.value)} className="p-2 border rounded bg-dark-blue">
        <option value="">All Barangays</option>
        {barangays.map((barangayName, index) => (
          <option key={index} value={barangayName}>{barangayName}</option>
        ))}
      </select>
      </div>

      {/* Resident Cards List */}
      <ul className="space-y-3">
        {paginated.map((res) => (
          <ResidentCard
            key={res.id}
            res={res}
            onEdit={onEdit}
            setResidentToDelete={setResidentToDelete}
            setDeleteConfirmModalOpen={setDeleteConfirmModalOpen}
          />
        ))}
      </ul>

    {/* Pagination Controls */}
{totalPages > 1 && (
  <div className="mt-6 flex justify-center space-x-3">
    {/* Previous Button */}
    <button
      className={`px-4 py-2 rounded-lg font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ${
        currentPage === 1
          ? 'bg-gray-300 cursor-not-allowed pointer-events-none'
          : 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 shadow-md'
      }`}
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      Previous
    </button>

    {/* Page Number Buttons */}
    {Array.from({ length: totalPages }).map((_, index) => {
      const pageNum = index + 1;
      const isActive = currentPage === pageNum;
      return (
        <button
          key={pageNum}
          className={`px-4 py-2 rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isActive
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          onClick={() => setCurrentPage(pageNum)}
          aria-current={isActive ? 'page' : undefined}
          aria-label={`Page ${pageNum}`}
        >
          {pageNum}
        </button>
      );
    })}

    {/* Next Button */}
    <button
      className={`px-4 py-2 rounded-lg font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ${
        currentPage === totalPages
          ? 'bg-gray-300 cursor-not-allowed pointer-events-none'
          : 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 shadow-md'
      }`}
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      aria-label="Next page"
    >
      Next
    </button>
  </div>
)}


      {/* Confirm Delete Modal */}
    {deleteConfirmModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div className="relative bg-dark-blue p-10 rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all duration-300 scale-100">

      
      <button
      onClick={() => setDeleteConfirmModalOpen(false)}
      className="absolute top-4 right-4 text-white text-4xl font-extrabold hover:text-red-500 focus:outline-none"
      aria-label="Close"
    >
      ×
    </button>


      {/* Title */}
      <h2 className="text-3xl font-bold text-red-400 mb-6 flex items-center">
        ⚠️ Deletion Confirmation
      </h2>
      <p className="text-lg mb-6 text-white leading-relaxed">
        You are about to permanently delete a resident record. This action is <strong>irreversible</strong> and will result in the <strong>permanent loss of all related data</strong>.
      </p>

      {/* Waiver Text */}
     <div className="bg-red-50 p-8 rounded-xl mb-8 border-2 border-red-400 shadow-md flex items-start gap-4 fade-in-up">
  <svg
    className="w-8 h-8 flex-shrink-0 text-red-600"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <p className="text-base text-red-700 leading-relaxed">
    <strong>Important:</strong> By proceeding, you confirm that you fully understand the <strong>permanent and irreversible consequences</strong> of this deletion. <br />
    This action <em>cannot</em> be undone, and all related resident data will be <strong>permanently removed</strong> from our records and <u>cannot be recovered or restored.</u> <br />
    Please ensure you have backed up any necessary information before continuing.
  </p>
</div>





    <div className="flex items-start mb-8">
  <input
    type="checkbox"
    id="delete-confirm-checkbox"
    checked={isChecked}
    onChange={() => setIsChecked(!isChecked)}
    className="hidden"
  />
  <label
    htmlFor="delete-confirm-checkbox"
    className="flex items-start cursor-pointer select-none"
  >
    <span className={`w-6 h-6 mr-4 flex items-center justify-center border-2 rounded-md transition-all duration-200 ${
      isChecked ? 'bg-red-600 border-red-600' : 'bg-white border-red-600'
    }`}>
      {isChecked && (
        <svg
          className="w-4 h-4 text-white animate-scale-in"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
    <span className="text-base text-white">
      I understand the consequences and wish to proceed with deletion.
    </span>
  </label>
</div>




      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          onClick={handleDelete}
          className={`bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-6 py-3 rounded-lg w-full sm:w-auto transition ${
            !isChecked ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!isChecked}
        >
          Yes, Delete Permanently
        </button>
        <button
          onClick={() => setDeleteConfirmModalOpen(false)}
          className="bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold px-6 py-3 rounded-lg w-full sm:w-auto transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


   </div>
    

  );
}
   