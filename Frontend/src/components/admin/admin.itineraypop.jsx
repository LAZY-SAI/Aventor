import { useState, useEffect } from "react";
import Model from "../Model";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";

const FormSection = ({ title, icon, children }) => (
  <div className="mb-8 last:mb-0 group">
    <div className="flex items-center gap-2 mb-4 border-b border-gray-800/50 pb-2 group-hover:border-emerald-500/30 transition-colors">
      <span className="text-emerald-500 text-xs">{icon}</span>
      <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  </div>
);

const AdItineryPop = ({ isOpen, onClose, onSave }) => {
  const initialState = {
    title: "",
    description: "",
    theme: "",
    totalDays: "",
    startDate: "",
    endDate: "",
    estimatedBudget: "", // Matched to your table's key name
  };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);

  const token = localStorage.getItem("accessToken");
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
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
        toast.success("Itinerary Created Successfully");
        // Trigger the parent fetch function to refresh the list
        if (onSave) onSave(); 
        onClose();
      } else {
        toast.error(data.message || "Failed to create itinerary");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-700 hover:border-gray-700";
  const labelClass =
    "block text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-[0.1em]";

  return (
    <Model isOpen={isOpen} onClose={onClose} title="Create New Itinerary">
      <div className="relative rounded-b-3xl overflow-hidden ">
        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] overflow-y-auto px-8 py-6 no-scrollbar"
        >
          {loading && !formData.title ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                Processing Request...
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: CORE DETAILS */}
              <FormSection title="Core Details" icon={<FaCheckCircle />}>
                <div className="md:col-span-2">
                  <label className={labelClass}>Itinerary Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Annapurna Circuit Adventure"
                    value={formData.title}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Describe the journey..."
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Travel Theme</label>
                  <input
                    type="text"
                    name="theme"
                    placeholder="Adventure, Cultural, etc."
                    value={formData.theme}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Total Days</label>
                  <input
                    type="number"
                    name="totalDays"
                    placeholder="7"
                    value={formData.totalDays}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </FormSection>

              {/* SECTION 2: LOGISTICS */}
              <FormSection title="Timeline & Budget" icon={<FaCalendarAlt />}>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Estimated Budget (NPR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold">
                      रू
                    </span>
                    <input
                      type="number"
                      name="estimatedBudget"
                      placeholder="50000"
                      value={formData.estimatedBudget}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </FormSection>

              {/* ACTION FOOTER */}
              <div className="bottom-0 pt-6 pb-2 mt-8 flex flex-col md:flex-row justify-end items-center gap-4 border-t border-gray-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full md:w-auto px-6 py-2.5 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-10 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  {loading ? "Creating..." : "Publish Itinerary"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </Model>
  );
};

export default AdItineryPop;