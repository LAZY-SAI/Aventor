import { useState, useEffect } from "react";
import Model from "../Model";
import { toast } from "react-toastify";
import {
  FaArrowRight,
  FaCheck,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaQuoteLeft,
} from "react-icons/fa";

const AdItineryPop = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [createdId, setCreatedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- FORM STATES ---
  const initialItineraryState = {
    title: "",
    description: "",
    theme: "",
    totalDays: "",
    startDate: "",
    endDate: "",
    estimatedBudget: "",
    isPublic: false, // This is the key we must target
  };

  const initialItemState = {
    dayNumber: 1,
    orderInDay: 1,
    title: "",
    notes: "",
    startTime: "08:00",
    endTime: "10:00",
    activityType: "",
    estimatedCost: 0,
    isVisited: true,
  };

  const [formData, setFormData] = useState(initialItineraryState);
  const [itemData, setItemData] = useState(initialItemState);

  const token = localStorage.getItem("accessToken");
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialItineraryState);
      setItemData(initialItemState);
      setStep(1);
      setCreatedId(null);
    }
  }, [isOpen]);

  // --- HANDLERS ---
  const handleItineraryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Fix: If it's a checkbox, use 'checked', else use 'value'
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to format time for API (Object format: {hour, minute, second, nano})
  const formatTimeToObj = (timeStr) => {
    if (!timeStr) return { hour: 0, minute: 0, second: 0, nano: 0 };
    const [h, m] = timeStr.split(":");
    return { hour: parseInt(h), minute: parseInt(m), second: 0, nano: 0 };
  };

  // STEP 1: CREATE ITINERARY
  const submitStepOne = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${baseUri}/create/itinerary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Itinerary Initialized!");
        setCreatedId(data.data.id || data.data._id);
        setStep(2);
      } else {
        toast.error(data.message || "Validation failed");
      }
    } catch (err) {
      toast.error("Network error.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: ADD ITINERARY ITEM
  const submitStepTwo = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...itemData,
      startTime: formatTimeToObj(itemData.startTime),
      endTime: formatTimeToObj(itemData.endTime),
    };

    try {
      const res = await fetch(`${baseUri}/itinerary/${createdId}`, {
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
        toast.error("Failed to add activity");
      }
    } catch (err) {
      toast.error("Sync error.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SUB-COMPONENTS ---
  const Toggle = ({ label, name, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={!!checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
      </label>
    </div>
  );

  // --- STYLES ---
  const inputClass =
    "w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700";
  const labelClass =
    "block text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-[0.15em]";

  return (
    <Model
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Initialize Expedition" : "Define Timeline"}
    >
      <div className="relative overflow-hidden">
        {/* Progress Tracker */}
        <div className="flex w-full h-1.5 bg-gray-900 overflow-hidden">
          <div
            className={`h-full bg-emerald-500 transition-all duration-700 ease-in-out ${
              step === 1 ? "w-1/3" : "w-full"
            }`}
          />
        </div>

        <div
          className={`flex transition-transform duration-500 ease-in-out ${
            step === 2 ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {/* STEP 1: GENERAL INFO */}
          <form
            onSubmit={submitStepOne}
            className="min-w-full px-8 py-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar"
          >
            <div>
              <label className={labelClass}>Itinerary Name</label>
              <input
                name="title"
                required
                value={formData.title}
                onChange={handleItineraryChange}
                className={inputClass}
                placeholder="e.g. Himalayan Secrets"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Duration (Days)</label>
                <input
                  type="number"
                  name="totalDays"
                  required
                  value={formData.totalDays}
                  onChange={handleItineraryChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Category/Theme</label>
                <input
                  name="theme"
                  value={formData.theme}
                  onChange={handleItineraryChange}
                  className={inputClass}
                  placeholder="Culture/Solo"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  className={inputClass}
                  value={formData.startDate}
                  type="date"
                  name="startDate"
                  onChange={handleItineraryChange}
                />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input
                  className={inputClass}
                  value={formData.endDate}
                  type="date"
                  name="endDate"
                  onChange={handleItineraryChange}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Estimated Budget (NPR)</label>
              <input
                className={inputClass}
                value={formData.estimatedBudget}
                type="number"
                name="estimatedBudget"
                onChange={handleItineraryChange}
              />
            </div>

            <div>
              <Toggle
                label="Public Itinerary"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleItineraryChange}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
            >
              {loading ? "Processing..." : "Continue to Timeline"}
              <FaArrowRight size={12} />
            </button>
          </form>

          {/* STEP 2: ACTIVITY INFO */}
          <form
            onSubmit={submitStepTwo}
            className="min-w-full px-8 py-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar"
          >
            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                  Linked Identity
                </p>
                <p className="text-gray-500 font-mono text-[10px] truncate w-40">
                  {createdId}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FaCheck size={12} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Activity / Destination</label>
              <input
                name="title"
                required
                value={itemData.title}
                onChange={handleItemChange}
                className={inputClass}
                placeholder="Check-in at Boutique Hotel"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Scheduled Day</label>
                <input
                  type="number"
                  name="dayNumber"
                  value={itemData.dayNumber}
                  onChange={handleItemChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Activity Type</label>
                <input
                  name="activityType"
                  value={itemData.activityType}
                  onChange={handleItemChange}
                  className={inputClass}
                  placeholder="Transport / Meal"
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
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Administrative Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={itemData.notes}
                onChange={handleItemChange}
                className={`${inputClass} resize-none`}
                placeholder="Details for travelers..."
              />
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? "Finalizing..." : "Publish Itinerary"}
                <FaCheck size={12} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </Model>
  );
};

export default AdItineryPop;