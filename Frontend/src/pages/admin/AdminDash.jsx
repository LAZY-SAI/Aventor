import { useState, useEffect } from "react";
import AdminLayout from "./adminLayout.jsx";


const Panel = ({ title, children, className = "", actionText = "View log" }) => (
  <div className={`bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm p-5 rounded-2xl shadow-xl ${className}`}>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">{title}</h3>
      <button className="text-[10px] font-bold uppercase tracking-tight text-gray-500 hover:text-emerald-400 transition-colors">
        {actionText}
      </button>
    </div>
    {children}
  </div>
);

const AdminDash = () => {
  const [users, setUsers] = useState({ activeUsers: 0, pendingFlags: 0 });
  const [destination, setDestination] = useState({destinationCount:0})
  const [post, setPost] = useState({postCount:0})
  const [isLoading, setIsLoading] = useState(true);

  const metrics = [
    { id: 1, name: "Active Users", value: users.activeUsers ?? "0", trend: "0%", color: "text-emerald-400" },
    { id: 2, name: "Trips Created", value: destination.destinationCount ?? "0", trend: "+3.5%", color: "text-blue-400" },
    { id: 3, name: "Posts", value: post.postCount ?? "0", trend: "-1.9%", color: "text-rose-400" },
    { id: 4, name: "Reports", value: "0", trend: "-0.4%", color: "text-amber-400" },
    { id: 5, name: "Pending Flags", value: users.pendingFlags ?? "0", trend: "High", color: "text-orange-400" },
  ];

  const recentChanges = [
    { id: 1, event: "Server Rebooted", time: "2 mins ago", type: "system" },
    { id: 2, event: "API Keys Rotated", time: "1 hour ago", type: "security" },
    { id: 3, event: "User #124 banned", time: "3 hours ago", type: "mod" },
    { id: 4, event: "Database Backup", time: "Yesterday", type: "system" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URI}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data);
        setDestination(data)
        setPost(data)
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">System Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time metrics and infrastructure health</p>
          </div>
          <button className="mt-4 md:mt-0 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Reports
          </button>
        </header>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Syncing with server...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {metrics.map((item) => (
              <div key={item.id} className="bg-gray-800/30 border border-gray-700/50 p-5 rounded-2xl hover:border-gray-600 transition-all group">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.name}</p>
                <div className="flex justify-between items-end mt-3">
                  <p className={`text-2xl font-black text-white group-hover:scale-110 transition-transform origin-left`}>
                    {item.value}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-900/50 ${
                    item.trend.startsWith("+") ? "text-emerald-400" : 
                    item.trend.startsWith("-") ? "text-rose-400" : "text-gray-400"
                  }`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2">
              <Panel title="Usage Over Time" actionText="Full Analytics">
                <div className="h-[400px] rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden group">
                  
                  <div className="absolute inset-0 opacity-10 pointer-events-none" 
                       style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                  </div>
                  <div className="z-10 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                    </div>
                    <p className="text-white font-bold tracking-tight text-lg">Infrastructure Analytics</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs">Waiting for real-time stream data from API cluster...</p>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Sidebar Activity */}
            <div className="lg:col-span-1">
              <Panel title="Recent Activity" className="h-full">
                <div className="space-y-6">
                  {recentChanges.map((change) => (
                    <div key={change.id} className="relative pl-6 border-l border-gray-700 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-700 group-hover:bg-emerald-500 transition-colors"></div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                          {change.event}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500/70">
                            {change.type}
                          </span>
                          <span className="text-[10px] text-gray-500 italic">
                            {change.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-gray-700 text-gray-500 text-xs font-bold hover:border-gray-500 hover:text-gray-300 transition-all">
                    Load More Events
                  </button>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDash;