import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_BASE = "http://localhost:8000";

async function request(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("civicbenefit_token")
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("civicbenefit_user")
      );
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(
        "civicbenefit_token",
        token
      );
    } else {
      localStorage.removeItem("civicbenefit_token");
    }

    if (user) {
      localStorage.setItem(
        "civicbenefit_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("civicbenefit_user");
    }
  }, [token, user]);

  const signup = (name, email) =>
    request("/api/auth/signup", {
      name,
      email,
    });

  const sendLoginOtp = (email) =>
    request("/api/auth/send-otp", {
      email,
    });

  const verifyOtp = async (email, otp) => {
    const data = await request(
      "/api/auth/verify-otp",
      {
        email,
        otp,
      }
    );

    setToken(data.access_token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        signup,
        sendLoginOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return value;
}