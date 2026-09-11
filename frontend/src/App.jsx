import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import SchemeExplorer from "./pages/SchemeExplorer";
import ApplicationPlanner from "./pages/ApplicationPlanner";
import Auth from "./pages/Auth";

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/profile"element={<Protected><Profile /></Protected>}/>
            <Route path="/profile/edit"element={<Protected><EditProfile /></Protected>}/>
            <Route path="/analysis"element={<Protected><Analysis /></Protected>}/>
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/planner" element={<Protected><ApplicationPlanner /></Protected>} />
            <Route path="/schemes" element={<SchemeExplorer />} />
          </Routes>
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
