import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./adminLayout";
import Panel from '../../components/admin/Panel';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

// --- Sub-Components ---

const MetricCard = ({ label, value, color, data }) => (
  <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-3xl h-40 flex flex-col justify-between transition-all hover:border-gray-500">
    <div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
    <div className="w-full h-12 overflow-hidden">
      <SparkLineChart 
        data={data} 
        colors={[color]} 
        height={48} 
        curve="natural" 
        area 
        sx={{ '& .MuiAreaElement-root': { fillOpacity: 0.1 } }} 
      />
    </div>
  </div>
);

const UserRow = ({ user }) => (
  <li className="py-5 flex items-center justify-between gap-4 group hover:bg-white/[0.02] px-4 rounded-2xl transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-emerald-400 font-bold shadow-xl">
        {user.username?.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{user.username}</p>
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
          UID: {user._id.slice(-6)}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-8">
      <div className="hidden md:block w-24 h-8">
        <SparkLineChart
          data={user.growthHistory || [0, 0, 0, 0]}
          height={32}
          colors={['#6366f1']}
        />
      </div>
      <div className="text-right">
        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
          user.isBlocked 
            ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        }`}>
          {user.isBlocked ? "Hold" : "Active"}
        </span>
      </div>
    </div>
  </li>
);

// --- Main Component ---

const AdUser = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, newUsersLast7Days: 0, mrr: 0, churnRate: "2.4%" });
  const [loading, setLoading] = useState(true);

  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  const growthRatio = useMemo(() => 
    stats.totalUsers > 0 ? (stats.newUsersLast7Days / stats.totalUsers) * 100 : 0
  , [stats.totalUsers, stats.newUsersLast7Days]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${baseUri}/admin/userStats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        const transformedUsers = (data.users || []).map(user => ({
          ...user,
          growthHistory: [10, 15, 12, 20, 18, 25, 25 + (data.newUsersLast7Days / 10), 35 + (data.newUsersLast7Days / 2)]
        }));

        setUsers(transformedUsers);
        setStats(prev => ({ ...prev, totalUsers: data.totalUsers || 0, newUsersLast7Days: data.newUsersLast7Days || 0 }));
      } catch (err) {
        console.error("SaaS Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [baseUri, token]);

  const metricConfigs = [
    { label: "Total Customers", val: stats.totalUsers, color: "#10b981", data: [40, 50, 45, 60, 55, 70, 85] },
    { label: "New (7 Days)", val: stats.newUsersLast7Days, color: "#3b82f6", data: [2, 8, 5, 12, 10, 15, 20] },
    { label: "Growth Velocity", val: `${growthRatio.toFixed(1)}%`, color: "#6366f1", data: [5, 10, 8, 15, 12, 20, 25] },
    { label: "Churn", val: stats.churnRate, color: "#f43f5e", data: [5, 4, 4.5, 3, 3.2, 2.5, 2.4] }
  ];

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-gray-800 mb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Customer Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Currently seeing <span className="text-emerald-400 font-bold">{growthRatio.toFixed(1)}%</span> platform expansion this week
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20">
             Export CRM
          </button>
        </header>
      }
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricConfigs.map((m, i) => (
          <MetricCard key={i} label={m.label} value={m.val} color={m.color} data={m.data} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Panel title="Recent Transactions & Growth" actionText="Full Analytics">
            <div className="relative w-full h-[200px] bg-black/20 rounded-2xl border border-white/5">
              {/* Background Hero Sparkline */}
              <div className="absolute inset-x-0 -top-4 h-48 opacity-40 pointer-events-none">
                <SparkLineChart
                  data={[stats.totalUsers - stats.newUsersLast7Days, stats.totalUsers - (stats.newUsersLast7Days * 0.5), stats.totalUsers]}
                  height={180}
                  curve="natural"
                  area
                  colors={['#10b981']}
                  sx={{ '& .MuiAreaElement-root': { fill: 'url(#growthGradient)', fillOpacity: 0.2 } }}
                >
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </SparkLineChart>
              </div>

              {/* User List */}
              <div className="relative z-10 overflow-hidden">
                <ul className="divide-y divide-gray-800/30">
                  {loading ? (
                    <div className="py-20 text-center text-gray-500 animate-pulse font-mono text-xs uppercase tracking-widest">
                      Syncing Growth Metrics...
                    </div>
                  ) : (
                    users.map((user) => <UserRow key={user._id} user={user} />)
                  )}
                </ul>
              </div>
            </div>
          </Panel>
        </div>

        {/* Sidebar Indicators */}
        <div className="space-y-8">
           <Panel title="Performance Indicators">
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <p className="text-xs text-indigo-300 font-bold mb-1">Weekly Growth Spike</p>
                <h4 className="text-xl font-black text-white">+{stats.newUsersLast7Days} <span className="text-xs text-gray-500 font-normal">Accounts</span></h4>
                <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
                   <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${Math.min(growthRatio, 100)}%` }}></div>
                </div>
              </div>
           </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdUser;