import { MdDashboard } from "react-icons/md";
import { FaUsers, FaMap, FaBell, FaRoute } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";

const NavItem = ({ name, logo, isActive }) => {
  const baseClasses =
    "w-[12rem] flex items-center text-sm p-3 gap-3 rounded-xl cursor-pointer transition-all duration-200 group ";

  const activeClasses = " bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
  const inactiveClasses = "text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent";

  return (
    <div className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      <span className={`text-lg ${isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-emerald-400 transition-colors"}`}>
        {logo}
      </span>
      <span className={`font-semibold tracking-wide ${isActive ? "text-white" : ""}`}>
        {name}
      </span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      )}
    </div>
  );
};

const AdminNav = () => {
  const location = useLocation();
  
  const isActiveLink = (linkpath) => {
    return location.pathname === linkpath;
  };

  const Navop = [
    {
      id: 1,
      name: "Dashboard",
      logo: <MdDashboard />,
      Link: "/admin",
      category: "Overview",
    },
    {
      id: 2,
      name: "Users",
      logo: <FaUsers />,
      Link: "/admin/users",
      category: "Overview",
    },
    {
      id: 3,
      name: "Destinations",
      logo: <FaMap />,
      Link: "/admin/destination",
      category: "Overview",
    },
    {
      id: 4,
      name: "Itineraries",
      logo: <FaRoute />, 
      Link: "/admin/itinery",
      category: "Overview",
    },
   
    {
      id: 5,
      name: "Settings",
      logo: <IoSettingsOutline />,
      Link: "/admin/setting",
      category: "System",
    },
    {
      id: 6,
      name: "Logout",
      Link: "/signup",
      logo: <CiLogout />,
      category: "System",
    },
  ];

  const groups = Navop.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <nav className="min-h-screen p-6 text-white w-64 md:w-72  border-r border-gray-900 flex flex-col">
      {/* Brand Header */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-2">
         
          <h1 className="text-xl font-black tracking-tighter text-white uppercase">
           Yatri<span className="text-emerald-500">ka</span>
          </h1>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-grow">
        {Object.entries(groups).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 ">
              {category}
            </h3>

            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <Link key={item.id} to={item.Link} className="w-full block">
                  <NavItem
                    name={item.name}
                    logo={item.logo}
                    isActive={isActiveLink(item.Link)}
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/*  Footer  */}
      <div className="pt-6 border-t border-gray-900 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-200">Admin User</span>
            <span className="text-[10px] text-gray-500 font-medium">System Manager</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;