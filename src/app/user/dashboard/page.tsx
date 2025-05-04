'use client';



import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Resident } from '@/types/resident';
import useAuthGuard from '@/utils/authGuard';
import { onAuthStateChanged } from 'firebase/auth';


export default function UserDashboard() {
  const loading = useAuthGuard('user');
  const router = useRouter();

  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalResidents, setTotalResidents] = useState(0);
 // const [nickname, setNickname] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [nickname, setNickname] = useState('');

  // Fetch the current user's nickname
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNickname(userData.nickname || null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch residents
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

  const filteredResidents = useMemo(() => {
    return residents
    .filter((res) => {
      const searchLower = search.toLowerCase();
      const fullName = `${res.firstName} ${res.middleName} ${res.lastName}`.toLowerCase();
      const address = res.address?.toLowerCase() || '';
      const phone = res.phone?.toLowerCase() || '';
      const email = res.email?.toLowerCase() || '';
      const age = res.age?.toString() || '';
    
      return (
        (fullName.includes(searchLower) ||
         address.includes(searchLower) ||
         phone.includes(searchLower) ||
         email.includes(searchLower) ||
         age.includes(searchLower)) &&
        (!gender || res.gender === gender) &&
        (!status || res.civilStatus === status)
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
  }, [residents, search, gender, status, sortOrder]);

  

  const paginatedResidents = filteredResidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6 pt-20">
      {/* Show nickname at the top */}
      <h1 className="text-2xl font-bold mb-4 text-dark-blue">
        {nickname  ? ` ${nickname}` : ''}'s Dashboard
      </h1>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-500 rounded w-full sm:w-auto text-gray-900 bg-white"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="p-2 border rounded border-gray-500 rounded w-full sm:w-auto text-gray-900 bg-powder-blue"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded border-gray-500 rounded w-full sm:w-auto text-gray-900 bg-powder-blue"
        >
          <option value="">All Statuses</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>

        <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
        className="p-2 border rounded border-gray-500 rounded w-full sm:w-auto text-gray-900 bg-powder-blue"
      >
        <option value="desc">Newest</option>
        <option value="asc">Oldest</option>
      </select>

        
      </div>

      {/* Resident List */}
      <ul className="space-y-3">
        {paginatedResidents.map((res) => (
          <li
            key={res.id}
            className="p-3 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-500 ease-out text-dark-blue"
          >
            <div className="flex gap-4 items-start">
              {res.profilePicture && (
                <img
                  src={res.profilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border"
                />
              )}
              <div>
                <strong>{`${res.firstName} ${res.middleName} ${res.lastName} ${res.suffix || ''}`}</strong>
                <p>{res.age} years old, {res.gender}, {res.civilStatus}</p>
                <p>Address: {res.address}</p>
                {res.email && <p>Email: {res.email}</p>}
                {res.phone && <p>Phone: {res.phone}</p>}
              </div>
            </div>
            <button
              onClick={() => router.push(`/user/residents/${res.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105 transition"
            >
              View Details
            </button>
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
