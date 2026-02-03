import { useState } from "react";
import { useAuth } from '../../../routes/Authenticator';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaLeaf } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const API_URI = import.meta.env.VITE_API_URI;

const InputField = ({ type, placeholder, value, onChange, icon, name, error, suffix }) => (
  <div className="relative w-full max-w-xs mb-6">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      className={`w-full pl-10 pr-10 py-3 border-b-2 bg-transparent outline-none transition-all text-gray-700 ${
        error ? "border-red-500" : "border-gray-200 focus:border-indigo-600"
      }`}
    />
    {suffix && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-indigo-600">
        {suffix}
      </span>
    )}
    {error && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 absolute">{error}</p>}
  </div>
);

const Signup = () => {
  const navigate = useNavigate();
  const {login} = useAuth()
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
    username: "",
    signupEmail: "",
    signupPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleToggle = () => {
    setIsLoginView(!isLoginView);
    setErrors({});
  };

  const validate = (isLogin) => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isLogin) {
      if (!formData.loginEmail) newErrors.loginEmail = "Email required";
      if (!formData.loginPassword) newErrors.loginPassword = "Password required";
    } else {
      if (!formData.username) newErrors.username = "Username required";
      if (!emailRegex.test(formData.signupEmail)) newErrors.signupEmail = "Invalid email";
      if (formData.signupPassword.length < 6) newErrors.signupPassword = "Min 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate(true)) return;
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
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      toast.success(`Welcome back, ${data.user.username}!`);
      login(data.user.username, data.token)
      setTimeout(() => navigate(data.user.role === "ADMIN" ? "/admin" : "/userdash"), 1500);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 font-sans p-4">
      <ToastContainer />

      <div className="w-full max-w-[900px] h-[600px] bg-white rounded-[2rem] shadow-2xl relative overflow-hidden flex">
        
        {/* --- SIGN UP FORM  */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col justify-center items-center p-12 transition-all duration-700 ease-in-out z-10 ${
           !isLoginView ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"
          }`}
        >
          <h2 className="text-3xl font-black text-indigo-600 mb-8 uppercase tracking-tighter">Register</h2>
          <form className="w-full flex flex-col items-center">
            <InputField type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} icon={<FaUser />} error={errors.username} />
            <InputField type="email" placeholder="Email" name="signupEmail" value={formData.signupEmail} onChange={handleInputChange} icon={<FaEnvelope />} error={errors.signupEmail} />
            <InputField type="password" placeholder="Password" name="signupPassword" value={formData.signupPassword} onChange={handleInputChange} icon={<FaLock />} error={errors.signupPassword} />
            <button className="w-full max-w-xs py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
              Create Account
            </button>
          </form>
        </div>

        {/* --- LOGIN FORM */}
        <div 
          className={`absolute top-0 right-0 h-full w-1/2 flex flex-col justify-center items-center p-12 transition-all duration-700 ease-in-out z-10 ${
            isLoginView ? "opacity-0 -translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"
          }`}
        >
          <h2 className="text-3xl font-black text-indigo-600 mb-8 uppercase tracking-tighter">Login</h2>
          <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
            <InputField type="email" placeholder="Email" name="loginEmail" value={formData.loginEmail} onChange={handleInputChange} icon={<FaEnvelope />} error={errors.loginEmail} />
            <InputField type={showPass ? "text" : "password"} placeholder="Password" name="loginPassword" value={formData.loginPassword} onChange={handleInputChange} icon={<FaLock />} error={errors.loginPassword} suffix={<div onClick={() => setShowPass(!showPass)}>{showPass ? <FaEyeSlash /> : <FaEye />}</div>} />
            <button className="w-full max-w-xs py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
             Login In
            </button>
          </form>
          <button type="button" className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest hover:opacity-70 transition-opacity">
            <FaLeaf /> Continue as Guest
          </button>
        </div>

        {/* --- MOVING OVERLAY PANEL --- */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full bg-indigo-600 z-50 transition-transform duration-700 ease-in-out flex flex-col items-center justify-center text-white text-center overflow-hidden ${
            isLoginView ? "translate-x-full" : "translate-x-0"
          }`}
        >
        
          <div className="p-12 transition-all duration-500">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">
              {isLoginView ? "Hello, Traveler!" : "Welcome Back!"}
            </h2>
            <p className="text-indigo-100 mb-10 font-medium">
              {isLoginView 
                ? "Enter your personal details and start your journey with us." 
                : "To keep connected with us please login with your personal info."}
            </p>
            <button 
              onClick={handleToggle}
              className="px-10 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-indigo-600 transition-all active:scale-95 shadow-xl"
            >
              {isLoginView ? "Log In" : "Sign Up"}
            </button>
          </div>
          
          {/* Visual fluff for the overlay background */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-50"></div>
        </div>

      </div>
    </div>
  );
};

export default Signup;