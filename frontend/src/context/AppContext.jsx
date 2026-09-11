import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import {
  getProfile,
  saveProfile as saveProfileToServer,
} from "../services/api";

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
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfileState] =
    useState(DEFAULT_PROFILE);
  const [analysis, setAnalysis] = useState(null);
  const [completedSteps, setCompletedSteps] =
    useState({});
  const [profileLoaded, setProfileLoaded] =
    useState(false);

  const skipNextSave = useRef(false);

  // Load this user's profile from SQLite after login.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!isAuthenticated || !user?.email) {
        setProfileState(DEFAULT_PROFILE);
        setProfileLoaded(false);
        setAnalysis(null);
        return;
      }

      setProfileLoaded(false);

      try {
        const result = await getProfile();

        if (cancelled) return;

        skipNextSave.current = true;

        if (result.exists && result.profile) {
          setProfileState({
            ...DEFAULT_PROFILE,
            ...result.profile,
          });
        } else {
          setProfileState({
            ...DEFAULT_PROFILE,
            name: user.name || "",
          });
        }

        const savedAnalysis = localStorage.getItem(
          `civicbenefit_analysis_${user.email}`
        );

        if (savedAnalysis) {
          try {
            setAnalysis(JSON.parse(savedAnalysis));
          } catch {
            setAnalysis(null);
          }
        } else {
          setAnalysis(null);
        }
      } catch (error) {
        console.error(
          "Could not load profile from database:",
          error
        );

        const saved = localStorage.getItem(
          `civicbenefit_profile_${user.email}`
        );

        skipNextSave.current = true;

        if (saved) {
          try {
            setProfileState({
              ...DEFAULT_PROFILE,
              ...JSON.parse(saved),
            });
          } catch {
            setProfileState({
              ...DEFAULT_PROFILE,
              name: user.name || "",
            });
          }
        } else {
          setProfileState({
            ...DEFAULT_PROFILE,
            name: user.name || "",
          });
        }
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email, user?.name]);

  // Persist profile locally and to SQLite.
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user?.email ||
      !profileLoaded
    ) {
      return;
    }

    const emailKey = user.email.toLowerCase().trim();

    localStorage.setItem(
      `civicbenefit_profile_${emailKey}`,
      JSON.stringify(profile)
    );

    // Skip saving the initial database load.
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await saveProfileToServer(profile);
      } catch (error) {
        console.error(
          "Could not save profile to database:",
          error
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    profile,
    profileLoaded,
    isAuthenticated,
    user?.email,
  ]);

  // Keep analysis isolated per account.
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user?.email ||
      !analysis
    ) {
      return;
    }

    localStorage.setItem(
      `civicbenefit_analysis_${user.email}`,
      JSON.stringify(analysis)
    );
  }, [analysis, isAuthenticated, user?.email]);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile: setProfileState,
        saveProfile: saveProfileToServer,
        profileLoaded,
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

  if (!ctx) {
    throw new Error(
      "useApp must be used within AppProvider"
    );
  }

  return ctx;
}
