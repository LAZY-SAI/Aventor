import { FaArrowLeft } from 'react-icons/fa';
import {  useNavigate } from 'react-router-dom';
import {useState} from "react";
import Loading from '../../../Loading.jsx'
const AiLayout = ({ children, title,HeaderTitle, subtitle,currentStep = 1 }) => {
  const navigate = useNavigate();

  const [showLoading, setShowLoading] = useState(false);
  const options = [
    { id: 1, name: "1. Vibe & constraints", path: '/AiPlan' },
    { id: 2, name: "2. Preferences", path: "/AiPlan/preference" },
    { id: 3, name: "3. Review itinerary", path: "/AiPlan/Review" },

  ];


  const handleNext = () => {
    if(currentStep === 3){
      setShowLoading(true);
      return
    }
    const nextStep = options.find(opt => opt.id === currentStep + 1);
    if (nextStep) {
      navigate(nextStep.path);
    } else  {
       console.log('reached final step')

    }
    return nextStep;
  };
  if(showLoading){
    return(
      <Loading onComplete={(data)=>{
        navigate("/AiPlan/Final",{state:{plan:data}})
      }}
      />
    )
  }

  return (

   <>

     <div className="min-h-screen text-white p-6">
       {/*  Top Header */}
       <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
         <div>
           <h1 className="text-2xl font-bold">{title}</h1>
           <p className="text-gray-400 text-sm">{subtitle}</p>
         </div>


         {/* Navigation Buttons */}
         <div className='flex p-2 gap-4 py-4'>
           <button
               className='bg-gray-800 rounded-xl px-6 py-2 hover:bg-gray-700 transition-colors'
               onClick={() => navigate(-1)}
           >
             Back
           </button>

           <button
               onClick={handleNext}
               className={`font-semibold p-2 px-6 rounded-xl transition-colors ${
                   currentStep === 3
                       ? 'bg-emerald-500 text-white'
                       : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'
               }`}
           >
             {currentStep === 3 ? 'Finish' : 'Next'}
           </button>
         </div>
       </header>

       <main className="max-w-7xl mx-auto">
         {/* Step Header Section */}
         <section className="border border-emerald-900/30 p-6 rounded-xl mb-8">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-semibold">{HeaderTitle}</h2>
             <span className="bg-emerald-900 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30">
              Step {currentStep} of 3
            </span>
           </div>


           <div className="flex gap-3">
             {options.map((item) => (
                 <div
                     key={item.id}
                     className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors
                  ${item.id === currentStep
                         ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400'
                         : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                 >
                   {item.name}
                 </div>
             ))}
           </div>
         </section>

         {/*  Main */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <section className="lg:col-span-7">
             {children}
           </section>

           <aside className="lg:col-span-5 bg-gray-900 border border-zinc-800 p-6 rounded-xl h-fit">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold">Live itinerary preview</h3>
               <span className="bg-emerald-600 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded text-white">AI Draft</span>
             </div>
             <p className="text-zinc-400 text-sm mb-6">We'll sketch a first draft as soon as you confirm your vibe.</p>
             <div className="space-y-4">
              
             </div>
           </aside>
         </div>


       </main>
     </div>
   </>
  );
};

export default AiLayout;