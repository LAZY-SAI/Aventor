import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../pages/admin/adminLayout";
import {
  FaSave, FaPlus, FaArrowLeft, FaTrash,
  FaSortNumericDown, FaCamera, FaImage
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const INITIAL_ITEM_TEMPLATE = {
  id: null,
  dayNumber: 1,
  orderInDay: 1,
  title: "",
  activityType: "",
  notes: "",
  startTime: "08:00:00",
  endTime: "10:00:00",
  isVisited: false,
  estimatedCost: 0,
  destination: null,
  images:null
};

const ItEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Image States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    totalDays: 1,
    estimatedBudget: 0,
    startDate: "",
    endDate: "",
    status: "TEMPLATE",
    theme: "",
  });

  const [itineraryItems, setItineraryItems] = useState([INITIAL_ITEM_TEMPLATE]);

  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200 hover:bg-white/10";
  const labelClass = "text-xs font-bold text-slate-400 mb-1.5 ml-1 tracking-wide block uppercase";

  const formatTimeToString = (timeVal) => {
    if (!timeVal) return "08:00";
    if (typeof timeVal === "object") {
      const h = String(timeVal.hour || 0).padStart(2, "0");
      const m = String(timeVal.minute || 0).padStart(2, "0");
      return `${h}:${m}`;
    }
    return typeof timeVal === "string" ? timeVal.substring(0, 5) : "08:00";
  };

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUri}/itineraries/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const data = result.data;
        console.log(data)
        if (data) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            totalDays: data.totalDays || 1,
            estimatedBudget: data.estimatedBudget || 0,
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            status: data.status || "TEMPLATE",
            theme: data.theme || "",
            images:data.images?.[0].url||""
          });

         
          if (data.images?.[0]?.url) {
            setImagePreview(data.images[0].url);
          }

          if (data.items && data.items.length > 0) {
            const formattedItems = data.items.map((item, index) => ({
              ...item,
              dayNumber: item.dayNumber || 1,
              orderInDay: item.orderInDay || index + 1,
              startTime: formatTimeToString(item.startTime),
              endTime: formatTimeToString(item.endTime),
            }));
            setItineraryItems(formattedItems);
          }
        }
      } catch (err) {
        toast.error("Failed to load itinerary.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchItinerary();
  }, [id, baseUri, token]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...itineraryItems];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setItineraryItems(updatedItems);
  };

  const addNewDay = () => {
    const lastItem = itineraryItems[itineraryItems.length - 1];
    setItineraryItems([
      ...itineraryItems,
      {
        ...INITIAL_ITEM_TEMPLATE,
        dayNumber: lastItem ? parseInt(lastItem.dayNumber) : 1,
        orderInDay: lastItem ? parseInt(lastItem.orderInDay) + 1 : 1,
      },
    ]);
  };

  const removeDay = (index) => {
    if (itineraryItems.length === 1) return;
    setItineraryItems(itineraryItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const toastId = toast.loading("Syncing expedition data...");
    try {

      const dataPayload = new FormData();
      dataPayload.append("title", formData.title);
      dataPayload.append("description", formData.description);
      dataPayload.append("totalDays", parseInt(formData.totalDays));
      dataPayload.append("estimatedBudget", parseFloat(formData.estimatedBudget));
      dataPayload.append("startDate", formData.startDate);
      dataPayload.append("endDate", formData.endDate);
      dataPayload.append("status", formData.status);
      dataPayload.append("theme", formData.theme);
      
      if (imageFile) {
        dataPayload.append("image", imageFile);
      }

      const headerRes = await fetch(`${baseUri}/itineraries/${id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}` 
         
        },
        body: dataPayload,
      });
      
      if (!headerRes.ok) throw new Error("Header update failed");

      const existingItems = itineraryItems.filter((item) => item.id);
      const newItems = itineraryItems.filter((item) => !item.id);
      const sharedDestinationId = existingItems[0]?.destination?.id || itineraryItems[0]?.destination?.id;

      if (!sharedDestinationId) {
        toast.update(toastId, { render: "Error: No destination linked.", type: "error", isLoading: false, autoClose: 3000 });
        return;
      }

      // 2. Update Existing Items
      if (existingItems.length > 0) {
        await Promise.all(
          existingItems.map((item) =>
            fetch(`${baseUri}/itineraries/${id}/items/${item.id}`, {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                destinationId: item.destination?.id || sharedDestinationId,
                dayNumber: parseInt(item.dayNumber),
                orderInDay: parseInt(item.orderInDay),
                title: item.title,
                notes: item.notes || "",
                activityType: item.activityType || "",
                isVisited: item.isVisited || false,
                estimatedCost: parseFloat(item.estimatedCost) || 0,
                startTime: item.startTime,
                endTime: item.endTime,
              }),
            })
          )
        );
      }

      // 3. Create New Items
      if (newItems.length > 0) {
        const createRes = await fetch(`${baseUri}/itinerary/${id}/items`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            itineraryItems: newItems.map((item) => ({
              destinationId: sharedDestinationId,
              dayNumber: parseInt(item.dayNumber),
              orderInDay: parseInt(item.orderInDay),
              title: item.title,
              notes: item.notes || "",
              activityType: item.activityType || "",
              isVisited: false,
              estimatedCost: parseFloat(item.estimatedCost) || 0,
              startTime: item.startTime,
              endTime: item.endTime,
            })),
          }),
        });
        if (!createRes.ok) throw new Error("Failed to create new activities");
      }

      toast.update(toastId, { render: "Expedition updated!", type: "success", isLoading: false, autoClose: 2000 });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.update(toastId, { render: err.message, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-emerald-500 font-bold tracking-widest animate-pulse">LOADING EXPEDITION...</div>;

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
        <ToastContainer theme="dark" position="top-center" />

        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 py-6 backdrop-blur-md border-b border-white/5 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-slate-400 transition-all">
              <FaArrowLeft size={14} />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Edit Expedition <span className="text-emerald-500 ml-2">#{id}</span></h1>
          </div>
          <button onClick={handleSave} className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all">
            <FaSave /> Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Header Configuration Section */}
            <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-8">
              <div className="border-b border-white/5 pb-4 mb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Primary Metadata</h2>
                  <p className="text-slate-500 text-xs mt-1">Basic information and media</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Input Section */}
                <div className="md:col-span-2 space-y-4">
                  <label className={labelClass}>Expedition Cover Image</label>
                  <div className="relative group">
                    <div className={`relative w-full h-72 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                      ${imagePreview ? 'border-emerald-500/50 bg-black/20' : 'border-white/10 hover:border-emerald-500/30 bg-white/5'}`}>
                      
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-center">
                              <FaCamera className="mx-auto text-2xl text-white mb-2" />
                              <p className="text-white font-bold text-sm">Change Expedition Photo</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaImage className="text-2xl text-slate-600" />
                          </div>
                          <p className="text-slate-400 font-medium">Click or drag to upload header image</p>
                          <p className="text-slate-600 text-[10px] uppercase mt-2 tracking-widest font-bold">Recommended: 1920x1080px</p>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        name="image"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                    </div>
                    {imagePreview && (
                      <button 
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-4 right-4 bg-red-500/20 backdrop-blur-md text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all z-20"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Itinerary Name</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} className={inputClass} placeholder="Enter title..." />
                </div>

                <div>
                  <label className={labelClass}>Total Days</label>
                  <input name="totalDays" type="number" value={formData.totalDays} onChange={handleInputChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Estimated Budget ($)</label>
                  <input name="estimatedBudget" type="number" value={formData.estimatedBudget} onChange={handleInputChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Start Date</label>
                  <input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>End Date</label>
                  <input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                    <option value="TEMPLATE" className="bg-slate-900">TEMPLATE</option>
                    <option value="PUBLISHED" className="bg-slate-900">PUBLISHED</option>
                    <option value="DRAFT" className="bg-slate-900">DRAFT</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Theme / Category</label>
                  <input name="theme" value={formData.theme} onChange={handleInputChange} className={inputClass} placeholder="e.g. Adventure, Luxury" />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputClass} min-h-[120px] py-4`} placeholder="Describe this expedition..." />
                </div>
              </div>
            </section>

            {/* Timeline Activities Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-white font-bold text-lg">Timeline Workflow</h2>
                <span className="text-slate-500 text-sm font-medium">{itineraryItems.length} Activities Planned</span>
              </div>

              {itineraryItems.map((item, index) => (
                <div key={index} className="group relative border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] transition-all border-l-4 border-l-emerald-500/30 bg-white/[0.01]">
                  <div className="absolute -left-3 top-8 w-6 h-6 bg-emerald-500 text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-xl shadow-emerald-500/20">
                    {item.dayNumber}
                  </div>
                  
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-tighter border border-emerald-500/20">Day {item.dayNumber}</span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-80">Activity Detail</h3>
                    </div>
                    <button onClick={() => removeDay(index)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white transition-all">
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Activity Title</label>
                      <input name="title" value={item.title} onChange={(e) => handleItemChange(index, e)} className={inputClass} placeholder="e.g. Sunrise Trek, Breakfast at Lakeside" />
                    </div>

                    <div>
                      <label className={labelClass}>Order in Day</label>
                      <div className="relative">
                        <FaSortNumericDown className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input type="number" name="orderInDay" value={item.orderInDay} onChange={(e) => handleItemChange(index, e)} className={`${inputClass} pl-10`} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Start Time</label>
                      <input type="time" name="startTime" value={item.startTime} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>End Time</label>
                      <input type="time" name="endTime" value={item.endTime} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>Est. Cost ($)</label>
                      <input type="number" name="estimatedCost" value={item.estimatedCost} onChange={(e) => handleItemChange(index, e)} className={inputClass} />
                    </div>

                    <div>
                      <label className={labelClass}>Activity Type</label>
                      <input type="text" name="activityType" value={item.activityType} onChange={(e) => handleItemChange(index, e)} className={inputClass} placeholder="e.g. Transport, Meal" />
                    </div>

                    <div className="md:col-span-3">
                      <label className={labelClass}>Notes / Instructions</label>
                      <input name="notes" value={item.notes || ""} onChange={(e) => handleItemChange(index, e)} className={inputClass} placeholder="Special instructions for this activity..." />
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addNewDay} className="w-full py-10 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center group hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all text-emerald-500">
                  <FaPlus />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-500 transition-colors">Append New Activity</span>
              </button>
            </div>
          </div>

          {/* Fixed Summary Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-6">
            <div className="bg-emerald-500 rounded-3xl p-8 text-black shadow-2xl shadow-emerald-500/20">
              <p className="text-[10px] font-black uppercase mb-4 opacity-60 tracking-widest">Projected Budget</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">$</span>
                <p className="text-5xl font-black">{formData.estimatedBudget || 0}</p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
               <h4 className="text-white font-bold text-sm mb-4 border-b border-white/5 pb-3">Quick Stats</h4>
               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase">Duration</span>
                    <span className="text-white">{formData.totalDays} Days</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase">Activities</span>
                    <span className="text-white">{itineraryItems.length} items</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase">Average Daily Cost</span>
                    <span className="text-emerald-500">${(formData.estimatedBudget / (formData.totalDays || 1)).toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
              <p className="text-blue-400 text-[10px] font-bold uppercase mb-2">Editor Note</p>
              <p className="text-blue-200/70 text-xs leading-relaxed">Changes made to the timeline will be synced across all traveler instances currently following this template.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ItEdit;