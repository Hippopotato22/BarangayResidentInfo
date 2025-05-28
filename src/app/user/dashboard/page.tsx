'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Resident } from '@/types/resident';
import useAuthGuard from '@/utils/authGuard';
import { onAuthStateChanged } from 'firebase/auth';
import PopulationStats from '@/app/PopulationStats';
import barangays from '@/components/barangays';
import ColorPicker from '@/app/ColorPicker';
import { useUser } from '@/components/UserContext';
import { Loader2 } from 'lucide-react';

const quotes = [
  "Good things take time… ⏳",
  "Fetching awesomeness… 🔍",
  "Almost there, hang tight! 🕊️",
  "This won’t take long… probably. 😅",
  "Magic is happening behind the scenes… ✨",
  "We’re loading… because teleportation isn't real (yet). 🚀",
  "Just enough time to stretch your legs… 🧘‍♂️",
];


export default function UserDashboard() {
  const loading = useAuthGuard('user');
  const router = useRouter();
  const { nickname } = useUser(); // ✅ Use shared context

  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalResidents, setTotalResidents] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  //const [nickname, setNickname] = useState('');
  const [barangay, setBarangay] = useState<string>(''); // State for barangay filter
  const [backgroundColor, setBackgroundColor] = useState<string>('linear-gradient(to right, #ff7e5f, #feb47b)'); // Default gradient

  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState('');
  // Fetch the current user's nickname
 

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

   // Select a random quote on mount
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(interval);
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
  }, [residents, search, gender, status, sortOrder, barangay]);

  const paginatedResidents = filteredResidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

if (loading) {
  return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md w-[90%] max-w-md animate-fade-in">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-center text-gray-700 text-xl italic">{quote}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-500 h-2.5 transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-500">{Math.round(progress)}% loaded</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen p-6 pt-20" style={{ background: backgroundColor }}>
      <div className="absolute top-14 right-13 z-50">
      <ColorPicker onChange={setBackgroundColor} selectedColor={backgroundColor} />
    </div>
      {/* Show nickname at the top */}
     <h1
        className="text-5xl font-bold mb-4 text-white"
        style={{
          fontFamily: 'hellonewyork, sans-serif',
          letterSpacing: '0.1em',
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
        }}
      >
        {nickname ? `${nickname}'s Dashboard` : 'Dashboard'}
      </h1>



      {/* Grid layout for Population Stats and Residents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Population Stats */}
    <div className="bg-[radial-gradient(circle_at_center,_#60a5fa,_#3b82f6,_#1e3a8a)] bg-[length:200%_200%] animate-[gradient_6s_ease_infinite] rounded-lg shadow-xl shadow-teal-500/50 p-3 max-w-7xl mx-auto">

  <PopulationStats residents={residents} />


</div>


<div className="bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 rounded-lg shadow-xl shadow-teal-500/50 p-4">
  {/* Filters */}
  <div className="mb-4 flex items-center gap-4 flex-wrap">
    <input
      type="text"
      placeholder="Search by name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="p-3 border border-gray-300 rounded-lg w-48 min-w-[180px] text-white-900 bg-dark-blue focus:ring-2 focus:ring-teal-500 focus:outline-none transition ease-in-out"
    />
    <select
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      className="p-3 border rounded-lg border-gray-300 w-32 min-w-[140px] text-white-900 bg-dark-blue focus:ring-2 focus:ring-teal-500 focus:outline-none transition ease-in-out"
    >
      <option value="">All Genders</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="p-3 border rounded-lg border-gray-300 w-32 min-w-[140px] text-white-900 bg-dark-blue focus:ring-2 focus:ring-teal-500 focus:outline-none transition ease-in-out"
    >
      <option value="">All Statuses</option>
      <option value="Single">Single</option>
      <option value="Married">Married</option>
    </select>
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
      className="p-3 border rounded-lg border-gray-300 w-32 min-w-[120px] text-white-900 bg-dark-blue focus:ring-2 focus:ring-teal-500 focus:outline-none transition ease-in-out"
    >
      <option value="desc">Newest</option>
      <option value="asc">Oldest</option>
    </select>
    <select value={barangay} onChange={(e) => setBarangay(e.target.value)} className="p-2 border rounded bg-dark-blue">
        <option value="">All Purok</option>
        {barangays.map((barangayName, index) => (
          <option key={index} value={barangayName}>{barangayName}</option>
        ))}
      </select>
  </div>




          {/* Resident List */}
      <ul className="space-y-3 max-h-[770px] overflow-y-auto scroll-smooth">

  {paginatedResidents.map((res) => (
    <li
      key={res.id}
     className="p-4 border border-gray-200 rounded-xl bg-white shadow-md transition-all duration-300 ease-in-out text-dark-blue">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4 items-start">
          {res.profilePicture && (
            <img
              src={res.profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-400"
            />
          )}
          <div>
            <strong className="text-lg font-semibold">{`${res.firstName} ${res.middleName} ${res.lastName} ${res.suffix || ''}`}</strong>
            <p className="text-sm text-gray-600">{res.age} years old, {res.gender}, {res.civilStatus}</p>
            <p className="text-sm text-gray-600">Address: {res.address}</p>
            {res.email && <p className="text-sm text-gray-600">Email: {res.email}</p>}
            {res.phone && <p className="text-sm text-gray-600">Phone: {res.phone}</p>}
          </div>
        </div>
        <button
          onClick={() => router.push(`/user/residents/${res.id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none transition"
        >
          View Details
        </button>
      </div>
    </li>
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
        </div>
      </div>
    </div>
    
  );
}

