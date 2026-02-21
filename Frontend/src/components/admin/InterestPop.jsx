import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Smile, Palette, Save, Info } from 'lucide-react';

const InterestPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    code:'',
    name: '',
    slug: '',
    icon: '📍',
    color: '#10b981',
    active:true

  });

  // Auto-generate slug from name
  useEffect(() => {
   
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, slug }));
  }, [formData.name]);

  const handleSubmit = async(e) => {
    e.preventDefault();
   const FormateName = formData.name.toUpperCase()
   setFormData((prev)=>({...prev, name:FormateName}))



    console.log("Saving Interest:", formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Interest</h2>
                  <p className="text-slate-400 text-xs mt-1">Define a new category for your expeditions.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* Name & Slug */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Interest Name</label>
                    <input
                      autoFocus
                      type="text"
                      required
                      placeholder="e.g. Mountaineering"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">URL Slug</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-10 py-3 text-slate-400 text-sm outline-none cursor-not-allowed"
                        value={formData.slug}
                      />
                    </div>
                  </div>
                </div>

                {/* Icon & Color Picker Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-2">
                      <Smile size={12} /> Visual Icon
                    </label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    >
                      <option value="🏔️">🏔️ Adventure</option>
                      <option value="🌊">🌊 Beach</option>
                      <option value="🍕">🍕 Food</option>
                      <option value="🏛️">🏛️ Culture</option>
                      <option value="💎">💎 Luxury</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-2">
                      <Palette size={12} /> Brand Color
                    </label>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                      <input
                        type="color"
                        className="w-8 h-8 bg-transparent border-none cursor-pointer"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">{formData.color}</span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3">
                  <Info className="text-emerald-500 shrink-0" size={18} />
                  <p className="text-[11px] text-emerald-200/60 leading-relaxed">
                    This interest will immediately appear in the traveler-facing discovery filters once saved.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Save size={18} /> Save Interest
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InterestPopup;