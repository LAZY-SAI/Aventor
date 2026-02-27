import { useEffect, useState } from "react";
import {  Clock, CheckCircle2 } from "lucide-react"; 
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Final = () => {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/data.json");
      const data = await res.json();
      setTripData(data);
    } catch (err) {
      console.error("Error fetching trip data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return <div className="text-white p-10">Loading your masterpiece...</div>;
  if (!tripData)
    return <div className="text-white p-10">Failed to load itinerary.</div>;

  return (
    <div className="min-h-screen  text-white p-6">
      <header className="flex items-center rounded-full">
        <button
         onClick={() => navigate("/Plan")}
          className={"p-3 hover:bg-gray-600 rounded-full ml-12 transition-colors"}
        >
          <FaArrowLeft
            className={" font-bold text-2xl"}
           
          />
        </button>
      </header>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Itinerary Column */}
        <div className="lg:col-span-8 space-y-10">
          <header>
            <h1 className="text-4xl font-bold">
              {tripData.trip_metadata.destination}
            </h1>
            <p className="text-zinc-500 mt-2">
              Personalized AI-optimized route
            </p>
          </header>

          {/* Mapping through Days */}
          {tripData.itinerary.map((day) => (
            <div
              key={day.day}
              className="relative pl-8 border-l border-zinc-800"
            >
              {/* Circle Marker for the day */}
              <div className="absolute -left-1.5 top-0 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />

              <h2 className="text-xl font-bold mb-1">
                Day {day.day}: {day.title}
              </h2>
              <p className="text-zinc-400 text-sm mb-6 italic">{day.theme}</p>

              {/* Nested Map: Activities within that day */}
              <div className="space-y-6">
                {day.activities.map((item, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl group hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-400">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-emerald-500 font-mono text-xs uppercase tracking-wider">
                            {item.time || "Flexible"}
                          </p>
                          <h3 className="font-semibold text-zinc-100">
                            {item.activity}
                          </h3>
                          {item.notes && (
                            <p className="text-zinc-500 text-sm mt-1">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/*  Sticky Sidebar  */}
        <aside className="lg:col-span-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl sticky top-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              Trip Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Dates:</span>
                <span>
                  {tripData.trip_metadata.dates.start} -{" "}
                  {tripData.trip_metadata.dates.end}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Budget:</span>
                <span className="text-emerald-400">
                  {tripData.trip_metadata.budget.level}
                </span>
              </div>
            </div>

            <hr className="my-6 border-zinc-800" />

            <h4 className="text-xs uppercase text-zinc-500 font-bold mb-3 tracking-widest">
              Optimized Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {tripData.trip_metadata.optimization_tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="p-2 bg-gray-700 mt-6 rounded-xl font-bold">
                Recreate
              </button>
              <button className="p-2 bg-emerald-800 mt-6 rounded-xl font-bold">
                Create
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Final;
