import { Reveal } from "../components/Reveal";
import { FaRoute, FaCompass, FaMapMarkedAlt, FaShieldAlt, FaCloudSun, FaUsers } from "react-icons/fa";

const Feature = () => {
  const services = [
    { 
      title: "AI Route Optimization", 
      desc: "Our neural engine calculates trail difficulty, elevation gain, and rest stops based on your fitness level.", 
      size: "md:col-span-4",
      icon: <FaRoute className="text-blue-400" />,
      tag: "Popular"
    },
    { 
      title: "Verified Guides", 
      desc: "Connect with locals certified by the Nepal Tourism Board.", 
      size: "md:col-span-2",
      icon: <FaUsers className="text-emerald-400" />
    },
    { 
      title: "Offline Maps", 
      desc: "Military-grade topo maps that work without GPS or Cell Service.", 
      size: "md:col-span-2",
      icon: <FaMapMarkedAlt className="text-orange-400" />
    },
    { 
      title: "Smart Weather Alerts", 
      desc: "Hyper-local forecasts for high-altitude passes to keep you ahead of the storm.", 
      size: "md:col-span-4",
      icon: <FaCloudSun className="text-sky-400" />,
      tag: "New"
    },
    { 
      title: "Rescue Protocols", 
      desc: "One-tap emergency satellite coordination and insurance verification.", 
      size: "md:col-span-3",
      icon: <FaShieldAlt className="text-rose-400" />
    },
    { 
      title: "Digital Permit Vault", 
      desc: "Store your TIMS and National Park permits securely in your digital pocket.", 
      size: "md:col-span-3",
      icon: <FaCompass className="text-purple-400" />
    },
  ];

  return (
    <section className="py-24 relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-blue-500 font-bold tracking-widest uppercase text-xs mb-3 block">Toolkit</span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
              Beyond the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Beaten Path.</span>
            </h2>
          </div>
          <p className="text-neutral-500 max-w-sm text-lg leading-tight">
            Advanced logistics for the modern explorer. Everything you need to survive and thrive in the Himalayas.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
        {services.map((s, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div className={`${s.size} group relative flex flex-col justify-between min-h-[280px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-10 transition-all hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]`}>
              
              {/* Card Header */}
              <div className="relative z-20">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  {s.tag && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                      {s.tag}
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{s.title}</h3>
                <p className="text-neutral-500 group-hover:text-neutral-400 transition-colors leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {/* Decorative Background Element */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Feature;