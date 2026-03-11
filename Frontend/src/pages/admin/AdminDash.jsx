import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Users, UserPlus, MapPin, MessageSquare, 
  FileText, Shield, Zap, BarChart3 
} from "lucide-react";

import AdminLayout from "./adminLayout";
import StatCard from "../../components/StatCard";
import MetricsPieChart from "../../components/PieChart";
// import ActivityLog from "../../components/ActivityLog";

const AdminDash = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Unauthorized: No access token found.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URI}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to sync cluster data");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Derived State & Data Transformations ---
  const { stats, userPieData, contentPieData, totals } = useMemo(() => {
    if (!data) return { stats: [], userPieData: [], contentPieData: [], totals: {} };

    const totalUsers = data.totalUsers || 0;
    const activeUsers = data.activeUsers || 0;
    const newUsers = data.newUsersLast7Days || 0;
    const destinations = data.destinationCount || 0;
    const reviews = data.reviewCount || 0;
    const posts = data.postCount || 0;
    
    const calcPct = (val) => `${Math.round((val / (totalUsers || 1)) * 100)}%`;

    return {
      totals: {
        users: totalUsers,
        content: destinations + reviews + posts,
        revenue: data.totalRevenue || 0
      },
      stats: [
        { title: "Total Users", value: totalUsers, icon: Users, color: "#6366f1", sparkData: [3, 5, 8, 10, 12, 15, totalUsers] },
        { title: "Active Users", value: activeUsers, change: `${calcPct(activeUsers)} of total`, icon: Zap, color: "#10b981", sparkData: [2, 5, 3, 9, 6, 10, activeUsers] },
        { title: "New (7 Days)", value: newUsers, change: `${calcPct(newUsers)} growth`, icon: UserPlus, color: "#f59e0b", sparkData: [1, 2, 4, 3, 6, 7, newUsers] },
        { title: "Destinations", value: destinations, icon: MapPin, color: "#3b82f6", sparkData: [5, 8, 10, 12, 15, 18, destinations] },
        { title: "Total Reviews", value: reviews, icon: MessageSquare, color: "#8b5cf6", sparkData: [2, 4, 5, 7, 8, 10, reviews] },
        { title: "Posts", value: posts, icon: FileText, color: "#f43f5e", sparkData: [0, 1, 1, 2, 2, 3, posts] },
      ],
      userPieData: [
        { name: "Total Users", value: totalUsers, color: "#6366f1" },
        { name: "Active Now", value: activeUsers, color: "#10b981" },
        { name: "New (7d)", value: newUsers, color: "#f59e0b" },
      ],
      contentPieData: [
        { name: "Destinations", value: destinations, color: "#3b82f6" },
        { name: "Reviews", value: reviews, color: "#8b5cf6" },
        { name: "Posts", value: posts, color: "#f43f5e" },
      ]
    };
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background grid-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <DashboardHeader />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, i) => (
              <StatCard key={stat.title} {...stat} delay={i * 0.1} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MetricsPieChart 
              title="User Distribution" 
              data={userPieData} 
              centerValue={totals.users} 
              centerLabel="Total" 
              delay={0.5} 
            />
            <MetricsPieChart 
              title="Content Metrics" 
              data={contentPieData} 
              centerValue={totals.content} 
              centerLabel="Items" 
              delay={0.6} 
            />
            <RevenueCard amount={totals.revenue} />
          </div>
          
        </div>
      </div>
    </AdminLayout>
  );
};

// --- Sub-components ---

const DashboardHeader = () => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
      <span className="text-[10px] text-accent font-mono uppercase tracking-widest">System Online</span>
    </div>
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform analytics & health monitoring</p>
      </div>
      <div className="flex items-center gap-2">
        {[{ icon: Shield, label: "Secure" }, { icon: Zap, label: "Live" }, { icon: BarChart3, label: "Syncing" }].map(({ icon: Icon, label }) => (
          <div key={label} className="bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const RevenueCard = ({ amount }) => (
  <div className="p-6 rounded-2xl h-full flex items-center justify-center text-center bg-white/5 border border-white/10 backdrop-blur-md">
    <div>
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</h2>
      <p className="text-4xl font-black text-foreground mt-2">
        NPR {(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <div className="text-accent font-mono animate-pulse tracking-widest text-xs uppercase">Initializing Cluster...</div>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center text-red-500 font-mono">
    [ERROR]: {message}
  </div>
);

export default AdminDash;