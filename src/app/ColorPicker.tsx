import React, { useState, useRef, useEffect } from 'react';

const ColorPicker: React.FC<{
  onChange: (gradient: string) => void;
  selectedColor: string;
}> = ({ onChange, selectedColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(selectedColor);
  const pickerRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = 'colorPickerSelectedGradient';

  const colorOptions = [
    { name: 'Tropical Sunrise', gradient: 'linear-gradient(to right, #ff9a9e, #fad0c4, #fad0c4)' },
    { name: 'Sea Breeze', gradient: 'linear-gradient(to top, #a1c4fd, #c2e9fb, #d4fc79)' },
    { name: 'Lush Meadow', gradient: 'linear-gradient(to bottom right, #56ab2f, #a8e063, #dce35b)' },
    { name: 'Dreamy Sunset', gradient: 'linear-gradient(135deg, #ff6e7f, #bfe9ff, #c9ffbf)' },
    { name: 'Berry Delight', gradient: 'linear-gradient(to left, #ff6a00, #ee0979, #ff6a00)' },
    { name: 'Ocean Bliss', gradient: 'linear-gradient(to top left, #2BC0E4, #EAECC6, #86fde8)' },
    { name: 'Peachy Waves', gradient: 'linear-gradient(225deg, #fbc2eb, #a6c1ee, #fbc2eb)' },
    { name: 'Neon Sunset', gradient: 'linear-gradient(to bottom, #ff416c, #ff4b2b, #ff6e7f)' },
    { name: 'Aurora Lights', gradient: 'linear-gradient(to top right, #00c9ff, #92fe9d, #f6fba2)' },
    { name: 'Fresh Citrus', gradient: 'linear-gradient(to right, #f9d423, #ff4e50, #fbd786)' },
    { name: 'Night Sky', gradient: 'linear-gradient(to right, #141E30, #243B55, #1C1C1C)' },
    { name: 'Dark Ocean', gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
    { name: 'Deep Space', gradient: 'linear-gradient(to bottom right, #000428, #004e92, #000000)' },
    { name: 'Crimson Void', gradient: 'linear-gradient(to top, #2c0f0c, #642d2d, #000000)' },
    { name: 'Midnight Plum', gradient: 'linear-gradient(to right, #2e003e, #3d2352, #1c1c1c)' },
    { name: 'Shadow Forest', gradient: 'linear-gradient(to left, #1a2a6c, #b21f1f, #000000)' },
    { name: 'Nebula Glow', gradient: 'linear-gradient(to bottom left, #3a1c71, #d76d77, #000000)' },
    { name: 'Cyber Noir', gradient: 'linear-gradient(160deg, #1f1c2c, #928dab, #000000)' },
    { name: 'Dark Horizon', gradient: 'linear-gradient(to top left, #000000, #434343, #1f1f1f)' },
    { name: 'Steel Eclipse', gradient: 'linear-gradient(to right, #485563, #29323c, #1e1e1e)' },
  ];

  // Load saved color from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== currentColor) {
      setCurrentColor(saved);
      onChange(saved);
    }
  }, []);

  const handleColorClick = (gradient: string) => {
    setCurrentColor(gradient);
    localStorage.setItem(STORAGE_KEY, gradient);
    onChange(gradient);
    setIsOpen(false);
  };

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={pickerRef}
      className="relative w-20 h-20 flex items-center justify-center"
      onClick={() => setIsOpen((prev) => !prev)}
    >
      {/* Color picker button */}
     <button
      title="Change background color"
      style={{
        background: `${currentColor} no-repeat center center / 150% 150%`, // Combine background color and size
        animation: 'gradientShift 5s ease infinite',
      }}
      className="w-14 h-14 p-3 rounded-full hover:scale-110 transition-transform duration-300 shadow-xl text-2xl select-none border-1 border-gray-100 backdrop-blur-md hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
    >
      <span role="img" aria-label="color-picker">🎨</span>
    </button>


      {colorOptions.map((color, index) => {
        const angle = (index / colorOptions.length) * 2 * Math.PI;
        const radius = 50;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <div
            key={index}
            onClick={() => handleColorClick(color.gradient)}
            style={{
              position: 'absolute',
              transform: `translate(${x}px, ${y}px) scale(${isOpen ? 1.2 : 0.5})`,
              opacity: isOpen ? 1 : 0,
              transition: `transform 0.3s ease ${isOpen ? index * 50 : (colorOptions.length - 1 - index) * 50}ms, opacity 0.3s ease ${isOpen ? index * 50 : (colorOptions.length - 1 - index) * 50}ms`,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: color.gradient,
              cursor: 'pointer',
              border: '2px solid white',
              pointerEvents: isOpen ? 'auto' : 'none',
              zIndex: 10,
            }}

            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
              el.style.transform = `translate(${x}px, ${y}px) scale(1.5)`;
              el.style.boxShadow = '0 0 12px rgba(0,0,0,0.5)';
            }}

            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
              el.style.transform = `translate(${x}px, ${y}px) scale(1.2)`;
              el.style.boxShadow = 'none';
            }}

            title={color.name}
          />
        );
      })}
    </div>
  );
};

export default ColorPicker;
