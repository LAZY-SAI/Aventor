import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  MapPin, 
  MessageSquare, 
  FileText, 
  Shield, 
  Zap, 
  BarChart3 
} from "lucide-react";


import AdminLayout from "./adminLayout";
import StatCard from "../../components/StatCard";
import MetricsPieChart from "../../components/PieChart";
import ActivityLog from "../../components/ActivityLog";

const AdminDash = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URI}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Dashboard synchronization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <div className="text-accent font-mono animate-pulse tracking-widest text-xs uppercase">
            Initializing Cluster...
          </div>
        </div>
      </div>
    );
  }

  // --- Data Transformations ---

  const totalUsers = data?.totalUsers || 0;
  const totalContent = (data?.destinationCount || 0) + (data?.reviewCount || 0) + (data?.postCount || 0);

  const stats = [
    { 
      title: "Total Users", 
      value: totalUsers, 
      icon: Users, 
      sparkData: [3, 5, 8, 10, 12, 15, totalUsers], 
      color: "#6366f1" 
    },
    { 
      title: "Active Users", 
      value: data?.activeUsers || 0, 
      change: `${Math.round(((data?.activeUsers || 0) / (totalUsers || 1)) * 100)}% of total`, 
      changeType: "positive", 
      icon: Zap, 
      sparkData: [2, 5, 3, 9, 6, 10, data?.activeUsers || 0], 
      color: "#10b981" 
    },
    { 
      title: "New (7 Days)", 
      value: data?.newUsersLast7Days || 0, 
      change: `${Math.round(((data?.newUsersLast7Days || 0) / (totalUsers || 1)) * 100)}% growth`, 
      changeType: "positive", 
      icon: UserPlus, 
      sparkData: [1, 2, 4, 3, 6, 7, data?.newUsersLast7Days || 0], 
      color: "#f59e0b" 
    },
    { 
      title: "Destinations", 
      value: data?.destinationCount || 0, 
      icon: MapPin, 
      sparkData: [5, 8, 10, 12, 15, 18, data?.destinationCount || 0], 
      color: "#3b82f6" 
    },
    { 
      title: "Total Reviews", 
      value: data?.reviewCount || 0, 
      icon: MessageSquare, 
      sparkData: [2, 4, 5, 7, 8, 10, data?.reviewCount || 0], 
      color: "#8b5cf6" 
    },
    { 
      title: "Posts", 
      value: data?.postCount || 0, 
      icon: FileText, 
      sparkData: [0, 1, 1, 2, 2, 3, data?.postCount || 0], 
      color: "#f43f5e" 
    },
  ];

  const userPieData = [
    { name: "Total Users", value: totalUsers, color: "#6366f1" },
    { name: "Active Now", value: data?.activeUsers || 0, color: "#10b981" },
    { name: "New (7d)", value: data?.newUsersLast7Days || 0, color: "#f59e0b" },
  ];

  const contentPieData = [
    { name: "Destinations", value: data?.destinationCount || 0, color: "#3b82f6" },
    { name: "Reviews", value: data?.reviewCount || 0, color: "#8b5cf6" },
    { name: "Posts", value: data?.postCount || 0, color: "#f43f5e" },
  ];

  const logEntries = [
    { id: "1", type: "success", message: "Dashboard synchronized successfully", time: "Just now" },
    { id: "2", type: "info", message: "Security protocols active", time: "System start" },
    { id: "3", type: "info", message: `Fetched ${totalUsers} user records`, time: "On load" },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background grid-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Dashboard Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8"
          >
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
                {[
                  { icon: Shield, label: "Secure" },
                  { icon: Zap, label: "Live" },
                  { icon: BarChart3, label: "Syncing" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, i) => (
              <StatCard key={stat.title} {...stat} delay={i * 0.1} />
            ))}
          </div>

          {/* Analytics & Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MetricsPieChart 
                title="User Distribution" 
                subtitle="Active vs Total breakdown" 
                data={userPieData} 
                centerValue={totalUsers} 
                centerLabel="Total" 
                delay={0.5} 
              />
            </div>
            <div className="lg:col-span-1">
              <MetricsPieChart 
                title="Content Metrics" 
                subtitle="Distribution by content type" 
                data={contentPieData} 
                centerValue={totalContent} 
                centerLabel="Items" 
                delay={0.6} 
              />
            </div>
            <div className="lg:col-span-1">
              <ActivityLog entries={logEntries} delay={0.7} />
            </div>
          </div>
          
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDash;