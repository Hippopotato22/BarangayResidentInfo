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
  plugins: [],
};
