import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900/90 border border-white/10 backdrop-blur-md px-3 py-2 text-xs rounded-lg shadow-xl">
        <span className="text-white font-medium">{payload[0].name}: </span>
        <span className="text-gray-400">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

const MetricsPieChart = ({ title, subtitle, data, centerValue, centerLabel, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-900/40 border border-white/5 backdrop-blur-md p-6 rounded-3xl shadow-2xl h-full"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white/90 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Chart Container */}
        <div className="relative w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                cornerRadius={6}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text Overlay */}
          {centerValue !== undefined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white tracking-tighter">
                {centerValue}
              </span>
              {centerLabel && (
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {centerLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-3 flex-1 w-full">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" 
                  style={{ background: item.color }} 
                />
                <span className="text-xs text-gray-400 font-medium group-hover:text-gray-200 transition-colors">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-bold text-white font-mono">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsPieChart;