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


export default function AdminDashboard() {
  const loading = useAuthGuard('admin');
  const [selectedResident, setSelectedResident] = useState<Resident & { id: string } | undefined>(undefined);
  const [residents, setResidents] = useState<(Resident & { id: string })[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const fetchResidents = async () => {
    const q = showRecent
      ? query(collection(db, 'residents'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'residents'));

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Resident),
    }));
    setResidents(data);
  };

  useEffect(() => {
    const fetchNickname = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.nickname) {
              const capitalized =
                userData.nickname.charAt(0).toUpperCase() + userData.nickname.slice(1);
              setNickname(capitalized);
            }
          }
        }
      });
    };
  
    fetchNickname();
  }, []);
  

  useEffect(() => {
    fetchResidents();
  }, [showRecent]);

  const [nickname, setNickname] = useState('');


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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-4 pt-20 bg-dark-blue px-4 md:px-12 lg:px-20 bg-gray-50 min-h-screen">
  
  <PopulationStats residents={residents} />
      
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4">
        Admin{nickname  ? ` ${nickname}` : ''}'s Dashboard
      </h1>

          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow"
          >
            + New Resident
          </button>
        </div>

    
        <ResidentList
          residents={residents}
          refreshResidents={refreshResidents}
          onEdit={handleEdit}
        />
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
  <div className="flex flex-col md:flex-row gap-4">
  </div>
    </div>
    
  );
  
}
