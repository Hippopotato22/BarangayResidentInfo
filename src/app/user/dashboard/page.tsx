'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Resident } from '@/types/resident'; // Assuming you have a Resident type
import useAuthGuard from '@/utils/authGuard';

export default function UserDashboard() {
  const loading = useAuthGuard('user'); // Ensure only 'user' role can access this page
  const router = useRouter();

  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalResidents, setTotalResidents] = useState(0);

  useEffect(() => {
    const fetchResidents = async () => {
      const residentsCollection = collection(db, 'residents');
      const querySnapshot = await getDocs(residentsCollection);
      const fetchedResidents: Resident[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Resident[];

      setResidents(fetchedResidents);
      setTotalResidents(fetchedResidents.length);
    };

    fetchResidents();
  }, []);

  const filteredResidents = residents.filter((res) =>
    `${res.firstName} ${res.middleName} ${res.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase()) &&
    (!gender || res.gender === gender) &&
    (!status || res.civilStatus === status)
  );

  const paginatedResidents = filteredResidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full sm:w-auto"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>
      </div>

      {/* Resident List */}
      <ul className="space-y-3">
        {paginatedResidents.map((res) => (
          <li
            key={res.id}
            className="p-3 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-500 ease-out"
          >
            <div className="flex gap-4 items-start">
              {/* Profile Image */}
              {res.profilePicture && (
                <img
                  src={res.profilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border"
                />
              )}

              {/* Basic Info */}
              <div>
                <strong>{`${res.firstName} ${res.middleName} ${res.lastName} ${res.suffix || ''}`}</strong>
                <p>{res.age} years old, {res.gender}, {res.civilStatus}</p>
                <p>Address: {res.address}</p>
                {res.email && <p>Email: {res.email}</p>}
                {res.phone && <p>Phone: {res.phone}</p>}
              </div>
            </div>

            {/* View Details Button */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => router.push(`/user/residents/${res.id}`)} // View Details
                className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105 transition"
              >
                View Details
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
    </div>
  );
}
