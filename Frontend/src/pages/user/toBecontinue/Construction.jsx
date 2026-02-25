import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHammer, FaCompass } from 'react-icons/fa';

const Construction = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark Overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/yatrika.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content Layer */}
      <div className="relative z-20 text-center px-6 max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-full animate-pulse">
            <FaHammer className="text-emerald-500 text-4xl" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase">
          Expedition <br /> <span className="text-emerald-500">In Progress</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          We're currently charting new territories and building a seamless experience for your next Nepal adventure. This peak is still being conquered.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
            Turn Back
          </button>
          
          <button
            onClick={() => window.location.href = 'mailto:support@aventor.com'}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900/50 text-white border border-white/10 backdrop-blur-md font-black rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            <FaCompass /> Notify Me
          </button>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-20 w-full max-w-md mx-auto">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">
            <span>Base Camp</span>
            <span>Summit</span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[65%] animate-shimmer relative">
              <div className="absolute top-0 right-0 w-8 h-full bg-white/20 blur-md" />
            </div>
          </div>
          <p className="text-center mt-4 text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest">
            65% Conquered
          </p>
        </div>
      </div>

      {/* Decorative Corner Text */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em] vertical-text">
          Aventor Systems 2026
        </p>
      </div>
    </div>
  );
};

export default Construction;