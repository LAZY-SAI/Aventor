import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
};

const colors = {
  success: "text-emerald-400",
  warning: "text-amber-400",
  info: "text-blue-400",
  error: "text-rose-400",
};

const bgColors = {
  success: "bg-emerald-500/10",
  warning: "bg-amber-500/10",
  info: "bg-blue-500/10",
  error: "bg-rose-500/10",
};

const borderColors = {
  success: "border-emerald-500/20",
  warning: "border-amber-500/20",
  info: "border-blue-500/20",
  error: "border-rose-500/20",
};

const ActivityLog = ({ entries=[], delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-900/40 border border-white/5 backdrop-blur-md p-6 rounded-3xl shadow-2xl h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          <h3 className="text-sm font-bold text-white/90 tracking-tight">System Activity</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {entries.map((entry, i) => {
          const Icon = icons[entry.type] || Info;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + i * 0.05 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border ${bgColors[entry.type]} ${borderColors[entry.type]} hover:bg-white/5 transition-all cursor-default group`}
            >
              <div className={`p-2 rounded-lg bg-black/20 ${colors[entry.type]}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-200 leading-snug">
                  {entry.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Timestamp</span>
                  <span className="text-[10px] text-gray-400 font-mono italic">
                    {entry.time}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {entries.length === 0 && (
          <div className="h-40 flex flex-col items-center justify-center text-gray-600">
            <Info className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-medium">No recent logs found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityLog;