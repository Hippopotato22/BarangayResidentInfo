import React, { useState, useRef, useEffect } from 'react';
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
  const [pendingOpen, setPendingOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);



  

  const handleClick = async () => {
    setLoading(true);
    await router.push(`/admin/residents/${res.id}`);
    // Optional: setLoading(false);
  };

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
     if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setPendingOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

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
        <strong
          className="text-2xl font-bold text-white-900"
          style={{ fontFamily: 'RandomWed', letterSpacing: '0.1em' }}
        >
          {`${res.firstName} ${res.middleName} ${res.lastName} ${res.suffix || ''}`}
        </strong>
        <p className="text-md text-white-700">
          {res.age} years old, {res.gender}, {res.civilStatus}
        </p>
        <p className="text-md text-white-700">
          Address:{' '}
          <span className="font-medium">
            {res.address}
            {res.purok ? `, Purok ${res.purok}` : ''}
          </span>
        </p>
        {res.email && (
          <p className="text-md text-white-700">
            Email: <span className="font-medium">{res.email}</span>
          </p>
        )}
        {res.phone && (
          <p className="text-md text-white-700">
            Phone: <span className="font-medium">{res.phone}</span>
          </p>
        )}
        {res.createdAt && (
          <p className="text-sm text-gray-900">
            Created on:{' '}
            <span className="font-medium">
              {new Date(res.createdAt.seconds * 1000).toLocaleDateString()}
            </span>
          </p>
        )}
      </div>
    </div>

    {/* Wrap action buttons and collapsible together for vertical stacking */}
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      {/* Action Buttons */}
      <div
        className={`flex gap-2 flex-wrap bg-white rounded-lg p-3 shadow transition transform hover:shadow-xl cursor-pointer ${
          hoveredButton === 'view'
            ? 'bg-gradient-to-r from-blue-600 to-blue-400'
            : hoveredButton === 'edit'
            ? 'bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400'
            : hoveredButton === 'delete'
            ? 'bg-gradient-to-r from-red-400 to-red-600'
            : ''
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

      {/* Collapsible Pending Requirements Section */}
      <div   ref={wrapperRef} className="mt-2 p-2 bg-gray-800 rounded-md shadow-sm text-sm w-full sm:w-auto">
        <button
  onClick={() => setPendingOpen(!pendingOpen)}
  className="w-full flex justify-between items-center text-white font-semibold focus:outline-none"
  aria-expanded={pendingOpen}
  aria-controls={`pending-requirements-${res.id}`}
>
  <div className="flex items-center gap-3">
    <span>Pending Requirements</span>

    {/* Status circles */}
    <div className="flex gap-1">
      {/* Residency Certificate circle */}
      <span
        className={`w-3 h-3 rounded-full ${
          res.residencyCertificate ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={`Residency Certificate: ${
          res.residencyCertificate ? 'Submitted' : 'Pending'
        }`}
      ></span>

      {/* Indigency Certificate circle */}
      <span
        className={`w-3 h-3 rounded-full ${
          res.indigencyCertificate ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={`Indigency Certificate: ${
          res.indigencyCertificate ? 'Submitted' : 'Pending'
        }`}
      ></span>

      {/* Barangay Clearance circle */}
      <span
        className={`w-3 h-3 rounded-full ${
          res.barangayClearance ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={`Barangay Clearance: ${
          res.barangayClearance ? 'Submitted' : 'Pending'
        }`}
      ></span>
    </div>
  </div>

  {/* Chevron SVG */}
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${
      pendingOpen ? 'rotate-180' : 'rotate-0'
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
  </svg>
</button>

{pendingOpen && (
  <ul
    id={`pending-requirements-${res.id}`}
    className="mt-2 space-y-2 text-white max-w-md"
  >
    {[
      {
        label: 'Residency Certificate',
        submitted: res.residencyCertificate,
      },
      {
        label: 'Indigency Certificate',
        submitted: res.indigencyCertificate,
      },
      {
        label: 'Barangay Clearance',
        submitted: res.barangayClearance,
      },
    ].map(({ label, submitted }) => (
      <li key={label}>
        <button
          onClick={handleClick}
          className="w-full flex justify-between items-center rounded-md px-3 py-2 bg-gray-700 hover:bg-gray-600 transition focus:outline-none"
          type="button"
        >
          <span className="font-medium text-left">{label}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold ${
              submitted
                ? 'bg-green-600 text-green-100'
                : 'bg-red-600 text-red-100'
            }`}
          >
            {submitted ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Submitted
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Pending
              </>
            )}
          </span>
        </button>
      </li>
    ))}
  </ul>
)}


        
      </div>
    </div>
  </li>
);

};

export default ResidentCard;
