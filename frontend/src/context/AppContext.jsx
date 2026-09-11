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
   * =====================================================
   * USER-SPECIFIC STORAGE KEYS
   * =====================================================
   */

  const email = user?.email?.toLowerCase().trim();

  const profileKey = email
    ? `civicbenefit_profile_${email}`
    : null;

  const analysisKey = email
    ? `civicbenefit_analysis_${email}`
    : null;

  /*
   * =====================================================
   * STATE
   * =====================================================
   */

  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const [analysis, setAnalysis] = useState(null);

  const [completedSteps, setCompletedSteps] = useState({});

  const [profileLoaded, setProfileLoaded] = useState(false);

  /*
   * =====================================================
   * LOAD USER DATA
   * =====================================================
   */

  useEffect(() => {
    if (!email) {
      setProfile(DEFAULT_PROFILE);
      setAnalysis(null);
      setCompletedSteps({});
      setProfileLoaded(false);
      return;
    }

    try {
      /*
       * -------------------------
       * LOAD PROFILE
       * -------------------------
       */

      const savedProfile = localStorage.getItem(profileKey);

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);

        setProfile({
          ...DEFAULT_PROFILE,
          ...parsedProfile,
        });
      } else {
        setProfile(DEFAULT_PROFILE);
      }

      /*
       * -------------------------
       * LOAD ANALYSIS
       * -------------------------
       */

      const savedAnalysis = localStorage.getItem(analysisKey);

      if (savedAnalysis) {
        try {
          setAnalysis(JSON.parse(savedAnalysis));
        } catch (error) {
          console.error(
            "Failed to parse saved analysis:",
            error
          );

          setAnalysis(null);
        }
      } else {
        setAnalysis(null);
      }

      /*
       * -------------------------
       * RESET TEMPORARY STEPS
       * -------------------------
       */

      setCompletedSteps({});

      /*
       * IMPORTANT:
       * Data has finished loading.
       */

      setProfileLoaded(true);

    } catch (error) {
      console.error(
        "Failed to load user data:",
        error
      );

      setProfile(DEFAULT_PROFILE);
      setAnalysis(null);
      setCompletedSteps({});
      setProfileLoaded(true);
    }

  }, [email, profileKey, analysisKey]);

  /*
   * =====================================================
   * SAVE PROFILE
   * =====================================================
   */

  useEffect(() => {
    if (!profileKey || !profileLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        profileKey,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error(
        "Failed to save profile:",
        error
      );
    }

  }, [profile, profileKey, profileLoaded]);

  /*
   * =====================================================
   * SAVE ANALYSIS
   * =====================================================
   */

  useEffect(() => {
    if (!analysisKey || !profileLoaded) {
      return;
    }

    /*
     * If analysis exists, save it.
     */

    if (analysis) {
      try {
        localStorage.setItem(
          analysisKey,
          JSON.stringify(analysis)
        );
      } catch (error) {
        console.error(
          "Failed to save analysis:",
          error
        );
      }

    }

  }, [analysis, analysisKey, profileLoaded]);

  /*
   * =====================================================
   * CHECK PROFILE COMPLETION
   * =====================================================
   */

  const isProfileComplete = Boolean(
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

  /*
   * =====================================================
   * PROVIDER
   * =====================================================
   */

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

/*
 * =====================================================
 * useApp HOOK
 * =====================================================
 */

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error(
      "useApp must be used within AppProvider"
    );
  }

  return ctx;
}