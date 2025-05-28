// ResidentCard.tsx
import React, { useState } from 'react';
import { Resident } from '@/types/resident';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // spinner icon

interface Props {
  res: Resident & { id: string };
  onEdit: (resident: Resident & { id: string }) => void;
  setResidentToDelete: (id: string) => void;
  setDeleteConfirmModalOpen: (open: boolean) => void;
}

const ResidentCard: React.FC<Props> = ({ res, onEdit, setResidentToDelete, setDeleteConfirmModalOpen }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const router = useRouter();
   const [loading, setLoading] = useState(false);

    const handleClick = async () => {
    setLoading(true);
    await router.push(`/admin/residents/${res.id}`);
    // If you want to keep loading until navigation ends, no need to setLoading(false)
    // But if navigation is fast and you want to reset:
    // setLoading(false);
  };

  return (
    <li className="p-3 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex gap-4 items-start">
        {res.profilePicture && (
          <img
            src={res.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
        )}
          <div>
        <strong className="text-2xl font-bold text-white-900" style={{ fontFamily: 'RandomWed', letterSpacing: '0.1em' }}>{`${res.firstName} ${res.middleName} ${res.lastName} ${res.suffix || ''}`}</strong>
        <p className="text-md text-white-700">{res.age} years old, {res.gender}, {res.civilStatus}</p>
        <p className="text-md text-white-700">Address: <span className="font-medium">{res.address}</span></p>
        {res.email && <p className="text-md text-white-700">Email: <span className="font-medium">{res.email}</span></p>}
        {res.phone && <p className="text-md text-white-700">Phone: <span className="font-medium">{res.phone}</span></p>}
        {res.createdAt && (
          <p className="text-sm text-gray-900">
            Created on: <span className="font-medium">{new Date(res.createdAt.seconds * 1000).toLocaleDateString()}</span>
          </p>
        )}
      </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`flex gap-2 flex-wrap bg-white rounded-lg p-3 shadow transition transform hover:shadow-xl cursor-pointer ${
          hoveredButton === 'view' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
          hoveredButton === 'edit' ? 'bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400' :
          hoveredButton === 'delete' ? 'bg-gradient-to-r from-red-400 to-red-600' :
          ''
        }`}
      >
        <button
      onMouseEnter={() => setHoveredButton('view')}
      onMouseLeave={() => setHoveredButton(null)}
      onClick={handleClick}
      disabled={loading}
      className={`bg-blue-600 text-white px-4 py-2 rounded 
                  hover:scale-110 hover:shadow-lg hover:bg-blue-700 
                  focus:outline-none focus:ring-2 focus:ring-blue-400 
                  transition transform duration-300 ease-in-out
                  ${loading ? 'cursor-not-allowed opacity-70' : ''}
                  `}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin inline-block" />
      ) : (
        'View Details'
      )}
    </button>

        <button
          onMouseEnter={() => setHoveredButton('edit')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => onEdit(res)}
          className="bg-yellow-500 text-white px-4 py-2 rounded 
                     hover:scale-110 hover:shadow-lg hover:bg-yellow-600 
                     focus:outline-none focus:ring-2 focus:ring-yellow-300 
                     transition transform duration-300 ease-in-out"
        >
          Edit
        </button>

        <button
          onMouseEnter={() => setHoveredButton('delete')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => {
            setResidentToDelete(res.id);
            setDeleteConfirmModalOpen(true);
          }}
          className="bg-red-500 text-white px-4 py-2 rounded 
                     hover:scale-110 hover:shadow-lg hover:bg-red-600 
                     focus:outline-none focus:ring-2 focus:ring-red-400 
                     transition transform duration-300 ease-in-out"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default ResidentCard;
