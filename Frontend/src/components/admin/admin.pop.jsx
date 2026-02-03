import Model from "../Model";
import { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import imageCompression from 'browser-image-compression';
import {
  FaCloudUploadAlt,
  FaTimes,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";

const Popup = ({ isOpen, onClose, onSave }) => {
  const initialState = {
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
    images: null 
  };

  const [formData, setFormData] = useState(initialState);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = async(e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        setPreview(URL.createObjectURL(file));

        const options = {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        try {
          const compressedFile = await imageCompression(file, options);
          console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB | Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          
          setFormData((prev) => ({ ...prev, images: compressedFile }));
        } catch (error) {
          console.error("Compression Error:", error);
          toast.error("Error processing image, using original.");
          setFormData((prev) => ({ ...prev, images: file }));
        }
      }
      return;
    }

    if (name === "safetyLevel") {
      const val = parseInt(value, 10);
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
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

  // Fetch with timeout and retry
  const fetchWithTimeout = async (url, options, timeout = 120000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!formData.images) {
      toast.error("Please upload an image");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Starting...");

    try {
      //  Upload image first
      console.log("===: Uploading Image ===");
      setUploadProgress("Uploading image...");
      
      const imageFormData = new FormData();
      imageFormData.append("file", formData.images);

      let imageUploadRes;
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          imageUploadRes = await fetchWithTimeout(
            `${import.meta.env.VITE_API_URI}/uploads/destination`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: imageFormData,
            },
            120000 // 2 minute timeout
          );

          if (imageUploadRes.ok) {
            break; // Success, exit retry loop
          }

          // If server error and we have retries left
          if (imageUploadRes.status >= 500 && retries < maxRetries) {
            retries++;
            setUploadProgress(`Server waking up... Retry ${retries}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s before retry
            continue;
          }

          // If error and no retries left, throw
          const error = await imageUploadRes.json();
          throw new Error(error.message || "Failed to upload image");

        } catch (fetchError) {
          if (retries < maxRetries && (fetchError.message.includes('timeout') || fetchError.message.includes('Failed to fetch'))) {
            retries++;
            setUploadProgress(`Connection issue... Retry ${retries}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before retry
            continue;
          }
          throw fetchError;
        }
      }

      const imageData = await imageUploadRes.json();
      console.log("Image uploaded:", imageData)
      // Extract the image URL from the response
      const imageUrl = imageData.fileUrl || imageData.fileName || imageData.url;
      console.log(imageUrl)
      if (!imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      // Create destination with image URL
      console.log("===  Creating Destination ===");
      setUploadProgress("Creating destination...");
      
      const tagArray = formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== "")
        : [];

      const destinationPayload = {
        name: formData.name,
        shortDescription: formData.shortDescription || "",
        description: formData.description || formData.shortDescription || "",
        country: formData.country,
        province: formData.province,
        district: formData.district,
        municipality: formData.municipality,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        type: formData.type,
        category: formData.category || "",
        subCategory: formData.subCategory || "",
        bestSeason: formData.bestSeason || "",
        difficultyLevel: formData.difficultyLevel,
        averageDurationHours: formData.averageDurationHours ? parseFloat(formData.averageDurationHours) : 0,
        entranceFeeLocal: formData.entranceFeeLocal ? parseFloat(formData.entranceFeeLocal) : 0,
        entranceFeeForeign: formData.entranceFeeForeign ? parseFloat(formData.entranceFeeForeign) : 0,
        tags: tagArray,
        safetyLevel: parseInt(formData.safetyLevel),
        hasParking: formData.hasParking,
        hasRestrooms: formData.hasRestrooms,
        hasDrinkingWater: formData.hasDrinkingWater,
        hasWifi: formData.hasWifi,
        hasGuideServices: formData.hasGuideServices,
        images: [
          {
            imageUrl: imageUrl,
            caption: formData.name,
            isPrimary: true
          }
        ]
      };

      console.log("Destination payload:", JSON.stringify(destinationPayload, null, 2));

      retries = 0;
      let createRes;

      while (retries <= maxRetries) {
        try {
          createRes = await fetchWithTimeout(
            `${import.meta.env.VITE_API_URI}/create/destinations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(destinationPayload),
            },
            120000
          );

          if (createRes.ok) {
            break;
          }

          if (createRes.status >= 500 && retries < maxRetries) {
            retries++;
            setUploadProgress(`Server processing... Retry ${retries}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }

          const error = await createRes.json();
          throw new Error(error.message || "Failed to create destination");

        } catch (fetchError) {
          if (retries < maxRetries && (fetchError.message.includes('timeout') || fetchError.message.includes('Failed to fetch'))) {
            retries++;
            setUploadProgress(`Connection issue... Retry ${retries}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
          throw fetchError;
        }
      }

      const result = await createRes.json();
      console.log("Response:", result);
      
      toast.success("Destination created successfully! 🎉");
      onSave(result);
      setFormData(initialState);
      setPreview(null);
      onClose();

    } catch (error) {
      console.error("Submit error:", error);
      
      if (error.message.includes('timeout')) {
        toast.error("Server is taking too long to respond. Please try again or check if your backend is running.", {
          autoClose: 5000
        });
      } else if (error.message.includes('Failed to fetch')) {
        toast.error("Cannot connect to server. Please check your internet connection and backend URL.", {
          autoClose: 5000
        });
      } else {
        toast.error(error.message || "Failed to create destination. Please try again.");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const inputClass =
    "w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none transition-all bg-transparent text-white";
  const labelClass = "block text-xs font-bold uppercase text-gray-500 mb-1";

  const Toggle = ({ label, name, checked }) => (
    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={handleChange}
          className="sr-only peer"
          disabled={isUploading}
        />
        <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
      </label>
    </div>
  );

  return (
    <Model isOpen={isOpen} onClose={onClose} title="Add New Destination">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-h-[80vh] overflow-y-auto px-4 scrollbar-hide text-white"
      >
        {/* Progress indicator */}
        {isUploading && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
            <FaSpinner className="animate-spin" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className={labelClass}>Cover Photo</label>
          <div
            onClick={() => !isUploading && fileInputRef.current.click()}
            className="relative border-2 border-dashed border-gray-700 rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800/50 transition-all overflow-hidden"
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-bold">
                    Click to change
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 z-10 shadow-lg"
                  disabled={isUploading}
                >
                  <FaTimes size={14} />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <FaCloudUploadAlt className="mx-auto text-5xl text-blue-500 mb-3" />
                <p className="text-sm text-gray-300 font-semibold">
                  Upload Destination Image
                </p>
                <p className="text-[10px] text-gray-500 uppercase mt-1">
                  Recommended: 1200x800px (Max 5MB)
                </p>
              </div>
            )}
            <input
              type="file"
              name="image"
              ref={fileInputRef}
              onChange={handleChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Rest of the form remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`${labelClass} flex gap-1`}>
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="e.g. Everest Base Camp"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border-b bg-gray-800 border-gray-700 text-white py-2 outline-none focus:border-blue-500"
              disabled={isUploading}
            >
              <option value="NATURAL">NATURAL</option>
              <option value="CULTURAL">CULTURAL</option>
              <option value="ADVENTURE">ADVENTURE</option>
              <option value="RELIGIOUS">RELIGIOUS</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Difficulty</label>
            <select
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
              className="w-full bg-gray-800 border-b border-gray-700 text-white py-2 outline-none focus:border-blue-500"
              disabled={isUploading}
            >
              <option value="EASY">EASY</option>
              <option value="MODERATE">MODERATE</option>
              <option value="HARD">HARD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Wildlife"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
              disabled={isUploading}
            />
          </div>
          <div>
            <label className={labelClass}>Sub-Category</label>
            <input
              type="text"
              name="subCategory"
              placeholder="e.g. National Park"
              value={formData.subCategory}
              onChange={handleChange}
              className={inputClass}
              disabled={isUploading}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Short Description</label>
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="A brief catchy summary..."
            className={inputClass}
            disabled={isUploading}
          />
          <label className={`${labelClass} mt-4`}>Full Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Detailed overview of the destination..."
            className={`${inputClass} resize-none`}
            disabled={isUploading}
          />
        </div>

        <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <FaMapMarkerAlt size={14} />
            <span className="text-xs font-bold uppercase">
              Location Details
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className={inputClass}
                disabled={isUploading}
              />
            </div>
            <div>
              <label className={labelClass}>Province *</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                className={inputClass}
                disabled={isUploading}
              />
            </div>
            <div>
              <label className={labelClass}>District *</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className={inputClass}
                disabled={isUploading}
              />
            </div>
            <div>
              <label className={labelClass}>Municipality *</label>
              <input
                type="text"
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                required
                className={inputClass}
                disabled={isUploading}
              />
            </div>
            <div>
              <label className={labelClass}>Longitude *</label>
              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="-180 to 180"
                value={formData.longitude}
                onChange={handleChange}
                required
                className={inputClass}
                disabled={isUploading}
              />
            </div>
            <div>
              <label className={labelClass}>Latitude *</label>
              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="-90 to 90"
                value={formData.latitude}
                onChange={handleChange}
                required
                className={inputClass}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Duration (Hrs)</label>
            <input
              type="number"
              name="averageDurationHours"
              value={formData.averageDurationHours}
              onChange={handleChange}
              className={inputClass}
              disabled={isUploading}
            />
          </div>
          <div>
            <label className={labelClass}>Local Fee</label>
            <input
              type="number"
              name="entranceFeeLocal"
              value={formData.entranceFeeLocal}
              onChange={handleChange}
              className={inputClass}
              disabled={isUploading}
            />
          </div>
          <div>
            <label className={labelClass}>Foreign Fee</label>
            <input
              type="number"
              name="entranceFeeForeign"
              value={formData.entranceFeeForeign}
              onChange={handleChange}
              className={inputClass}
              disabled={isUploading}
            />
          </div>
          <div>
            <label className={labelClass}>Safety (1-5)</label>
            <input
              type="number"
              name="safetyLevel"
              min="1"
              max="5"
              value={formData.safetyLevel}
              onChange={handleChange}
              className={inputClass}
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Toggle
            label="WiFi Available"
            name="hasWifi"
            checked={formData.hasWifi}
          />
          <Toggle
            label="Parking Space"
            name="hasParking"
            checked={formData.hasParking}
          />
          <Toggle
            label="Restrooms"
            name="hasRestrooms"
            checked={formData.hasRestrooms}
          />
          <Toggle
            label="Guide Services"
            name="hasGuideServices"
            checked={formData.hasGuideServices}
          />
          <Toggle
            label="Drinking Water"
            name="hasDrinkingWater"
            checked={formData.hasDrinkingWater}
          />
        </div>

        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. trekking, scenic, mountain"
            className={inputClass}
            disabled={isUploading}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-8 pb-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-400 font-medium hover:text-white transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-10 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading && <FaSpinner className="animate-spin" />}
            {isUploading ? "Uploading..." : "Save Destination"}
          </button>
        </div>
      </form>
    </Model>
  );
};

export default Popup;