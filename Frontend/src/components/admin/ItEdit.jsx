import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../pages/admin/adminLayout";
import Panel from "../../components/admin/Panel";
import {
  FaSave,
  FaPlus,
  FaArrowLeft,
  FaImage,
  FaClock,
  FaTag,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const ItEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State for itinerary data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    totalDays: 1,
    estimatedCost: 0,
    destination: "",
    category: "Adventure",
    images: null,
  });
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const inputClass =
    "w-full p-4 bg-gray-950/50 text-white rounded-2xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all";
  const labelClass =
    "text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-widest block";
  const token = localStorage.getItem("accessToken");
  useEffect(() => {
  const fetchItinerary = async () => {
    try {
      setLoading(true);
    
      const res = await fetch(`${baseUri}/itineraries/${id}`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error("Failed to fetch itinerary");
    
      const result = await res.json();
      const data = result.data; 
      console.log(data)
     
      setFormData({
        title: data.title || "",
        description: data.description || "",
        totalDays: data.totalDays || 1,
        price: data.estimatedCost8 || 0,
        destination: data.destination || "",
        category: data.category || "Adventure",
        coverImage: data.images || null
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not load expedition data.");
    } finally {
      setLoading(false);
    }
  };

  if (id && token) {
    fetchItinerary();
  }
}, [id, baseUri, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    toast.success("Itinerary updated successfully!");
   
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-screen flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-500">
            Loading Expedition Data...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-gray-900 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Edit Itinerary
              </h2>
              <p className="text-sm text-gray-500 font-medium font-mono uppercase tracking-tighter">
                ID: {id}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-2xl text-gray-400 font-bold hover:bg-gray-900 transition-all">
              Discard
            </button>
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-2xl text-white font-bold shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <FaSave /> Update Expedition
            </button>
          </div>
        </header>
      }
    >
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* Main Editor Section */}
        <div className="lg:col-span-8 space-y-8">
          <Panel title="General Information">
            <div className="space-y-6 mt-4">
              <div>
                <label className={labelClass}>Itinerary Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter a captivating name..."
                />
              </div>

              <div>
                <label className={labelClass}>Overview Description</label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Describe the journey experience..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* <div>
                  <label className={labelClass}>Primary Destination</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      className={`${inputClass} pl-12`}
                    />
                  </div>
                </div> */}
                <div>
                  <label className={labelClass}>Experience Category</label>
                  <div className="relative">
                    <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`${inputClass} pl-12`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Detailed Itinerary Content">
            <div className="p-8 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-emerald-500/50 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-gray-500 group-hover:text-emerald-500 mb-4 transition-all">
                <FaPlus size={20} />
              </div>
              <h4 className="text-white font-bold mb-1">Add Day Component</h4>
              <p className="text-gray-600 text-xs">
                Manage timeline events, meals, and accommodations.
              </p>
            </div>
          </Panel>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
          <Panel title="Banner Assets">
            <div className="mt-4 space-y-4">
              <div className="aspect-video rounded-2xl bg-gray-900 overflow-hidden border border-gray-800 relative group">
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-white border border-white/20 hover:bg-emerald-500 transition-all">
                    <FaImage />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-600 font-bold uppercase text-center tracking-widest italic px-4">
                Recommended size: 1920x1080 (JPG/PNG)
              </p>
            </div>
          </Panel>

          <Panel title="Expedition Metrics">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <FaClock />
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    Duration
                  </span>
                </div>
                <input
                  type="number"
                  name="totalDays"
                  value={formData.totalDays}
                  onChange={handleChange}
                  className="bg-transparent text-right text-white font-black w-16 outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <FaTag />
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    Estimated Cost ($)
                  </span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  className="bg-transparent text-right text-white font-black w-24 outline-none"
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ItEdit;
