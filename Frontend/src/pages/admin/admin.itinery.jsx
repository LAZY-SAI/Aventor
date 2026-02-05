import AdminLayout from "./adminLayout";
import AdItineryPop from "../../components/admin/admin.itineraypop";
import { FaPlus, FaSearch, FaFilter, FaCalendarAlt, FaClock } from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
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

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUri}/itineraries`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setItineraries(data.data || []);
      } else {
        toast.error("Failed to fetch itineraries");
      }
    } catch (err) {
      console.error(err)
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [baseUri, token]);

  useEffect(() => {
    if (token) fetchItineraries();
  }, [fetchItineraries, token]);

 
  const handleToggleStatus = async (id, currentIsPublic) => {
    const nextIsPublic = !currentIsPublic;


    setItineraries((prev) =>
      prev.map((item) =>
        (item._id === id || item.id === id) ? { ...item, isPublic: nextIsPublic } : item
      )
    );

    try {
      const res = await fetch(`${baseUri}/itineraries/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: nextIsPublic }),
      });

      if (!res.ok) throw new Error();
      toast.success(`Itinerary is now ${nextIsPublic ? "Public" : "Private"}`);
    } catch (err) {
      console.error(err)
      toast.error("Update failed. Reverting...");
      setItineraries((prev) =>
        prev.map((item) =>
          (item._id === id || item.id === id) ? { ...item, isPublic: currentIsPublic } : item
        )
      );
    }
  };

  const handleSaveSuccess = () => {
    fetchItineraries(); // Re-fetch only when a NEW itinerary is created
    setIsIteneraryOpen(false);
  };

  const filteredItineraries = itineraries.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const itemStatus = item.isPublic ? "Active" : "Draft";
    const matchesStatus = statusFilter === "All Status" || itemStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const Toggle = ({ isPublic, id }) => (
    <div className="flex items-center justify-end gap-3">
      <span className={`text-[9px] font-black uppercase tracking-widest ${isPublic ? 'text-emerald-500' : 'text-gray-600'}`}>
        {isPublic ? "Live" : "Draft"}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={!!isPublic}
          onChange={() => handleToggleStatus(id, isPublic)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
      </label>
    </div>
  );

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Itineraries</h2>
            <p className="text-sm text-gray-500 font-medium">Manage multi-day travel experiences</p>
          </div>
          <button
            onClick={() => setIsIteneraryOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl text-white font-bold transition-all"
          >
            <FaPlus /> Create Itinerary
          </button>
        </header>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search itineraries..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-sm font-semibold outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Active">Public</option>
            <option value="Draft">Private</option>
          </select>
        </div>

        <Panel title="All Itineraries">
          <div className="overflow-x-auto no-scrollbar">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    <th className="px-4 py-4">Itinerary Name</th>
                    <th className="px-4 py-4">Duration</th>
                    <th className="px-4 py-4 text-right">Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredItineraries.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-5 font-bold text-gray-200">{item.title}</td>
                      <td className="px-4 py-5 text-gray-400 text-xs">
                        <FaClock className="inline mr-2"/>{item.totalDays} Days
                      </td>
                      <td className="px-4 py-5 text-right">
                        <Toggle isPublic={item.isPublic ?? false} id={item.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Panel>
      </div>

      <AdItineryPop 
        isOpen={isItenararyOpen} 
        onClose={() => setIsIteneraryOpen(false)} 
        onSave={handleSaveSuccess} 
      />
    </AdminLayout>
  );
};

export default AdItinery;