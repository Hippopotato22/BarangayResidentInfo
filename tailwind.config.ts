// tailwind.config.ts


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Add any other paths where your components are located
  ],
  theme: {
    extend: {
      colors: {
        'light-blue': '#8ecae6',
        'blue': '#219ebc',
        'dark-blue': '#023047',
        'yellow': '#ffb703',
        'orange': '#fb8500',
      },
    },
  },

  extend: {
    animation: {
      modal: 'fadeIn 0.3s ease-out',
      gradient: 'gradient 6s ease infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: 0, transform: 'scale(0.95)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
      },
      gradient: {
          '0%, 100%': { backgroundPosition: 'center center' },
          '50%': { backgroundPosition: 'top left' },
        },  
    },
  },

  
  
  plugins: [],
};
