import { useState, useEffect, useRef } from "react";
import Model from "../Model";
import { toast } from "react-toastify";
import {
  FaArrowRight,
  FaCheck,
  FaImage,
  FaTimes,
  FaUpload,
  FaMapMarkerAlt,
  FaSearch
} from "react-icons/fa";

const AdItineryPop = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [createdId, setCreatedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validDestination, setValidDestination] = useState(null);
  
  // --- NEW STATES FOR AUTOFILL ---
  const [allDestinations, setAllDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

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
    if (isOpen) {
      const fetchDestinations = async () => {
        try {
          const res = await fetch(`${baseUri}/destinations`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          const list = data.content || data.data || data;
          setAllDestinations(Array.isArray(list) ? list : []);
        } catch (err) {
          console.error("Failed to load destinations", err);
        }
      };
      fetchDestinations();
    } else {
      // Reset logic
      setFormData(initialItineraryState);
      setItemData(initialItemState);
      setStep(1);
      setCreatedId(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidDestination(null);
      setShowDropdown(false);
    }
  }, [isOpen]);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // --- UPDATED HANDLE CHANGE FOR AUTOFILL ---
  const handleItineraryChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (name === "title") {
      if (value.length > 0) {
        const filtered = allDestinations.filter((dest) =>
          dest.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredDestinations(filtered);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }
  };

  const selectDestination = (dest) => {
    setFormData((prev) => ({ ...prev, title: dest.name }));
    setValidDestination(dest);
    setShowDropdown(false);
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

  // const formatTimeToString = (timeStr) => {
  //   if (!timeStr) return "00:00:00";
  //   if (timeStr.length === 8) return timeStr;
  //   if (timeStr.length === 5) return `${timeStr}:00`;
  //   return timeStr;
  // };

  const submitStepOne = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
 
      const match = allDestinations.find(
        (d) => d.name.toLowerCase() === formData.title.toLowerCase()
      );

      if (!match) {
        toast.error("Invalid destination. Please select from the dropdown.");
        setLoading(false);
        return;
      }

      setValidDestination(match);

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
      if (res.ok) {
        const itineraryId = result.id || result.data?.id;
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
      toast.error("Network error.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const submitStepTwo = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      destinationId: validDestination.id,
      dayNumber: parseInt(itemData.dayNumber),
      orderInDay: parseInt(itemData.orderInDay),
      title: itemData.title,
      notes: itemData.notes || "",
      startTime: itemData.startTime,
      endTime: itemData.endTime,
      activityType: itemData.activityType || "",
      estimatedCost: parseFloat(itemData.estimatedCost) || 0,
      isVisited: itemData.isVisited,
    };

    try {
      const res = await fetch(`${baseUri}/itinerary/${createdId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Activities Synced!");
        if (onSave) onSave();
        onClose();
      } else {
        const result = await res.json();
        toast.error(result.message || "Failed to add activity");
      }
    } catch (err) {
      toast.error("Sync error.");
      console.error(err)
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-[0.15em]";
  const inputClass = "w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700";

  return (
    <Model isOpen={isOpen} onClose={onClose} title={step === 1 ? "Initialize Expedition" : "Define Timeline"}>
      <div className="relative overflow-hidden">
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

            {/* AUTOFILL INPUT FIELD */}
            <div className="relative" ref={dropdownRef}>
              <label className={labelClass}>Itinerary Name (must match existing destination)</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 text-xs" />
                <input 
                  name="title" 
                  autoComplete="off"
                  required 
                  value={formData.title} 
                  onChange={handleItineraryChange} 
                  onFocus={() => formData.title && setShowDropdown(true)}
                  className={`${inputClass} pl-10`} 
                  placeholder="Type to search destinations..." 
                />
              </div>

              {/* DROPDOWN MENU */}
              {showDropdown && filteredDestinations.length > 0 && (
                <ul className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-h-52 overflow-y-auto no-scrollbar backdrop-blur-xl">
                  {filteredDestinations.map((dest) => (
                    <li 
                      key={dest.id}
                      onClick={() => selectDestination(dest)}
                      className="px-4 py-3 text-sm text-gray-400 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors flex justify-between items-center border-b border-gray-800/50 last:border-0"
                    >
                      <span className="font-medium">{dest.name}</span>
                      <FaArrowRight size={10} className="opacity-0 group-hover:opacity-100" />
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[9px] text-gray-500 mt-1 ml-1">⚠️ Use suggestions to ensure valid database linking</p>
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
                <p className="text-gray-500 font-mono text-[10px] truncate w-40">Itinerary ID: {createdId}</p>
                {validDestination && (
                  <p className="text-gray-500 font-mono text-[10px] truncate w-40">Dest ID: {validDestination.id}</p>
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
                <input type="number" name="dayNumber" required value={itemData.dayNumber} onChange={handleItemChange} className={inputClass} min="1" />
              </div>
              <div>
                <label className={labelClass}>Order in Day</label>
                <input type="number" name="orderInDay" required value={itemData.orderInDay} onChange={handleItemChange} className={inputClass} min="1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Activity Type</label>
                <input name="activityType" value={itemData.activityType} onChange={handleItemChange} className={inputClass} placeholder="Sightseeing/Meal" />
              </div>
              <div>
                <label className={labelClass}>Estimated Cost</label>
                <input name="estimatedCost" type="number" className={inputClass} value={itemData.estimatedCost} onChange={handleItemChange} min="0" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Time</label>
                <input className={inputClass} type="time" name="startTime" value={itemData.startTime} onChange={handleItemChange} step="1" required />
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input className={inputClass} type="time" name="endTime" value={itemData.endTime} onChange={handleItemChange} step="1" required />
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