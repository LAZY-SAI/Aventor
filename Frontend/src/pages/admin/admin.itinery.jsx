import AdminLayout from "./adminLayout";
import AdItineryPop from "../../components/admin/admin.itineraypop";
import { 
  FaPlus, 
  FaSearch, 
  FaClock, 
  FaEdit, 
  FaTrash, 
  FaFilter, 
  FaImage,
  FaGlobeAmericas
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Panel from "../../components/admin/Panel";
import { toast } from "react-toastify";

const AdItinery = () => {
  const [isItenararyOpen, setIsIteneraryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeMenuId, setActiveMenuId] = useState(null); 
  
  const navigate = useNavigate();
  const menuRef = useRef(null); 
  const token = localStorage.getItem("accessToken");
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditClick = (id) => {
    navigate(`/admin/editItinerary/${id}/items`);
  };

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
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }, [baseUri, token]);

  useEffect(() => {
    if (token) fetchItineraries();
  }, [fetchItineraries, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this itinerary?")) return;
    try {
      const res = await fetch(`${baseUri}/itineraries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Deleted successfully");
        setItineraries(prev => prev.filter(item => (item.id || item._id) !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
    }
    setActiveMenuId(null);
  };

  const filteredItineraries = itineraries.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const itemStatus = item.isPublic ? "Active" : "Draft";
    const matchesStatus = statusFilter === "All Status" || itemStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const Toggle = ({ isPublic }) => (
    <div className="flex items-center justify-end gap-3">
      <span className={`text-[9px] font-black uppercase tracking-widest ${isPublic ? "text-emerald-500" : "text-gray-600"}`}>
        {isPublic ? "Live" : "Draft"}
      </span>
      <div className="relative inline-flex items-center">
        <div className={`w-10 h-5 rounded-full transition-colors ${isPublic ? "bg-emerald-600" : "bg-gray-800"}`}>
          <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform ${isPublic ? "translate-x-5" : "translate-x-0"}`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Itineraries</h2>
            <p className="text-sm text-gray-500 font-medium">Manage curated travel experiences</p>
          </div>
          <button 
            onClick={() => setIsIteneraryOpen(true)} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            <FaPlus /> Create Itinerary
          </button>
        </header>
      }
    >
      <div className="flex flex-col gap-6">
        
        {/* --- SEARCH & FILTER SECTION --- */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-gray-800/50">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search by title..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-sm text-white outline-none focus:border-emerald-500/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <FaFilter className="text-gray-600 text-xs hidden md:block" />
            <select
              className="w-full md:w-40 px-4 py-2.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold outline-none cursor-pointer hover:border-gray-700 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Public (Live)</option>
              <option value="Draft">Private (Draft)</option>
            </select>
          </div>
        </div>

        {/* --- TABLE PANEL --- */}
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
                    <th className="px-4 py-4 w-20">Hero</th>
                    <th className="px-4 py-4">Itinerary Name</th>
                    <th className="px-4 py-4">Duration</th>
                    <th className="px-4 py-4 text-right">Visibility</th>
                    <th className="px-4 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredItineraries.length > 0 ? (
                    filteredItineraries.map((item) => {
                      const itemId = item.id || item._id;
                      return (
                        <tr key={itemId} className="group hover:bg-gray-800/30 transition-colors">
                          {/* Image Preview */}
                          <td className="px-4 py-5">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center relative">
                              {item.images ? (
                                <img 
                                  src={item.images} 
                                  alt="" 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <FaImage className="text-gray-700 text-lg" />
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-200">{item.title}</span>
                              <span className="text-[10px] text-gray-500 uppercase tracking-tighter flex items-center gap-1">
                                <FaGlobeAmericas size={8}/> {item.theme || "No Theme"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2 bg-gray-950/50 w-fit px-3 py-1 rounded-full border border-gray-800/50 text-gray-400 text-xs">
                              <FaClock className="text-emerald-500" size={10} />
                              {item.totalDays} Days
                            </div>
                          </td>

                          <td className="px-4 py-5 text-right">
                            <Toggle isPublic={item.isPublic ?? false} />
                          </td>

                          <td className="px-4 py-5 relative">
                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === itemId ? null : itemId)}
                              className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-all"
                            >
                              <BsThreeDotsVertical />
                            </button>

                            {activeMenuId === itemId && (
                              <div 
                                ref={menuRef}
                                className="absolute right-10 top-5 w-36 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-150"
                              >
                                <button 
                                  onClick={() => handleEditClick(itemId)}
                                  className="w-full px-4 py-2 flex items-center gap-3 text-xs font-bold text-gray-300 hover:bg-emerald-500 hover:text-white transition-colors"
                                >
                                  <FaEdit /> Update
                                </button>
                                <button 
                                  onClick={() => handleDelete(itemId)}
                                  className="w-full px-4 py-2 flex items-center gap-3 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-gray-600 text-sm italic">
                        No itineraries discovered. Create your first expedition.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Panel>
      </div>

      <AdItineryPop 
        isOpen={isItenararyOpen} 
        onClose={() => setIsIteneraryOpen(false)} 
        onSave={fetchItineraries} 
      />
    </AdminLayout>
  );
};

export default AdItinery;