import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const Cards = ({ crd }) => {
  return (
    <div className="p-3 bg-gray-800 items-center min-h-48 rounded-xl overflow-hidden flex flex-col">
      <div className="p-3 flex flex-col items-start mb-1 w-full">
        <h2 className="font-bold text-lg text-white leading-tight">
          {crd.title}
        </h2>
        <p className="text-gray-400 text-xs mb-4">{crd.subtitle}</p>

        <div className="grid grid-cols-2 gap-3 mb-4 w-full">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-sm text-white">Dates</p>
            <p className="font-bold text-sm text-white">Travelers</p>
            <p className="font-bold text-sm text-white">Budget</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-sm">{crd.dates}</p>
            <p className="text-gray-400 text-sm">{crd.travelers}</p>
            <p className="text-gray-400 text-sm">{crd.budget}</p>
          </div>
        </div>

        <div className="flex gap-3 items-center mt-auto">
          <span className="px-3 py-1 rounded-lg bg-emerald-900 text-emerald-400 text-xs font-bold uppercase">
            {crd.status}
          </span>
          <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition-colors">
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

const MyPlan = () => {
  const navigate = useNavigate()
  const [userPlan, setUserPlan] = useState([]);

  const [filter, setFilter] = useState("Upcoming");

  const statusOptions = [
    { id: 1, name: "Upcoming" },
    { id: 2, name: "Completed" },
  ];

  useEffect(() => {
    fetch("/api/userplan.json")
      .then((res) => res.json())
      .then((data) => setUserPlan(data));
  }, []);

  //  Filter the plans based on the selected state
  const filteredPlans = userPlan.filter(
    (plan) => plan.status.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="min-h-screen p-8  text-white">
      <div className="max-w-7xl mx-auto py-3">
        <header className="flex gap-4">
          <button 
          onClick={()=>navigate(-1)}
          className="mt-1 p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors border border-gray-700">
            <FaArrowLeft size={14} />
          </button>
         <div>
           <h2 className="font-bold text-2xl">My Plans</h2>
          <p className="text-gray-400">
            All the trips you have created are saved here
          </p>
         </div>
        </header>

        {/*  Filter Buttons */}
        <div className="flex gap-4 mt-6 mb-8">
          {statusOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.name)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === item.name
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((item) => <Cards key={item.id} crd={item} />)
          ) : (
            <p className="text-gray-500 italic">No {filter} plans found.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyPlan;
