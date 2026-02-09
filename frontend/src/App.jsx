import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useChatStore } from "./store/chatStore";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfAuth from "./components/RedirectIfAuth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PetList from "./pages/PetList";
import AdoptionRequests from "./pages/AdoptionRequests";
import AdoptedPets from "./pages/AdoptedPets";
import Profile from "./pages/Profile";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import Landing from "./pages/Landing";
import ShelterDashboard from "./pages/shelter/ShelterDashboard";
import PetManagement from "./pages/shelter/PetManagement";
import ShelterProfile from "./pages/shelter/ShelterProfile";
import ShelterAdoptionRequests from "./pages/shelter/ShelterAdoptionRequests";
import ShelterAdoptedPets from "./pages/shelter/ShelterAdoptedPets";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPets from "./pages/admin/AdminPets";
import AdminAdoptions from "./pages/admin/AdminAdoptions";
import { registerServiceWorker, ensurePushSubscription } from "./utils/pwaClient";
import "./App.css";
import "./pages/ChatStyles.css";
import "./EnhancedStyles.css";

function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated } = useAuthStore();
  const { initSocket, disconnectSocket, fetchUnreadCount } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    ensurePushSubscription().catch((err) => console.error("Push subscription failed", err));
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
      fetchUnreadCount();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, initSocket, disconnectSocket, fetchUnreadCount]);

  return (
    <Router>
      <Layout isCheckingAuth={isCheckingAuth}>
        {isCheckingAuth ? (
          <div className="loader">Checking session…</div>
        ) : (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/login"
              element=
                {
                  <RedirectIfAuth>
                    <Login />
                  </RedirectIfAuth>
                }
            />
            <Route
              path="/signup"
              element=
                {
                  <RedirectIfAuth>
                    <Signup />
                  </RedirectIfAuth>
                }
            />
            <Route
              path="/verify"
              element=
                {
                  <RedirectIfAuth>
                    <VerifyEmail />
                  </RedirectIfAuth>
                }
            />
            <Route
              path="/forgot-password"
              element=
                {
                  <RedirectIfAuth>
                    <ForgotPassword />
                  </RedirectIfAuth>
                }
            />
            <Route
              path="/reset-password/:token"
              element=
                {
                  <RedirectIfAuth>
                    <ResetPassword />
                  </RedirectIfAuth>
                }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shelter/dashboard"
              element={
                <ProtectedRoute shelterOnly>
                  <ShelterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shelter/pets"
              element={
                <ProtectedRoute shelterOnly>
                  <PetManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shelter/profile"
              element={
                <ProtectedRoute shelterOnly>
                  <ShelterProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shelter/requests"
              element={
                <ProtectedRoute shelterOnly>
                  <ShelterAdoptionRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shelter/adopted"
              element={
                <ProtectedRoute shelterOnly>
                  <ShelterAdoptedPets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pets"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/adoptions"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAdoptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pets"
              element={
                <ProtectedRoute>
                  <PetList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <AdoptionRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adopted"
              element={
                <ProtectedRoute>
                  <AdoptedPets />
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
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Layout>
    </Router>
  );
}

export default App;
