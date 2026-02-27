import { useState, useEffect, useRef } from "react";
import Model from "../Model";
import { toast } from "react-toastify";
import imageCompression from 'browser-image-compression';
import {
  FaCloudUploadAlt,
  FaTrash,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaCogs,
  FaMoneyBillWave,
  FaCheckCircle,
  FaSearch,
} from "react-icons/fa";
import { form } from "framer-motion/client";



const FormSection = ({ title, icon, children }) => (
  <div className="mb-10 group">
    <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2 group-hover:border-emerald-500/50 transition-colors">
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

const Toggle = ({ label, name, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl border border-gray-800/50 hover:border-emerald-500/30 transition-all">
    <span className="text-xs font-semibold text-gray-300">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
    </label>
  </div>
);

const DestEdit = ({ isOpen, onClose, onSave, destId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("accessToken");
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");

  useEffect(() => {
    if (!destId || !isOpen) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${baseUri}/destinations/${destId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
     
        // Set form data
        setFormData({
          ...data,
          tags: Array.isArray(data.tags)
            ? data.tags.join(", ")
            : data.tags || "",
        });

        // Set preview URL
        if (data.images?.length > 0) {
          const rawUrl = data.images[0].imageUrl
          const imageUrl = rawUrl.startsWith("http")
          ? rawUrl : `${baseUri}${rawUrl}`
          setPreviewUrl(imageUrl);
          
        } else {
          setPreviewUrl(null);
        }
      } catch (err) {
        toast.error("Failed to load destination");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [destId, isOpen, token, baseUri]);

  const handleChange = async(e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === "image") {
      const file = files[0];
      if (file) {
        setNewImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        const options ={
          maxSizeMB:5,
          maxWidthOrHeight:1920,
          useWebWorker:true
        }
        try
        {
          const compressedFile = await imageCompression(file, options)
          console.log(`Compressed to : ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
           setNewImageFile(compressedFile);
        }
        catch(error)
        {
          console.error("compression error",error)
             setNewImageFile(file);
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this destination?"))
      return;

    const loadingId = toast.loading("Deleting asset...");
    try {
      const res = await fetch(
        `${baseUri}/delete/destination/${destId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.update(loadingId, {
        render: "Deleted successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      onSave(null, destId, true);
      onClose();
    } catch (err) {
      toast.update(loadingId, {
        render: err.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }

  
   };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingId = toast.loading("Updating destination...");

    try {
      const tagsArray = typeof formData.tags === "string"
        ? formData.tags.split(",").map((t) => t.trim()).filter(t => t !== "")
        : formData.tags || [];

      const destinationData = {
        name: formData.name,
        shortDescription: formData.shortDescription || "",
        description: formData.description || formData.shortDescription || "",
        country: formData.country,
        district: formData.district,
        province: formData.province,
        municipality: formData.municipality,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        type: formData.type || "NATURAL",
        category: formData.category || "",
        subCategory: formData.subCategory || "",
        bestSeason: formData.bestSeason || "",
        difficultyLevel: formData.difficultyLevel || "EASY",
        averageDurationHours: parseFloat(formData.averageDurationHours) || 0,
        entranceFeeLocal: parseFloat(formData.entranceFeeLocal) || 0,
        entranceFeeForeign: parseFloat(formData.entranceFeeForeign) || 0,
        tags: tagsArray,
        safetyLevel: parseInt(formData.safetyLevel) || 1,
        hasParking: formData.hasParking || false,
        hasRestrooms: formData.hasRestrooms || false,
        hasDrinkingWater: formData.hasDrinkingWater || false,
        hasWifi: formData.hasWifi || false,
        hasGuideServices: formData.hasGuideServices || false,
      };

      // If user picked a NEW image, upload to Cloudinary first
      if (newImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", newImageFile);

        const uploadRes = await fetch(`${baseUri}/uploads/destination`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imageFormData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadData = await uploadRes.json();
        const newImageUrl = uploadData.fileUrl || uploadData.url;

        destinationData.images = [{
          imageUrl: newImageUrl,
          caption: formData.name,
          isPrimary: true
        }];

      } else if (formData.images && formData.images.length > 0) {
        // No new image picked - keep existing images
        destinationData.images = formData.images.map(img => ({
          imageUrl: img.imageUrl,
          caption: img.caption || formData.name,
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : true
        }));
      }

      console.log("Updating with data:", destinationData);

      // Send update to backend
      const updateRes = await fetch(
        `${baseUri}/update/destinations/${destId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(destinationData),
        }
      );

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.message || "Failed to update destination");
      }

      const updatedData = await updateRes.json();

      toast.update(loadingId, {
        render: "Updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      onSave(updatedData);
      onClose();

    } catch (error) {
      console.error("Update error:", error);
      toast.update(loadingId, {
        render: error.message || "Update failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-900/60 border border-gray-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-gray-700";
  const labelClass =
    "block text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-[0.1em]";

  return (
    <Model isOpen={isOpen} onClose={onClose} title="Edit Destination Asset">
      <div className="relative rounded-b-3xl overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="max-h-[85vh] overflow-y-auto px-6 py-4 custom-scrollbar"
        >
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-xs tracking-widest uppercase">
                Retrieving Data...
              </p>
            </div>
          ) : (
            <>
              {/* IMAGE UPLOAD SECTION */}
              <div className="mb-10">
                <label className={labelClass}>Hero Media</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-64 w-full rounded-2xl border-2 border-dashed border-gray-800 overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all flex items-center justify-center bg-gray-900/20"
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          console.error("Image load error:", previewUrl);
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCloudUploadAlt className="text-white text-3xl" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <FaCloudUploadAlt className="mx-auto text-4xl text-gray-700 mb-2" />
                      <p className="text-xs text-gray-500 font-medium">
                        Click to upload image
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  name="image"
                  ref={fileInputRef}
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-sm font-semibold text-red-500">Image Must be Less than 5mb</p>
              </div>

              {/* GENERAL INFORMATION */}
              <FormSection title="General Information" icon={<FaCheckCircle />}>
                <div className="md:col-span-2">
                  <label className={labelClass}>Destination Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Short Tagline</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Full Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description || ""}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Primary Type</label>
                  <select
                    name="type"
                    value={formData.type || "NATURAL"}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="NATURAL">NATURAL</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="ADVENTURE">ADVENTURE</option>
                    <option value="RELIGIOUS">RELIGIOUS</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tags (Comma Separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags || ""}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="hiking, nature, water"
                  />
                </div>
              </FormSection>

              {/* LOCATION DETAILS */}
              <FormSection title="Location Details" icon={<FaMapMarkerAlt />}>
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province || ""}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., Bagmati, Gandaki"
                  />
                </div>
                <div>
                  <label className={labelClass}>District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Municipality</label>
                  <input
                    type="text"
                    name="municipality"
                    value={formData.municipality || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </FormSection>

              {/* CLASSIFICATION */}
              <FormSection title="Classification" icon={<FaLayerGroup />}>
                <div>
                  <label className={labelClass}>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., Nature, Trekking"
                  />
                </div>
                <div>
                  <label className={labelClass}>SubCategory</label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory || ""}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., Hiking, Climbing"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Best Season</label>
                  <input
                    type="text"
                    name="bestSeason"
                    value={formData.bestSeason || ""}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., Spring, Autumn"
                  />
                </div>
              </FormSection>

              {/* PRICING & LOGISTICS */}
              <FormSection
                title="Pricing & Logistics"
                icon={<FaMoneyBillWave />}
              >
                <div>
                  <label className={labelClass}>Duration (Hrs)</label>
                  <input
                    type="number"
                    name="averageDurationHours"
                    value={formData.averageDurationHours || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Difficulty</label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel || "EASY"}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Safety Level (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    name="safetyLevel"
                    value={formData.safetyLevel || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Local Fee</label>
                  <input
                    type="number"
                    name="entranceFeeLocal"
                    value={formData.entranceFeeLocal || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Foreign Fee</label>
                  <input
                    type="number"
                    name="entranceFeeForeign"
                    value={formData.entranceFeeForeign || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                 <div className="md:col-span-2">
                  <label className={labelClass}>Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                 <div className="md:col-span-2">
                  <label className={labelClass}>latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </FormSection>

              {/* FACILITIES */}
              <FormSection title="Facilities" icon={<FaCogs />}>
                <Toggle
                  label="WiFi Access"
                  name="hasWifi"
                  checked={formData.hasWifi || false}
                  onChange={handleChange}
                />
                <Toggle
                  label="Parking"
                  name="hasParking"
                  checked={formData.hasParking || false}
                  onChange={handleChange}
                />
                <Toggle
                  label="Restrooms"
                  name="hasRestrooms"
                  checked={formData.hasRestrooms || false}
                  onChange={handleChange}
                />
                <Toggle
                  label="Drinking Water"
                  name="hasDrinkingWater"
                  checked={formData.hasDrinkingWater || false}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <Toggle
                    label="Professional Guide Services"
                    name="hasGuideServices"
                    checked={formData.hasGuideServices || false}
                    onChange={handleChange}
                  />
                </div>
              </FormSection>

              {/* ACTION FOOTER */}
              <div className="bottom-0 pt-6 pb-4 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <FaTrash /> Delete Asset
                </button>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 md:flex-none px-10 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
                  >
                    Update Destination
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </Model>
  );
};

export default DestEdit;