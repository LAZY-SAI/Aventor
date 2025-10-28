
const Signup = () => {
  return (
    <div className="flex justify-center items-center min-h-screen ">
      <form className="flex flex-col bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>
        
        <input
          type="text"
          placeholder="Full Name"
          className="border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        
        <button className="bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600 transition">
          Create Account
        </button>

      </form>
    </div>
  );
};

export default Signup;
