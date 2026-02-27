import { useState } from "react";
import Model from "../Model";

const API_URI = import.meta.env.VITE_API_URI;
const Userpop = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    from: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URI}/admin-users`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: formData.name,
        description: formData.description,
        from: formData.from,
      }),
    });

    const data = await res.json();
    console.log("response from server", data);

    onSave(formData);
    onClose();
    setFormData({
      name: "",
      description: "",
      place: "",
    });
  };
  const inputClass =
    "w-full px-4 py-3  border-t-0 border-l-0 border-r-0 border-b-1 rounded-lg focus:border-blue-500 focus:border-blue-500 focus:  outline-none rounded-none transition-all";
  const labelClass = "block text-sm font-semibold  py-2";
  return (
    <Model isOpen={isOpen} onClose={onClose} title="Add Guide">
      <form onSubmit={handleSubmit} method="POST">
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            onChange={handleChange}
            name="name"
            value={formData.name}
            placeholder="Name"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            onChange={handleChange}
            name="description"
            value={formData.description}
            placeholder="description of guide"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>From</label>
          <input
            type="text"
            onChange={handleChange}
            name="from"
            value={formData.place}
            placeholder="Place"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-all"
          >
            Save Destination
          </button>
        </div>
      </form>
    </Model>
  );
};

export default Userpop;
