import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../../pages/admin/adminLayout";

import "react-toastify/dist/ReactToastify.css";
import {
  FaSave,
  FaPlus,
  FaArrowLeft,
  FaTrash,
  FaRegClock,
  FaMapMarkerAlt,
  FaSearch,
  FaCheck,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

const INITIAL_ITEM_TEMPLATE = {
  id: null,
  dayNumber: 1,
  orderInDay: 1,
  title: "",
  activityType: "VISIT",
  notes: "",
  startTime: "08:00",
  endTime: "10:00",
  isVisited: false,
  estimatedCost: 0,
  destination: null,
  destinationId: null,
  destinationName: "",
};

// --- Helpers ---
const toTimeString = (timeVal) => {
  if (!timeVal) return "00:00:00";
  if (typeof timeVal === "string" && timeVal.length === 5)
    return `${timeVal}:00`;
  return timeVal;
};

const toInputTime = (timeVal) => {
  if (!timeVal) return "08:00";
  if (typeof timeVal === "string") return timeVal.substring(0, 5);
  return "08:00";
};

const toDateOnly = (val) => {
  if (!val) return "";
  return val.substring(0, 10);
};

// ─────────────────────────────────────────────
// Per-activity destination search widget
// ─────────────────────────────────────────────
const ActivityDestinationSearch = ({
  item,
  globalIndex,
  allDestinations,
  onSelect,
  inputClass,
  labelClass,
}) => {
  const resolvedName = item.destinationName || item.destination?.name || "";
  const resolvedId   = item.destinationId   || item.destination?.id   || null;

  const [search, setSearch]           = useState(resolvedName);
  const [filtered, setFiltered]       = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmed, setConfirmed]     = useState(!!resolvedId);
  const wrapperRef = useRef(null);

  // ✅ Sync local state if parent item changes (e.g. after fetch completes)
  useEffect(() => {
    const name = item.destinationName || item.destination?.name || "";
    const id   = item.destinationId   || item.destination?.id   || null;
    setSearch(name);
    setConfirmed(!!id);
  }, [item.destinationId, item.destination?.id, item.destinationName, item.destination?.name]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setConfirmed(false);
    onSelect(globalIndex, null, ""); // clear until user picks
    if (val.trim().length > 0) {
      setFiltered(
        allDestinations.filter((d) =>
          d.name.toLowerCase().includes(val.toLowerCase())
        )
      );
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handlePick = (dest) => {
    setSearch(dest.name);
    setConfirmed(true);
    setShowDropdown(false);
    onSelect(globalIndex, dest.id, dest.name);
  };

  return (
    <div className="md:col-span-2 relative" ref={wrapperRef}>
      <label className={labelClass}>Destination</label>
      <div className="relative">
        <FaSearch
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${
            confirmed ? "text-emerald-500" : "text-slate-600"
          }`}
        />
        <input
          autoComplete="off"
          value={search}
          onChange={handleChange}
          onFocus={() => {
            if (search && !confirmed) setShowDropdown(true);
          }}
          placeholder="Search destination..."
          className={`${inputClass} pl-10 ${confirmed ? "border-emerald-500/50" : ""}`}
        />
        {confirmed && (
          <FaCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xs" />
        )}
      </div>

      {showDropdown && (
        <ul className="absolute z-[100] w-full mt-2 bg-[#0b171f] border border-white/10 rounded-xl shadow-2xl max-h-44 overflow-y-auto no-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((dest) => (
              <li
                key={dest.id}
                onClick={() => handlePick(dest)}
                className="px-4 py-3 text-sm text-slate-400 hover:bg-emerald-500 hover:text-white cursor-pointer border-b border-white/5 last:border-0 transition-colors flex items-center gap-2"
              >
                <FaMapMarkerAlt size={10} className="text-emerald-500 shrink-0" />
                {dest.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-4 text-center text-xs text-slate-600 italic">
              No destinations found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const ItEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const passedImageUrl = location.state?.imageUrl ?? null;
  const navigate = useNavigate();

  const [loading, setLoading]               = useState(true);
  const [selectedDay, setSelectedDay]       = useState(1);
  const [preview, setPreview]               = useState(passedImageUrl);
  const [allDestinations, setAllDestinations] = useState([]);
  const [formData, setFormData]             = useState({
    title: "",
    description: "",
    totalDays: 1,
    estimatedBudget: 0,
    startDate: "",
    endDate: "",
    status: "TEMPLATE",
    theme: "",
    images: passedImageUrl ? [{ url: passedImageUrl }] : [],
  });
  const [itineraryItems, setItineraryItems] = useState([]);

  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const token   = localStorage.getItem("accessToken");

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200 hover:bg-white/10";
  const labelClass =
    "text-xs font-bold text-slate-400 mb-1.5 ml-1 tracking-wide block uppercase";

  // --- Fetch destinations ---
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res  = await fetch(`${baseUri}/destinations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list = data.content || data.data || data;
        setAllDestinations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load destinations", err);
      }
    };
    if (token) fetchDestinations();
  }, [baseUri, token]);

  // --- Fetch itinerary ---
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const res    = await fetch(`${baseUri}/itineraries/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const data   = result.data?.data ?? result.data;

        if (data) {
          let resolvedImages = passedImageUrl ? [{ url: passedImageUrl }] : [];
          if (data.images && data.images.length > 0) {
            const normalized = data.images.map((img, index) => ({
              url:       img.url || img.path || "",
              sortOrder: img.sortOrder ?? index,
              isCover:   img.isCover ?? index === 0,
            }));
            resolvedImages = normalized;
            setPreview(normalized[0]?.url || passedImageUrl);
          } else {
            setPreview(passedImageUrl);
          }

          setFormData({
            title:           data.title           || "",
            description:     data.description     || "",
            totalDays:       data.totalDays        || 1,
            estimatedBudget: data.estimatedBudget  || 0,
            startDate:       toDateOnly(data.startDate),
            endDate:         toDateOnly(data.endDate),
            status:          data.status          || "TEMPLATE",
            theme:           data.theme           || "",
            images:          resolvedImages,
          });

          if (data.items && data.items.length > 0) {
            const normalized = data.items.map((item) => ({
              ...item,
              startTime:       toInputTime(item.startTime),
              endTime:         toInputTime(item.endTime),
              // ✅ always seed both fields from the nested destination object
              destinationId:   item.destination?.id   || null,
              destinationName: item.destination?.name || "",
            }));
            console.log("Normalized items with destinationId:", normalized.map(i => ({
              title: i.title,
              destinationId: i.destinationId,
              destinationName: i.destinationName,
            })));
            setItineraryItems(normalized);
          } else {
            setItineraryItems([{ ...INITIAL_ITEM_TEMPLATE, dayNumber: 1 }]);
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

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (globalIndex, e) => {
    const { name, value } = e.target;
    setItineraryItems((prev) => {
      const updated = [...prev];
      updated[globalIndex] = { ...updated[globalIndex], [name]: value };
      return updated;
    });
  };

  // ✅ Updates only the specific item's destinationId when user picks from search
  const handleItemDestinationSelect = (globalIndex, destId, destName) => {
    setItineraryItems((prev) => {
      const updated = [...prev];
      updated[globalIndex] = {
        ...updated[globalIndex],
        destinationId:   destId,
        destinationName: destName,
      };
      console.log(`Item[${globalIndex}] destination set →`, destId, destName);
      return updated;
    });
  };

  const addNewActivityToDay = () => {
    const maxDays = parseInt(formData.totalDays) || 1;
    if (selectedDay > maxDays) {
      toast.error("Increase 'Total Days' to add items here.");
      return;
    }
    const itemsInDay = itineraryItems.filter(
      (i) => parseInt(i.dayNumber) === selectedDay
    );
    const nextOrder =
      itemsInDay.length > 0
        ? Math.max(...itemsInDay.map((i) => parseInt(i.orderInDay || 0))) + 1
        : 1;

    setItineraryItems([
      ...itineraryItems,
      { ...INITIAL_ITEM_TEMPLATE, dayNumber: selectedDay, orderInDay: nextOrder },
    ]);
  };

  const removeActivity = (globalIndex) => {
    setItineraryItems(itineraryItems.filter((_, i) => i !== globalIndex));
  };

  // --- API Save Methods ---
  const updateExistingItems = async (existingItems) => {
    for (const item of existingItems) {
      // ✅ destinationId is always the per-item value set by search or seeded from API
      const resolvedDestId = item.destinationId || item.destination?.id || null;

      const payload = {
        destinationId: resolvedDestId,
        dayNumber:     parseInt(item.dayNumber),
        orderInDay:    parseInt(item.orderInDay),
        title:         item.title,
        notes:         item.notes || "",
        activityType:  item.activityType || "VISIT",
        isVisited:     item.isVisited ?? true,
        estimatedCost: parseFloat(item.estimatedCost) || 0,
        startTime:     toTimeString(item.startTime),
        endTime:       toTimeString(item.endTime),
      };

      console.log(`PUT item[${item.id}] destinationId →`, resolvedDestId, payload);

      await fetch(`${baseUri}/itineraries/${id}/items/${item.id}`, {
        method: "PUT",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  };

  const createNewItems = async (newItems) => {
    const payload = {
      itineraryItems: newItems.map((i) => ({
        destinationId: i.destinationId || null,
        dayNumber:     parseInt(i.dayNumber),
        orderInDay:    parseInt(i.orderInDay),
        title:         i.title,
        notes:         i.notes || "",
        activityType:  i.activityType || "VISIT",
        isVisited:     false,
        estimatedCost: parseFloat(i.estimatedCost) || 0,
        startTime:     toTimeString(i.startTime),
        endTime:       toTimeString(i.endTime),
      })),
    };

    console.log("POST new items payload →", JSON.stringify(payload, null, 2));

    await fetch(`${baseUri}/itinerary/${id}/items`, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  const handleSave = async () => {
    const toastId = toast.loading("Syncing expedition data...");
    try {
      const headerRes = await fetch(`${baseUri}/itineraries/${id}`, {
        method: "PUT",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!headerRes.ok) throw new Error("Header update failed");

      const existingItems = itineraryItems.filter((item) => item.id);
      const newItems      = itineraryItems.filter((item) => !item.id);

      if (existingItems.length > 0) await updateExistingItems(existingItems);
      if (newItems.length > 0)      await createNewItems(newItems);

      toast.update(toastId, {
        render:    "Expedition updated successfully!",
        type:      "success",
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => navigate('/admin/Itinery'), 1500);
    } catch (err) {
      toast.update(toastId, {
        render:    err.message,
        type:      "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-500 font-black tracking-widest text-xs uppercase">
          Loading Expedition
        </p>
      </div>
    );

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
        <ToastContainer theme="dark" position="top-center" />

        {/* Header */}
        <div className="sticky top-0 z-50 py-6 backdrop-blur-md border-b border-white/5 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-slate-400 transition-all"
            >
              <FaArrowLeft size={14} />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Edit Expedition <span className="text-emerald-500 ml-2">#{id}</span>
            </h1>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            <FaSave /> Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-10">

            {/* Metadata Card */}
            <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FaMapMarkerAlt size={120} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Itinerary Name</label>
                <input name="title" value={formData.title} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Total Days</label>
                <input name="totalDays" type="number" min={1} value={formData.totalDays} onChange={handleInputChange} className={inputClass} />
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
                  <option value="TEMPLATE"  className="bg-slate-900">TEMPLATE</option>
                  <option value="PUBLISHED" className="bg-slate-900">PUBLISHED</option>
                  <option value="DRAFT"     className="bg-slate-900">DRAFT</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Theme</label>
                <input name="theme" value={formData.theme} onChange={handleInputChange} className={inputClass} placeholder="e.g. Adventure" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputClass} min-h-[120px]`} />
              </div>
            </section>

            {/* Day Selector */}
            <div className="flex items-center justify-center gap-3 py-6 bg-white/[0.02] rounded-3xl border border-white/5 flex-wrap">
              <h3 className="text-white font-bold mr-2 uppercase text-xs tracking-[0.2em] opacity-40">Timeline</h3>
              {[...Array(parseInt(formData.totalDays || 1))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i + 1)}
                  className={`w-12 h-12 rounded-full font-bold transition-all border ${
                    selectedDay === i + 1
                      ? "bg-emerald-500 text-black scale-110 shadow-lg border-transparent"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Activities */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <h2 className="text-white font-bold text-xl uppercase tracking-tighter">Day {selectedDay} Workflow</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  {itineraryItems.filter((i) => parseInt(i.dayNumber) === selectedDay).length} Activities Found
                </p>
              </div>

              {itineraryItems
                .map((item, index) => ({ ...item, globalIndex: index }))
                .filter((item) => parseInt(item.dayNumber) === selectedDay)
                .map((item, localIndex) => (
                  <div
                    key={item.globalIndex}
                    className="group relative border border-white/5 rounded-3xl p-8 bg-white/[0.01] hover:bg-white/[0.02] transition-all border-l-4 border-l-emerald-500/30"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black italic">
                          {localIndex + 1}
                        </span>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Activity Detail</span>
                      </div>
                      <button
                        onClick={() => removeActivity(item.globalIndex)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    
                      <ActivityDestinationSearch
                        item={item}
                        globalIndex={item.globalIndex}
                        allDestinations={allDestinations}
                        onSelect={handleItemDestinationSelect}
                        inputClass={inputClass}
                        labelClass={labelClass}
                      />

                      <div className="md:col-span-2">
                        <label className={labelClass}>Activity Title</label>
                        <input
                          name="title"
                          value={item.title}
                          onChange={(e) => handleItemChange(item.globalIndex, e)}
                          className={inputClass}
                          placeholder="e.g. Sunrise Trek"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Start Time</label>
                        <input type="time" name="startTime" value={item.startTime} onChange={(e) => handleItemChange(item.globalIndex, e)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>End Time</label>
                        <input type="time" name="endTime" value={item.endTime} onChange={(e) => handleItemChange(item.globalIndex, e)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Activity Type</label>
                        <input name="activityType" value={item.activityType} onChange={(e) => handleItemChange(item.globalIndex, e)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Cost ($)</label>
                        <input type="number" name="estimatedCost" value={item.estimatedCost ?? 0} onChange={(e) => handleItemChange(item.globalIndex, e)} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Notes</label>
                        <textarea name="notes" value={item.notes || ""} onChange={(e) => handleItemChange(item.globalIndex, e)} className={`${inputClass} min-h-[80px]`} />
                      </div>
                    </div>
                  </div>
                ))}

              <button
                onClick={addNewActivityToDay}
                className="w-full py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center group hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <FaPlus />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-500">
                  Append New Activity to Day {selectedDay}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.03] flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cover Media</p>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-400 uppercase">Static Asset</span>
              </div>
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative group">
                {preview ? (
                  <>
                    <img src={preview} alt="Cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-20">
                    <FaPlus size={24} className="mb-2" />
                    <p className="text-[10px] font-black uppercase">No Asset</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-emerald-500/5">
                <p className="text-[10px] text-emerald-500 font-medium italic">
                  * To change cover media, update the Media Library association for this ID.
                </p>
              </div>
            </div>

            <div className="bg-emerald-500 rounded-3xl p-8 text-black shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] opacity-10">
                <FaRegClock size={120} />
              </div>
              <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-[0.2em]">Projected Budget</p>
              <p className="text-5xl font-black">${formData.estimatedBudget || 0}</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Total Days</span>
                <span className="text-white">{formData.totalDays} Days</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Global Items</span>
                <span className="text-white">{itineraryItems.length}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Avg Daily Cost</span>
                <span className="text-emerald-500">
                  ${(formData.estimatedBudget / (formData.totalDays || 1)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
              <p className="text-blue-400 text-[10px] font-black uppercase mb-2 tracking-widest">System Sync</p>
              <p className="text-blue-200/70 text-xs leading-relaxed">
                Saving changes will trigger a live update to all travelers currently using this template.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ItEdit;