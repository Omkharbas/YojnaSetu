import React, { useState } from "react";
import {
  ArrowRight,
  User,
  MapPin,
  IndianRupee,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
const calculateAge = (dob) => {
  if (!dob) return "";

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return Math.max(0, age);
};
export default function ProfileSetup() {
  const { profile, setProfile } = useApp();
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: profile.name || "",
    date_of_birth: profile.date_of_birth || "",
    age: "",
    gender: profile.gender || "",
    state: profile.state || "",
    district: profile.district || "",
    annual_income: profile.annual_income || "",
    category: profile.category || "",
    occupation: profile.occupation || "",
  });

  const [error, setError] = useState("");


  // =====================================================
  // UPDATE FIELD
  // =====================================================

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  // =====================================================
  // SUBMIT PROFILE
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // -------------------------------
    // REQUIRED VALIDATION
    // -------------------------------

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!form.age || Number(form.age) <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    if (!form.gender) {
      setError("Please select your gender.");
      return;
    }

    if (!form.state) {
      setError("Please select your state.");
      return;
    }

    if (!form.district.trim()) {
      setError("District is required.");
      return;
    }

    if (
      form.annual_income === "" ||
      form.annual_income === null ||
      form.annual_income === undefined ||
      Number(form.annual_income) < 0
    ) {
      setError(
        "Please enter your annual household income."
      );
      return;
    }

    if (!form.category) {
      setError("Please select your social category.");
      return;
    }

    if (!form.occupation) {
      setError("Please select your occupation.");
      return;
    }


    // =================================================
    // SAVE COMPLETE PROFILE
    // =================================================

    setProfile((previous) => ({
  ...previous,

  // Basic details
  name: form.name.trim(),
  date_of_birth: form.date_of_birth,
age: calculateAge(form.date_of_birth), 
gender: form.gender,

      // Location
      state: form.state,
      district: form.district.trim(),

      // Financial
      annual_income: Number(form.annual_income),
      category: form.category,

      // Occupation
      occupation: form.occupation,
      employment_status: form.occupation,

      // Backend-safe numeric defaults
      family_members:
        Number(previous.family_members) || 1,

      children:
        Number(previous.children) || 0,

      girl_children:
        Number(previous.girl_children) || 0,

      // Safe defaults
      marital_status:
        previous.marital_status || "Single",

      bpl_status:
        Boolean(previous.bpl_status),

      disability_status:
        Boolean(previous.disability_status),

      minority_status:
        Boolean(previous.minority_status),

      pregnant_or_lactating:
        Boolean(previous.pregnant_or_lactating),

      student_status:
        Boolean(previous.student_status),

      owns_house:
        Boolean(previous.owns_house),

      rural:
        previous.rural !== false,

      homeless:
        Boolean(previous.homeless),

      owns_land:
        Boolean(previous.owns_land),

      health_insurance:
        Boolean(previous.health_insurance),

      bank_account:
        Boolean(previous.bank_account),

      documents:
        Array.isArray(previous.documents)
          ? previous.documents
          : [],
    }));


    // =================================================
    // REMOVE NEW-USER SETUP REQUIREMENT
    // =================================================

    const normalizedEmail =
      user?.email?.toLowerCase().trim();

    if (normalizedEmail) {
      localStorage.removeItem(
        `civicbenefit_setup_required_${normalizedEmail}`
      );
    }


    // =================================================
    // CONTINUE
    // =================================================

    const destination =
      location.state?.from || "/analysis";

    navigate(destination, {
      replace: true,
    });
  };


  return (
    <main className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 py-10">

      <div className="mx-auto max-w-3xl">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <ShieldCheck size={32} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Complete Your Citizen Profile
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Before CivicBenefit AI can analyze your
            government benefits, we need a few basic
            details about you.
          </p>

          <div className="mt-4 inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
            ⚠️ Required before continuing
          </div>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="card"
        >

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {/* =================================================
              PERSONAL DETAILS
          ================================================= */}

          <div>

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <User size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Personal Details
                </h2>

                <p className="text-xs text-slate-500">
                  Required information
                </p>
              </div>

            </div>


            <div className="grid gap-5 sm:grid-cols-2">

              {/* NAME */}

              <div className="sm:col-span-2">

                <label className="label-field">
  Full Name * (as per Aadhaar Card)
</label>

                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) =>
                    update("name", e.target.value)
                  }
                  placeholder="Enter your name exactly as on Aadhaar Card"
                  required
                />

              </div>
<div>
  <label className="label-field">
    Date of Birth * (as per Aadhaar Card)
  </label>

  <input
    type="date"
    className="input-field"
    value={form.date_of_birth}
   onChange={(e) => {
  const dob = e.target.value;

  update("date_of_birth", dob);
  update("age", calculateAge(dob));
}}
    required
  />
</div>

              {/* AGE */}

              <div>

                <label className="label-field">
                  Age *
                </label>

                <input
  type="number"
  className="input-field"
  value={form.age}
  readOnly
/>

              </div>


              {/* GENDER */}

              <div>

                <label className="label-field">
                  Gender *
                </label>

                <select
                  className="input-field"
                  value={form.gender}
                  onChange={(e) =>
                    update("gender", e.target.value)
                  }
                  required
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* =================================================
              LOCATION
          ================================================= */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Location
                </h2>

                <p className="text-xs text-slate-500">
                  Used for state and district schemes
                </p>
              </div>

            </div>


            <div className="grid gap-5 sm:grid-cols-2">

              {/* STATE */}

              <div>

                <label className="label-field">
                  State *
                </label>

                <select
                  className="input-field"
                  value={form.state}
                  onChange={(e) =>
                    update("state", e.target.value)
                  }
                  required
                >

                  <option value="">
                    Select state
                  </option>

                  <option value="Maharashtra">
                    Maharashtra
                  </option>

                  <option value="Karnataka">
                    Karnataka
                  </option>

                  <option value="Gujarat">
                    Gujarat
                  </option>

                  <option value="Rajasthan">
                    Rajasthan
                  </option>

                  <option value="Uttar Pradesh">
                    Uttar Pradesh
                  </option>

                  <option value="Madhya Pradesh">
                    Madhya Pradesh
                  </option>

                  <option value="Delhi">
                    Delhi
                  </option>

                  <option value="Tamil Nadu">
                    Tamil Nadu
                  </option>

                  <option value="Telangana">
                    Telangana
                  </option>

                  <option value="Kerala">
                    Kerala
                  </option>

                  <option value="Andhra Pradesh">
                    Andhra Pradesh
                  </option>

                  <option value="West Bengal">
                    West Bengal
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* DISTRICT */}

              <div>

                <label className="label-field">
                  District *
                </label>

                <input
                  className="input-field"
                  value={form.district}
                  onChange={(e) =>
                    update(
                      "district",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Pune"
                  required
                />

              </div>

            </div>

          </div>


          {/* =================================================
              FINANCIAL
          ================================================= */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <IndianRupee size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Financial Information
                </h2>

                <p className="text-xs text-slate-500">
                  Required for income-based schemes
                </p>
              </div>

            </div>


            <div className="grid gap-5 sm:grid-cols-2">

              {/* INCOME */}

              <div>

                <label className="label-field">
                  Annual Household Income (₹) *
                </label>

                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.annual_income}
                  onChange={(e) =>
                    update(
                      "annual_income",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 250000"
                  required
                />

              </div>


              {/* CATEGORY */}

              <div>

                <label className="label-field">
                  Social Category *
                </label>

                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) =>
                    update(
                      "category",
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="General">
                    General
                  </option>

                  <option value="OBC">
                    OBC
                  </option>

                  <option value="SC">
                    SC
                  </option>

                  <option value="ST">
                    ST
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* =================================================
              OCCUPATION
          ================================================= */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Briefcase size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Occupation
                </h2>

                <p className="text-xs text-slate-500">
                  Helps match livelihood schemes
                </p>
              </div>

            </div>


            <select
              className="input-field"
              value={form.occupation}
              onChange={(e) =>
                update(
                  "occupation",
                  e.target.value
                )
              }
              required
            >

              <option value="">
                Select occupation
              </option>

              <option value="Student">
                Student
              </option>

              <option value="Farmer">
                Farmer
              </option>

              <option value="Salaried">
                Salaried
              </option>

              <option value="Self-employed">
                Self-employed
              </option>

              <option value="Daily Wage Worker">
                Daily Wage Worker
              </option>

              <option value="Unemployed">
                Unemployed
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* =================================================
              CONTINUE
          ================================================= */}

          <div className="mt-8 border-t border-slate-100 pt-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-400">
                All fields marked * are required.
              </p>

              <button
                type="submit"
                className="btn-primary px-6 py-3"
              >

                Save Profile & Continue

                <ArrowRight size={18} />

              </button>

            </div>

          </div>

        </form>

      </div>

    </main>
  );
}