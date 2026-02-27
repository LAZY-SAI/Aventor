import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./routes/Authenticator";
import ProtectedRoute from "./routes/ProtectedRoute";
import Land from "./section/Landing";
import Signup from "./pages/user/signup/Signup";
import Footer from "./section/Footer";
import Userdash from "./pages/user/UserDash";
import Construction from "./pages/user/toBecontinue/Construction";
import UserRoutes from "./routes/UserRoute";
import AdminRoutes from "./routes/AdminRoute";
import AiRoute from "./routes/AiRoute";
import Nav from "./components/Nav";
import Discover from "./pages/user/discover/Discover";
import Post from "./pages/user/post/Post";
import Profile from "./pages/user/profile/Profile";
const App = () => {
  const location = useLocation();

  const hideFooterRoutes = [
    "/signup",
    "/construction",
    "/userdash",
    "/plan",
    "/profile",
    "/posts",
    "/discover",
    "/admin",
    "/admin/users",
    "/admin/destination",
    "/admin/trip",
    "/admin/notify",
    "/admin/setting",
    "/admin/itinery",
    "/admin/editItinerary/:id/items",
    "/admin/interests",
    "/plan/create",
    "/plan/set",
    "/plan/preview",
    "/plan/myplan",
    "/plan/packages",
    "/AiPlan",
    "/AiPlan/preference",
    "/AiPlan/Review",
    "/AiPlan/Final",
  ];

  const showNavRoutes = [
    "/userdash",
    "/plan",
    "/profile",
    "/posts",
    "/discover",
  ];

  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);
  const shouldShowNav = showNavRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      <div className="container mx-auto max-w-8xl">
        <Routes>
          {/**public routes */}
          <Route
            path="/"
            element={
              <>
                <Land />
              </>
            }
          />
          <Route path="/signup" element={<Signup />} />
           <Route path="/userdash" element={<Userdash />} />

            <Route path="/construction" element={<Construction />} />

          {/**protected Routes⬇ */}

         
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />

          {/* User planning routes with wildcard */}
          <Route
            path="/plan/*"
            element={
              <ProtectedRoute>
                <UserRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AiPlan/*"
            element={
              <ProtectedRoute>
                <AiRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <Post />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

        

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Bottom fixed nav */}
      {shouldShowNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4">
          <div className="w-full max-w-7xl">
            <Nav />
          </div>
        </div>
      )}

      {!shouldHideFooter && <Footer />}
    </AuthProvider>
  );
};

export default App;
