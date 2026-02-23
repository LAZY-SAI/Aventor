import  { useState, useEffect } from 'react';
import { 
  Plus, Search, MoreVertical, Trash2, Edit3, 
  Grid, List, Filter, ArrowUpDown, Tag, Hash 
} from 'lucide-react';
import AdminLayout from '../../pages/admin/adminLayout';
import { toast, ToastContainer } from 'react-toastify';
import {motion,AnimatePresence } from 'framer-motion';
import InterestPopup from '../../components/admin/InterestPop';
const Interest = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
 const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
 const token = localStorage.getItem("accessToken")
  const fetchData = async () => {
      setLoading(true);
      try{
            const res = await fetch(`${baseUri}/admin/interests`,{
                method:"GET",
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
           
            const data = await res.json()
             console.log(data)
            
        setInterests(data);
        setLoading(false);
    
      }
      catch(error){
        
        console.error(error)
      }
    }
  useEffect(() => 
    {
    
     fetchData()
  }, []);

  const handleDelete = async(id)=>{{
    try{
      const res = await fetch (`${baseUri}/admin/delete/interests/${id}`,{
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      if(res.ok){
        setInterests((prev)=>prev.filter((item)=>(item.id || item._d) !== id))
      }
    }
    catch(error)
    {
      console.log(error)
    }
  }}

  const filteredInterests = interests.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto px-6 pb-20 text-white">
        <ToastContainer theme="dark" />

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interests & Tags</h1>
            <p className="text-slate-400 mt-1">Manage global categories for discovery and filtering.</p>
          </div>
          
          <button onClick={()=>setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
            <Plus size={18} /> Add New Interest
          </button>
        </div>

        {/* --- TOOLBAR --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search interests..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredInterests.map((item) => (
                <InterestCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="max-w-full bg-white/5 text-slate-400 uppercase  text-[10px] font-black tracking-widest">
                  <th className="px-6 py-4">Interest</th>
                  <th className="px-6 py-4">Slug</th>
                 
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterests.map((item) => (
                  <InterestRow key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <InterestPopup isOpen={isModalOpen} onScuccess={()=>{fetchData()
        toast.success("Interest created successfully")
      }} onClose={() => setIsModalOpen(false)} />
    </AdminLayout>
  );
};

// --- SUB-COMPONENTS ---

const InterestCard = ({ item, onDelete }) => (

  
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="group relative bg-white/[0.03] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
        {item.icon}
      </div>
      <button className="text-slate-600 hover:text-white transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>
    
    <div>
      <h3 className="text-xl font-bold mb-1">{item.name}</h3>
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
        <Hash size={14} /> <span>{item.slug}</span>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-white/5">
      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
        {item.count} Expeditions
      </span>
      <div className="flex gap-2">
        {/* <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-blue-400 transition-all">
          <Edit3 size={16} />
        </button> */}
        <button  onClick={() => onDelete(item.id)}
        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all">
          <Trash2 size={16} />
        </button>
      </div>

     
    </div>
    
  </motion.div>
);

const InterestRow = ({ item,onDelete }) => (
  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-lg">
          {item.icon}
        </span>
        <span className="font-bold">{item.name}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-slate-500 font-mono text-sm">/{item.slug}</td>
    <td className="px-6 py-4">
      <span className="text-sm font-medium text-slate-300">{item.count} items</span>
    </td>
    <td className="px-6 py-4">
      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* <button className="p-2 hover:bg-emerald-500 hover:text-black rounded-lg transition-all text-emerald-500">
          <Edit3 size={16} />
        </button> */}
        <button onClick={()=>onDelete(item.id)}
        className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all text-red-500">
          <Trash2 size={16} />
        </button>
      </div>
    </td>
    
  </tr>
  
);

export default Interest;