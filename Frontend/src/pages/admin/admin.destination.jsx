import AdminLayout from "./adminLayout";
import { useEffect, useState } from "react";
import Panel from "../../components/admin/Panel";
import PopUp from "../../components/admin/admin.pop";
import DestEdit from "../../components/admin/DestEdit";
import { ToastContainer } from "react-toastify";
import { FaMapMarkerAlt, FaEdit, FaSearch, FaPlus } from "react-icons/fa";
import AuthImage from "./AuthImage"; 

const Adestination = () => {
  const [destStats, setDestStats] = useState({ destinationCount: 0 });
  const [detail, setDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPopOpen, setIsPopOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState(null);

  const [recentChanges, setRecentChanges] = useState([
    { id: 1, action: "System", target: "Dashboard Ready", time: "Connected" },
  ]);

  const handleEditClick = (id) => {
    setSelectedDestId(id);
    setIsEditOpen(true);
  };

  const overView = [
    {
      id: 1,
      title: "Total Destinations",
      num: destStats.destinationCount ?? "0",
      color: "text-emerald-400",
    },
    { id: 2, title: "Activities", num: 0, color: "text-blue-400" },
    { id: 3, title: "Featured Spots", num: 0, color: "text-amber-400" },
  ];

  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return setLoading(false);

      try {
        const [adminRes, destListRes] = await Promise.all([
          fetch(`${baseUri}/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUri}/destinations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!adminRes.ok || !destListRes.ok) throw new Error("API Error");

        const det = await adminRes.json();
        const place = await destListRes.json();
        console.log("First destination:", place.content?.[0]);
        console.log("Images:", place.content?.[0]?.images);
        setDestStats(det);
        setDetail(place.content || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseUri]);

  const handleUpdateDestination = (updatedDest, data, isDeleted = false) => {
    if (isDeleted) {
      setDetail((prev) => prev.filter((item) => item.id !== data));
      setDestStats((prev) => ({
        ...prev,
        destinationCount: Math.max(0, prev.destinationCount - 1),
      }));
      return;
    }

    setDetail((prev) =>
      prev.map((item) =>
        item.id === updatedDest.id ? { ...item, ...updatedDest } : item,
      ),
    );
    setRecentChanges((prev) => [
      {
        id: Date.now(),
        action: "Updated",
        target: updatedDest.name,
        time: "Just now",
      },
      ...prev,
    ]);
  };

  const handleSaveDestination = (newDest) => {
    setDetail((prev) => [newDest, ...prev]);
    setDestStats((prev) => ({
      ...prev,
      destinationCount: (Number(prev.destinationCount) || 0) + 1,
    }));
    setRecentChanges((prev) => [
      {
        id: Date.now(),
        action: "Created",
        target: newDest.name,
        time: "Just now",
      },
      ...prev,
    ]);
  };

  const DetailContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Fetching locations...</p>
        </div>
      );
    }

    const filteredDetail = detail.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()),
    );

    if (filteredDetail.length === 0) {
      return (
        <div className="text-gray-500 text-center py-20 border-2 border-dashed border-gray-800 rounded-xl mt-4">
          No destinations found matching "{search}"
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">
        {filteredDetail.map((item) => {
          const hasImage = item.images && item.images.length > 0;
          
         const imageUrl = hasImage ? item.images[0].imageUrl : null
          return (
            <div
              key={item.id}
              className="group flex flex-col bg-gray-900/40 hover:bg-gray-800/60 transition-all duration-300 rounded-2xl border border-gray-800 hover:border-emerald-500/50 overflow-hidden"
            >
              {/* Card Image Area - Using AuthImage Component */}
              <div className="relative h-44 w-full bg-gray-950 overflow-hidden">
                {imageUrl ? (
                  <AuthImage 
                    src={imageUrl}
                    alt={item.name || "Destination"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    fallbackLetter={item.name.charAt(0) || "?"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800 font-black text-5xl">
                    {item.name.charAt(0) || "?"}
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                  {item.type || "Natural"}
                </div>
              </div>

              {/* Card Content Area */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors truncate">
                    {item.name}
                  </h2>
                </div>

                <div className="flex items-center gap-1 text-gray-500 text-[10px] mb-3 uppercase font-bold tracking-tighter">
                  <FaMapMarkerAlt className="text-emerald-500" />
                  {item.district}, {item.province}
                </div>

                <p className="text-gray-400 text-xs line-clamp-2 mb-5 leading-relaxed">
                  {item.shortDescription ||
                    "No description provided for this location."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-gray-500 font-black tracking-widest">
                      Difficulty
                    </span>
                    <span
                      className={`text-xs font-bold ${item.difficultyLevel === "HARD" ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {item.difficultyLevel || "EASY"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEditClick(item.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                  >
                    <FaEdit size={12} /> Edit Asset
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Destinations
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Manage your global travel inventory and assets
            </p>
          </div>
          <button
            onClick={() => setIsPopOpen(true)}
            className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl transition-all duration-300 text-white font-bold shadow-xl shadow-emerald-900/40"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform" />
            Add New Destination
          </button>
        </header>
      }
    >
      <ToastContainer theme="dark" position="top-right" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cards Grid */}
        <div className="lg:col-span-8">
          <Panel title={"Active Inventory"}>
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search by name, district or type..."
                className="w-full p-4 pl-12 bg-gray-950/50 text-white rounded-2xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DetailContent />
          </Panel>
        </div>

        {/* Right: Stats & Logs */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Panel title={"System Metrics"}>
            <div className="grid grid-cols-1 gap-4">
              {overView.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-950/40 p-5 flex justify-between items-center rounded-2xl border border-gray-800 group hover:border-emerald-500/30 transition-all"
                >
                  <span className="font-bold text-xs uppercase tracking-widest text-gray-500">
                    {item.title}
                  </span>
                  <span className={`text-2xl font-black ${item.color}`}>
                    {item.num}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={"Activity Log"}>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {recentChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-start gap-4 p-4 bg-gray-950/30 border border-gray-800 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50"></div>
                  <div className="flex flex-col">
                    <p className="text-[13px] text-gray-300">
                      <span className="font-black text-emerald-500 uppercase text-[10px] mr-2">
                        {change.action}
                      </span>
                      {change.target}
                    </p>
                    <span className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-tighter">
                      {change.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Modals */}
      <PopUp
        isOpen={isPopOpen}
        onClose={() => setIsPopOpen(false)}
        onSave={handleSaveDestination}
      />

      {isEditOpen && (
        <DestEdit
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          destId={selectedDestId}
          onSave={handleUpdateDestination}
        />
      )}
    </AdminLayout>
  );
};

export default Adestination;