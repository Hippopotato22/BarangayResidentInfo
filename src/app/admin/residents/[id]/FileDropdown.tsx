// FileDropdown.tsx

import React, { useState } from 'react';

interface FileDropdownProps {
  profilePicture?: string;
  clearance?: string;
  residency?: string;
  indigency?: string;
  onChange?: () => void; // Callback to handle profile picture change
}

const FileDropdown: React.FC<FileDropdownProps> = ({
  profilePicture,
  clearance,
  residency,
  indigency,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        View Uploaded Files
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="p-4 space-y-2">
            <div>
              <strong>Barangay Clearance:</strong>
              <a href={clearance} target="_blank" rel="noopener noreferrer" className="block text-blue-500">
                View Document
              </a>
            </div>
            <div>
              <strong>Residency Certificate:</strong>
              <a href={residency} target="_blank" rel="noopener noreferrer" className="block text-blue-500">
                View Document
              </a>
            </div>
            <div>
              <strong>Indigency Certificate:</strong>
              <a href={indigency} target="_blank" rel="noopener noreferrer" className="block text-blue-500">
                View Document
              </a>
            </div>
            <div className="mt-4">
              <strong>Profile Picture:</strong>
              <img src={profilePicture} alt="Profile" className="w-24 h-24 object-cover rounded mt-1" />
              <button
                onClick={onChange}
                className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Change Picture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropdown;
