import AIChatbot from "./components/AIChatbot";
import React from "react";
import { Routes, Route } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ProfileSetup from "./pages/ProfileSetup";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import SchemeExplorer from "./pages/SchemeExplorer";
import ApplicationPlanner from "./pages/ApplicationPlanner";
import Auth from "./pages/Auth";


/* =========================================================
   PROTECTED PAGE
========================================================= */

const Protected = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);


/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>

        <div className="min-h-screen bg-slate-50">

          <Navbar />

          <Routes>

            {/* ================= HOME ================= */}

            <Route
              path="/"
              element={<Landing />}
            />


            {/* ================= LOGIN ================= */}

            <Route
              path="/login"
              element={<Auth mode="login" />}
            />


            {/* ================= SIGNUP ================= */}

            <Route
              path="/signup"
              element={<Auth mode="signup" />}
            />


            {/* ================= PROFILE SETUP =================
                This page is accessible only after login.
                It is NOT automatically forced on every page.
            ================================================= */}

            <Route
              path="/profile/setup"
              element={
                <Protected>
                  <ProfileSetup />
                </Protected>
              }
            />


            {/* ================= PROFILE ================= */}

            <Route
              path="/profile"
              element={
                <Protected>
                  <Profile />
                </Protected>
              }
            />


            {/* ================= EDIT PROFILE ================= */}

            <Route
              path="/profile/edit"
              element={
                <Protected>
                  <EditProfile />
                </Protected>
              }
            />


            {/* ================= ANALYSIS ================= */}

            <Route
            
              path="/analysis"
              element={
                <Protected>
                  <Analysis />
                </Protected>
              }
              
            />


            {/* ================= DASHBOARD ================= */}

            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />


            {/* ================= SCHEME EXPLORER ================= */}

            <Route
              path="/schemes"
              element={<SchemeExplorer />}
            />


            {/* ================= MY APPLICATIONS ================= */}

            <Route
              path="/planner"
              element={
                <Protected>
                  <ApplicationPlanner />
                </Protected>
              }
            />

                    </Routes>

          <AIChatbot />

        </div>

      </AppProvider>
    </AuthProvider>
  );
}