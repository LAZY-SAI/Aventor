import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import imageCompression from 'browser-image-compression';
import {
  FaCloudUploadAlt,
  FaTimes,
  FaMapMarkerAlt,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import Model from "../Model";


const useGeocoding = (query, setFormData, setQuery) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const debounce = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { "User-Agent": "Yatrika/1.0" } }
        );
        const data = await res.json();
        console.log(data)
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Geocoding Error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectSuggestion = (place) => {
    const placeName = place.display_name.split(",")[0];
    setFormData((prev) => ({
      ...prev,
      name: placeName,
      latitude: place.lat,
      longitude: place.lon,
      province:place.provience,
      district:place.district
    }));
    setQuery(placeName);
    console.log(placeName)
    setShowDropdown(false);
    setSuggestions([]);
  };

  return { suggestions, showDropdown, setShowDropdown, isSearching, handleSelectSuggestion };
};

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-4">
    <div className="flex items-center gap-2 text-blue-400 mb-2">
      <Icon size={14} />
      <span className="text-xs font-bold uppercase">{title}</span>
    </div>
    {children}
  </div>
);

const Popup = ({ isOpen, onClose, onSave }) => {
  const initialState = useMemo(() => ({
    name: "",
    description: "",
    shortDescription: "",
    country: "",
    district: "",
    province: "",
    municipality: "",
    type: "NATURAL",
    category: "",
    subCategory: "",
    bestSeason: "",
    difficultyLevel: "EASY",
    averageDurationHours: "",
    entranceFeeLocal: "",
    entranceFeeForeign: "",
    tags: "",
    safetyLevel: 1,
    hasParking: false,
    hasRestrooms: false,
    hasDrinkingWater: false,
    hasWifi: false,
    hasGuideServices: false,
    longitude: "",
    latitude: "",
    images: null,
  }), []);

  const [formData, setFormData] = useState(initialState);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [query, setQuery] = useState("");

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const { suggestions, showDropdown, setShowDropdown, isSearching, handleSelectSuggestion } = 
    useGeocoding(query, setFormData, setQuery);

  // --- Helpers ---

  const resetForm = () => {
    setFormData(initialState);
    setPreview(null);
    setQuery("");
  };

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        const options = { maxSizeMB: 5, maxWidthOrHeight: 1920, useWebWorker: true };
        try {
          const compressedFile = await imageCompression(file, options);
          setFormData((prev) => ({ ...prev, images: compressedFile }));
        } catch (error) {
          toast.error("Error processing image, using original.");
          setFormData((prev) => ({ ...prev, images: file }));
          console.error(error)
        }
      }
      return;
    }

    if (name === "safetyLevel") {
      if (value === "") { setFormData(p => ({ ...p, [name]: "" })); return; }
      const val = parseInt(value, 10);
      if (val < 1 || val > 5) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, images: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchWithTimeout = async (url, options, timeout = 120000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error.name === "AbortError" ? new Error("Request timeout") : error;
    }
  };

  // --- Submission Logic ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!formData.images) return toast.error("Please upload an image");

    setIsUploading(true);
    setUploadProgress("Starting...");

    try {
      //  Upload Image
      setUploadProgress("Uploading image...");
      const imageFormData = new FormData();
      imageFormData.append("file", formData.images);

      let imageUploadRes;
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          imageUploadRes = await fetchWithTimeout(`${import.meta.env.VITE_API_URI}/uploads/destination`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: imageFormData,
          });
          if (imageUploadRes.ok) break;
          retries++;
          setUploadProgress(`Retrying image... ${retries}/${maxRetries}`);
          await new Promise(r => setTimeout(r, 3000));
        } catch (err) {
          if (retries >= maxRetries) throw err;
          retries++;
          await new Promise(r => setTimeout(r, 5000));
        }
      }

      const imageData = await imageUploadRes.json();
      const imageUrl = imageData.fileUrl || imageData.fileName || imageData.url;
      if (!imageUrl) throw new Error("Upload failed to return URL");

      // Create Destination
      setUploadProgress("Creating destination...");
      const tagArray = formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        averageDurationHours: parseFloat(formData.averageDurationHours) || 0,
        entranceFeeLocal: parseFloat(formData.entranceFeeLocal) || 0,
        entranceFeeForeign: parseFloat(formData.entranceFeeForeign) || 0,
        safetyLevel: parseInt(formData.safetyLevel),
        tags: tagArray,
        description: formData.description || formData.shortDescription || "",
        images: [{ imageUrl, caption: formData.name, isPrimary: true }],
      };

      const createRes = await fetchWithTimeout(`${import.meta.env.VITE_API_URI}/create/destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) throw new Error("Failed to create destination");

      const result = await createRes.json();
      toast.success("Destination created successfully! 🎉");
      onSave(result);
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  // --- Sub-render Components ---

  const Toggle = ({ label, name, checked }) => (
    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={handleChange} className="sr-only peer" disabled={isUploading} />
        <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
      </label>
    </div>
  );

  const inputClass = "w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none transition-all bg-transparent text-white";
  const labelClass = "block text-xs font-bold uppercase text-gray-500 mb-1";

  return (
    <Model isOpen={isOpen} onClose={onClose} title="Add New Destination">
      {/* 1. Search Logic */}
      <div className="relative mb-4 px-4" ref={dropdownRef}>
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 text-gray-500 z-10" size={13} />
          {isSearching && <FaSpinner className="absolute right-3 text-gray-500 animate-spin z-10" size={13} />}
          <input
            className="w-full pl-9 pr-4 py-2 border-b border-gray-600 focus:border-blue-500 outline-none bg-transparent text-white placeholder-gray-500 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search destination to auto-fill..."
            disabled={isUploading}
          />
        </div>

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-2xl">
            {suggestions.map((place) => (
              <li key={place.place_id} onClick={() => handleSelectSuggestion(place)} className="px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors">
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-blue-400 mt-1 shrink-0" size={12} />
                  <div>
                    <p className="text-white text-sm font-medium">{place.display_name.split(",")[0]}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{place.display_name}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-4 scrollbar-hide text-white">
        {/*  Global Progress */}
        {isUploading && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
            <FaSpinner className="animate-spin" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/*  Image Section */}
        <div className="space-y-2">
          <label className={labelClass}>Cover Photo</label>
          <div onClick={() => !isUploading && fileInputRef.current.click()} className="relative border-2 border-dashed border-gray-700 rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800/50 transition-all overflow-hidden">
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }} className="absolute top-3 right-3 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 z-10 shadow-lg" disabled={isUploading}>
                  <FaTimes size={14} />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <FaCloudUploadAlt className="mx-auto text-5xl text-blue-500 mb-3" />
                <p className="text-sm text-gray-300 font-semibold">Upload Image</p>
              </div>
            )}
            <input type="file" name="image" ref={fileInputRef} onChange={handleChange} accept="image/*" className="hidden" disabled={isUploading} />
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Destination Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} disabled={isUploading} />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border-b bg-gray-800 border-gray-700 py-2" disabled={isUploading}>
              <option value="NATURAL">NATURAL</option>
              <option value="CULTURAL">CULTURAL</option>
              <option value="ADVENTURE">ADVENTURE</option>
              <option value="RELIGIOUS">RELIGIOUS</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Difficulty</label>
            <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleChange} className="w-full bg-gray-800 border-b border-gray-700 py-2" disabled={isUploading}>
              <option value="EASY">EASY</option>
              <option value="MODERATE">MODERATE</option>
              <option value="DIFFICULT">DIFFICULT</option>
              <option value="EXTREME">EXTREME</option>
            </select>
          </div>
        </div>

        {/* Details & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} className={inputClass} disabled={isUploading} />
          <input type="text" name="subCategory" placeholder="Sub-Category" value={formData.subCategory} onChange={handleChange} className={inputClass} disabled={isUploading} />
        </div>
        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Short Summary" className={inputClass} disabled={isUploading} />
        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Full Description" className={`${inputClass} resize-none`} disabled={isUploading} />

        {/*  Location  */}
        <FormSection title="Location Details" icon={FaMapMarkerAlt}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} required className={inputClass} />
            <input name="province" placeholder="Province" value={formData.province} onChange={handleChange} required className={inputClass} />
            <input name="district" placeholder="District" value={formData.district} onChange={handleChange} required className={inputClass} />
            <input name="municipality" placeholder="Municipality" value={formData.municipality} onChange={handleChange} required className={inputClass} />
            <input type="number" step="any" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} required className={inputClass} />
            <input type="number" step="any" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} required className={inputClass} />
          </div>
        </FormSection>

        {/*  Numbers & Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input type="number" name="averageDurationHours" placeholder="Hrs" value={formData.averageDurationHours} onChange={handleChange} className={inputClass} />
          <input type="number" name="entranceFeeLocal" placeholder="Local Fee" value={formData.entranceFeeLocal} onChange={handleChange} className={inputClass} />
          <input type="number" name="entranceFeeForeign" placeholder="Foreign Fee" value={formData.entranceFeeForeign} onChange={handleChange} className={inputClass} />
          <input type="number" name="safetyLevel" min="1" max="5" value={formData.safetyLevel} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Toggle label="WiFi" name="hasWifi" checked={formData.hasWifi} />
          <Toggle label="Parking" name="hasParking" checked={formData.hasParking} />
          <Toggle label="Restrooms" name="hasRestrooms" checked={formData.hasRestrooms} />
          <Toggle label="Guide Services" name="hasGuideServices" checked={formData.hasGuideServices} />
          <Toggle label="Water" name="hasDrinkingWater" checked={formData.hasDrinkingWater} />
        </div>

        <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (trekking, scenic...)" className={inputClass} />

        {/*  Footer Actions */}
        <div className="flex justify-end space-x-4 pt-8 pb-4 border-t border-gray-800">
          <button type="button" onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white" disabled={isUploading}>Cancel</button>
          <button type="submit" disabled={isUploading} className="px-10 py-2 bg-blue-600 text-white rounded-full font-bold flex items-center gap-2">
            {isUploading && <FaSpinner className="animate-spin" />}
            {isUploading ? "Uploading..." : "Save Destination"}
          </button>
        </div>
      </form>
    </Model>
  );
};

export default Popup;