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


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement);

interface Props {
  residents: Resident[];
}

const PopulationStats: React.FC<Props> = ({ residents }) => {
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const total = residents.length;
    const male = residents.filter((r) => r.gender === 'Male').length;
    const female = residents.filter((r) => r.gender === 'Female').length;
    const single = residents.filter((r) => r.civilStatus === 'Single').length;
    const married = residents.filter((r) => r.civilStatus === 'Married').length;
    const widowed = residents.filter((r) => r.civilStatus === 'Widowed').length;
    const divorced = residents.filter((r) => r.civilStatus === 'Divorced').length;
  

    const ageGroups = {
      children: residents.filter((r) => r.age <= 12).length,
      teens: residents.filter((r) => r.age >= 13 && r.age <= 17).length,
      adults: residents.filter((r) => r.age >= 18 && r.age <= 59).length,
      seniors: residents.filter((r) => r.age >= 60).length,
    };

    return { total, male, female, single, married, widowed, divorced, ageGroups };
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

  return (
    <div className="md:w-[320px] w-full">
      {/* Toggle Button for Small Screens */}
      <button
  onClick={() => setOpen((prev) => !prev)}
  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded shadow mb-2 transition-colors duration-300 ${
    open ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
  } text-white`}
>
  <span className={`transform transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
    ▼
  </span>
  {open ? 'Hide Population Stats' : 'Show Population Stats'}
</button>

      {/* Stats Panel */}
      <aside
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          open ? 'max-h-[1075px] opacity-100' : 'max-h-0 opacity-0'
        } bg-gray-50 border-1 border-gray-200 shadow-inner rounded-lg px-4 py-2`}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700">📊 Population Stats</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-3 shadow">
            <h3 className="text-sm font-medium mb-2 text-gray-600">Gender</h3>
            <div className="h-[180px]">
              <Pie data={genderData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow">
            <h3 className="text-sm font-medium mb-2 text-gray-600">Civil Status</h3>
            <div className="h-[180px]">
              <Pie data={statusData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow">
            <h3 className="text-sm font-medium mb-2 text-gray-600">Age Group</h3>
            <div className="h-[180px]">
              <Pie data={ageData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm bg-gradient-to-br from-white via-blue-50 to-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
          <div className="mb-4">
            <p className="text-4xl font-extrabold text-green-600 animate-pulse">
              {totalPopulation}
            </p>
            <h3 className="text-md font-semibold text-gray-700">Overall Population</h3>
          </div>
          <div className="h-[200px] relative">
            <Bar
              data={totalData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 10,
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>


      </aside>
      {!open && (
  <div className="p-4 bg-blue-50 rounded-lg shadow text-blue-900 flex flex-col items-center animate-fade-in">
    <img
      src="/movinghome.gif" // Replace with your actual mascot/icon path
      alt="Mascot"
      className="w-16 h-16 mb-2 animate-bounce"
    />
    <p className="text-sm font-medium text-center">
      💡 Tip: You can search residents by name, gender, address, or contact number for faster lookup!
    </p>
  </div>
)}

    </div>
  );
};

export default PopulationStats;
