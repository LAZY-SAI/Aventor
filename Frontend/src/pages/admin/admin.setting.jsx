import AdminLayout from "./adminLayout";
import { FaUserShield, FaKey, FaGlobe, FaCamera, FaLock } from "react-icons/fa";
import Panel from "../../components/admin/Panel";
import { useState, useEffect } from 'react';


const Setting = () => {
  const infoLabelClass = "text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest block";
  const infoValueClass = "text-sm font-bold text-white bg-gray-950/40 p-3 rounded-xl border border-gray-800/50 w-full block group-hover:border-emerald-500/30 transition-all";
  
                        
  const Id = localStorage.getItem('id');
  const baseUri = import.meta.env.VITE_API_URI;
  const token = localStorage.getItem("accessToken");

  const [adminData, setAdminData] = useState(null);       
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {                       
      try {
        
        setLoading(true);
        const res = await fetch(`${baseUri}/admin/profile/${Id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const data = await res.json();
        setAdminData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if(!Id){
      setError("no use1r Found")
      setLoading(false)
      return
    }
    if (Id) fetchAdmin();                                 
  }, [Id]);

  // Loading state
  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-emerald-500 font-bold animate-pulse">Loading profile...</div>
      </div>
    </AdminLayout>
  );

  // Error state
  if (error) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 font-bold">Error: {error}</div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">System Settings</h2>
            <p className="text-sm text-gray-500 font-medium">Configure your administrative workspace and security.</p>
          </div>
          <button className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-2xl transition-all duration-300 text-white font-bold shadow-xl shadow-emerald-900/40 active:scale-95">
            Save All Changes
          </button>
        </header>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">

          <Panel title="Profile Identity" icon={<FaUserShield className="text-emerald-500" />}>
            <div className="flex flex-col md:flex-row items-center gap-8 py-4 mb-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                
                  {adminData?.firstName?.[0]}{adminData?.lastName?.[0]}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-gray-900 border border-gray-700 rounded-xl text-emerald-500 hover:text-white hover:bg-emerald-600 transition-all shadow-xl">
                  <FaCamera size={14} />
                </button>
              </div>

              <div className="text-center md:text-left space-y-1">
                <h3 className="text-2xl font-black text-white">
                  {adminData?.username ?? "—"}
                </h3>
                <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest">
                  Role: {adminData?.role ?? "—"}
                </p>
                <p className="text-gray-500 text-sm">
              
                  Joined {adminData?.createdAt
                    ? new Date(adminData.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-800/50">
              <div className="group">
                <label className={infoLabelClass}>Display Name</label>
                <span className={infoValueClass}>{adminData?.fullName ?? "—"}</span>
              </div>
              <div className="group">
                <label className={infoLabelClass}>Contact Email</label>
                <span className={infoValueClass}>{adminData?.email ?? "—"}</span>
              </div>
              <div className="group">
                <label className={infoLabelClass}>Regional Locale</label>
                <div className="flex items-center justify-between p-3 bg-gray-950/40 border border-gray-800/50 rounded-xl">
                  <span className="text-sm font-bold text-white">English (US)</span>
                  <FaGlobe className="text-gray-600" />
                </div>
              </div>
              <div className="group">
                <label className={infoLabelClass}>System Timezone</label>
                <span className={infoValueClass}>UTC +5:45 (Kathmandu)</span>
              </div>
            </div>
          </Panel>

          <Panel title="Login Credentials" icon={<FaKey className="text-emerald-500" />}>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-950/30 rounded-2xl border border-gray-800/50 group hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-900 rounded-xl text-gray-500"><FaLock size={18} /></div>
                  <div>
                    <p className="text-white font-bold text-sm">Password</p>
                    <p className="text-gray-500 text-xs">Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400">
                  Update Password
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-950/30 rounded-2xl border border-gray-800/50 group hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-900 rounded-xl text-red-500/20"><FaUserShield size={18} /></div>
                  <div>
                    <p className="text-white font-bold text-sm">Two-Factor Authentication</p>
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-tighter">Current Status: Disabled</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                  Enable 2FA
                </button>
              </div>
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          <Panel title="Account Status">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Active Plan</span>
                <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black rounded">PRO</span>
              </div>
              <p className="text-white font-bold text-lg">Yatrika Enterprise</p>
              <p className="text-gray-500 text-xs mt-1">Renewal Date: Oct 12, 2026</p>
            </div>
          </Panel>

          <Panel title="Danger Zone">
            <div className="space-y-4">
              <p className="text-gray-500 text-xs leading-relaxed">
                Once you delete your administrative access, there is no going back. Please be certain.
              </p>
              <button className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                Deactivate Account
              </button>
            </div>
          </Panel>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Setting;