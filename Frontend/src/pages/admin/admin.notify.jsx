import AdminLayout from "./adminLayout";
import Panel from "../../components/admin/Panel";
import { useState, useEffect, useCallback } from "react";
import { MdDelete, MdSend, MdNotificationsActive } from "react-icons/md";
import { FaInbox, FaGlobe, FaEnvelope } from "react-icons/fa";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";

const Notify = () => {
  const channels = [
    { id: 1, name: "In-App", icon: <FaInbox /> },
    { id: 2, name: "Web Push", icon: <FaGlobe /> },
    { id: 3, name: "Email", icon: <FaEnvelope /> },
  ];

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(channels[0].id);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const getChannelDetails = (id) => {
    return channels.find((c) => c.id === id) || { name: "Unknown", icon: null };
  };

  const handleDelete = useCallback((id) => {
    setRecentNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.info("Notification removed from history");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);


    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        title,
        message,
        channelId: selectedChannel,
        timestamps: new Date().toISOString(),
      };

      setRecentNotifications((prev) => [newNotification, ...prev]);
      setTitle("");
      setMessage("");
      setIsSending(false);
      toast.success(`Notification broadcasted via ${getChannelDetails(selectedChannel).name}`);
    }, 800);
  };

  useEffect(() => {
  
    // fetch("/api/notifications").then...
  }, []);

  return (
    <AdminLayout
      header={
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Broadcast</h2>
            <p className="text-sm text-gray-500 font-medium">Keep your travelers updated in real-time</p>
          </div>
        </header>
      }
    >
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Composition Area */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Panel title="Compose Message" subtitle="Craft your broadcast message">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-4">
              {/* Channel Selector */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 mb-4 block tracking-widest">
                  Target Channel
                </label>
                <div className="flex flex-wrap gap-3">
                  {channels.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedChannel(item.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300 border ${
                        selectedChannel === item.id
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40"
                          : "bg-gray-950/50 border-gray-800 text-gray-500 hover:border-gray-700"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-5">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-widest">
                    Subject / Title
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Flight Update: Gate Change"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    className="w-full p-4 bg-gray-950/50 text-white rounded-2xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-2 ml-1 tracking-widest">
                    Content Body
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter the notification details..."
                    className="w-full p-4 bg-gray-950/50 text-white rounded-2xl border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 p-4 rounded-2xl transition-all duration-300 text-white font-bold text-sm shadow-xl shadow-emerald-900/20 active:scale-95"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <MdSend /> Broadcast Notification
                  </>
                )}
              </button>
            </form>
          </Panel>
        </div>

        {/* Right: Preview & History */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Live Preview UI */}
          <Panel title="Live Preview">
            <div className="mt-4 p-6 bg-gray-950 rounded-3xl border border-gray-800 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <MdNotificationsActive size={20} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-white font-bold text-sm truncate">
                    {title || "Notification Preview"}
                  </h5>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-3">
                    {message || "Your message content will appear here once you start typing..."}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                     <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        {getChannelDetails(selectedChannel).name}
                     </span>
                     <span className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter">Now</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Recent List */}
          <Panel title="History">
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-20">
                   <MdNotificationsActive size={40} />
                   <p className="text-xs font-bold uppercase tracking-widest mt-2">No History</p>
                </div>
              ) : (
                recentNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col p-4 bg-gray-900/40 hover:bg-gray-800/40 border border-gray-800 hover:border-emerald-500/20 rounded-2xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-gray-950 text-gray-400 border border-gray-800">
                          {getChannelDetails(item.channelId).name}
                       </span>
                       <button
                         onClick={() => handleDelete(item.id)}
                         className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-600 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-lg"
                       >
                         <MdDelete size={14} />
                       </button>
                    </div>
                    <h6 className="text-white text-xs font-bold truncate mb-1">{item.title}</h6>
                    <p className="text-gray-500 text-[11px] line-clamp-1 mb-2">{item.message}</p>
                    <span className="text-[9px] text-gray-600 font-bold uppercase">
                      {format(new Date(item.timestamps), "MMM d, h:mm a")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Notify;