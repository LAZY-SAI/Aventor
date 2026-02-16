import { useState, useEffect, useRef } from "react";
import Model from "../Model";
import { toast } from "react-toastify";
import {
  FaArrowRight,
  FaCheck,
  FaImage,
  FaTimes,
  FaUpload,
  FaMapMarkerAlt
} from "react-icons/fa";

const AdItineryPop = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [createdId, setCreatedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validDestination, setValidDestination] = useState(null); 
  const fileInputRef = useRef(null);

  const initialItineraryState = {
    title: "",
    description: "",
    theme: "",
    totalDays: "",
    startDate: "",
    endDate: "",
    estimatedBudget: "",
    isPublic: false,
  };

  const initialItemState = {
    dayNumber: 1,
    orderInDay: 1,
    title: "",
    notes: "",
    startTime: "08:00:00",
    endTime: "10:00:00",
    activityType: "",
    estimatedCost: 0,
    isVisited: true,
  };

  const [formData, setFormData] = useState(initialItineraryState);
  const [itemData, setItemData] = useState(initialItemState);

  const token = localStorage.getItem("accessToken");
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialItineraryState);
      setItemData(initialItemState);
      setStep(1);
      setCreatedId(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidDestination(null); 
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large (Max 5MB)");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleItineraryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    
   
    if ((name === "startTime" || name === "endTime") && value) {
      
      const formattedValue = value.length === 5 ? `${value}:00` : value;
      setItemData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setItemData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatTimeToString = (timeStr) => {
    if (!timeStr) return "00:00:00";
    
 
    if (timeStr.length === 8 && timeStr.split(":").length === 3) {
      return timeStr;
    }
    
    // If in HH:MM format, append :00
    if (timeStr.length === 5 && timeStr.split(":").length === 2) {
      return `${timeStr}:00`;
    }
    
    return timeStr;
  };

  const formatTimeToObj = (timeStr) => {
    if (!timeStr) return { hour: 0, minute: 0, second: 0, nano: 0 };
    
    
    const parts = timeStr.split(":");
    const hour = parseInt(parts[0]) || 0;
    const minute = parseInt(parts[1]) || 0;
    const second = parseInt(parts[2]) || 0;
    const nano = parseInt(parts[3])||0
    return { 
      hour: hour, 
      minute: minute, 
      second: second, 
      nano: nano
    };
  };


  const checkValidDestination = async (titleToCheck) => {
    try {
      const response = await fetch(`${baseUri}/destinations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }

      const data = await response.json();
      console.log("All Destinations:", data);

   
      const destinations = data.content || data.data || data;

      const matchedDestination = Array.isArray(destinations) 
        ? destinations.find(dest => 
            dest.name?.toLowerCase() === titleToCheck.toLowerCase()
          )
        : null;

      if (matchedDestination) {
        console.log("Found matching destination:", matchedDestination);
        setValidDestination(matchedDestination);
        return matchedDestination;
      } else {
        console.log("No matching destination found for:", titleToCheck);
        setValidDestination(null);
        return null;
      }
    } catch (error) {
      console.error("Error checking destinations:", error);
      toast.error("Failed to verify destination");
      return null;
    }
  };

  const submitStepOne = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
   
      const destination = await checkValidDestination(formData.title);

      if (!destination) {
        toast.error("Not a valid destination. Please create the destination first or use an existing destination name.");
        setLoading(false);
        return;
      }


      const data = new FormData();
      const jsonBlob = new Blob([JSON.stringify(formData)], { type: "application/json" });
      data.append("data", jsonBlob);
      if (selectedFile) data.append("files", selectedFile);

      const res = await fetch(`${baseUri}/create/itinerary`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();
      console.log("Step 1 Response:", result);

      if (res.ok) {
        const itineraryId = result.id || result.data?.id;

        if (!itineraryId) {
          toast.error("Failed to get itinerary ID");
          console.error("Response structure:", result);
          return;
        }

        setCreatedId(itineraryId);
        setItemData((prev) => ({
          ...prev,
          estimatedCost: formData.estimatedBudget || 0,
        }));
        setStep(2);
        toast.success("Itinerary Initialized!");
      } else {
        toast.error(result.message || "Failed to initialize");
      }
    } catch (err) {
      console.error("Step 1 Error:", err);
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const submitStepTwo = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Validate destination exists
    if (!validDestination || !validDestination.id) {
      toast.error("No valid destination found. Please go back and verify.");
      setLoading(false);
      return;
    }

    // ✅ Validate time logic
    const startHour = parseInt(itemData.startTime.split(':')[0]);
    const startMinute = parseInt(itemData.startTime.split(':')[1]);
    const endHour = parseInt(itemData.endTime.split(':')[0]);
    const endMinute = parseInt(itemData.endTime.split(':')[1]);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) {
      toast.error("End time must be after start time!");
      setLoading(false);
      return;
    }

    // ✅ Validate all required fields
    if (!itemData.title || itemData.title.trim() === '') {
      toast.error("Activity title is required");
      setLoading(false);
      return;
    }

    if (itemData.dayNumber < 1) {
      toast.error("Day number must be at least 1");
      setLoading(false);
      return;
    }

    if (itemData.orderInDay < 1) {
      toast.error("Order in day must be at least 1");
      setLoading(false);
      return;
    }

    const payload = {
      destinationId: validDestination.id, // ✅ Use the validated destination ID
      dayNumber: parseInt(itemData.dayNumber),
      orderInDay: parseInt(itemData.orderInDay),
      title: itemData.title,
      notes: itemData.notes || "",
      startTime: formatTimeToString(itemData.startTime), // ✅ Send as "HH:MM:SS" string
      endTime: formatTimeToString(itemData.endTime),     // ✅ Send as "HH:MM:SS" string
      activityType: itemData.activityType || "",
      estimatedCost: parseFloat(itemData.estimatedCost) || 0,
      isVisited: itemData.isVisited,
    };

    console.log("Step 2 Payload:", JSON.stringify(payload, null, 2));
    console.log("Adding to Itinerary ID:", createdId);
    console.log("Using Destination ID:", validDestination.id);

    try {
      const res = await fetch(`${baseUri}/itinerary/${createdId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Step 2 Response:", result);

      if (res.ok) {
        toast.success("Activities Synced!");
        if (onSave) onSave();
        onClose();
      } else {
        toast.error(result.message || "Failed to add activity");
        console.error("Step 2 Error Response:", result);
      }
    } catch (err) {
      console.error("Step 2 Network Error:", err);
      toast.error("Sync error.");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ label, name, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={!!checked} onChange={onChange} className="sr-only peer" />
        <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
      </label>
    </div>
  );

  const inputClass = "w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700";
  const labelClass = "block text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-[0.15em]";

  return (
    <Model isOpen={isOpen} onClose={onClose} title={step === 1 ? "Initialize Expedition" : "Define Timeline"}>
      <div className="relative overflow-hidden">
        {/* Progress Tracker */}
        <div className="flex w-full h-1.5 bg-gray-900 overflow-hidden">
          <div className={`h-full bg-emerald-500 transition-all duration-700 ease-in-out ${step === 1 ? "w-1/3" : "w-full"}`} />
        </div>

        <div className={`flex transition-transform duration-500 ease-in-out ${step === 2 ? "-translate-x-full" : "translate-x-0"}`}>
          
          {/* STEP 1: GENERAL INFO */}
          <form onSubmit={submitStepOne} className="min-w-full px-8 py-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
            <div>
              <label className={labelClass}>Hero Cover Image</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                className={`relative group w-full h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  previewUrl ? "border-emerald-500/50" : "border-gray-800 hover:border-gray-600 bg-gray-900/20"
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-bold flex items-center gap-2"><FaUpload /> Change Image</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10">
                      <FaTimes size={10} />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <FaImage className="mx-auto text-gray-700 mb-2" size={24} />
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Click to upload banner</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Itinerary Name (must match existing destination)</label>
              <input name="title" required value={formData.title} onChange={handleItineraryChange} className={inputClass} placeholder="e.g. Himalayan Secrets" />
              <p className="text-[9px] text-gray-500 mt-1 ml-1">⚠️ Must match an existing destination name exactly</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Duration (Days)</label>
                <input type="number" name="totalDays" required value={formData.totalDays} onChange={handleItineraryChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Estimated Budget</label>
                <input type="number" name="estimatedBudget" required value={formData.estimatedBudget} onChange={handleItineraryChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Category/Theme</label>
              <input name="theme" value={formData.theme} onChange={handleItineraryChange} className={inputClass} placeholder="Culture/Solo" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input className={inputClass} value={formData.startDate} type="date" name="startDate" onChange={handleItineraryChange} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input className={inputClass} value={formData.endDate} type="date" name="endDate" onChange={handleItineraryChange} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3">
              {loading ? "Processing..." : "Continue to Timeline"} <FaArrowRight size={12} />
            </button>
          </form>

          {/* STEP 2: ACTIVITY INFO */}
          <form onSubmit={submitStepTwo} className="min-w-full px-8 py-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
            
            {/* --- PERSISTENT PREVIEW FROM STEP 1 --- */}
            <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
              {previewUrl ? (
                <img src={previewUrl} alt="Selected Hero" className="w-full h-full object-cover opacity-60" />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center"><FaImage className="text-gray-800" size={30}/></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent flex flex-col justify-end p-4">
                <p className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em]">Add Activity to</p>
                <h4 className="text-white font-bold text-sm truncate">{formData.title || "New Expedition"}</h4>
              </div>
            </div>

            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Database Linked</p>
                <p className="text-gray-500 font-mono text-[10px] truncate w-40">Itinerary: {createdId}</p>
                {validDestination && (
                  <p className="text-gray-500 font-mono text-[10px] truncate w-40">Destination: {validDestination.id}</p>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><FaCheck size={12} /></div>
            </div>

            <div>
              <label className={labelClass}>Activity / Destination</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                <input name="title" required value={itemData.title} onChange={handleItemChange} className={`${inputClass} pl-10`} placeholder="Check-in at Boutique Hotel" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Day Number</label>
                <input 
                  type="number" 
                  name="dayNumber" 
                  required
                  value={itemData.dayNumber} 
                  onChange={handleItemChange} 
                  className={inputClass}
                  min="1"
                />
              </div>
              <div>
                <label className={labelClass}>Order in Day</label>
                <input 
                  type="number" 
                  name="orderInDay" 
                  required
                  value={itemData.orderInDay} 
                  onChange={handleItemChange} 
                  className={inputClass}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Activity Type</label>
                <input name="activityType" value={itemData.activityType} onChange={handleItemChange} className={inputClass} placeholder="Transport / Meal / Sightseeing" />
              </div>

              <div>
                <label className={labelClass}>Estimated Cost</label>
                <input 
                  name="estimatedCost"
                  type="number"
                  className={inputClass} 
                  value={itemData.estimatedCost} 
                  onChange={handleItemChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Time</label>
                <input 
                  className={inputClass} 
                  type="time" 
                  name="startTime" 
                  value={itemData.startTime} 
                  onChange={handleItemChange} 
                  step="1"
                  required 
                />
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input 
                  className={inputClass} 
                  type="time" 
                  name="endTime" 
                  value={itemData.endTime} 
                  onChange={handleItemChange} 
                  step="1"
                  required 
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Administrative Notes</label>
              <textarea name="notes" rows={3} value={itemData.notes} onChange={handleItemChange} className={`${inputClass} resize-none`} placeholder="Details for travelers..." />
            </div>

            <div className="space-y-3 pt-2">
              <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3">
                {loading ? "Finalizing..." : "Publish Activity"} <FaCheck size={12} />
              </button>
              <button type="button" onClick={onClose} className="w-full py-2 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-colors">Finish & Close</button>
            </div>
          </form>
        </div>
      </div>
    </Model>
  );
};

export default AdItineryPop;