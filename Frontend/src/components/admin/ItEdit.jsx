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
  FaTrash,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const ItEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 1. Unified State for General Info and Day Items
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    totalDays: 1,
    estimatedCost: 0,
    category: "Adventure",
    coverImage: null,
  });

  const [itineraryItems, setItineraryItems] = useState([]);

  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");
  const inputClass = "w-full p-4 bg-gray-950/50 text-white rounded-2xl border border-gray-800 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-widest block";

  // 2. Add a new Day Component
  const addNewDay = () => {
    const nextDay = itineraryItems.length + 1;
    const newItem = {
      dayNumber: nextDay,
      title: "",
      activityType: "",
      notes: "",
      startTime: "08:00",
      endTime: "10:00",
    };
    setItineraryItems([...itineraryItems, newItem]);
    setFormData(prev => ({ ...prev, totalDays: nextDay }));
  };

  // 3. Handle Item Changes
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...itineraryItems];
    updatedItems[index][name] = value;
    setItineraryItems(updatedItems);
  };

  // 4. Remove a Day
  const removeDay = (index) => {
    const updatedItems = itineraryItems.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, dayNumber: i + 1 })); // Re-index days
    setItineraryItems(updatedItems);
    setFormData(prev => ({ ...prev, totalDays: updatedItems.length }));
  };

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUri}/itineraries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        const data = result.data;

        setFormData({
          title: data.title || "",
          description: data.description || "",
          totalDays: data.totalDays || 1,
          estimatedCost: data.estimatedCost || 0,
          category: data.category || "Adventure",
          coverImage: data.images || null
        });

        // If the API returns existing items, load them here
        setItineraryItems(data.itineraryItems || []);
      } catch (err) {
        console.log(err)
        toast.error("Could not load expedition data.");
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchItinerary();
  }, [id, baseUri, token]);

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-gray-900 rounded-xl text-gray-400 hover:text-white"><FaArrowLeft /></button>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Edit Itinerary</h2>
              <p className="text-sm text-gray-500 font-mono">ID: {id}</p>
            </div>
          </div>
          <button onClick={() => toast.info("Saving Data...")} className="flex items-center gap-2 bg-emerald-600 px-8 py-3 rounded-2xl text-white font-bold"><FaSave /> Update Expedition</button>
        </header>
      }
    >
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        <div className="lg:col-span-8 space-y-8">
          
          <Panel title="General Information">
         
             <div className="space-y-6 mt-4">
                <div>
                  <label className={labelClass}>Itinerary Title</label>
                  <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputClass} />
                </div>
             </div>
          </Panel>

          {/* DYNAMIC DAY COMPONENTS */}
          <div className="space-y-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="w-8 h-px bg-emerald-500"></span> Timeline Breakdown
            </h3>
            
            {itineraryItems.map((item, index) => (
              <Panel key={index} title={`Day ${item.dayNumber}: activity details`}>
                
                <div className=" w-full mx-auto flex flex-row-reverse z-10 ">
                  <button onClick={() => removeDay(index)} className="text-red-500 hover:text-red-400 p-2"><FaTrash size={12}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Activity / Destination</label>
                    <input 
                      name="title" 
                      value={item.title} 
                      onChange={(e) => handleItemChange(index, e)} 
                      className={inputClass} 
                      placeholder="e.g. Arrive at Base Camp" 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Start Time</label>
                    <input type="time" name="startTime" value={item.startTime} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Activity Type</label>
                    <input name="activityType" value={item.activityType} onChange={(e) => handleItemChange(index, e)} className={inputClass} placeholder="Trek / Rest" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Logistics Notes</label>
                    <textarea name="notes" value={item.notes} onChange={(e) => handleItemChange(index, e)} className={`${inputClass} h-24 resize-none`} placeholder="Specific instructions for this day..." />
                  </div>
                </div>
              </Panel>
            ))}

            {/* ADD DAY BUTTON */}
            <div 
              onClick={addNewDay}
              className="p-8 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-emerald-500/50 transition-all cursor-pointer bg-gray-900/10"
            >
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-gray-500 group-hover:text-emerald-500 mb-4 transition-all">
                <FaPlus size={20} />
              </div>
              <h4 className="text-white font-bold mb-1">Add Another Day</h4>
              <p className="text-gray-600 text-xs">Append a new segment to this expedition's timeline.</p>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
         
           <Panel title="Expedition Metrics">
            <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-2xl border border-gray-800">
               <span className="text-xs font-bold text-gray-400">Total Calculated Days</span>
               <span className="text-white font-black">{itineraryItems.length}</span>
            </div>
           </Panel>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ItEdit;