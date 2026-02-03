import AdminLayout from "./adminLayout";
import AdItineryPop from "../../components/admin/admin.itineraypop";
import { FaPlus, FaSearch, FaFilter, FaEllipsisV, FaCalendarAlt, FaClock } from "react-icons/fa";
import { useEffect, useState } from "react";
import Panel from "../../components/admin/Panel";
import { toast } from "react-toastify";

const AdItinery = () => {
  const [isItenararyOpen, setIsIteneraryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");

  const token = localStorage.getItem("accessToken");
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");

  // Fetch itineraries
  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUri}/itineraries`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setItineraries(data.data || []);
      } else {
        toast.error("Failed to fetch itineraries");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  // Handle new itinerary creation
  const handleSaveItinerary = (newItinerary) => {
    setItineraries((prev) => [newItinerary, ...prev]);
  };

  // Filter itineraries based on search and status
  const filteredItineraries = itineraries.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Itineraries
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Design and manage multi-day travel experiences
            </p>
          </div>
          <button
            onClick={() => setIsIteneraryOpen(true)}
            className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl transition-all duration-300 text-white font-bold shadow-xl shadow-emerald-900/40"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform" />
            Create Itinerary
          </button>
        </header>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search itineraries..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:border-emerald-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-all">
              <FaFilter size={12} /> Filter
            </button>
            <select
              className="flex-1 md:flex-none px-4 py-2.5 bg-gray-800 border-none text-gray-300 rounded-xl text-sm font-semibold outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        {/* Data List */}
        <Panel title="All Itineraries">
          <div className="overflow-x-auto no-scrollbar">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                  Loading Itineraries...
                </p>
              </div>
            ) : filteredItineraries.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <FaCalendarAlt className="text-gray-700 text-4xl" />
                <p className="text-gray-500 text-sm font-bold">
                  {searchQuery || statusFilter !== "All Status"
                    ? "No itineraries match your filters"
                    : "No itineraries yet. Create your first one!"}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    <th className="px-4 py-4">Itinerary Name</th>
                    <th className="px-4 py-4">Duration</th>
                    <th className="px-4 py-4">Theme</th>
                    <th className="px-4 py-4">Budget</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredItineraries.map((item) => (
                    <tr
                      key={item._id || item.id}
                      className="group hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <FaCalendarAlt />
                          </div>
                          <span className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition-colors cursor-pointer">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                          <FaClock className="text-gray-600" />
                          {item.totalDays} {item.totalDays === 1 ? "day" : "days"}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border text-emerald-400 border-emerald-400/20 bg-emerald-400/5">
                          {item.theme || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-xs text-gray-400 font-semibold">
                          {item.estimationBudget
                            ? `रू ${item.estimationBudget.toLocaleString()}`
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "Active"
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                : "bg-gray-600"
                            }`}
                          ></span>
                          <span className="text-xs text-gray-300 font-semibold">
                            {item.status || "Draft"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-500 transition-all">
                          <FaEllipsisV size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Panel>
      </div>

      {/* Create Itinerary Modal */}
      <AdItineryPop
        isOpen={isItenararyOpen}
        onClose={() => setIsIteneraryOpen(false)}
        onSave={handleSaveItinerary}
      />
    </AdminLayout>
  );
};

export default AdItinery;