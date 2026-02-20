import { useState, useEffect } from "react";
import AdminLayout from "./adminLayout";
import Panel from '../../components/admin/Panel';
import UserPop from '../../components/admin/admin.userpop';

const AdUser = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState({totalUsers:0})
  const [newUsers, setNewUsers] = useState({newUsersLast7Days:0})
  const [loading, setLoading] = useState(true);
  const [isPopOpen, setIsPopOpen] = useState(false);


  const activity = [
    { id: 1, name: "Total Users", value:totalUsers.totalUsers ?? "0", percent: "+8.2%", color: "text-emerald-400" },
    { id: 2, name: "New Users", value: newUsers.newUsersLast7Days ?? "0", percent: "+3.5%", color: "text-blue-400" },
   
  ];
  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const token = localStorage.getItem("accessToken")
  const handleSaveInfo = (newGuideData) => {
  
    console.log("Saving Guide:", newGuideData);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${baseUri}/admin/userStats`, {
        
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUsers(data.users || []);
       setTotalUsers({ totalUsers: data.totalUsers || 0 });
      setNewUsers({ newUsersLast7Days: data.newUsersLast7Days || 0 });
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-gray-800 mb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">User Directory</h2>
            <p className="text-sm text-gray-500 mt-1">Manage permissions and monitor account health</p>
          </div>
          <button 
            onClick={() => setIsPopOpen(true)}
            className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-900/20 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Register New Guide
          </button>
        </header>
      }
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activity.map((item) => (
          <div key={item.id} className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-2xl">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{item.name}</p>
            <div className="flex justify-between items-end mt-2">
              <p className="text-2xl font-black text-white">{item.value}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-gray-900/40 ${
                item.percent.startsWith("+") ? "text-emerald-400" : "text-rose-400"
              }`}>
                {item.percent}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main User List */}
        <div className="lg:col-span-2 space-y-8">
          <Panel title="Recently Active Users" actionText="Export CSV">
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-800">
                {loading ? (
                  <div className="py-20 text-center text-gray-500 animate-pulse">Scanning database...</div>
                ) : users.length === 0 ? (
                  <div className="py-20 text-center text-gray-500 italic">No user records found.</div>
                ) : (
                  users.map((user) => (
                    <li key={user._id} className="py-4 flex justify-between items-center group hover:bg-gray-800/20 px-2 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                        {/* Avatar Placeholder */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-gray-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          user.isBlocked 
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {user.isBlocked ? "Banned" : "Active"}
                        </span>
                        <button className="text-gray-600 hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Panel>

          <Panel title="Guide Growth" actionText="View Metrics">
            <div className="h-48 flex items-end justify-between gap-2 px-2">
                {/* Visual Bar Chart Mockup */}
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-500/20 border border-emerald-500/30 rounded-t-lg transition-all hover:bg-emerald-500/40" style={{ height: `${h}%` }}></div>
                ))}
            </div>
          </Panel>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <Panel title="User Segments" className="min-h-[300px]">
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Travelers</span>
                    <span className="text-white font-bold">84%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[84%]"></div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-gray-400">Guides</span>
                    <span className="text-white font-bold">12%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[12%]"></div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-gray-400">Moderators</span>
                    <span className="text-white font-bold">4%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[4%]"></div>
                </div>
             </div>
          </Panel>

          <Panel title="Quick Registration" className="bg-emerald-900/10 border-emerald-500/20">
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Registering a guide requires verified identity documents. Ensure all fields are audited.
            </p>
            <button 
              onClick={() => setIsPopOpen(true)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-gray-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Open Form
            </button>
          </Panel>
        </div>
      </div>

      <UserPop
        isOpen={isPopOpen}
        onClose={() => setIsPopOpen(false)}
        onSave={handleSaveInfo} 
      />
    </AdminLayout>
  );
}

export default AdUser;