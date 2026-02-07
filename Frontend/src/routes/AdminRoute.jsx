import { Routes, Route } from "react-router-dom";
import AdminDash from "../pages/admin/AdminDash";
import AdUser from "../pages/admin/admin.user";
import AdDestination from "../pages/admin/admin.destination";
import AdSetting from "../pages/admin/admin.setting";
import AdNotify from "../pages/admin/admin.notify";
import AdItinery from "../pages/admin/admin.itinery";
import ItEdit from "../components/admin/ItEdit";
const AdminRoutes = () => {
  return (
    <Routes>
      {/* Index route - shows when at /admindash */}
      <Route index element={<AdminDash />} />

      {/* Nested admin routes */}
      <Route path="users" element={<AdUser />} />
      <Route path="destination" element={<AdDestination />} />
      <Route path="setting" element={<AdSetting />} />
      <Route path="notify" element={<AdNotify />} />
      <Route path="Itinery" element={<AdItinery />} />
      <Route path="EditItinerary" element={<ItEdit />} />
    </Routes>
  );
};

export default AdminRoutes;
