import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export const DEFAULT_PROFILE = {
  name: "",
  age: "",
  gender: "",
  state: "",
  district: "",
  marital_status: "",

  annual_income: "",
  employment_status: "",
  bpl_status: false,
  income_category: "",

  category: "",
  disability_status: false,
  minority_status: false,

  family_members: "",
  children: "",
  girl_children: "",
  pregnant_or_lactating: false,

  education_level: "",
  student_status: false,
  course: "",
  institution_type: "",

  occupation: "",

  owns_house: false,
  rural: true,
  homeless: false,

  owns_land: false,
  health_insurance: false,

  documents: [],
  bank_account: false,
};

export function AppProvider({ children }) {
  const { user } = useAuth();

  /*
   * Every email gets its own profile.
   */
  const profileKey = user?.email
    ? `civicbenefit_profile_${user.email.toLowerCase().trim()}`
    : null;

  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const [analysis, setAnalysis] = useState(null);

  const [completedSteps, setCompletedSteps] = useState({});


  /* =====================================================
     LOAD PROFILE WHEN USER LOGS IN
  ===================================================== */

  useEffect(() => {
    if (!profileKey) {
      setProfile(DEFAULT_PROFILE);
      setAnalysis(null);
      return;
    }

    try {
      const saved = localStorage.getItem(profileKey);

      if (saved) {
        setProfile({
          ...DEFAULT_PROFILE,
          ...JSON.parse(saved),
        });
      } else {
        setProfile(DEFAULT_PROFILE);
      }

      setAnalysis(null);
      setCompletedSteps({});
    } catch {
      setProfile(DEFAULT_PROFILE);
      setAnalysis(null);
      setCompletedSteps({});
    }
  }, [profileKey]);


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  useEffect(() => {
    if (!profileKey) return;

    localStorage.setItem(
      profileKey,
      JSON.stringify(profile)
    );
  }, [profile, profileKey]);


  /* =====================================================
     CHECK WHETHER BASIC PROFILE IS COMPLETE
  ===================================================== */

  const isProfileComplete =
    Boolean(
      profile.name?.trim() &&
      Number(profile.age) > 0 &&
      profile.gender &&
      profile.state?.trim() &&
      profile.district?.trim() &&
      profile.annual_income !== "" &&
      profile.annual_income !== null &&
      profile.annual_income !== undefined &&
      profile.category &&
      profile.occupation
    );


  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,

        analysis,
        setAnalysis,

        completedSteps,
        setCompletedSteps,

        isProfileComplete,

        DEFAULT_PROFILE,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}


export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error(
      "useApp must be used within AppProvider"
    );
  }

  return ctx;
}