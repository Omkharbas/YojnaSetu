import React, { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);

const DEFAULT_PROFILE = {
  name: "",
  age: 18,
  gender: "Male",
  state: "Maharashtra",
  district: "",
  marital_status: "Single",
  annual_income: 0,
  employment_status: "Unemployed",
  bpl_status: false,
  income_category: "APL",
  category: "General",
  disability_status: false,
  minority_status: false,
  family_members: 1,
  children: 0,
  girl_children: 0,
  pregnant_or_lactating: false,
  education_level: "",
  student_status: false,
  course: "",
  institution_type: "",
  occupation: "Unemployed",
  owns_house: false,
  rural: true,
  homeless: false,
  owns_land: false,
  health_insurance: false,
  documents: [],
  bank_account: false,
};

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("civicbenefit_profile");
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [analysis, setAnalysis] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    localStorage.setItem("civicbenefit_profile", JSON.stringify(profile));
  }, [profile]);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        analysis,
        setAnalysis,
        completedSteps,
        setCompletedSteps,
        DEFAULT_PROFILE,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
