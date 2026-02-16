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
        <div className={`w-10 h-5 rounded-full transition-colors ${isPublic ? "bg-emerald-600/20 border border-emerald-500/30" : "bg-gray-800 border border-gray-700"}`}>
          <div className={`absolute top-[2px] left-[2px] rounded-full h-4 w-4 transition-transform ${isPublic ? "translate-x-5 bg-emerald-500" : "translate-x-0 bg-gray-500"}`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Itineraries</h2>
            <p className="text-sm text-gray-500 font-medium">Curate and deploy world-class trekking experiences</p>
          </div>
          <button 
            onClick={() => setIsIteneraryOpen(true)} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl text-white font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 text-sm"
          >
            <FaPlus /> Create New Expedition
          </button>
        </header>
      }
    >
      <div className="flex flex-col gap-6">
        
        {/* --- SEARCH & FILTER --- */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0b171f]/50 p-5 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="relative w-full md:w-[450px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by itinerary name..."
              className="w-full pl-12 pr-4 py-3 bg-[#050f14] border border-gray-800 rounded-2xl text-sm text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-[#050f14] border border-gray-800 rounded-2xl px-4 py-1">
              <FaFilter className="text-gray-600 text-[10px] mr-3" />
              <select
                className="bg-transparent py-2.5 text-gray-300 rounded-xl text-xs font-bold outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">ALL STATUSES</option>
                <option value="Active">PUBLIC / LIVE</option>
                <option value="Draft">PRIVATE / DRAFT</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- TABLE PANEL --- */}
        <Panel title="Expedition Registry">
          <div className="overflow-x-auto no-scrollbar">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    <th className="px-6 py-5 w-32">Hero</th>
                    <th className="px-6 py-5">Expedition Details</th>
                    <th className="px-6 py-5">Duration</th>
                    <th className="px-6 py-5 text-right">Deployment</th>
                    <th className="px-6 py-5 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItineraries.length > 0 ? (
                    filteredItineraries.map((item) => {
                      const itemId = item.id || item._id;
                      return (
                        <tr key={itemId} className="group hover:bg-white/[0.02] transition-colors">
                          
                          {/* --- ENHANCED HERO SECTION --- */}
                          <td className="px-6 py-6">
                            <div className="w-24 h-16 rounded-2xl overflow-hidden bg-gray-950 border border-white/10 flex items-center justify-center relative shadow-2xl group-hover:border-emerald-500/50 transition-all duration-500">
                              {item.images ? (
                                <>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <img 
                                    src={item.images} 
                                    alt="" 
                                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                                  />
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-1 opacity-20">
                                  <FaImage className="text-white text-xl" />
                                  <span className="text-[8px] font-bold">NO MEDIA</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-6">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-gray-100 text-lg tracking-tight group-hover:text-emerald-400 transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                <FaGlobeAmericas className="text-emerald-600" size={10}/> {item.theme || "GENERAL EXPEDITION"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2 bg-white/5 w-fit px-4 py-1.5 rounded-xl border border-white/5 text-gray-300 text-xs font-bold">
                              <FaClock className="text-emerald-500" size={12} />
                              {item.totalDays} Days
                            </div>
                          </td>

                          <td className="px-6 py-6 text-right">
                            <Toggle isPublic={item.isPublic ?? false} />
                          </td>

                          <td className="px-6 py-6 relative">
                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === itemId ? null : itemId)}
                              className="p-3 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"
                            >
                              <BsThreeDotsVertical />
                            </button>

                            {activeMenuId === itemId && (
                              <div 
                                ref={menuRef}
                                className="absolute right-12 top-10 w-44 bg-[#0b171f] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
                              >
                                <button 
                                  onClick={() => handleEditClick(itemId)}
                                  className="w-full px-5 py-3 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-emerald-500 hover:text-white transition-colors"
                                >
                                  <FaEdit /> Edit Registry
                                </button>
                                <div className="h-px bg-white/5 mx-2 my-1" />
                                <button 
                                  onClick={() => handleDelete(itemId)}
                                  className="w-full px-5 py-3 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <FaTrash /> Purge Entry
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <FaGlobeAmericas size={40} />
                          <p className="text-sm font-bold uppercase tracking-widest">No Itineraries Logged</p>
                        </div>
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