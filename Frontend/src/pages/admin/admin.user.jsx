import { useState, useEffect } from "react";
import AdminLayout from "./adminLayout";
import Panel from '../../components/admin/Panel';

const AdUser = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersLast7Days: 0,
    mrr: 0, // Monthly Recurring Revenue
    churnRate: "0%"
  });
  const [loading, setLoading] = useState(true);

  const baseUri = import.meta.env.VITE_API_URI?.replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  const metrics = [
    { id: 1, name: "Total Customers", value: stats.totalUsers, percent: "+12%", color: "text-emerald-400" },
    { id: 2, name: "New Signups (7d)", value: stats.newUsersLast7Days, percent: "+5.2%", color: "text-blue-400" },
    { id: 3, name: "Est. MRR", value: `$${(stats.totalUsers * 29).toLocaleString()}`, percent: "+8.1%", color: "text-indigo-400" },
    { id: 4, name: "Churn Rate", value: "2.4%", percent: "-0.5%", color: "text-rose-400" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${baseUri}/admin/userStats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        setUsers(data.users || []);
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers || 0,
          newUsersLast7Days: data.newUsersLast7Days || 0,
        }));
      } catch (err) {
        console.error("SaaS Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [baseUri, token]);

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-gray-800 mb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Customer Management</h2>
            <p className="text-sm text-gray-500 mt-1">Monitor subscription lifecycle and account health</p>
          </div>
          {/* <button className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20">
            Export Billing Report
          </button> */}
        </header>
      }
    >
      {/* SaaS Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((item) => (
          <div key={item.id} className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-2xl">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{item.name}</p>
            <div className="flex justify-between items-end mt-2">
              <p className="text-2xl font-black text-white">{item.value}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-gray-900/40 ${item.color}`}>
                {item.percent}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Customer List */}
        <div className="lg:col-span-2">
          <Panel title="Recent Transactions & Users" actionText="View All">
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-800">
                {loading ? (
                  <div className="py-20 text-center text-gray-500 animate-pulse">Accessing CRM Records...</div>
                ) : users.length === 0 ? (
                  <div className="py-20 text-center text-gray-500 italic">No customers found.</div>
                ) : (
                  users.map((user) => (
                    <li key={user._id} className="py-4 flex justify-between items-center group hover:bg-gray-800/20 px-3 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Mocking a SaaS Plan Badge */}
                        <span className="hidden md:block text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          PRO PLAN
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          user.isBlocked ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {user.isBlocked ? "Suspended" : "Active"}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Panel>
        </div>

        {/* SaaS Sidebar Widgets */}
        <div className="space-y-8">
          <Panel title="Subscription Mix">
            <div className="space-y-5">
              {[
                { label: "Enterprise", val: "45%", color: "bg-indigo-500" },
                { label: "Professional", val: "35%", color: "bg-emerald-500" },
                { label: "Free Trial", val: "20%", color: "bg-gray-600" }
              ].map((tier, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">{tier.label}</span>
                    <span className="text-white font-bold">{tier.val}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`${tier.color} h-full`} style={{ width: tier.val }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="System Health" className="bg-indigo-900/5 border-indigo-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">All Systems Operational</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              API latency is currently <span className="text-white">42ms</span>. No service disruptions reported in the last 24 hours.
            </p>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdUser;