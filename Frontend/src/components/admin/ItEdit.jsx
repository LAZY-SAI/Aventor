import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../pages/admin/adminLayout";
import {
  FaSave,
  FaPlus,
  FaArrowLeft,
  FaTrash,
  FaChevronRight,
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
};

// ─── Ensure "HH:MM:SS" format for backend ────────────────────────────────────
const toTimeString = (timeVal) => {
  if (!timeVal) return "00:00:00";
  if (typeof timeVal === "string" && timeVal.length === 5) return `${timeVal}:00`;
  return timeVal;
};

// ─── Convert backend time to "HH:MM" for <input type="time"> ─────────────────
const toInputTime = (timeVal) => {
  if (!timeVal) return "08:00";
  if (typeof timeVal === "string") return timeVal.substring(0, 5);
  return "08:00";
};

const ItEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [destinationId, setDestinationId] = useState(null);

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

  const [itineraryItems, setItineraryItems] = useState([]);

  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-200 hover:bg-white/10";
  const labelClass =
    "text-xs font-bold text-slate-400 mb-1.5 ml-1 tracking-wide block uppercase";

          const toDateOnly = (val) => {
  if (!val) return "";
  return val.substring(0, 10); 
};
  // ─── Fetch Itinerary ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUri}/itineraries/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const data = result.data;

 
        if (data) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            totalDays: data.totalDays || 1,
            estimatedBudget: data.estimatedBudget || 0,
            startDate: toDateOnly(data.startDate), 
            endDate: toDateOnly(data.endDate),
            status: data.status || "TEMPLATE",
            theme: data.theme || "",
          });
            console.log("startDate raw:", data.startDate)
          if (data.items && data.items.length > 0) {
           
            const firstDestId = data.items[0]?.destination?.id;
            setDestinationId(firstDestId);
            console.log("🔍 destinationId extracted:", firstDestId);

            const normalized = data.items.map((item) => ({
              ...item,
              startTime: toInputTime(item.startTime),
              endTime: toInputTime(item.endTime),
            }));
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

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (globalIndex, e) => {
    const { name, value } = e.target;
    const updatedItems = [...itineraryItems];
    updatedItems[globalIndex] = { ...updatedItems[globalIndex], [name]: value };
    setItineraryItems(updatedItems);
  };

  const addNewActivityToDay = () => {
    const maxDays = parseInt(formData.totalDays) || 1;
    if (selectedDay > maxDays) {
      toast.error("Increase 'Total Days' in metadata to add items here.");
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
    toast.success(`New activity added to Day ${selectedDay}`);
  };

  const removeActivity = (globalIndex) => {
    if (itineraryItems.length === 1 && !itineraryItems[0].id) return;
    setItineraryItems(itineraryItems.filter((_, i) => i !== globalIndex));
  };

  // ─── Update Existing Items ─────────────────────────────────────────────────
  const updateExistingItems = async (existingItems) => {
    for (const item of existingItems) {
      // ✅ Use per-item destination first, fall back to shared destinationId state
      const destId = item.destination?.id || destinationId;

      const payload = {
        destinationId: destId,
        dayNumber: parseInt(item.dayNumber),
        orderInDay: parseInt(item.orderInDay),
        title: item.title,
        notes: item.notes || "",
        activityType: item.activityType || "VISIT",
        isVisited: item.isVisited ?? true,
        estimatedCost: parseFloat(item.estimatedCost) || 0,
        startTime: toTimeString(item.startTime),  
        endTime: toTimeString(item.endTime),       
      };

      console.log(`📤 item.id:${item.id} | itinerary.id:${id} | destId:${destId}`, JSON.stringify(payload, null, 2));

      const res = await fetch(`${baseUri}/itineraries/${id}/items/${item.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`❌ Failed item ${item.id}:`, JSON.stringify(err, null, 2));
        throw new Error(err?.message || `Item ${item.id} update failed (${res.status})`);
      }
    }
  };

  // ─── Create New Items ──────────────────────────────────────────────────────
  const createNewItems = async (newItems) => {
    const payload = {
      itineraryItems: newItems.map((i) => ({
        destinationId: destinationId,
        dayNumber: parseInt(i.dayNumber),
        orderInDay: parseInt(i.orderInDay),
        title: i.title,
        notes: i.notes || "",
        activityType: i.activityType || "VISIT",
        isVisited: false,
        estimatedCost: parseFloat(i.estimatedCost) || 0,
        startTime: toTimeString(i.startTime),  
        endTime: toTimeString(i.endTime),       
      })),
    };

    console.log("📤 Creating new items:", JSON.stringify(payload, null, 2));

    const res = await fetch(`${baseUri}/itinerary/${id}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("❌ Failed to create items:", JSON.stringify(err, null, 2));
      throw new Error(err?.message || `Create items failed (${res.status})`);
    }
  };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const toastId = toast.loading("Saving changes...");
    try {
      // 1. Update header
      const headerRes = await fetch(`${baseUri}/itineraries/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!headerRes.ok) throw new Error("Header update failed");

      const existingItems = itineraryItems.filter((item) => item.id);
      const newItems = itineraryItems.filter((item) => !item.id);

      // 2. Update existing
      if (existingItems.length > 0) await updateExistingItems(existingItems);

      // 3. Create new
      if (newItems.length > 0) await createNewItems(newItems);

      toast.update(toastId, {
        render: "Expedition updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => navigate(0), 1500);
    } catch (err) {
      console.error("Save error:", err);
      toast.update(toastId, {
        render: err.message || "Something went wrong",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-emerald-500 font-bold animate-pulse">
        LOADING...
      </div>
    );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
        <ToastContainer theme="dark" position="top-center" />

        {/* Top Nav */}
        <div className="sticky top-0 z-50 py-6 backdrop-blur-md border-b border-white/5 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-slate-400 transition-all"
            >
              <FaArrowLeft size={14} />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Edit Expedition{" "}
              <span className="text-emerald-500 ml-2">#{id}</span>
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
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Metadata Section */}
            <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Itinerary Name</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={inputClass}
                  placeholder="Enter title..."
                />
              </div>

              <div>
                <label className={labelClass}>Total Days</label>
                <input
                  name="totalDays"
                  type="number"
                  min={1}
                  value={formData.totalDays}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Estimated Budget ($)</label>
                <input
                  name="estimatedBudget"
                  type="number"
                  value={formData.estimatedBudget}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>End Date</label>
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="TEMPLATE" className="bg-slate-900">TEMPLATE</option>
                  <option value="PUBLISHED" className="bg-slate-900">PUBLISHED</option>
                  <option value="DRAFT" className="bg-slate-900">DRAFT</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Theme / Category</label>
                <input
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className={inputClass}
                  placeholder="e.g. Adventure, Luxury"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${inputClass} min-h-[120px] py-4`}
                  placeholder="Describe this expedition..."
                />
              </div>
            </section>

            {/* Day Selector */}
            <div className="flex items-center justify-center gap-3 py-6 bg-white/[0.02] rounded-3xl border border-white/5 flex-wrap">
              <h3 className="text-white font-bold mr-2 uppercase text-xs tracking-widest">
                Days
              </h3>
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
              <div className="text-slate-600 px-2">
                <FaChevronRight />
              </div>
            </div>

            {/* Timeline Activities */}
            <div className="space-y-6">
              <h2 className="text-white font-bold text-lg px-2">
                Timeline Workflow — Day {selectedDay}
              </h2>

              {itineraryItems
                .map((item, index) => ({ ...item, globalIndex: index }))
                .filter((item) => parseInt(item.dayNumber) === selectedDay)
                .map((item, localIndex) => (
                  <div
                    key={item.globalIndex}
                    className="relative border border-white/5 rounded-3xl p-8 bg-white/[0.01] border-l-4 border-l-emerald-500/30"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase">
                        Day {item.dayNumber} — Activity #{localIndex + 1}
                      </span>
                      <button
                        onClick={() => removeActivity(item.globalIndex)}
                        className="text-red-500/40 hover:text-red-500 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Activity Title</label>
                        <input
                          name="title"
                          value={item.title}
                          onChange={(e) => handleItemChange(item.globalIndex, e)}
                          className={inputClass}
                          placeholder="e.g. Sunrise Trek, Lakeside Breakfast"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Start Time</label>
                        <input
                          type="time"
                          name="startTime"
                          value={item.startTime}
                          onChange={(e) => handleItemChange(item.globalIndex, e)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>End Time</label>
                        <input
                          type="time"
                          name="endTime"
                          value={item.endTime}
                          onChange={(e) => handleItemChange(item.globalIndex, e)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Activity Type</label>
                        <input
                          name="activityType"
                          value={item.activityType}
                          onChange={(e) => handleItemChange(item.globalIndex, e)}
                          className={inputClass}
                          placeholder="e.g. VISIT, MEAL, TRANSPORT"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Cost ($)</label>
                        <input
                          type="number"
                          name="estimatedCost"
                          value={item.estimatedCost??0}
                          onChange={(e) => handleItemChange(item.globalIndex, e)}
                          className={inputClass}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>Notes</label>
                        <textarea
                          name="notes"
                          className={`${inputClass} min-h-[80px] py-4`}
                          value={item.notes || ""}
                          onChange={(e) => handleItemChange(item.globalIndex, e)}
                          placeholder="Special instructions..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

              {/* Empty State */}
              {itineraryItems.filter(
                (item) => parseInt(item.dayNumber) === selectedDay
              ).length === 0 && (
                <div className="text-center py-12 text-slate-600 text-sm font-medium">
                  No activities for Day {selectedDay} yet.
                </div>
              )}

              {/* Add Activity Button */}
              <button
                onClick={addNewActivityToDay}
                className="w-full py-10 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center group hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <FaPlus />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-emerald-500">
                  Add Activity to Day {selectedDay}
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="bg-emerald-500 rounded-3xl p-8 text-black shadow-2xl shadow-emerald-500/20">
              <p className="text-[10px] font-black uppercase opacity-60 mb-2">
                Projected Budget
              </p>
              <p className="text-5xl font-black">
                ${formData.estimatedBudget || 0}
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Duration</span>
                <span className="text-white">{formData.totalDays} Days</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Total Activities</span>
                <span className="text-white">{itineraryItems.length}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Day {selectedDay} Activities</span>
                <span className="text-emerald-500">
                  {itineraryItems.filter((i) => parseInt(i.dayNumber) === selectedDay).length}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Avg Daily Cost</span>
                <span className="text-white">
                  ${(formData.estimatedBudget / (formData.totalDays || 1)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
              <p className="text-blue-400 text-[10px] font-bold uppercase mb-2">
                Editor Note
              </p>
              <p className="text-blue-200/70 text-xs leading-relaxed">
                Changes made to the timeline will be synced across all traveler
                instances currently following this template.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ItEdit;