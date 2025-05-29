import React, { useMemo, useState } from 'react';
import { Resident } from '@/types/resident';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { h1 } from 'framer-motion/client';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement);

interface Props {
  residents: Resident[];
}

const PopulationStats: React.FC<Props> = ({ residents }) => {
  const [open, setOpen] = useState(false);
 
  const [populationFilter, setPopulationFilter] = useState('all'); // State for population filter

  const stats = useMemo(() => {
    const total = residents.length;
    const male = residents.filter((r) => r.gender === 'Male').length;
    const female = residents.filter((r) => r.gender === 'Female').length;
    const single = residents.filter((r) => r.civilStatus === 'Single').length;
    const married = residents.filter((r) => r.civilStatus === 'Married').length;
    const widowed = residents.filter((r) => r.civilStatus === 'Widowed').length;
    const divorced = residents.filter((r) => r.civilStatus === 'Divorced').length;
    

    const barangayPopulation: Record<string, number> = {};

    residents.forEach((r) => {
      const barangay = r.address.split(',')[0].trim(); // Assuming format "Barangay X, City"
      barangayPopulation[barangay] = (barangayPopulation[barangay] || 0) + 1;
    });


    const ageGroups = {
      children: residents.filter((r) => r.age <= 12).length,
      teens: residents.filter((r) => r.age >= 13 && r.age <= 17).length,
      adults: residents.filter((r) => r.age >= 18 && r.age <= 59).length,
      seniors: residents.filter((r) => r.age >= 60).length,
    };
    

    return { total, male, female, single, married, widowed, divorced, ageGroups, barangayPopulation, };
  }, [residents]);


  
  const totalPopulation = residents.length;

  const totalData = {
    labels: ['Total Population'],
    datasets: [
      {
        label: 'Residents',
        data: [totalPopulation],
        backgroundColor: ['#10B981'],
      },
    ],
  };
  

  const genderData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [stats.male, stats.female],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  const statusData = {
    labels: ['Single', 'Married', 'Widowed', 'Divorced'],
    datasets: [
      {
        data: [stats.single, stats.married, stats.widowed, stats.divorced],
        backgroundColor: ['#FFCE56', '#4BC0C0', '#ffa69e', '#f95738'],
        borderWidth: 1,
      },
    ],
  };

  const ageData = {
    labels: ['Children', 'Teens', 'Adults', 'Seniors'],
    datasets: [
      {
        data: [
          stats.ageGroups.children,
          stats.ageGroups.teens,
          stats.ageGroups.adults,
          stats.ageGroups.seniors,
        ],
        backgroundColor: ['#FF9F40', '#9966FF', '#00A8E8', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  const barangayData = useMemo(() => {
  const data = Object.entries(stats.barangayPopulation)
    .map(([barangay, population]) => ({ barangay, population }))
    .filter(item => item.population > 0); // Always show only barangays with population > 0

  // Sort based on filter type
  if (populationFilter === 'most') {
    data.sort((a, b) => b.population - a.population); // Descending (most populated first)
  } else if (populationFilter === 'least') {
    data.sort((a, b) => a.population - b.population); // Ascending (least populated first)
  } else {
    data.sort((a, b) => a.barangay.localeCompare(b.barangay)); // Alphabetical if no filter
  }

  return data;
}, [stats.barangayPopulation, populationFilter]);



return (
  <div className="w-full max-w-md mx-auto mt-6 px-4 md:px-0">
    <h2 className="text-2xl font-bold mb-4 text-center">Population Stats</h2>
    {/* Toggle Button for Small Screens */}
   <button
  onClick={() => setOpen((prev) => !prev)}
  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-lg mb-2 transition-all duration-300 transform ${
    open ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
  } text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 ${
    open ? 'focus:ring-red-500' : 'focus:ring-blue-500'
  }`}
>
  <span className={`transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
    ▼
  </span>
  {open ? 'Hide Population Stats' : 'Show Population Stats'}
</button>


    {/* Stats Panel */}
    <aside
      className={`overflow-y-auto pr-2 transition-all duration-500 ease-in-out overflow-hidden ${
        open ? 'max-h-[1075px] opacity-100' : 'max-h-0 opacity-0'
      } bg-[#dad7cd] border border-gray-200 shadow-inner rounded-lg px-4 py-2 mt-2`} // Added mt-2 to lower the stats panel
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-700">📊 Population Stats</h2>

      {/* Top section: two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Gender and Civil Status pies stacked */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-3 shadow transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <h3 className="text-sm font-medium mb-2 text-gray-600">Gender</h3>
            <div className="h-[180px]">
              <Pie data={genderData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <h3 className="text-sm font-medium mb-2 text-gray-600">Civil Status</h3>
            <div className="h-[255px]">
              <Pie data={statusData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Right column: Age Group pie and Overall Population stacked */}
        <div className="space-y-6 mr-2">
          <div className="bg-white rounded-lg p-3 shadow transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <h3 className="text-sm font-medium mb-2 text-gray-600">Age Group</h3>
            <div className="h-[180px]">
              <Pie data={ageData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="w-full bg-gradient-to-br from-white via-blue-50 to-white p-6 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1 hover:shadow-[0_50px_90px_rgba(244, 63, 94, 0.3))] duration-300 cursor-pointer">
            <div className="mb-4">
              <p className="text-4xl font-extrabold text-green-600 animate-pulse">{totalPopulation}</p>
              <h3 className="text-md font-semibold text-gray-700">Overall Population</h3>
            </div>
            <div className="h-[156px] relative">
              <Bar
                data={totalData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 10 },
                      grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

    <div className="mt-6 mb-3 bg-white rounded-lg p-4 shadow transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer">
      <h3 className="text-sm font-bold mb-2 text-gray-600">Population per Barangay</h3>
      <div className="h-[250px]">
        <Bar
          data={{
            labels: Object.keys(stats.barangayPopulation),
            datasets: [
              {
                label: 'Residents',
                data: Object.values(stats.barangayPopulation),
                backgroundColor: '#3B82F6',
                borderColor: '#1E40AF',
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.raw || 0;
                    return `${label}: ${value}`;
                  },
                },
              },
              title: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
              },
              x: {
                ticks: { autoSkip: false },
                grid: { display: false },
              },
            },
          }}
        />
      </div>
        <div className="mt-4 overflow-x-auto">
      <h4 className="text-sm font-bold text-gray-600 mb-2">Summary</h4>
      
      
       {/* Population Filter Dropdown */}
      <div className="mb-6">
  <label className="text-sm font-semibold text-gray-700 dark:text-black-200 mr-2">
    🔍 Filter by Population:
  </label>
  <select
    value={populationFilter}
    onChange={(e) => setPopulationFilter(e.target.value)}
    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
  >
    <option value="all">All</option>
    <option value="most">Most Populated</option>
    <option value="least">Least Populated</option>
  </select>
</div>

      <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 p-2 text-black text-left">Barangay</th>
            <th className="border border-gray-300 p-2 text-black text-left">Population</th>
          </tr>
        </thead>
        <tbody>
          {barangayData.map(({ barangay, population }, index) => (
            <tr key={barangay} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="border border-gray-300 p-2 text-black">{barangay}</td>
              <td className="border border-gray-300 p-2 text-black">
                <div className="flex items-center justify-between">
                  <span>{population}</span>
                  <div className="relative w-24 h-2 bg-gray-300 rounded">
                    <div
                      className="absolute h-full bg-blue-500 rounded"
                      style={{ width: `${(population / 200) * 100}%` }} // Adjust the denominator based on your max population
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    </aside>

    {!open && (
      <div className="p-4 bg-blue-50 rounded-lg shadow text-blue-900 flex flex-col items-center animate-fade-in">
        <img
          src="/target.gif" // Replace with your actual mascot/icon path
          alt="Mascot"
          className="w-16 h-16 mb-2 animate-bounce"
        />
        <p className="text-sm font-semibold text-center">
          💡 Tip: You can search residents by name, gender, age, address, purok or contact number for faster lookup!
        </p>
      </div>
    )}

    <div className="p-4 bg-blue-50 rounded-lg shadow text-blue-900 flex flex-col items-center animate-fade-in mt-4">
      <img
        src="/diagram.gif" // Replace with your actual filter icon path
        alt="Filter Icon"
        className="w-16 h-16 mb-2 animate-bounce"
      />
      <p className="text-sm font-semibold text-center">
        💡 Tip: Click on the categories in the charts (e.g., Male, Female, Married, Teens, Seniors) to filter the data. Click again to include them back!
      </p>
    </div>
  </div>

)};



export default PopulationStats;
