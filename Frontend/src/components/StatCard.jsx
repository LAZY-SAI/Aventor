import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "positive", 
  icon: Icon, 
  sparkData, 
  color, 
  delay = 0 
}) => {
  // Mapping the sparkData array to the format Recharts expects
  const chartData = sparkData.map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-900/40 border border-white/5 backdrop-blur-md p-5 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-2xl"
    >
      {/* Dynamic Glow effect on hover */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}33, transparent)` }}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black mt-1 text-white tracking-tighter">{value}</p>
          
          {change && (
            <p className={`text-[10px] mt-1 font-bold uppercase tracking-tight ${
              changeType === "positive" 
                ? "text-emerald-400" 
                : changeType === "negative" 
                ? "text-rose-400" 
                : "text-gray-400"
            }`}>
              {change}
            </p>
          )}
        </div>
        
        {/* Icon Container */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="h-12 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${title.replace(/\s+/g, '')})`}
              dot={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StatCard;