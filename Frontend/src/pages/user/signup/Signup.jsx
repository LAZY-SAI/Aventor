import { useState } from "react";
import { useAuth } from "../../../routes/Authenticator";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaLeaf, FaPhone } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const API_URI = import.meta.env.VITE_API_URI;


const InputField = ({ type, placeholder, value, onChange, icon, name, error, suffix }) => (
  <div className="relative w-full max-w-xs mb-6">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">{icon}</span>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full pl-10 pr-10 py-3 border-b-2 bg-transparent outline-none transition-all text-gray-700 ${
        error ? "border-red-500" : "border-gray-200 focus:border-indigo-600"
      }`}
    />
    {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400">{suffix}</span>}
    {error && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 absolute whitespace-nowrap">{error}</p>}
  </div>
);

const AuthOverlay = ({ isLoginView, onToggle }) => (
  <div className={`absolute top-0 left-0 w-1/2 h-full bg-indigo-600 z-50 transition-transform duration-700 ease-in-out flex flex-col items-center justify-center text-white text-center overflow-hidden ${isLoginView ? "translate-x-full" : "translate-x-0"}`}>
    <div className="p-12 z-10">
      <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">
        {isLoginView ? "Hello, Traveler!" : "Welcome Back!"}
      </h2>
      <p className="text-indigo-100 mb-10 font-medium">
        {isLoginView ? "Enter your personal details and start your journey." : "To keep connected please login with your info."}
      </p>
      <p className="text-indigo-100 mb-3 font-medium">{isLoginView ? "Already have an account?" : "Don't have an account?"}</p>
      <button onClick={onToggle} className="px-10 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-indigo-600 transition-all active:scale-95 shadow-xl">
        {isLoginView ? "Log In" : "Sign Up"}
      </button>
    </div>
    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50" />
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-50" />
  </div>
);

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({
    loginEmail: "", loginPassword: "",
    username: "", signupEmail: "", signupPassword: "",
    signupUser: "", signupFirst: "", signupLast: "", signupPhone: ""
  });
  const [errors, setErrors] = useState({});

  // --- REAL-TIME VALIDATION LOGIC ---
  const runRealTimeValidation = (name, value) => {
    let errorMsg = "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/;

    switch (name) {
      case "signupEmail":
      case "loginEmail":
        if (value && !emailRegex.test(value)) errorMsg = "Invalid email format";
        break;
      case "signupPhone":
        if (value && !phoneRegex.test(value)) errorMsg = "Enter 10-15 digits";
        break;
      case "signupPassword":
        if (value && value.length < 6) errorMsg = "Password too short (min 6)";
        break;
      case "username":
      case "signupUser":
        if (value && value.length < 3) errorMsg = "Username too short";
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
   
    const sanitizedValue = name === "signupPhone" ? value.replace(/[^\d+]/g, '') : value;

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    

    runRealTimeValidation(name, sanitizedValue);
  };

  // Final check before submission
  const validateAll = (isLogin) => {
    const newErrors = {};
    if (isLogin) {
      if (!formData.loginEmail) newErrors.loginEmail = "Email required";
      if (!formData.loginPassword) newErrors.loginPassword = "Password required";
    } else {
      if (!formData.signupFirst) newErrors.signupFirst = "Required";
      if (!formData.signupEmail || errors.signupEmail) newErrors.signupEmail = errors.signupEmail || "Email required";
      if (!formData.signupPhone || errors.signupPhone) newErrors.signupPhone = errors.signupPhone || "Phone required";
      if (formData.signupPassword.length < 6) newErrors.signupPassword = "Min 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignup = async (e) => {
    e.preventDefault();
    if (!validateAll(false)) return;
    try {
      const res = await fetch(`${API_URI}/signup`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({
          email: formData.signupEmail,
          firstName: formData.signupFirst,
          LastName: formData.signupLast,
          password: formData.signupPassword,
          username: formData.signupUser,
          phoneNumber: formData.signupPhone,
          
        }),
      });
      const data = await res.json();
      if (res.ok) toast.success("Account created! Please login.");
      else throw new Error(data.message || "Signup failed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    if (!validateAll(true)) return;
    try {
      const res = await fetch(`${API_URI}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: formData.loginEmail,
          password: formData.loginPassword,
        }),
      });
      const data = await res.json();
     console.log(data)
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      if(data.accessToken) localStorage.setItem("id",data.user.id)
      toast.success(`Welcome back, ${data.user.username}!`);
      login(data.user.username, data.token);
     setTimeout(() => {
  navigate(data.user.role === "ADMIN" ? "/admin" : "/construction")
   
}, 1500)
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 font-sans p-4">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-[900px] h-[650px] bg-white rounded-[2rem] shadow-2xl relative overflow-hidden flex">
        
        {/* REGISTER SECTION */}
        <div className={`absolute top-0 left-0 h-full w-1/2 flex flex-col justify-center items-center p-12 transition-all duration-700 z-10 ${!isLoginView ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"}`}>
          <h2 className="text-3xl font-black text-indigo-600 mb-4 uppercase">Register</h2>
          <form onSubmit={onSignup} className="w-full flex flex-col items-center overflow-y-auto max-h-full py-4 custom-scrollbar">
            <InputField type="text" placeholder="First Name" name="signupFirst" value={formData.signupFirst} onChange={handleInputChange} error={errors.signupFirst} />
            <InputField type="text" placeholder="Last Name" name="signupLast" value={formData.signupLast} onChange={handleInputChange} />
            <InputField type="tel" placeholder="Phone Number" name="signupPhone" value={formData.signupPhone} onChange={handleInputChange} icon={<FaPhone />} error={errors.signupPhone} />
            <InputField type="text" placeholder="Username" name="signupUser" value={formData.signupUser} onChange={handleInputChange} icon={<FaUser />} error={errors.signupUser} />
            <InputField type="email" placeholder="Email" name="signupEmail" value={formData.signupEmail} onChange={handleInputChange} icon={<FaEnvelope />} error={errors.signupEmail} />
            <InputField type="password" placeholder="Password" name="signupPassword" value={formData.signupPassword} onChange={handleInputChange} icon={<FaLock />} error={errors.signupPassword} />
            <button className="w-full max-w-xs py-3 mt-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Create Account</button>
          </form>
        </div>

        {/* LOGIN SECTION */}
        <div className={`absolute top-0 right-0 h-full w-1/2 flex flex-col justify-center items-center p-12 transition-all duration-700 z-10 ${isLoginView ? "opacity-0 -translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"}`}>
          <h2 className="text-3xl font-black text-indigo-600 mb-8 uppercase">Login</h2>
          <form onSubmit={onLogin} className="w-full flex flex-col items-center">
            <InputField type="email" placeholder="Email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange} icon={<FaEnvelope />} error={errors.loginEmail} />
            <InputField 
              type={showPass ? "text" : "password"} 
              placeholder="Password" name="loginPassword" 
              value={formData.loginPassword} onChange={handleInputChange} 
              icon={<FaLock />} error={errors.loginPassword}
              suffix={<div onClick={() => setShowPass(!showPass)}>{showPass ? <FaEyeSlash /> : <FaEye />}</div>}
            />
            <button className="w-full max-w-xs py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">Log In</button>
          </form>
          <button type="button" className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase hover:opacity-70 transition-opacity">
            <FaLeaf /> Continue as Guest
          </button>
        </div>

        <AuthOverlay isLoginView={isLoginView} onToggle={() => { setIsLoginView(!isLoginView); setErrors({}); }} />
      </div>
    </div>
  );
};

export default Signup;