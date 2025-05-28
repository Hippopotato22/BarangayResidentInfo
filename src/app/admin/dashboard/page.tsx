'use client';

import { useState, useEffect } from 'react';
import useAuthGuard from '@/utils/authGuard';
import ResidentForm from '@/components/ResidentForm';
import ResidentList from '@/components/ResidentList';
import Navbar from '@/components/Navbar';
import { Resident } from '@/types/resident';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import PopulationStats from '@/app/PopulationStats';
import { FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
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

export default function AdminDashboard() {
  const loading = useAuthGuard('admin');
   const { nickname } = useUser(); // ✅ Use shared context
  const [selectedResident, setSelectedResident] = useState<Resident & { id: string } | undefined>(undefined);
  const [residents, setResidents] = useState<(Resident & { id: string })[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  

  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState('');

  const [backgroundColor, setBackgroundColor] = useState<string>(
  'linear-gradient(to bottom right, #1e3a8a, #2563eb, #1e3a8a)'
);


  const fetchResidents = async () => {
  const q = showRecent
    ? query(collection(db, 'residents'), orderBy('createdAt', 'desc'))
    : query(collection(db, 'residents'));

  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map((doc) => {
    const residentData = doc.data() as Resident;
    const { id: _, ...restData } = residentData; // Omit 'id' from residentData
    return { id: doc.id, ...restData };
  });
  setResidents(data);
};

 
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

    
  

  useEffect(() => {
    fetchResidents();
  }, [showRecent]);



  const handleEdit = (resident: Resident & { id: string }) => {
    setSelectedResident(resident);
    setShowFormModal(true);
  };

  const handleAddNew = () => {
    setSelectedResident(undefined);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setSelectedResident(undefined);
  };

  const refreshResidents = () => {
    fetchResidents();
  };

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
  <div className="min-h-screen px-4 md:px-6 lg:px-10 gap-8 pt-20 " style={{ background: backgroundColor }}>
    <div className="absolute top-14 right-13 z-50">
      <ColorPicker onChange={setBackgroundColor} selectedColor={backgroundColor} />
    </div>

      {/* Centered Header */}
      <h1
        className="text-6xl font-bold mb-4 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent animate-gradient-x text-center"
        style={{ fontFamily: 'hellonewyork', letterSpacing: '0.1em' }}
      >
       Admin {nickname ? `${nickname}'s Dashboard` : 'Dashboard'}
      </h1>

      {/* Population stats */}
<div className="grid grid-cols-5 gap-6">
  
{/* Left Column: Population Stats */}
<div className="col-span-2 flex justify-center bg-[radial-gradient(circle_at_center,_#80d0ff,_#1e3a8a)] bg-[length:200%_200%] animate-[gradient_6s_ease_infinite] rounded-lg shadow-xl shadow-teal-500/50 p-4">


  <PopulationStats residents={residents} />
</div>


{/* Right Column: Resident List */}
<div className="col-span-3 sm:col-span-3 w-full bg-gradient-to-br from-blue-800 via-teal-700 to-teal-800 rounded-lg shadow-xl shadow-teal-500/50 p-4 md:p-6">


    <div className="flex justify-between items-center mb-6">
    <button
      onClick={handleAddNew}
      className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 font-semibold tracking-wide select-none flex items-center gap-2"
    >
      <motion.span whileHover={{ scale: 1.3, rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
        <FiPlus className="w-5 h-5" />
      </motion.span>
      New Resident
    </button>
  </div>

  <ResidentList
    residents={residents}
    refreshResidents={refreshResidents}
    onEdit={handleEdit}
  />
</div>

</div>


      {/* Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 animate-fadeIn">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {selectedResident ? 'Edit Resident' : 'Add New Resident'}
            </h2>
            <ResidentForm
              selectedResident={selectedResident}
              clearSelection={handleCloseModal}
              onSave={() => {
                refreshResidents();
                handleCloseModal();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
